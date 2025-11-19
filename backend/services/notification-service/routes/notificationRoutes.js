const express = require('express');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

/**
 * Notification Service Routes
 */

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'Notification Service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Send notification (Internal - called by API Gateway)
router.post('/send', notificationController.sendNotification);

// Get user notifications
router.get('/', notificationController.getNotifications);

// Mark all as read
router.put('/read-all', notificationController.markAllAsRead);

// Mark notification as read
router.put('/:id/read', notificationController.markAsRead);

// Delete notification
router.delete('/:id', notificationController.deleteNotification);

// Price Alerts
router.post('/alert', notificationController.createPriceAlert);
router.get('/alerts', notificationController.getPriceAlerts);
router.delete('/alert/:id', notificationController.deletePriceAlert);

module.exports = router;
