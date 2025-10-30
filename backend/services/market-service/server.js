require('dotenv').config();
const express = require('express');
const marketRoutes = require('./routes/marketRoutes');
const ServiceRegistry = require('./utils/registerService');
const logger = require('../../shared/utils/logger');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3002;

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
app.use('/', marketRoutes);

// ===========================
// Start Server
// ===========================
const server = app.listen(PORT, async () => {
  logger.info(`
  ╔═══════════════════════════════════════════════════════╗
  ║                                                       ║
  ║   📊 MARKET SERVICE STARTED                          ║
  ║                                                       ║
  ║   Port: ${PORT}                                      ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}              ║
  ║   CoinGecko API: Connected                            ║
  ║                                                       ║
  ╚═══════════════════════════════════════════════════════╝
  `);

  // Register with Consul
  const serviceRegistry = new ServiceRegistry({
    name: process.env.SERVICE_NAME || 'market-service',
    host: 'localhost',
    port: PORT,
    healthCheck: '/health',
    tags: ['market', 'coingecko', 'prices'],
  });

  await serviceRegistry.register();
});

// Error handler
app.use((err, req, res, next) => {
  logger.error(`❌ Error: ${err.message}`);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
