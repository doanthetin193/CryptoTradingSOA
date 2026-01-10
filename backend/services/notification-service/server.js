require('dotenv').config({ path: require('path').join(__dirname, '../../', '.env') });
const express = require('express');
const cron = require('node-cron');
const connectDB = require('../../shared/config/db');
const notificationRoutes = require('./routes/notificationRoutes');
const priceAlertChecker = require('./utils/priceAlertChecker');
const ServiceRegistry = require('./utils/registerService');
const logger = require('../../shared/utils/logger');

// Initialize Express app
const app = express();
const PORT = process.env.NOTIFICATION_SERVICE_PORT || 3005;
const SERVICE_NAME = 'notification-service';

// ===========================
// Middleware
// ===========================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger (skip health checks to reduce noise)
app.use((req, res, next) => {
  if (req.path !== '/health') {
    logger.info(`${req.method} ${req.path}`);
  }
  next();
});

// ===========================
// Routes
// ===========================
app.use('/', notificationRoutes);

// ===========================
// Error Handler
// ===========================
app.use((err, req, res, next) => {
  logger.error(`❌ Error: ${err.message}`);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ===========================
// Start Server
// ===========================
const startServer = async () => {
  await connectDB(process.env.NOTIFICATION_DB_URI);

  // Background Jobs
  if (process.env.ENABLE_PRICE_ALERTS === 'true') {
    // Check price alerts every minute
    cron.schedule('* * * * *', async () => {
      await priceAlertChecker.checkPriceAlerts();
    });
    logger.info('🕒 Price alert checker started (every minute)');
  }

  cron.schedule('0 0 * * *', async () => {
    try {
      const Notification = require('./models/Notification');
      await Notification.deleteOldNotifications();
    } catch (error) {
      logger.error(`❌ Error cleaning up notifications: ${error.message}`);
    }
  });

  app.listen(PORT, async () => {
    logger.info(`
  ╔═══════════════════════════════════════════════════════╗
  ║   🔔 NOTIFICATION SERVICE STARTED                    ║
  ║   Port: ${PORT}                                      ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}              ║
  ║   Database: Connected                                 ║
  ║   Price Alerts: ${process.env.ENABLE_PRICE_ALERTS === 'true' ? 'Enabled' : 'Disabled'}                         ║
  ╚═══════════════════════════════════════════════════════╝
    `);

    const serviceRegistry = new ServiceRegistry({
      name: SERVICE_NAME,
      host: 'localhost',
      port: PORT,
      healthCheck: '/health',
      tags: ['notification', 'alert', 'messaging'],
    });

    await serviceRegistry.register();
  });
};

// Start the server
startServer().catch((err) => {
  logger.error(`❌ Failed to start server: ${err.message}`);
  process.exit(1);
});

module.exports = app;
