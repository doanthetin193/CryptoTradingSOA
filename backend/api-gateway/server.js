require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import routes and middleware
const apiRoutes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const serviceDiscovery = require('./utils/serviceDiscovery');

// Logger setup
const logger = require('../shared/utils/logger');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ===========================
// Middleware Configuration
// ===========================

// Security headers
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logger
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// ===========================
// Health Check Endpoint
// ===========================
app.get('/health', async (req, res) => {
  const consulHealth = await serviceDiscovery.healthCheck();
  
  res.json({
    success: true,
    service: 'API Gateway',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    consul: consulHealth,
  });
});

// ===========================
// API Routes
// ===========================
app.use('/api', apiRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Welcome to CryptoTrading SOA API Gateway',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      users: '/api/users',
      market: '/api/market',
      portfolio: '/api/portfolio',
      trade: '/api/trade',
      notifications: '/api/notifications',
    },
  });
});

// ===========================
// Error Handling
// ===========================
app.use(notFoundHandler);
app.use(errorHandler);

// ===========================
// Start Server
// ===========================
app.listen(PORT, () => {
  logger.info(`
  ╔═══════════════════════════════════════════════════════╗
  ║                                                       ║
  ║   🚀 API GATEWAY STARTED SUCCESSFULLY                ║
  ║                                                       ║
  ║   Port: ${PORT}                                      ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}              ║
  ║   Consul: ${process.env.CONSUL_HOST}:${process.env.CONSUL_PORT}                  ║
  ║                                                       ║
  ║   📡 Ready to proxy requests to microservices        ║
  ║                                                       ║
  ╚═══════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

module.exports = app;
