const CircuitBreaker = require('opossum');
const axios = require('axios');
const logger = require('./logger');

/**
 * Circuit Breaker Utility
 * Wrap service calls to prevent cascading failures
 */

// Circuit breaker configuration
const circuitBreakerOptions = {
  timeout: 5000, // 5 seconds timeout
  errorThresholdPercentage: 50, // Open circuit if 50% of requests fail
  resetTimeout: 30000, // Try to close circuit after 30 seconds
  rollingCountTimeout: 10000, // Rolling window for failure stats (10s)
  rollingCountBuckets: 10, // Number of buckets in rolling window
  name: 'ServiceCircuitBreaker',
  volumeThreshold: 5, // Minimum number of requests before checking error percentage
};

/**
 * Create a circuit breaker for HTTP requests
 * @param {string} serviceName - Name of the service (for logging)
 * @param {object} options - Custom circuit breaker options
 * @returns {CircuitBreaker} Circuit breaker instance
 */
function createCircuitBreaker(serviceName, options = {}) {
  const mergedOptions = { ...circuitBreakerOptions, ...options, name: serviceName };

  // Create the circuit breaker
  const breaker = new CircuitBreaker(
    async (config) => {
      // Execute the actual HTTP request
      return await axios(config);
    },
    mergedOptions
  );

  // ===========================
  // Event Listeners
  // ===========================

  breaker.on('open', () => {
    logger.warn(`🔴 [Circuit Breaker] ${serviceName} - Circuit OPENED (too many failures)`);
  });

  breaker.on('halfOpen', () => {
    logger.info(`🟡 [Circuit Breaker] ${serviceName} - Circuit HALF-OPEN (testing recovery)`);
  });

  breaker.on('close', () => {
    logger.info(`🟢 [Circuit Breaker] ${serviceName} - Circuit CLOSED (service recovered)`);
  });

  breaker.on('timeout', () => {
    logger.error(`⏱️ [Circuit Breaker] ${serviceName} - Request TIMEOUT (>${mergedOptions.timeout}ms)`);
  });

  breaker.on('reject', () => {
    logger.error(`❌ [Circuit Breaker] ${serviceName} - Request REJECTED (circuit open)`);
  });

  breaker.on('fallback', (result) => {
    logger.warn(`🔄 [Circuit Breaker] ${serviceName} - Fallback executed`);
  });

  breaker.on('success', (result) => {
    logger.debug(`✅ [Circuit Breaker] ${serviceName} - Request succeeded`);
  });

  breaker.on('failure', (error) => {
    logger.error(`❌ [Circuit Breaker] ${serviceName} - Request failed: ${error.message}`);
  });

  return breaker;
}

/**
 * Create a circuit breaker with fallback
 * @param {string} serviceName - Name of the service
 * @param {function} fallbackFunction - Function to execute when circuit is open
 * @param {object} options - Custom circuit breaker options
 */
function createCircuitBreakerWithFallback(serviceName, fallbackFunction, options = {}) {
  const breaker = createCircuitBreaker(serviceName, options);
  breaker.fallback(fallbackFunction);
  return breaker;
}

/**
 * Get circuit breaker status
 * @param {CircuitBreaker} breaker - Circuit breaker instance
 * @returns {object} Status information
 */
function getBreakerStats(breaker) {
  const stats = breaker.stats;
  return {
    name: breaker.name,
    state: breaker.opened ? 'OPEN' : breaker.halfOpen ? 'HALF-OPEN' : 'CLOSED',
    stats: {
      fires: stats.fires,
      successes: stats.successes,
      failures: stats.failures,
      timeouts: stats.timeouts,
      rejects: stats.rejects,
      fallbacks: stats.fallbacks,
      latencyMean: stats.latencyMean,
    },
  };
}

/**
 * Health check for circuit breaker
 * @param {CircuitBreaker} breaker - Circuit breaker instance
 * @returns {boolean} true if circuit is closed (healthy)
 */
function isHealthy(breaker) {
  return !breaker.opened;
}

module.exports = {
  createCircuitBreaker,
  createCircuitBreakerWithFallback,
  getBreakerStats,
  isHealthy,
  circuitBreakerOptions,
};
