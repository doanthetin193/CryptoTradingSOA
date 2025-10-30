/**
 * Service Configuration - Fallback addresses nếu Consul không hoạt động
 * Trong production, các services sẽ được discover qua Consul
 */

module.exports = {
  // API Gateway
  API_GATEWAY: {
    host: 'localhost',
    port: 3000,
  },

  // User Service
  USER_SERVICE: {
    name: 'user-service',
    host: 'localhost',
    port: 3001,
    healthCheck: '/health',
  },

  // Market Service
  MARKET_SERVICE: {
    name: 'market-service',
    host: 'localhost',
    port: 3002,
    healthCheck: '/health',
  },

  // Portfolio Service
  PORTFOLIO_SERVICE: {
    name: 'portfolio-service',
    host: 'localhost',
    port: 3003,
    healthCheck: '/health',
  },

  // Trade Service
  TRADE_SERVICE: {
    name: 'trade-service',
    host: 'localhost',
    port: 3004,
    healthCheck: '/health',
  },

  // Notification Service
  NOTIFICATION_SERVICE: {
    name: 'notification-service',
    host: 'localhost',
    port: 3005,
    healthCheck: '/health',
  },

  // Consul Configuration
  CONSUL: {
    host: 'localhost',
    port: 8500,
  },
};
