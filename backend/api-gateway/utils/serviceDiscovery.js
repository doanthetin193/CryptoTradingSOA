const Consul = require('consul');
const logger = require('../../shared/utils/logger');
const serviceConfig = require('../../shared/config/services');

/**
 * Consul Service Discovery
 * Tìm địa chỉ của các services đã đăng ký với Consul
 */

class ServiceDiscovery {
  constructor() {
    this.consul = new Consul({
      host: process.env.CONSUL_HOST || serviceConfig.CONSUL.host,
      port: process.env.CONSUL_PORT || serviceConfig.CONSUL.port,
      promisify: true,
    });
    
    this.serviceCache = new Map(); // Cache service addresses
    this.cacheTimeout = 30000; // 30 seconds cache
  }

  /**
   * Lấy địa chỉ service từ Consul hoặc fallback config
   * @param {string} serviceName - Tên service cần tìm
   * @returns {Promise<string>} - URL của service
   */
  async getServiceUrl(serviceName) {
    try {
      // Check cache first
      const cached = this.serviceCache.get(serviceName);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        logger.debug(`📦 Using cached address for ${serviceName}: ${cached.url}`);
        return cached.url;
      }

      // Query Consul for healthy service instances
      const result = await this.consul.health.service({
        service: serviceName,
        passing: true, // Only get healthy instances
      });

      if (result && result.length > 0) {
        // Load balancing: pick random instance
        const instance = result[Math.floor(Math.random() * result.length)];
        const address = instance.Service.Address || instance.Node.Address;
        const port = instance.Service.Port;
        const url = `http://${address}:${port}`;

        // Cache the result
        this.serviceCache.set(serviceName, {
          url,
          timestamp: Date.now(),
        });

        logger.info(`✅ Discovered ${serviceName} at ${url} via Consul`);
        return url;
      } else {
        throw new Error(`No healthy instances found for ${serviceName}`);
      }
    } catch (error) {
      logger.warn(`⚠️  Consul discovery failed for ${serviceName}: ${error.message}`);
      return this.getFallbackUrl(serviceName);
    }
  }

  /**
   * Fallback to static configuration nếu Consul không hoạt động
   * @param {string} serviceName
   * @returns {string} - Fallback URL
   */
  getFallbackUrl(serviceName) {
    const configMap = {
      'user-service': serviceConfig.USER_SERVICE,
      'market-service': serviceConfig.MARKET_SERVICE,
      'portfolio-service': serviceConfig.PORTFOLIO_SERVICE,
      'trade-service': serviceConfig.TRADE_SERVICE,
      'notification-service': serviceConfig.NOTIFICATION_SERVICE,
    };

    const config = configMap[serviceName];
    if (config) {
      const url = `http://${config.host}:${config.port}`;
      logger.info(`🔄 Using fallback address for ${serviceName}: ${url}`);
      return url;
    }

    throw new Error(`Unknown service: ${serviceName}`);
  }

  /**
   * Clear cache for a specific service
   */
  clearCache(serviceName) {
    this.serviceCache.delete(serviceName);
    logger.debug(`🗑️  Cleared cache for ${serviceName}`);
  }

  /**
   * Clear all cache
   */
  clearAllCache() {
    this.serviceCache.clear();
    logger.debug(`🗑️  Cleared all service cache`);
  }

  /**
   * Health check - kiểm tra Consul connection
   */
  async healthCheck() {
    try {
      await this.consul.agent.self();
      return { status: 'healthy', consul: 'connected' };
    } catch (error) {
      return { status: 'degraded', consul: 'disconnected', error: error.message };
    }
  }
}

module.exports = new ServiceDiscovery();
