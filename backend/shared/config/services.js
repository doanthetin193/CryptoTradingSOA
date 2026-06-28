/**
 * Service Configuration - Fallback addresses nếu Consul không hoạt động
 * Trong production, các services sẽ được discover qua Consul
 */

module.exports = {
  // API Gateway
  API_GATEWAY: {
    name: 'api-gateway',
    host: 'localhost',
    port: 3000,
    healthCheck: '/health',
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

  // News Service (Java Spring Boot)
  NEWS_SERVICE: {
    name: 'news-service',
    host: 'localhost',
    port: 3006,
    healthCheck: '/news/health',
  },

  // Academy Service (Java Spring Boot)
  ACADEMY_SERVICE: {
    name: 'academy-service',
    host: 'localhost',
    port: 3007,
    healthCheck: '/academy/health',
  },

  // Sentiment Service (Python FastAPI)
  SENTIMENT_SERVICE: {
    name: 'sentiment-service',
    host: 'localhost',
    port: 3008,
    healthCheck: '/sentiment/health',
  },

  // Consul Configuration
  CONSUL: {
    host: 'localhost',
    port: 8500,
  },
};
