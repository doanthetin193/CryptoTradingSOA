require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Import shared utilities and middleware
const logger = require('../shared/utils/logger');
const { errorHandler, notFoundHandler } = require('../shared/middleware/errorHandler');
const { authMiddleware, optionalAuth, adminMiddleware, internalOrAuth } = require('../shared/middleware/auth');
const serviceDiscovery = require('../shared/utils/serviceDiscovery');

// Import orchestration
const tradeOrchestration = require('./orchestration/tradeOrchestration');
const portfolioOrchestration = require('./orchestration/portfolioOrchestration');

// Initialize Express app
const app = express();
const PORT = process.env.API_GATEWAY_PORT || 3000;

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

// HTTP request logger
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
}));

// ===========================
// Rate Limiting Configuration
// ===========================

// Global rate limit: 1000 requests / 15 minutes for all APIs
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Login rate limit: 5 attempts / 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed attempts
});

// Register rate limit: 3 attempts / 60 minutes
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 3,
  message: {
    success: false,
    message: 'Too many registration attempts. Please try again after 1 hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply global rate limit to all API routes
app.use('/api', globalLimiter);

// ===========================
// Proxy Configuration
// ===========================

/**
 * Get service URL dynamically from Consul
 */
async function getServiceTarget(serviceName) {
  try {
    return await serviceDiscovery.getServiceUrl(serviceName);
  } catch (error) {
    logger.error(`Failed to discover ${serviceName}: ${error.message}`);
    throw error;
  }
}

/**
 * Create dynamic proxy with router for service discovery
 */
const createServiceProxy = (serviceName, apiPrefix) => {
  return createProxyMiddleware({
    target: 'http://localhost:3000',
    router: async (req) => {
      return await getServiceTarget(serviceName);
    },
    changeOrigin: true,
    pathRewrite: (path, req) => {
      // Remove /api/{prefix} from path
      // /api/users/register -> /register
      const newPath = path.replace(`/api/${apiPrefix}`, '');
      logger.debug(`🔄 Path rewrite: ${path} -> ${newPath}`);
      return newPath;
    },
    logLevel: 'debug',
    onProxyReq: (proxyReq, req, res) => {
      logger.info(`📤 Proxying to ${serviceName}: ${req.method} ${req.url}`);

      // Forward user info to service
      if (req.userId) {
        proxyReq.setHeader('X-User-Id', req.userId);
      }
      if (req.user) {
        proxyReq.setHeader('X-User-Data', JSON.stringify(req.user));
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      logger.info(`✅ Response from ${serviceName}: ${proxyRes.statusCode}`);
    },
    onError: (err, req, res) => {
      logger.error(`❌ Proxy error for ${serviceName}: ${err.message}`);
      if (!res.headersSent) {
        res.status(503).json({
          success: false,
          message: `Service ${serviceName} is currently unavailable`,
          error: err.message
        });
      }
    },
    timeout: 30000, // 30 seconds timeout
  });
};

// Create proxies with correct API prefixes
const userProxy = createServiceProxy('user-service', 'users');
const marketProxy = createServiceProxy('market-service', 'market');
const portfolioProxy = createServiceProxy('portfolio-service', 'portfolio');
const tradeProxy = createServiceProxy('trade-service', 'trade');
const notificationProxy = createServiceProxy('notification-service', 'notifications');

// News proxy: Spring controller dùng @RequestMapping("/news") nên chỉ strip "/api"
// /api/news/health -> /news/health (Spring nhận đúng prefix)
const newsProxy = createProxyMiddleware({
  target: 'http://localhost:3006',
  router: async () => await getServiceTarget('news-service'),
  changeOrigin: true,
  pathRewrite: (path) => {
    const newPath = path.replace('/api', '');
    logger.debug(`🔄 [news] Path rewrite: ${path} -> ${newPath}`);
    return newPath;
  },
  logLevel: 'warn',
  onProxyReq: (proxyReq, req) => {
    logger.info(`📤 Proxying to news-service: ${req.method} ${req.url}`);
  },
  onProxyRes: (proxyRes, req) => {
    logger.info(`✅ Response from news-service: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    logger.error(`❌ Proxy error for news-service: ${err.message}`);
    if (!res.headersSent) {
      res.status(503).json({
        success: false,
        message: 'Service news-service is currently unavailable',
        error: err.message,
      });
    }
  },
  timeout: 30000,
});

// Academy proxy: Spring controller dùng @RequestMapping("/academy") nên chỉ strip "/api"
// /api/academy/courses -> /academy/courses
const academyProxy = createProxyMiddleware({
  target: 'http://localhost:3007',
  router: async () => await getServiceTarget('academy-service'),
  changeOrigin: true,
  pathRewrite: (path) => {
    const newPath = path.replace('/api', '');
    logger.debug(`🔄 [academy] Path rewrite: ${path} -> ${newPath}`);
    return newPath;
  },
  logLevel: 'warn',
  onProxyReq: (proxyReq, req) => {
    logger.info(`📤 Proxying to academy-service: ${req.method} ${req.url}`);
  },
  onProxyRes: (proxyRes, req) => {
    logger.info(`✅ Response from academy-service: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    logger.error(`❌ Proxy error for academy-service: ${err.message}`);
    if (!res.headersSent) {
      res.status(503).json({
        success: false,
        message: 'Service academy-service is currently unavailable',
        error: err.message,
      });
    }
  },
  timeout: 30000,
});

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
      news: '/api/news',
      academy: '/api/academy',
    },
  });
});

