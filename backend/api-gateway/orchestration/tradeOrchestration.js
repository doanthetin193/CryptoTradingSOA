const axios = require('axios');
const Joi = require('joi');
const logger = require('../../shared/utils/logger');

/**
 * Trade Orchestration
 * API Gateway orchestrates calls to multiple services for buy/sell operations
 */

// Service URLs
const getServiceUrl = (port) => `http://localhost:${port}`;
const SERVICES = {
  USER: getServiceUrl(3001),
  MARKET: getServiceUrl(3002),
  PORTFOLIO: getServiceUrl(3003),
  TRADE: getServiceUrl(3004),
  NOTIFICATION: getServiceUrl(3005),
};

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

// Trading configuration
const TRADING_FEE_PERCENTAGE = 0.1; // 0.1%
const MIN_TRADE_AMOUNT_USD = 10;

/**
 * @desc    Buy coin - Orchestrates multiple service calls
 * @route   POST /api/trade/buy
 * @access  Private
 */
exports.buyCoin = async (req, res) => {
  try {
    const userId = req.userId;
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

    // STEP 1: Get current price from Market Service
    logger.info(`🔄 [BUY] Step 1: Getting price for ${coinId}`);
    const priceResponse = await axios.get(`${SERVICES.MARKET}/price/${coinId}`);
    
    if (!priceResponse.data.success) {
      return res.status(503).json({
        success: false,
        message: 'Failed to get market price',
      });
    }

    const currentPrice = priceResponse.data.data.price;
    const coinName = priceResponse.data.data.name;

    // Calculate costs
    const totalCost = amount * currentPrice;
    const fee = totalCost * (TRADING_FEE_PERCENTAGE / 100);
    const finalCost = totalCost + fee;

    // Check minimum trade amount
    if (totalCost < MIN_TRADE_AMOUNT_USD) {
      return res.status(400).json({
        success: false,
        message: `Minimum trade amount is ${MIN_TRADE_AMOUNT_USD} USD`,
      });
    }

    // STEP 2: Get user balance from User Service
    logger.info(`🔄 [BUY] Step 2: Checking balance for user ${userId}`);
    const balanceResponse = await axios.get(`${SERVICES.USER}/balance`, {
      headers: { 'X-User-Id': userId },
    });

    const currentBalance = balanceResponse.data.data.balance;

    if (currentBalance < finalCost) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Required: ${finalCost.toFixed(2)} USDT, Available: ${currentBalance.toFixed(2)} USDT`,
      });
    }

    // STEP 3: Update user balance (deduct cost)
    logger.info(`🔄 [BUY] Step 3: Deducting ${finalCost} from balance`);
    const updateBalanceResponse = await axios.put(
      `${SERVICES.USER}/balance`,
      {
        userId,
        amount: -finalCost,
        type: 'trade',
        description: `Buy ${amount} ${symbol} at ${currentPrice} USDT`,
      },
      {
        headers: { 'X-User-Id': userId },
      }
    );

    const newBalance = updateBalanceResponse.data.data.balance;

    // STEP 4: Update portfolio (add holding)
    logger.info(`🔄 [BUY] Step 4: Adding ${amount} ${symbol} to portfolio`);
    await axios.post(
      `${SERVICES.PORTFOLIO}/holding`,
      {
        symbol: symbol.toUpperCase(),
        coinId: coinId.toLowerCase(),
        name: coinName,
        amount,
        buyPrice: currentPrice,
      },
      {
        headers: { 'X-User-Id': userId },
      }
    );

    // STEP 5: Create trade record
    logger.info(`🔄 [BUY] Step 5: Creating trade record`);
    const tradeResponse = await axios.post(
      `${SERVICES.TRADE}/`,
      {
        userId,
        type: 'buy',
        symbol: symbol.toUpperCase(),
        coinId: coinId.toLowerCase(),
        coinName,
        amount,
        price: currentPrice,
        totalCost,
        fee,
        feePercentage: TRADING_FEE_PERCENTAGE,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
      },
      {
        headers: { 'X-User-Id': userId },
      }
    );

    const trade = tradeResponse.data.data;

    // STEP 6: Send notification (non-blocking)
    logger.info(`🔄 [BUY] Step 6: Sending notification`);
    axios.post(
      `${SERVICES.NOTIFICATION}/send`,
      {
        userId,
        type: 'trade',
        title: 'Buy Order Completed',
        message: `Successfully bought ${amount} ${symbol} at ${currentPrice} USDT`,
        data: { tradeId: trade._id, type: 'buy', symbol, amount },
      },
      {
        headers: { 'X-User-Id': userId },
      }
    ).catch(err => logger.warn(`Failed to send notification: ${err.message}`));

    logger.info(`✅ [BUY] Completed: ${amount} ${symbol} for user ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Buy order completed successfully',
      data: {
        trade,
        newBalance,
      },
    });
  } catch (error) {
    logger.error(`❌ [BUY] Error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to process buy order',
      error: error.response?.data?.message || error.message,
    });
  }
};

/**
 * @desc    Sell coin - Orchestrates multiple service calls
 * @route   POST /api/trade/sell
 * @access  Private
 */
exports.sellCoin = async (req, res) => {
  try {
    const userId = req.userId;
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

    // STEP 1: Get portfolio to check holdings
    logger.info(`🔄 [SELL] Step 1: Checking holdings for ${symbol}`);
    const portfolioResponse = await axios.get(`${SERVICES.PORTFOLIO}/`, {
      headers: { 'X-User-Id': userId },
    });

    const portfolio = portfolioResponse.data.data;
    const holding = portfolio.holdings.find(h => h.symbol === symbol.toUpperCase());

    if (!holding || holding.amount < amount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient ${symbol}. Available: ${holding?.amount || 0}`,
      });
    }

    // STEP 2: Get current price from Market Service
    logger.info(`🔄 [SELL] Step 2: Getting price for ${holding.coinId}`);
    const priceResponse = await axios.get(`${SERVICES.MARKET}/price/${holding.coinId}`);

    const currentPrice = priceResponse.data.data.price;
    const coinName = priceResponse.data.data.name;

    // Calculate proceeds
    const totalProceeds = amount * currentPrice;
    const fee = totalProceeds * (TRADING_FEE_PERCENTAGE / 100);
    const finalProceeds = totalProceeds - fee;

    // STEP 3: Get current balance
    logger.info(`🔄 [SELL] Step 3: Getting current balance`);
    const balanceResponse = await axios.get(`${SERVICES.USER}/balance`, {
      headers: { 'X-User-Id': userId },
    });
    const currentBalance = balanceResponse.data.data.balance;

    // STEP 4: Update user balance (add proceeds)
    logger.info(`🔄 [SELL] Step 4: Adding ${finalProceeds} to balance`);
    const updateBalanceResponse = await axios.put(
      `${SERVICES.USER}/balance`,
      {
        userId,
        amount: finalProceeds,
        type: 'trade',
        description: `Sell ${amount} ${symbol} at ${currentPrice} USDT`,
      },
      {
        headers: { 'X-User-Id': userId },
      }
    );

    const newBalance = updateBalanceResponse.data.data.balance;

    // STEP 5: Update portfolio (reduce holding)
    logger.info(`🔄 [SELL] Step 5: Reducing ${amount} ${symbol} from portfolio`);
    await axios.put(
      `${SERVICES.PORTFOLIO}/holding`,
      {
        symbol: symbol.toUpperCase(),
        amount,
      },
      {
        headers: { 'X-User-Id': userId },
      }
    );

    // STEP 6: Create trade record
    logger.info(`🔄 [SELL] Step 6: Creating trade record`);
    const profitLoss = (currentPrice - holding.averageBuyPrice) * amount - fee;
    
    const tradeResponse = await axios.post(
      `${SERVICES.TRADE}/`,
      {
        userId,
        type: 'sell',
        symbol: symbol.toUpperCase(),
        coinId: holding.coinId,
        coinName,
        amount,
        price: currentPrice,
        totalCost: totalProceeds,
        fee,
        feePercentage: TRADING_FEE_PERCENTAGE,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
      },
      {
        headers: { 'X-User-Id': userId },
      }
    );

    const trade = tradeResponse.data.data;

    // STEP 7: Send notification (non-blocking)
    logger.info(`🔄 [SELL] Step 7: Sending notification`);
    axios.post(
      `${SERVICES.NOTIFICATION}/send`,
      {
        userId,
        type: 'trade',
        title: 'Sell Order Completed',
        message: `Successfully sold ${amount} ${symbol} at ${currentPrice} USDT. P/L: ${profitLoss.toFixed(2)} USDT`,
        data: { 
          tradeId: trade._id, 
          type: 'sell', 
          symbol, 
          amount,
          profitLoss: profitLoss.toFixed(2),
        },
      },
      {
        headers: { 'X-User-Id': userId },
      }
    ).catch(err => logger.warn(`Failed to send notification: ${err.message}`));

    logger.info(`✅ [SELL] Completed: ${amount} ${symbol} for user ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Sell order completed successfully',
      data: {
        trade,
        newBalance,
        profitLoss,
      },
    });
  } catch (error) {
    logger.error(`❌ [SELL] Error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to process sell order',
      error: error.response?.data?.message || error.message,
    });
  }
};
