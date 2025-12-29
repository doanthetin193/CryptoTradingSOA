/**
 * Price Alert Checker Service
 * Định kỳ kiểm tra giá coin và gửi alerts
 */

const axios = require('axios');
const logger = require('../../../shared/utils/logger');
const websocket = require('../../../shared/utils/websocket');

const serviceDiscovery = require('../../../shared/utils/serviceDiscovery');
const PriceAlert = require('../models/PriceAlert');
const Notification = require('../models/Notification');

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

    // Get current prices via API Gateway (SOA compliance)
    const apiGatewayUrl = process.env.API_GATEWAY_URL || 'http://localhost:3000';
    const pricesResponse = await axios.get(`${apiGatewayUrl}/api/market/prices`);
    if (!pricesResponse.data.success) {
      logger.error('Failed to get prices from API Gateway');
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
        await Notification.create({
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
