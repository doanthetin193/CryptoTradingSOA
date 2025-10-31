const { mongoose } = require('../../../shared/config/db');

/**
 * Notification Schema - Collection: notifications
 * Lưu trữ lịch sử thông báo
 */

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true,
    },
    type: {
      type: String,
      enum: ['trade', 'price_alert', 'system', 'warning'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ['unread', 'read', 'archived'],
      default: 'unread',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    channel: {
      type: String,
      enum: ['app', 'email', 'both'],
      default: 'app',
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// ===========================
// Indexes
// ===========================
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ type: 1 });

// ===========================
// Instance Methods
// ===========================

/**
 * Mark notification as read
 */
notificationSchema.methods.markAsRead = function () {
  this.status = 'read';
  this.readAt = new Date();
  return this.save();
};

/**
 * Archive notification
 */
notificationSchema.methods.archive = function () {
  this.status = 'archived';
  return this.save();
};

// ===========================
// Static Methods
// ===========================

/**
 * Get user notifications
 */
notificationSchema.statics.getUserNotifications = function (userId, filter = {}) {
  return this.find({ userId, ...filter })
    .sort({ createdAt: -1 })
    .limit(50);
};

/**
 * Get unread count
 */
notificationSchema.statics.getUnreadCount = function (userId) {
  return this.countDocuments({ userId, status: 'unread' });
};

/**
 * Mark all as read for user
 */
notificationSchema.statics.markAllAsRead = async function (userId) {
  return this.updateMany(
    { userId, status: 'unread' },
    { $set: { status: 'read', readAt: new Date() } }
  );
};

/**
 * Delete old notifications (older than 30 days)
 */
notificationSchema.statics.deleteOldNotifications = async function () {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return this.deleteMany({
    createdAt: { $lt: thirtyDaysAgo },
    status: { $in: ['read', 'archived'] },
  });
};

module.exports = mongoose.model('Notification', notificationSchema);
