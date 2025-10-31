const { mongoose } = require('../../../shared/config/db');

/**
 * Portfolio Schema - Collection: portfolios
 * Lưu trữ danh mục đầu tư của người dùng
 */

const portfolioSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true, // Index for faster queries
    },
    holdings: [
      {
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
        name: {
          type: String,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
          min: [0, 'Amount cannot be negative'],
        },
        averageBuyPrice: {
          type: Number,
          required: true,
          min: [0, 'Price cannot be negative'],
        },
        totalInvested: {
          type: Number,
          required: true,
          default: 0,
        },
        // Lịch sử giao dịch (tóm tắt)
        lastUpdated: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Tổng giá trị danh mục (cached)
    totalValue: {
      type: Number,
      default: 0,
    },
    totalInvested: {
      type: Number,
      default: 0,
    },
    totalProfit: {
      type: Number,
      default: 0,
    },
    profitPercentage: {
      type: Number,
      default: 0,
    },
    // Metadata
    lastCalculated: {
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
portfolioSchema.index({ userId: 1 }, { unique: true });
portfolioSchema.index({ 'holdings.symbol': 1 });

// ===========================
// Instance Methods
// ===========================

/**
 * Add or update holding in portfolio
 */
portfolioSchema.methods.addOrUpdateHolding = function (coinData) {
  const { symbol, coinId, name, amount, buyPrice } = coinData;

  // Find existing holding
  const existingHolding = this.holdings.find((h) => h.symbol === symbol);

  if (existingHolding) {
    // Update existing holding
    const totalAmount = existingHolding.amount + amount;
    const totalCost = existingHolding.totalInvested + amount * buyPrice;
    
    existingHolding.amount = totalAmount;
    existingHolding.averageBuyPrice = totalCost / totalAmount;
    existingHolding.totalInvested = totalCost;
    existingHolding.lastUpdated = new Date();
  } else {
    // Add new holding
    this.holdings.push({
      symbol,
      coinId,
      name,
      amount,
      averageBuyPrice: buyPrice,
      totalInvested: amount * buyPrice,
      lastUpdated: new Date(),
    });
  }

  return this;
};

/**
 * Remove or reduce holding from portfolio
 */
portfolioSchema.methods.reduceHolding = function (symbol, amount) {
  const holding = this.holdings.find((h) => h.symbol === symbol);

  if (!holding) {
    throw new Error(`No holding found for ${symbol}`);
  }

  if (holding.amount < amount) {
    throw new Error(`Insufficient ${symbol}. Available: ${holding.amount}`);
  }

  if (holding.amount === amount) {
    // Remove holding completely
    this.holdings = this.holdings.filter((h) => h.symbol !== symbol);
  } else {
    // Reduce amount proportionally
    const remainingPercentage = (holding.amount - amount) / holding.amount;
    holding.amount -= amount;
    holding.totalInvested *= remainingPercentage;
    holding.lastUpdated = new Date();
  }

  return this;
};

/**
 * Calculate portfolio value with current prices
 */
portfolioSchema.methods.calculateValue = function (pricesMap) {
  let totalValue = 0;
  let totalInvested = 0;

  this.holdings.forEach((holding) => {
    const currentPrice = pricesMap[holding.symbol] || holding.averageBuyPrice;
    const value = holding.amount * currentPrice;
    
    totalValue += value;
    totalInvested += holding.totalInvested;
  });

  this.totalValue = totalValue;
  this.totalInvested = totalInvested;
  this.totalProfit = totalValue - totalInvested;
  this.profitPercentage = totalInvested > 0 ? (this.totalProfit / totalInvested) * 100 : 0;
  this.lastCalculated = new Date();

  return this;
};

/**
 * Get holding by symbol
 */
portfolioSchema.methods.getHolding = function (symbol) {
  return this.holdings.find((h) => h.symbol === symbol.toUpperCase());
};

// ===========================
// Static Methods
// ===========================

/**
 * Find or create portfolio for user
 */
portfolioSchema.statics.findOrCreateByUserId = async function (userId) {
  let portfolio = await this.findOne({ userId });

  if (!portfolio) {
    portfolio = await this.create({
      userId,
      holdings: [],
      totalValue: 0,
      totalInvested: 0,
    });
  }

  return portfolio;
};

module.exports = mongoose.model('Portfolio', portfolioSchema);