// ===========================
// API Routes - Service Proxies
// ===========================

// USER SERVICE - Apply specific rate limiters for login/register
app.post('/api/users/login', loginLimiter, userProxy);
app.post('/api/users/register', registerLimiter, userProxy);

// ADMIN ROUTES - Apply auth + admin middleware
app.use('/api/users/admin', authMiddleware, adminMiddleware, userProxy);

// USER SERVICE - Protected routes (profile, balance, etc.)
app.use('/api/users', authMiddleware, userProxy);

// MARKET SERVICE
// internalOrAuth: chấp nhận JWT (user calls) HOẶC X-Internal-Service-Key (service-to-service calls)
app.use('/api/market', internalOrAuth, marketProxy);

// PORTFOLIO SERVICE - Orchestrated route for enriched data
app.get('/api/portfolio', authMiddleware, portfolioOrchestration.getEnrichedPortfolio);

// PORTFOLIO SERVICE - Other routes via proxy
app.use('/api/portfolio', authMiddleware, portfolioProxy);

// TRADE SERVICE - Orchestrated routes (before proxy)
// Need body parser for orchestration
app.post('/api/trade/buy', express.json(), authMiddleware, tradeOrchestration.buyCoin);
app.post('/api/trade/sell', express.json(), authMiddleware, tradeOrchestration.sellCoin);

// HEALTH CHECK - Circuit Breaker Status
app.get('/api/health/circuit-breakers', authMiddleware, tradeOrchestration.getCircuitBreakerStatus);

// TRADE SERVICE - Other routes via proxy
app.use('/api/trade', authMiddleware, tradeProxy);

// NOTIFICATION SERVICE
app.use('/api/notifications', authMiddleware, notificationProxy);

// NEWS SERVICE - Public route (tin tức không cần xác thực)
app.use('/api/news', newsProxy);

// ACADEMY SERVICE - Public route (video học không cần xác thực)
app.use('/api/academy', academyProxy);

// ===========================
// Error Handling
// ===========================
app.use(notFoundHandler);
app.use(errorHandler);

// ===========================
// Start Server
// ===========================
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);

// Setup Socket.IO for real-time communication
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
    credentials: true,
  },
});

// WebSocket authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  logger.info(`🔌 WebSocket connected: User ${socket.userId}`);

  // Join user's private room for targeted notifications
  socket.join(`user_${socket.userId}`);

  socket.on('disconnect', () => {
    logger.info(`🔌 WebSocket disconnected: User ${socket.userId}`);
  });
});

// Export io for use in other modules
global.io = io;

server.listen(PORT, () => {
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
