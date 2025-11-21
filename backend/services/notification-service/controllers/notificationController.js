const Notification = require('../models/Notification');
const PriceAlert = require('../models/PriceAlert');
const logger = require('../../../shared/utils/logger');

/**
 * Notification Controller
 * CHỈ quản lý notifications - KHÔNG gọi service khác
 */

/**
 * @desc    Send notification
 * @route   POST /send
 * @access  Internal (called by API Gateway)
 */
exports.sendNotification = async (req, res) => {
  try {
    const { userId, type, title, message, data, priority, channel } = req.body;

    if (!userId || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      data: data || {},
      priority: priority || 'medium',
      channel: channel || 'app',
      status: 'unread',
      sentAt: new Date(),
    });

    logger.info(`📢 Notification sent to user ${userId}: ${title}`);

    res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    logger.error(`❌ Send notification error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification',
    });
  }
};

/**
 * @desc    Get unread count
 * @route   GET /unread-count
 * @access  Private
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found',
      });
    }

    const unreadCount = await Notification.countDocuments({ userId, status: 'unread' });

    res.json({
      success: true,
      data: {
        unreadCount,
      },
    });
  } catch (error) {
    logger.error(`❌ Get unread count error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
    });
  }
};

/**
 * @desc    Get user notifications
 * @route   GET /
 * @access  Private
 */
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found',
      });
    }

    const { page = 1, limit = 20, status, type } = req.query;

    const filter = { userId };
    if (status) filter.status = status;
    if (type) filter.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const notifications = await Notification.find(filter)
      .sort({ sentAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ userId, status: 'unread' });

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    logger.error(`❌ Get notifications error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications',
    });
  }
};

/**
 * @desc    Mark notification as read
 * @route   PUT /:id/read
 * @access  Private
 */
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { id } = req.params;

    const notification = await Notification.findOne({ _id: id, userId });
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    notification.status = 'read';
    notification.readAt = new Date();
    await notification.save();

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    logger.error(`❌ Mark as read error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
    });
  }
};

/**
 * @desc    Mark all notifications as read
 * @route   PUT /read-all
 * @access  Private
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found',
      });
    }

    await Notification.updateMany(
      { userId, status: 'unread' },
      { status: 'read', readAt: new Date() }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    logger.error(`❌ Mark all as read error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
    });
  }
};

/**
 * @desc    Delete notification
 * @route   DELETE /:id
 * @access  Private
 */
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({ _id: id, userId });
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    logger.error(`❌ Delete notification error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
    });
  }
};

/**
 * @desc    Create price alert
 * @route   POST /alert
 * @access  Private
 */
exports.createPriceAlert = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { symbol, targetPrice, condition } = req.body;

    if (!userId || !symbol || !targetPrice || !condition) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const alert = await PriceAlert.create({
      userId,
      symbol: symbol.toUpperCase(),
      targetPrice,
      condition,
      status: 'active',
    });

    res.status(201).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    logger.error(`❌ Create price alert error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to create price alert',
    });
  }
};

/**
 * @desc    Get user price alerts
 * @route   GET /alerts
 * @access  Private
 */
exports.getPriceAlerts = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found',
      });
    }

    const { status } = req.query;
    const filter = { userId };
    if (status) filter.status = status;

    const alerts = await PriceAlert.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    logger.error(`❌ Get price alerts error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get price alerts',
    });
  }
};

/**
 * @desc    Delete price alert
 * @route   DELETE /alert/:id
 * @access  Private
 */
exports.deletePriceAlert = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { id } = req.params;

    const alert = await PriceAlert.findOneAndDelete({ _id: id, userId });
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Price alert not found',
      });
    }

    res.json({
      success: true,
      message: 'Price alert deleted',
    });
  } catch (error) {
    logger.error(`❌ Delete price alert error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to delete price alert',
    });
  }
};
