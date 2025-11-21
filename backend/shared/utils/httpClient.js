const axios = require('axios');
const logger = require('./logger');
const { createCircuitBreaker } = require('./circuitBreaker');

/**
 * HTTP Client để gọi REST API giữa các services
 * Hỗ trợ Circuit Breaker, Timeout, và Error Handling
 */

class HttpClient {
  constructor(baseURL, timeout = 5000, serviceName = 'UnknownService') {
    this.baseURL = baseURL;
    this.timeout = timeout;
    this.serviceName = serviceName;
    
    // Create circuit breaker for this service
    this.circuitBreaker = createCircuitBreaker(serviceName, {
      timeout: timeout,
      errorThresholdPercentage: 50,
      resetTimeout: 30000,
    });

    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        logger.debug(`🚀 HTTP Request: ${config.method.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error(`❌ Request Error: ${error.message}`);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`✅ HTTP Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        if (error.response) {
          // Server responded with error status
          logger.error(`❌ HTTP Error ${error.response.status}: ${error.response.data?.message || error.message}`);
        } else if (error.request) {
          // Request made but no response
          logger.error(`❌ No response from server: ${error.message}`);
        } else {
          // Error in request setup
          logger.error(`❌ Request setup error: ${error.message}`);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * GET request with circuit breaker
   */
  async get(url, config = {}) {
    try {
      const response = await this.circuitBreaker.fire({
        method: 'GET',
        url: `${this.baseURL}${url}`,
        ...config,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * POST request with circuit breaker
   */
  async post(url, data = {}, config = {}) {
    try {
      const response = await this.circuitBreaker.fire({
        method: 'POST',
        url: `${this.baseURL}${url}`,
        data,
        ...config,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * PUT request with circuit breaker
   */
  async put(url, data = {}, config = {}) {
    try {
      const response = await this.circuitBreaker.fire({
        method: 'PUT',
        url: `${this.baseURL}${url}`,
        data,
        ...config,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * DELETE request with circuit breaker
   */
  async delete(url, config = {}) {
    try {
      const response = await this.circuitBreaker.fire({
        method: 'DELETE',
        url: `${this.baseURL}${url}`,
        ...config,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle errors
   */
  handleError(error) {
    // Handle circuit breaker specific errors
    if (error.message && error.message.includes('Breaker is open')) {
      logger.error(`🔴 [${this.serviceName}] Circuit breaker is OPEN - Service unavailable`);
      return {
        status: 503,
        message: `${this.serviceName} is temporarily unavailable. Please try again later.`,
        data: null,
        circuitOpen: true,
      };
    }

    if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
      logger.error(`⏱️ [${this.serviceName}] Request timeout`);
      return {
        status: 504,
        message: `${this.serviceName} request timeout`,
        data: null,
        timeout: true,
      };
    }

    if (error.response) {
      return {
        status: error.response.status,
        message: error.response.data?.message || error.message,
        data: error.response.data,
      };
    } else if (error.request) {
      return {
        status: 503,
        message: `${this.serviceName} unavailable`,
        data: null,
      };
    } else {
      return {
        status: 500,
        message: error.message,
        data: null,
      };
    }
  }

  /**
   * Get circuit breaker status
   */
  getCircuitStatus() {
    return {
      serviceName: this.serviceName,
      state: this.circuitBreaker.opened ? 'OPEN' : this.circuitBreaker.halfOpen ? 'HALF-OPEN' : 'CLOSED',
      isHealthy: !this.circuitBreaker.opened,
      stats: this.circuitBreaker.stats,
    };
  }

  /**
   * Check if service is healthy
   */
  isHealthy() {
    return !this.circuitBreaker.opened;
  }

  /**
   * Set authorization token
   */
  setAuthToken(token) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Remove authorization token
   */
  removeAuthToken() {
    delete this.client.defaults.headers.common['Authorization'];
  }
}

module.exports = HttpClient;
