/**
 * WebSocket Utility
 * Gửi real-time notifications qua Socket.IO
 */

const logger = require('./logger');

/**
 * Emit notification to specific user
 */
const emitToUser = (userId, event, data) => {
  try {
    if (global.io) {
      global.io.to(`user_${userId}`).emit(event, data);
      logger.debug(`📡 WebSocket sent to user ${userId}: ${event}`);
    } else {
      logger.warn('⚠️  WebSocket not initialized');
    }
  } catch (error) {
    logger.error(`❌ WebSocket emit error: ${error.message}`);
  }
};

/**
 * Broadcast to all connected users
 */
const broadcast = (event, data) => {
  try {
    if (global.io) {
      global.io.emit(event, data);
      logger.debug(`📡 WebSocket broadcast: ${event}`);
    }
  } catch (error) {
    logger.error(`❌ WebSocket broadcast error: ${error.message}`);
  }
};

/**
 * Send notification to user
 */
const sendNotification = (userId, notification) => {
  emitToUser(userId, 'notification', notification);
};

/**
 * Send trade confirmation to user
 */
const sendTradeConfirmation = (userId, trade) => {
  emitToUser(userId, 'trade_confirmation', trade);
};

/**
 * Send price alert to user
 */
const sendPriceAlert = (userId, alert) => {
  emitToUser(userId, 'price_alert', alert);
};

module.exports = {
  emitToUser,
  broadcast,
  sendNotification,
  sendTradeConfirmation,
  sendPriceAlert,
};
