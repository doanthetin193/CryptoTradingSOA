const axios = require('axios');
const logger = require('./logger');

/**
 * HTTP Client để gọi REST API giữa các services
 * Hỗ trợ retry logic và error handling
 */

class HttpClient {
  constructor(baseURL, timeout = 5000) {
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
   * GET request
   */
  async get(url, config = {}) {
    try {
      const response = await this.client.get(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * POST request
   */
  async post(url, data = {}, config = {}) {
    try {
      const response = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * PUT request
   */
  async put(url, data = {}, config = {}) {
    try {
      const response = await this.client.put(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * DELETE request
   */
  async delete(url, config = {}) {
    try {
      const response = await this.client.delete(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle errors
   */
  handleError(error) {
    if (error.response) {
      return {
        status: error.response.status,
        message: error.response.data?.message || error.message,
        data: error.response.data,
      };
    } else if (error.request) {
      return {
        status: 503,
        message: 'Service unavailable',
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
