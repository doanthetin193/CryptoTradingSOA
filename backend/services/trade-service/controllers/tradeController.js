const Joi = require('joi');
const Trade = require('../models/Trade');
const logger = require('../../../shared/utils/logger');

/**
 * Trade Controller
 * CHỈ quản lý Trade records - KHÔNG gọi service khác
 * API Gateway sẽ orchestrate logic buy/sell
 */

// Validation schema
const createTradeSchema = Joi.object({
  userId: Joi.string().required(),
  type: Joi.string().valid('buy', 'sell').required(),
  symbol: Joi.string().required(),
  coinId: Joi.string().required(),
  coinName: Joi.string().required(),
  amount: Joi.number().positive().required(),
  price: Joi.number().positive().required(),
  totalCost: Joi.number().positive().required(),
  fee: Joi.number().min(0).required(),
  feePercentage: Joi.number().min(0).required(),
  balanceBefore: Joi.number().required(),
  balanceAfter: Joi.number().required(),
});

/**
 * @desc    Create trade record (called by API Gateway)
 * @route   POST /
 * @access  Internal
 */
exports.createTrade = async (req, res) => {
  try {
    const { error, value } = createTradeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const trade = await Trade.create({
      ...value,
      status: 'completed',
      executedAt: new Date(),
    });

    logger.info(`✅ Trade recorded: ${value.type} ${value.amount} ${value.symbol}`);

    res.status(201).json({
      success: true,
      data: trade,
    });
  } catch (error) {
    logger.error(`❌ Create trade error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to record trade',
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
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found',
      });
    }

    const { page = 1, limit = 20, type, symbol } = req.query;

    const filter = { userId };
    if (type) filter.type = type;
    if (symbol) filter.symbol = symbol.toUpperCase();

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const trades = await Trade.find(filter)
      .sort({ executedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Trade.countDocuments(filter);

    res.json({
      success: true,
      data: {
        trades,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    logger.error(`❌ Get trade history error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get trade history',
    });
  }
};
