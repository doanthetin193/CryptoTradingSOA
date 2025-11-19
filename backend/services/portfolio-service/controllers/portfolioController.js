const Portfolio = require('../models/Portfolio');
const logger = require('../../../shared/utils/logger');

/**
 * Portfolio Controller
 * CHỈ quản lý Portfolio data - KHÔNG gọi service khác
 * API Gateway sẽ orchestrate việc lấy giá từ Market Service
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

    const portfolio = await Portfolio.findOrCreateByUserId(userId);

    res.json({
      success: true,
      data: portfolio,
    });
  } catch (error) {
    logger.error(`❌ Get portfolio error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get portfolio',
    });
  }
};

/**
 * @desc    Update portfolio value (called by API Gateway with prices)
 * @route   PUT /value
 * @access  Internal
 */
exports.updatePortfolioValue = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { prices } = req.body;

    if (!userId || !prices) {
      return res.status(400).json({
        success: false,
        message: 'Missing userId or prices',
      });
    }

    const portfolio = await Portfolio.findOrCreateByUserId(userId);
    
    // Update value with provided prices
    const pricesMap = {};
    prices.forEach(coin => {
      pricesMap[coin.symbol] = coin.price;
    });

    portfolio.calculateValue(pricesMap);
    await portfolio.save();

    res.json({
      success: true,
      data: portfolio,
    });
  } catch (error) {
    logger.error(`❌ Update portfolio value error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to update portfolio value',
    });
  }
};

/**
 * @desc    Add holding to portfolio
 * @route   POST /holding
 * @access  Internal (called by API Gateway)
 */
exports.addHolding = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { symbol, coinId, name, amount, buyPrice } = req.body;

    if (!userId || !symbol || !amount || !buyPrice) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const portfolio = await Portfolio.findOrCreateByUserId(userId);
    
    // Find existing holding
    const existingHolding = portfolio.holdings.find(h => h.symbol === symbol.toUpperCase());

    if (existingHolding) {
      // Update existing holding
      const totalAmount = existingHolding.amount + amount;
      const totalCost = (existingHolding.amount * existingHolding.averageBuyPrice) + (amount * buyPrice);
      existingHolding.amount = totalAmount;
      existingHolding.averageBuyPrice = totalCost / totalAmount;
    } else {
      // Add new holding
      portfolio.holdings.push({
        symbol: symbol.toUpperCase(),
        coinId: coinId.toLowerCase(),
        name,
        amount,
        averageBuyPrice: buyPrice,
        currentPrice: buyPrice,
      });
    }

    await portfolio.save();
    logger.info(`✅ Added holding: ${amount} ${symbol} for user ${userId}`);

    res.json({
      success: true,
      data: portfolio,
    });
  } catch (error) {
    logger.error(`❌ Add holding error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to add holding',
    });
  }
};

/**
 * @desc    Reduce holding from portfolio
 * @route   PUT /holding
 * @access  Internal (called by API Gateway)
 */
exports.reduceHolding = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { symbol, amount } = req.body;

    if (!userId || !symbol || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const portfolio = await Portfolio.findOrCreateByUserId(userId);
    const holding = portfolio.holdings.find(h => h.symbol === symbol.toUpperCase());

    if (!holding) {
      return res.status(404).json({
        success: false,
        message: `Holding ${symbol} not found`,
      });
    }

    if (holding.amount < amount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient ${symbol}. Available: ${holding.amount}`,
      });
    }

    // Reduce amount
    holding.amount -= amount;

    // Remove if amount is zero
    if (holding.amount === 0) {
      portfolio.holdings = portfolio.holdings.filter(h => h.symbol !== symbol.toUpperCase());
    }

    await portfolio.save();
    logger.info(`✅ Reduced holding: ${amount} ${symbol} for user ${userId}`);

    res.json({
      success: true,
      data: portfolio,
    });
  } catch (error) {
    logger.error(`❌ Reduce holding error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to reduce holding',
    });
  }
};

/**
 * @desc    Get holding by symbol
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

    const portfolio = await Portfolio.findOrCreateByUserId(userId);
    const holding = portfolio.holdings.find(h => h.symbol === symbol.toUpperCase());

    if (!holding) {
      return res.status(404).json({
        success: false,
        message: `Holding ${symbol} not found`,
      });
    }

    res.json({
      success: true,
      data: holding,
    });
  } catch (error) {
    logger.error(`❌ Get holding error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get holding',
    });
  }
};
