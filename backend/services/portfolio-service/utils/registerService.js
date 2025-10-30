const Consul = require('consul');
const logger = require('../../../shared/utils/logger');

class ServiceRegistry {
  constructor(serviceConfig) {
    this.config = serviceConfig;
    this.consul = new Consul({
      host: process.env.CONSUL_HOST || 'localhost',
      port: process.env.CONSUL_PORT || 8500,
      promisify: true,
    });
    this.serviceId = `${serviceConfig.name}-${serviceConfig.port}`;
  }

  async register() {
    try {
      const registration = {
        id: this.serviceId,
        name: this.config.name,
        address: this.config.host,
        port: parseInt(this.config.port), // Ensure port is a number
        tags: this.config.tags || ['soa', 'crypto-trading'],
        check: {
          http: `http://${this.config.host}:${this.config.port}${this.config.healthCheck}`,
          interval: '10s',
          timeout: '5s',
          deregistercriticalserviceafter: '1m',
        },
      };

      await this.consul.agent.service.register(registration);
      logger.info(`✅ Service registered with Consul: ${this.config.name} (${this.serviceId})`);

      this.setupGracefulShutdown();
    } catch (error) {
      logger.error(`❌ Failed to register service with Consul: ${error.message}`);
      logger.warn('⚠️  Service will run without Consul registration');
    }
  }

  async deregister() {
    try {
      await this.consul.agent.service.deregister(this.serviceId);
      logger.info(`✅ Service deregistered from Consul: ${this.serviceId}`);
    } catch (error) {
      logger.error(`❌ Failed to deregister service: ${error.message}`);
    }
  }

  setupGracefulShutdown() {
    const signals = ['SIGTERM', 'SIGINT'];
    signals.forEach((signal) => {
      process.on(signal, async () => {
        logger.info(`${signal} received, deregistering service...`);
        await this.deregister();
        process.exit(0);
      });
    });
  }
}

module.exports = ServiceRegistry;
