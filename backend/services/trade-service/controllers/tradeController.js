const Joi = require('joi');
const Trade = require('../models/Trade');
const HttpClient = require('../../../shared/utils/httpClient');
const logger = require('../../../shared/utils/logger');

// Service clients
const userServiceClient = new HttpClient(process.env.USER_SERVICE_URL || 'http://localhost:3001');
const marketServiceClient = new HttpClient(process.env.MARKET_SERVICE_URL || 'http://localhost:3002');
const portfolioServiceClient = new HttpClient(process.env.PORTFOLIO_SERVICE_URL || 'http://localhost:3003');
const notificationServiceClient = new HttpClient(process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005');

/**
 * Trade Controller
 * Xử lý logic giao dịch mua/bán coin ảo
 */

// Validation schemas
const buySchema = Joi.object({
  symbol: Joi.string().required(),
  coinId: Joi.string().required(),
  amount: Joi.number().positive().required(),
});

const sellSchema = Joi.object({
  symbol: Joi.string().required(),
  amount: Joi.number().positive().required(),
});

/**
 * @desc    Buy coin
 * @route   POST /buy
 * @access  Private
 */
exports.buyCoin = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found',
      });
    }

    // Validate input
    const { error, value } = buySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { symbol, coinId, amount } = value;

    // 1. Get current price from Market Service
    const priceResponse = await marketServiceClient.get(`/price/${coinId}`);
    if (!priceResponse || priceResponse.status === 503) {
      return res.status(503).json({
        success: false,
        message: 'Market service unavailable',
      });
    }

    const currentPrice = priceResponse.data.price;
    const coinName = priceResponse.data.symbol;

    // Calculate total cost with fee
    const feePercentage = parseFloat(process.env.TRADING_FEE_PERCENTAGE) || 0.1;
    const totalCost = amount * currentPrice;
    const fee = totalCost * (feePercentage / 100);
    const finalCost = totalCost + fee;

    // Check minimum trade amount
    const minTradeAmount = parseFloat(process.env.MIN_TRADE_AMOUNT_USD) || 10;
    if (totalCost < minTradeAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum trade amount is ${minTradeAmount} USD`,
      });
    }

    // 2. Check user balance from User Service
    const balanceResponse = await userServiceClient.get(`/balance?userId=${userId}`);
    if (!balanceResponse || balanceResponse.status === 503) {
      return res.status(503).json({
        success: false,
        message: 'User service unavailable',
      });
    }

    const currentBalance = balanceResponse.data.balance;

    if (currentBalance < finalCost) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Required: ${finalCost.toFixed(2)} USDT, Available: ${currentBalance.toFixed(2)} USDT`,
      });
    }

    // 3. Update user balance (deduct cost)
    const updateBalanceResponse = await userServiceClient.put('/balance', {
      userId,
      amount: -finalCost,
      type: 'trade',
      description: `Buy ${amount} ${symbol} at ${currentPrice} USDT`,
    });

    if (!updateBalanceResponse.success) {
      throw new Error('Failed to update user balance');
    }

    const newBalance = updateBalanceResponse.data.balance;

    // 4. Update portfolio (add holding)
    await portfolioServiceClient.post('/holding', {
      userId,
      symbol: symbol.toUpperCase(),
      coinId: coinId.toLowerCase(),
      name: coinName,
      amount,
      buyPrice: currentPrice,
    });

    // 5. Create trade record
    const trade = await Trade.create({
      userId,
      type: 'buy',
      symbol: symbol.toUpperCase(),
      coinId: coinId.toLowerCase(),
      coinName,
      amount,
      price: currentPrice,
      totalCost,
      fee,
      feePercentage,
      status: 'completed',
      balanceBefore: currentBalance,
      balanceAfter: newBalance,
      executedAt: new Date(),
    });

    // 6. Send notification (non-blocking)
    notificationServiceClient.post('/send', {
      userId,
      type: 'trade',
      title: 'Buy Order Completed',
      message: `Successfully bought ${amount} ${symbol} at ${currentPrice} USDT`,
      data: { tradeId: trade._id, type: 'buy', symbol, amount },
    }).catch(err => logger.warn(`Failed to send notification: ${err.message}`));

    logger.info(`✅ Buy order completed: ${amount} ${symbol} for user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Buy order completed successfully',
      data: {
        trade: {
          id: trade._id,
          type: trade.type,
          symbol: trade.symbol,
          amount: trade.amount,
          price: trade.price,
          totalCost: trade.totalCost,
          fee: trade.fee,
          balanceAfter: trade.balanceAfter,
          executedAt: trade.executedAt,
        },
      },
    });
  } catch (error) {
    logger.error(`❌ Buy coin error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error processing buy order',
      error: error.message,
    });
  }
};

/**
 * @desc    Sell coin
 * @route   POST /sell
 * @access  Private
 */
