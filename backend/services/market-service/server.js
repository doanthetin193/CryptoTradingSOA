require('dotenv').config({ path: require('path').join(__dirname, '../../', '.env') });
const express = require('express');
const marketRoutes = require('./routes/marketRoutes');
const ServiceRegistry = require('./utils/registerService');
const logger = require('../../shared/utils/logger');

// Initialize Express app
const app = express();
const PORT = process.env.MARKET_SERVICE_PORT || 3002;
const SERVICE_NAME = 'market-service';

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
      name: SERVICE_NAME,
    host: 'localhost',
    port: PORT,
    healthCheck: '/health',
    tags: ['market', 'coingecko', 'prices'],
  });

  await serviceRegistry.register();

  // Pre-warm cache for all coins after service starts
  setTimeout(async () => {
    try {
      logger.info('🔥 Pre-warming cache for popular coins...');
      const axios = require('axios');
      
      // Warm up prices cache (caches all 8 coins at once)
      await axios.get(`http://localhost:${PORT}/prices`).catch(() => {});
      logger.info('✅ Cached prices for all coins');
      
      // Warm up chart cache for TOP 4 coins only (với delay 4s để tránh rate limit)
      const topCoins = ['bitcoin', 'ethereum', 'binancecoin', 'solana'];
      for (const coin of topCoins) {
        await new Promise(resolve => setTimeout(resolve, 4000)); // 4 second delay
        try {
          await axios.get(`http://localhost:${PORT}/chart/${coin}?days=7`, { timeout: 10000 });
          logger.info(`✅ Cached chart data for ${coin}`);
        } catch (error) {
          logger.warn(`⚠️  Failed to cache ${coin}: ${error.message}`);
        }
      }
      
      logger.info('🎉 Cache pre-warming completed! Other coins will be cached on first access.');
    } catch (error) {
      logger.warn(`⚠️  Cache pre-warming failed: ${error.message}`);
    }
  }, 3000); // Start after 3 seconds
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
