const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

/**
 * JWT Authentication Middleware
 * Xác thực token từ client trước khi forward request đến services
 */

const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Authorization denied.',
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user info to request
    req.user = decoded;
    req.userId = decoded.userId;

    logger.debug(`✅ Authenticated user: ${decoded.userId}`);
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.',
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Authorization denied.',
      });
    }

    logger.error(`❌ Auth middleware error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
    });
  }
};

/**
 * Optional Auth Middleware - không bắt buộc phải có token
 * Nếu có token thì verify, không có thì vẫn cho qua
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      req.userId = decoded.userId;
    }

    next();
  } catch (error) {
    // Ignore errors, just don't set user
    next();
  }
};

/**
 * Admin Middleware - Kiểm tra user có role admin không
 * Phải dùng sau authMiddleware
 * Forward to User Service để verify role (không query DB trực tiếp)
 */
const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    // Query User Service directly (this middleware runs in API Gateway)
    try {
      const serviceDiscovery = require('../utils/serviceDiscovery');
      const axios = require('axios');
      
      const userServiceUrl = await serviceDiscovery.getServiceUrl('user-service');
      
      const response = await axios.get(`${userServiceUrl}/profile`, {
        headers: {
          'x-user-id': req.userId
        },
        timeout: 5000
      });
      
      if (!response.data.success) {
        return res.status(404).json({
          success: false,
          message: 'User not found.',
        });
      }
      
      // User data is nested in data.user (not data.data)
      const user = response.data.data?.user || response.data.data;
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required. You do not have permission.',
        });
      }

      // Add user to request
      req.adminUser = user;
      logger.debug(`✅ Admin verified: ${user.email}`);
      next();
      
    } catch (serviceError) {
      logger.error(`❌ Failed to verify admin via User Service: ${serviceError.message}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to verify admin permissions.',
      });
    }
  } catch (error) {
    logger.error(`❌ Admin middleware error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during admin verification.',
    });
  }
};

module.exports = {
  authMiddleware,
  optionalAuth,
  adminMiddleware,
};