exports.sellCoin = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found',
      });
    }

    // Validate input
    const { error, value } = sellSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { symbol, amount } = value;

    // 1. Get holding from Portfolio Service
    const holdingResponse = await portfolioServiceClient.get(`/holding/${symbol}`);
    if (!holdingResponse || holdingResponse.status === 404) {
      return res.status(404).json({
        success: false,
        message: `You don't own any ${symbol}`,
      });
    }

    const holding = holdingResponse.data;

    // Check if user has enough coins
    if (holding.amount < amount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient ${symbol}. Available: ${holding.amount}`,
      });
    }

    // 2. Get current price
    const priceResponse = await marketServiceClient.get(`/price/${holding.coinId}`);
    if (!priceResponse || priceResponse.status === 503) {
      return res.status(503).json({
        success: false,
        message: 'Market service unavailable',
      });
    }

    const currentPrice = priceResponse.data.price;

    // Calculate revenue with fee
    const feePercentage = parseFloat(process.env.TRADING_FEE_PERCENTAGE) || 0.1;
    const totalRevenue = amount * currentPrice;
    const fee = totalRevenue * (feePercentage / 100);
    const finalRevenue = totalRevenue - fee;

    // 3. Get current balance
    const balanceResponse = await userServiceClient.get(`/balance?userId=${userId}`);
    const currentBalance = balanceResponse.data.balance;

    // 4. Update user balance (add revenue)
    const updateBalanceResponse = await userServiceClient.put('/balance', {
      userId,
      amount: finalRevenue,
      type: 'trade',
      description: `Sell ${amount} ${symbol} at ${currentPrice} USDT`,
    });

    if (!updateBalanceResponse.success) {
      throw new Error('Failed to update user balance');
    }

    const newBalance = updateBalanceResponse.data.balance;

    // 5. Update portfolio (reduce holding)
    await portfolioServiceClient.put('/holding/reduce', {
      userId,
      symbol: symbol.toUpperCase(),
      amount,
    });

    // 6. Create trade record
    const trade = await Trade.create({
      userId,
      type: 'sell',
      symbol: symbol.toUpperCase(),
      coinId: holding.coinId,
      coinName: holding.name,
      amount,
      price: currentPrice,
      totalCost: totalRevenue,
      fee,
      feePercentage,
      status: 'completed',
      balanceBefore: currentBalance,
      balanceAfter: newBalance,
      executedAt: new Date(),
    });

    // 7. Send notification
    notificationServiceClient.post('/send', {
      userId,
      type: 'trade',
      title: 'Sell Order Completed',
      message: `Successfully sold ${amount} ${symbol} at ${currentPrice} USDT`,
      data: { tradeId: trade._id, type: 'sell', symbol, amount },
    }).catch(err => logger.warn(`Failed to send notification: ${err.message}`));

    logger.info(`✅ Sell order completed: ${amount} ${symbol} for user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Sell order completed successfully',
      data: {
        trade: {
          id: trade._id,
          type: trade.type,
          symbol: trade.symbol,
          amount: trade.amount,
          price: trade.price,
          totalCost: trade.totalCost,
          fee: trade.fee,
          balanceAfter: trade.balanceAfter,
          executedAt: trade.executedAt,
        },
      },
    });
  } catch (error) {
    logger.error(`❌ Sell coin error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error processing sell order',
      error: error.message,
    });
  }
};

/**
 * @desc    Get trade history
 * @route   GET /history
 * @access  Private
 */
exports.getTradeHistory = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { type, symbol, limit = 50 } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found',
      });
    }

    const filter = {};
    if (type) filter.type = type;
    if (symbol) filter.symbol = symbol.toUpperCase();

    const trades = await Trade.getUserTrades(userId, filter).limit(parseInt(limit));

    res.json({
      success: true,
      count: trades.length,
      data: trades,
    });
  } catch (error) {
    logger.error(`❌ Get trade history error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching trade history',
      error: error.message,
    });
  }
};

/**
 * @desc    Get trade statistics
 * @route   GET /stats
 * @access  Private
 */
exports.getTradeStats = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found',
      });
    }

    const stats = await Trade.getUserStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error(`❌ Get trade stats error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching trade statistics',
      error: error.message,
    });
  }
};

/**
 * @desc    Get trade by ID
 * @route   GET /:tradeId
 * @access  Private
 */
exports.getTradeById = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { tradeId } = req.params;

    const trade = await Trade.findOne({ _id: tradeId, userId });

    if (!trade) {
      return res.status(404).json({
        success: false,
        message: 'Trade not found',
      });
    }

    res.json({
      success: true,
      data: trade,
    });
  } catch (error) {
    logger.error(`❌ Get trade by ID error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching trade',
      error: error.message,
    });
  }
};
