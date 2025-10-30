const mongoose = require('mongoose');

/**
 * Price Alert Schema - Collection: price_alerts
 * Lưu trữ ngưỡng giá để gửi thông báo
 */

const priceAlertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true,
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
    targetPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    condition: {
      type: String,
      enum: ['above', 'below'],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    triggered: {
      type: Boolean,
      default: false,
    },
    triggeredAt: {
      type: Date,
    },
    lastChecked: {
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
priceAlertSchema.index({ userId: 1, isActive: 1 });
priceAlertSchema.index({ symbol: 1, isActive: 1 });

// ===========================
// Instance Methods
// ===========================

/**
 * Trigger alert
 */
priceAlertSchema.methods.trigger = function () {
  this.triggered = true;
  this.isActive = false;
  this.triggeredAt = new Date();
  return this.save();
};

// ===========================
// Static Methods
// ===========================

/**
 * Get active alerts for user
 */
priceAlertSchema.statics.getActiveAlerts = function (userId) {
  return this.find({ userId, isActive: true });
};

/**
 * Get all active alerts (for batch checking)
 */
priceAlertSchema.statics.getAllActiveAlerts = function () {
  return this.find({ isActive: true });
};

module.exports = mongoose.model('PriceAlert', priceAlertSchema);
