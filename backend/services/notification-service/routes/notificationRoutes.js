const express = require('express');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

/**
 * Notification Service Routes
 */

// Health check (must be first to avoid conflict with /:notificationId)
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'Notification Service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Send notification (Internal - called by other services)
router.post('/send', notificationController.sendNotification);

// Get user notifications
router.get('/', notificationController.getNotifications);

// Mark all as read (must be before /:notificationId/read)
router.put('/read-all', notificationController.markAllAsRead);

// Mark notification as read
router.put('/:notificationId/read', notificationController.markAsRead);

// Delete notification
router.delete('/:notificationId', notificationController.deleteNotification);

// Price Alerts
router.post('/alerts', notificationController.createPriceAlert);
router.get('/alerts', notificationController.getPriceAlerts);
router.delete('/alerts/:alertId', notificationController.deletePriceAlert);

module.exports = router;
