const Notification = require('../models/Notification');
const PriceAlert = require('../models/PriceAlert');
const HttpClient = require('../../../shared/utils/httpClient');
const logger = require('../../../shared/utils/logger');

// Service clients
const marketServiceClient = new HttpClient(process.env.MARKET_SERVICE_URL || 'http://localhost:3002');

/**
 * Notification Controller
 * Xử lý gửi và quản lý thông báo
 */

/**
 * @desc    Send notification
 * @route   POST /send
 * @access  Private (Internal)
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

    // Create notification
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
      message: 'Notification sent successfully',
      data: notification,
    });
  } catch (error) {
    logger.error(`❌ Send notification error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error sending notification',
      error: error.message,
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
    const { status, type, limit = 50 } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found',
      });
    }

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const notifications = await Notification.getUserNotifications(userId, filter).limit(parseInt(limit));
    const unreadCount = await Notification.getUnreadCount(userId);

    res.json({
      success: true,
      count: notifications.length,
      unreadCount,
      data: notifications,
    });
  } catch (error) {
    logger.error(`❌ Get notifications error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message,
    });
  }
};

/**
 * @desc    Mark notification as read
 * @route   PUT /:notificationId/read
 * @access  Private
 */
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { notificationId } = req.params;

    const notification = await Notification.findOne({ _id: notificationId, userId });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    await notification.markAsRead();

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (error) {
    logger.error(`❌ Mark as read error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message,
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

    const result = await Notification.markAllAsRead(userId);

    res.json({
      success: true,
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    logger.error(`❌ Mark all as read error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error marking all notifications as read',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete notification
 * @route   DELETE /:notificationId
 * @access  Private
 */
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndDelete({ _id: notificationId, userId });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    logger.error(`❌ Delete notification error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message,
    });
  }
};

/**
 * @desc    Create price alert
 * @route   POST /alerts
 * @access  Private
 */
exports.createPriceAlert = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { symbol, coinId, targetPrice, condition } = req.body;

    if (!userId || !symbol || !coinId || !targetPrice || !condition) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Validate condition
    if (!['above', 'below'].includes(condition)) {
      return res.status(400).json({
        success: false,
        message: 'Condition must be "above" or "below"',
      });
    }

    // Create price alert
    const alert = await PriceAlert.create({
      userId,
      symbol: symbol.toUpperCase(),
      coinId: coinId.toLowerCase(),
      targetPrice: parseFloat(targetPrice),
      condition,
      isActive: true,
    });

    logger.info(`🔔 Price alert created: ${symbol} ${condition} ${targetPrice} for user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Price alert created successfully',
      data: alert,
    });
  } catch (error) {
    logger.error(`❌ Create price alert error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error creating price alert',
      error: error.message,
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

    const alerts = await PriceAlert.getActiveAlerts(userId);

    res.json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    logger.error(`❌ Get price alerts error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching price alerts',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete price alert
 * @route   DELETE /alerts/:alertId
 * @access  Private
 */
exports.deletePriceAlert = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { alertId } = req.params;

    const alert = await PriceAlert.findOneAndDelete({ _id: alertId, userId });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Price alert not found',
      });
    }

    res.json({
      success: true,
      message: 'Price alert deleted successfully',
    });
  } catch (error) {
    logger.error(`❌ Delete price alert error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error deleting price alert',
      error: error.message,
    });
  }
};

/**
 * @desc    Check price alerts (Background job)
 * Called periodically to check if any price alerts should be triggered
 */
exports.checkPriceAlerts = async () => {
  try {
    const alerts = await PriceAlert.getAllActiveAlerts();

    if (alerts.length === 0) {
      return;
    }

    // Get current prices
    const pricesResponse = await marketServiceClient.get('/prices');
    if (!pricesResponse || !pricesResponse.data) {
      logger.warn('⚠️  Failed to fetch prices for alert checking');
      return;
    }

    const prices = pricesResponse.data;
    const pricesMap = {};
    prices.forEach((coin) => {
      pricesMap[coin.symbol] = coin.price;
    });

    // Check each alert
    for (const alert of alerts) {
      const currentPrice = pricesMap[alert.symbol];

      if (!currentPrice) {
        continue;
      }

      let shouldTrigger = false;

      if (alert.condition === 'above' && currentPrice >= alert.targetPrice) {
        shouldTrigger = true;
      } else if (alert.condition === 'below' && currentPrice <= alert.targetPrice) {
        shouldTrigger = true;
      }

      if (shouldTrigger) {
        // Trigger alert
        await alert.trigger();

        // Send notification
        await Notification.create({
          userId: alert.userId,
          type: 'price_alert',
          title: `Price Alert: ${alert.symbol}`,
          message: `${alert.symbol} is now ${alert.condition} ${alert.targetPrice} USDT. Current price: ${currentPrice} USDT`,
          data: {
            symbol: alert.symbol,
            targetPrice: alert.targetPrice,
            currentPrice: currentPrice,
            condition: alert.condition,
          },
          priority: 'high',
          channel: 'app',
        });

        logger.info(`🔔 Price alert triggered: ${alert.symbol} ${alert.condition} ${alert.targetPrice}`);
      }

      // Update lastChecked
      alert.lastChecked = new Date();
      await alert.save();
    }
  } catch (error) {
    logger.error(`❌ Check price alerts error: ${error.message}`);
  }
};
