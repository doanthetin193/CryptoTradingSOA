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

module.exports = {
  authMiddleware,
  optionalAuth,
};
