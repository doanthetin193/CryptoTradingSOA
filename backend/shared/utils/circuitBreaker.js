const CircuitBreaker = require('opossum');
const axios = require('axios');
const logger = require('./logger');

/**
 * Tiện ích Circuit Breaker
 * Bọc các cuộc gọi service để ngăn chặn lỗi dây chuyền (cascading failures)
 */

// Cấu hình Circuit Breaker
const circuitBreakerOptions = {
  timeout: 5000, // Timeout 5 giây
  errorThresholdPercentage: 50, // Mở mạch nếu 50% request thất bại
  resetTimeout: 30000, // Thử đóng mạch sau 30 giây
  rollingCountTimeout: 10000, // Cửa sổ trượt để tính toán lỗi (10 giây)
  rollingCountBuckets: 10, // Số lượng bucket trong cửa sổ trượt
  name: 'ServiceCircuitBreaker',
  volumeThreshold: 5, // Số lượng request tối thiểu trước khi kiểm tra tỷ lệ lỗi
};

/**
 * Tạo một circuit breaker cho các HTTP request
 * @param {string} serviceName - Tên của service (để log)
 * @param {object} options - Tùy chọn circuit breaker tùy chỉnh
 * @returns {CircuitBreaker} Instance của Circuit breaker
 */
function createCircuitBreaker(serviceName, options = {}) {
  const mergedOptions = { ...circuitBreakerOptions, ...options, name: serviceName };

  // Tạo circuit breaker
  const breaker = new CircuitBreaker(
    async (config) => {
      // Thực hiện HTTP request thực tế
      return await axios(config);
    },
    mergedOptions
  );

  // ===========================
  // Event Listeners (Lắng nghe sự kiện)
  // ===========================

  breaker.on('open', () => {
    logger.warn(`🔴 [Circuit Breaker] ${serviceName} - Mạch đã MỞ (quá nhiều lỗi)`);
  });

  breaker.on('halfOpen', () => {
    logger.info(`🟡 [Circuit Breaker] ${serviceName} - Mạch NỬA-MỞ (đang thử khôi phục)`);
  });

  breaker.on('close', () => {
    logger.info(`🟢 [Circuit Breaker] ${serviceName} - Mạch đã ĐÓNG (service đã khôi phục)`);
  });

  breaker.on('timeout', () => {
    logger.error(`⏱️ [Circuit Breaker] ${serviceName} - Request QUÁ HẠN (>${mergedOptions.timeout}ms)`);
  });

  breaker.on('reject', () => {
    logger.error(`❌ [Circuit Breaker] ${serviceName} - Request BỊ TỪ CHỐI (mạch đang mở)`);
  });

  breaker.on('fallback', (result) => {
    logger.warn(`🔄 [Circuit Breaker] ${serviceName} - Fallback đã được thực thi`);
  });

  breaker.on('success', (result) => {
    logger.debug(`✅ [Circuit Breaker] ${serviceName} - Request thành công`);
  });

  breaker.on('failure', (error) => {
    logger.error(`❌ [Circuit Breaker] ${serviceName} - Request thất bại: ${error.message}`);
  });

  return breaker;
}


module.exports = {
  createCircuitBreaker,
  circuitBreakerOptions,
};
