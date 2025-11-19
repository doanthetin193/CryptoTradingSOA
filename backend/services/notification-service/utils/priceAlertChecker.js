/**
 * Price Alert Checker Service
 * Định kỳ kiểm tra giá coin và gửi alerts
 */

const axios = require('axios');
const logger = require('../../../shared/utils/logger');
const websocket = require('../../../shared/utils/websocket');
const emailService = require('../../../shared/utils/emailService');
const PriceAlert = require('../models/PriceAlert');
const Notification = require('../models/Notification');

const MARKET_SERVICE_URL = `http://localhost:${process.env.MARKET_SERVICE_PORT || 3002}`;
const USER_SERVICE_URL = `http://localhost:${process.env.USER_SERVICE_PORT || 3001}`;

/**
 * Check all active price alerts
 */
const checkPriceAlerts = async () => {
  try {
    // Get all active alerts
    const alerts = await PriceAlert.getAllActiveAlerts();
    if (alerts.length === 0) {
      logger.debug('No active price alerts to check');
      return;
    }

    logger.info(`🔍 Checking ${alerts.length} price alerts...`);

    // Get current prices from Market Service
    const pricesResponse = await axios.get(`${MARKET_SERVICE_URL}/prices`);
    if (!pricesResponse.data.success) {
      logger.error('Failed to get prices from Market Service');
      return;
    }

    const prices = pricesResponse.data.data;
    const priceMap = {};
    prices.forEach(coin => {
      priceMap[coin.symbol] = coin.price;
    });

    // Check each alert
    let triggeredCount = 0;
    for (const alert of alerts) {
      const currentPrice = priceMap[alert.symbol];
      if (!currentPrice) {
        logger.warn(`Price not found for ${alert.symbol}`);
        continue;
      }

      // Update last checked time
      alert.lastChecked = new Date();

      // Check if alert should be triggered
      let shouldTrigger = false;
      if (alert.condition === 'above' && currentPrice >= alert.targetPrice) {
        shouldTrigger = true;
      } else if (alert.condition === 'below' && currentPrice <= alert.targetPrice) {
        shouldTrigger = true;
      }

      if (shouldTrigger) {
        logger.info(`🔔 Price alert triggered: ${alert.symbol} ${alert.condition} ${alert.targetPrice}`);
        
        // Trigger the alert
        await alert.trigger();
        triggeredCount++;

        // Create notification
        const notification = await Notification.create({
          userId: alert.userId,
          type: 'price_alert',
          title: `Price Alert: ${alert.symbol}`,
          message: `${alert.symbol} is now ${alert.condition} $${alert.targetPrice}. Current price: $${currentPrice.toFixed(2)}`,
          data: {
            symbol: alert.symbol,
            targetPrice: alert.targetPrice,
            currentPrice,
            condition: alert.condition,
          },
          priority: 'high',
          channel: 'app',
        });

        // Send WebSocket notification
        websocket.sendPriceAlert(alert.userId, {
          symbol: alert.symbol,
          targetPrice: alert.targetPrice,
          currentPrice,
          condition: alert.condition,
          timestamp: new Date(),
        });

        // Send email notification if enabled
        if (process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true') {
          try {
            const userResponse = await axios.get(`${USER_SERVICE_URL}/profile`, {
              headers: { 'X-User-Id': alert.userId },
            });
            
            if (userResponse.data.success) {
              const userEmail = userResponse.data.data.email;
              await emailService.sendPriceAlertEmail(userEmail, {
                symbol: alert.symbol,
                targetPrice: alert.targetPrice,
                currentPrice,
                condition: alert.condition,
              });
            }
          } catch (emailError) {
            logger.error(`Failed to send email for alert: ${emailError.message}`);
          }
        }
      } else {
        await alert.save(); // Just update lastChecked
      }
    }

    if (triggeredCount > 0) {
      logger.info(`✅ ${triggeredCount} price alerts triggered`);
    }
  } catch (error) {
    logger.error(`❌ Price alert checker error: ${error.message}`);
  }
};

module.exports = {
  checkPriceAlerts,
};
