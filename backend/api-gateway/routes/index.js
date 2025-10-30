const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const serviceDiscovery = require('../utils/serviceDiscovery');
const { authMiddleware, optionalAuth } = require('../middleware/auth');
const logger = require('../../shared/utils/logger');

const router = express.Router();

/**
 * Dynamic proxy middleware creator
 * Tự động forward request đến service tương ứng
 */
const createServiceProxy = (serviceName, requireAuth = true) => {
  return async (req, res, next) => {
    try {
      // Get service URL from Consul or fallback
      const serviceUrl = await serviceDiscovery.getServiceUrl(serviceName);

      // Create proxy middleware dynamically
      const proxy = createProxyMiddleware({
        target: serviceUrl,
        changeOrigin: true,
        pathRewrite: (path, req) => {
          // Remove service prefix from path
          // Example: /api/users/profile -> /profile
          const servicePath = path.replace(`/api/${serviceName.replace('-service', '')}`, '');
          logger.debug(`🔀 Proxying: ${path} -> ${serviceUrl}${servicePath}`);
          return servicePath;
        },
        onProxyReq: (proxyReq, req, res) => {
          // Forward user info to service
          if (req.userId) {
            proxyReq.setHeader('X-User-Id', req.userId);
          }
          if (req.user) {
            proxyReq.setHeader('X-User-Data', JSON.stringify(req.user));
          }
        },
        onError: (err, req, res) => {
          logger.error(`❌ Proxy error for ${serviceName}: ${err.message}`);
          res.status(503).json({
            success: false,
            message: `Service ${serviceName} is currently unavailable`,
          });
        },
      });

      // Apply proxy
      proxy(req, res, next);
    } catch (error) {
      logger.error(`❌ Failed to create proxy for ${serviceName}: ${error.message}`);
      res.status(503).json({
        success: false,
        message: `Failed to connect to ${serviceName}`,
      });
    }
  };
};

/**
 * ===========================
 * USER SERVICE ROUTES
 * ===========================
 */
// Public routes (no auth required)
router.use('/users/register', createServiceProxy('user-service', false));
router.use('/users/login', createServiceProxy('user-service', false));

// Protected routes (auth required)
router.use('/users', authMiddleware, createServiceProxy('user-service'));

/**
 * ===========================
 * MARKET SERVICE ROUTES
 * ===========================
 */
// Market data is public
router.use('/market', optionalAuth, createServiceProxy('market-service', false));

/**
 * ===========================
 * PORTFOLIO SERVICE ROUTES
 * ===========================
 */
// Portfolio requires authentication
router.use('/portfolio', authMiddleware, createServiceProxy('portfolio-service'));

/**
 * ===========================
 * TRADE SERVICE ROUTES
 * ===========================
 */
// Trading requires authentication
router.use('/trade', authMiddleware, createServiceProxy('trade-service'));

/**
 * ===========================
 * NOTIFICATION SERVICE ROUTES
 * ===========================
 */
// Notifications require authentication
router.use('/notifications', authMiddleware, createServiceProxy('notification-service'));

module.exports = router;
