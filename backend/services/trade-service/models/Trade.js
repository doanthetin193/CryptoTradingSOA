const mongoose = require('mongoose');

/**
 * Trade Schema - Collection: trades
 * Lưu trữ lịch sử giao dịch mua/bán coin
 */

const tradeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true,
    },
    type: {
      type: String,
      enum: ['buy', 'sell'],
      required: true,
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
    },
    coinId: {
      type: String,
      required: true,
      lowercase: true,
    },
    coinName: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount must be positive'],
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price must be positive'],
    },
    totalCost: {
      type: Number,
      required: true,
    },
    fee: {
      type: Number,
      default: 0,
    },
    feePercentage: {
      type: Number,
      default: 0.1,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'completed',
    },
    // User balance before and after trade
    balanceBefore: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    // Additional metadata
    notes: {
      type: String,
      maxlength: 500,
    },
    errorMessage: {
      type: String,
    },
    executedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// ===========================
// Indexes
// ===========================
tradeSchema.index({ userId: 1, createdAt: -1 });
tradeSchema.index({ type: 1 });
tradeSchema.index({ symbol: 1 });
tradeSchema.index({ status: 1 });

// ===========================
// Static Methods
// ===========================

/**
 * Get user trade history
 */
tradeSchema.statics.getUserTrades = function (userId, filter = {}) {
  return this.find({ userId, ...filter })
    .sort({ createdAt: -1 })
    .limit(100);
};

/**
 * Get trade statistics for user
 */
tradeSchema.statics.getUserStats = async function (userId) {
  const stats = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), status: 'completed' } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalCost' },
        totalFees: { $sum: '$fee' },
      },
    },
  ]);

  const result = {
    buy: { count: 0, totalAmount: 0, totalFees: 0 },
    sell: { count: 0, totalAmount: 0, totalFees: 0 },
  };

  stats.forEach((stat) => {
    result[stat._id] = {
      count: stat.count,
      totalAmount: stat.totalAmount,
      totalFees: stat.totalFees,
    };
  });

  return result;
};

/**
 * Get recent trades for a coin
 */
tradeSchema.statics.getRecentTradesByCoin = function (symbol, limit = 10) {
  return this.find({ symbol: symbol.toUpperCase(), status: 'completed' })
    .sort({ createdAt: -1 })
    .limit(limit);
};

module.exports = mongoose.model('Trade', tradeSchema);
