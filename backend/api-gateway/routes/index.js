const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const serviceDiscovery = require('../utils/serviceDiscovery');
const { authMiddleware, optionalAuth } = require('../middleware/auth');
const logger = require('../../shared/utils/logger');

const router = express.Router();

/**
 * Create static proxy for each service
 * Proxy được tạo 1 lần và tái sử dụng cho tất cả requests
 */
const createServiceProxy = (serviceName) => {
  const cleanServiceName = serviceName.replace('-service', '');
  const pathPattern = `^/api/${cleanServiceName}`;
  
  return createProxyMiddleware({
    target: `http://localhost:${getServicePort(serviceName)}`,
    changeOrigin: true,
    pathRewrite: {
      [pathPattern]: '', // Remove /api/users, /api/market, etc.
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

/**
 * Get service port by name
 */
function getServicePort(serviceName) {
  const ports = {
    'user-service': 3001,
    'market-service': 3002,
    'portfolio-service': 3003,
    'trade-service': 3004,
    'notification-service': 3005,
  };
  return ports[serviceName] || 3000;
}

// Create proxies
const userProxy = createServiceProxy('user-service');
const marketProxy = createServiceProxy('market-service');
const portfolioProxy = createServiceProxy('portfolio-service');
const tradeProxy = createServiceProxy('trade-service');
const notificationProxy = createServiceProxy('notification-service');

/**
 * ===========================
 * USER SERVICE ROUTES
 * ===========================
 */
// Public routes (no auth required)
router.use('/users/register', userProxy);
router.use('/users/login', userProxy);

// Protected routes (auth required)
router.use('/users', authMiddleware, userProxy);

/**
 * ===========================
 * MARKET SERVICE ROUTES
 * ===========================
 */
// Market data is public
router.use('/market', optionalAuth, marketProxy);

/**
 * ===========================
 * PORTFOLIO SERVICE ROUTES
 * ===========================
 */
// Portfolio requires authentication
router.use('/portfolio', authMiddleware, portfolioProxy);

/**
 * ===========================
 * TRADE SERVICE ROUTES
 * ===========================
 */
// Trading requires authentication
router.use('/trade', authMiddleware, tradeProxy);

/**
 * ===========================
 * NOTIFICATION SERVICE ROUTES
 * ===========================
 */
// Notifications require authentication
router.use('/notifications', authMiddleware, notificationProxy);

module.exports = router;
