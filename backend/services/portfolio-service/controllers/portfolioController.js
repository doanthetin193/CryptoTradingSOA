const Portfolio = require('../models/Portfolio');
const HttpClient = require('../../../shared/utils/httpClient');
const logger = require('../../../shared/utils/logger');

// Service clients
const userServiceClient = new HttpClient(process.env.USER_SERVICE_URL || 'http://localhost:3001');
const marketServiceClient = new HttpClient(process.env.MARKET_SERVICE_URL || 'http://localhost:3002');

/**
 * Portfolio Controller
 * Quản lý danh mục đầu tư của người dùng
 */

/**
 * @desc    Get user portfolio
 * @route   GET /
 * @access  Private
 */
exports.getPortfolio = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found',
      });
    }

    // Find or create portfolio
    const portfolio = await Portfolio.findOrCreateByUserId(userId);

    // Get current prices from Market Service
    const pricesResponse = await marketServiceClient.get('/prices');
    
    if (!pricesResponse || pricesResponse.status === 503) {
      logger.warn('Market service unavailable, using cached prices');
    }

    const prices = pricesResponse?.data || [];
    const pricesMap = {};
    prices.forEach((coin) => {
      pricesMap[coin.symbol] = coin.price;
    });

    // Calculate current value
    portfolio.calculateValue(pricesMap);
    await portfolio.save();

    // Enrich holdings with current prices
    const enrichedHoldings = portfolio.holdings.map((holding) => {
      const currentPrice = pricesMap[holding.symbol] || holding.averageBuyPrice;
      const currentValue = holding.amount * currentPrice;
      const profit = currentValue - holding.totalInvested;
      const profitPercentage = holding.totalInvested > 0 
        ? (profit / holding.totalInvested) * 100 
        : 0;

      return {
        symbol: holding.symbol,
        coinId: holding.coinId,
        name: holding.name,
        amount: holding.amount,
        averageBuyPrice: holding.averageBuyPrice,
        currentPrice: currentPrice,
        totalInvested: holding.totalInvested,
        currentValue: currentValue,
        profit: profit,
        profitPercentage: profitPercentage,
        lastUpdated: holding.lastUpdated,
      };
    });

    logger.info(`📊 Portfolio retrieved for user ${userId}`);

    res.json({
      success: true,
      data: {
        userId: portfolio.userId,
        holdings: enrichedHoldings,
        summary: {
          totalValue: portfolio.totalValue,
          totalInvested: portfolio.totalInvested,
          totalProfit: portfolio.totalProfit,
          profitPercentage: portfolio.profitPercentage,
          holdingsCount: portfolio.holdings.length,
        },
        lastCalculated: portfolio.lastCalculated,
      },
    });
  } catch (error) {
    logger.error(`❌ Get portfolio error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching portfolio',
      error: error.message,
    });
  }
};

/**
 * @desc    Get specific holding
 * @route   GET /holding/:symbol
 * @access  Private
 */
exports.getHolding = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { symbol } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found',
      });
    }

    const portfolio = await Portfolio.findOne({ userId });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found',
      });
    }

    const holding = portfolio.getHolding(symbol);

    if (!holding) {
      return res.status(404).json({
        success: false,
        message: `No holding found for ${symbol}`,
      });
    }

    // Get current price
    const priceResponse = await marketServiceClient.get(`/price/${holding.coinId}`);
    const currentPrice = priceResponse?.data?.price || holding.averageBuyPrice;

    const currentValue = holding.amount * currentPrice;
    const profit = currentValue - holding.totalInvested;
    const profitPercentage = holding.totalInvested > 0 
      ? (profit / holding.totalInvested) * 100 
      : 0;

    res.json({
      success: true,
      data: {
        symbol: holding.symbol,
        coinId: holding.coinId,
        name: holding.name,
        amount: holding.amount,
        averageBuyPrice: holding.averageBuyPrice,
        currentPrice: currentPrice,
        totalInvested: holding.totalInvested,
        currentValue: currentValue,
        profit: profit,
        profitPercentage: profitPercentage,
      },
    });
  } catch (error) {
    logger.error(`❌ Get holding error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching holding',
      error: error.message,
    });
  }
};

/**
 * @desc    Add or update holding (called by Trade Service)
 * @route   POST /holding
 * @access  Private (Internal)
 */
exports.addHolding = async (req, res) => {
  try {
    const { userId, symbol, coinId, name, amount, buyPrice } = req.body;

    if (!userId || !symbol || !amount || !buyPrice) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Find or create portfolio
    const portfolio = await Portfolio.findOrCreateByUserId(userId);

    // Add or update holding
    portfolio.addOrUpdateHolding({
      symbol: symbol.toUpperCase(),
      coinId: coinId.toLowerCase(),
      name,
      amount: parseFloat(amount),
      buyPrice: parseFloat(buyPrice),
    });

    await portfolio.save();

    logger.info(`✅ Added/Updated holding: ${amount} ${symbol} for user ${userId}`);

    res.json({
      success: true,
      message: 'Holding added/updated successfully',
      data: {
        holding: portfolio.getHolding(symbol),
      },
    });
  } catch (error) {
    logger.error(`❌ Add holding error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error adding holding',
      error: error.message,
    });
  }
};

/**
 * @desc    Reduce or remove holding (called by Trade Service)
 * @route   PUT /holding/reduce
 * @access  Private (Internal)
 */
exports.reduceHolding = async (req, res) => {
  try {
    const { userId, symbol, amount } = req.body;

    if (!userId || !symbol || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const portfolio = await Portfolio.findOne({ userId });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found',
      });
    }

    // Reduce holding
    portfolio.reduceHolding(symbol.toUpperCase(), parseFloat(amount));
    await portfolio.save();

    logger.info(`✅ Reduced holding: ${amount} ${symbol} for user ${userId}`);

    res.json({
      success: true,
      message: 'Holding reduced successfully',
      data: {
        holding: portfolio.getHolding(symbol),
      },
    });
  } catch (error) {
    logger.error(`❌ Reduce holding error: ${error.message}`);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get portfolio summary/stats
 * @route   GET /summary
 * @access  Private
 */
exports.getPortfolioSummary = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found',
      });
    }

    const portfolio = await Portfolio.findOrCreateByUserId(userId);

    // Get current prices
    const pricesResponse = await marketServiceClient.get('/prices');
    const prices = pricesResponse?.data || [];
    const pricesMap = {};
    prices.forEach((coin) => {
      pricesMap[coin.symbol] = coin.price;
    });

    // Calculate value
    portfolio.calculateValue(pricesMap);
    await portfolio.save();

    res.json({
      success: true,
      data: {
        totalValue: portfolio.totalValue,
        totalInvested: portfolio.totalInvested,
        totalProfit: portfolio.totalProfit,
        profitPercentage: portfolio.profitPercentage,
        holdingsCount: portfolio.holdings.length,
        lastCalculated: portfolio.lastCalculated,
      },
    });
  } catch (error) {
    logger.error(`❌ Get summary error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching portfolio summary',
      error: error.message,
    });
  }
};
