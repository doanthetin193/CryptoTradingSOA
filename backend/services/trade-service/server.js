require('dotenv').config({ path: require('path').join(__dirname, '../../', '.env') });
const express = require('express');
const connectDB = require('../../shared/config/db');
const tradeRoutes = require('./routes/tradeRoutes');
const ServiceRegistry = require('./utils/registerService');
const logger = require('../../shared/utils/logger');

// Initialize Express app
const app = express();
const PORT = process.env.TRADE_SERVICE_PORT || 3004;
const SERVICE_NAME = 'trade-service';

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
app.use('/', tradeRoutes);

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
  await connectDB(process.env.MONGODB_URI);

  app.listen(PORT, async () => {
    logger.info(`
  ╔═══════════════════════════════════════════════════════╗
  ║   💰 TRADE SERVICE STARTED                           ║
  ║   Port: ${PORT}                                      ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}              ║
  ║   Database: Connected                                 ║
  ║   Trading Fee: ${process.env.TRADING_FEE_PERCENTAGE || 0.1}%                              ║
  ╚═══════════════════════════════════════════════════════╝
    `);

    const serviceRegistry = new ServiceRegistry({
      name: SERVICE_NAME,
      host: 'localhost',
      port: PORT,
      healthCheck: '/health',
      tags: ['trade', 'buy', 'sell', 'transaction'],
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
