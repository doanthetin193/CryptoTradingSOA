# Circuit Breaker Implementation Guide

## Overview

Hệ thống đã implement **Circuit Breaker Pattern** để ngăn chặn cascading failures khi các microservices chậm hoặc down.

## What is Circuit Breaker?

Circuit Breaker hoạt động giống như cầu dao điện:
- **CLOSED** (Bình thường): Requests được gửi đến service
- **OPEN** (Ngắt): Service down → Reject requests ngay, không waste thời gian
- **HALF-OPEN** (Thử nghiệm): Sau 30s, thử gửi 1 request để test recovery

## Configuration

### Current Settings

```javascript
{
  timeout: 5000,                    // 5s timeout
  errorThresholdPercentage: 50,    // Open khi 50% requests fail
  resetTimeout: 30000,              // Thử close lại sau 30s
  volumeThreshold: 5,               // Cần tối thiểu 5 requests
}
```

### Services Protected

1. **UserService** (Port 3001) - Timeout: 5s
2. **MarketService** (Port 3002) - Timeout: 5s
3. **PortfolioService** (Port 3003) - Timeout: 5s
4. **TradeService** (Port 3004) - Timeout: 5s
5. **NotificationService** (Port 3005) - Timeout: 3s

## Usage in Code

### 1. Import Circuit Breaker

```javascript
const { createCircuitBreaker } = require('../../shared/utils/circuitBreaker');
```

### 2. Create Breaker Instance

```javascript
const breaker = createCircuitBreaker('ServiceName', {
  timeout: 5000,
  errorThresholdPercentage: 50,
});
```

### 3. Call Service with Breaker

```javascript
try {
  const response = await breaker.fire({
    method: 'GET',
    url: 'http://localhost:3001/api/users',
    headers: { 'X-User-Id': userId },
    timeout: 5000,
  });
  
  return response.data;
} catch (error) {
  // Handle circuit open or timeout
  if (breaker.opened) {
    logger.error('Circuit is OPEN - Service unavailable');
  }
}
```

### 4. Helper Function (Recommended)

```javascript
async function callServiceWithBreaker(serviceName, config) {
  const breaker = SERVICE_BREAKERS[serviceName];
  
  try {
    return await breaker.fire(config);
  } catch (error) {
    if (breaker.opened) {
      const err = new Error(`${serviceName} is temporarily unavailable`);
      err.circuitOpen = true;
      throw err;
    }
    throw error;
  }
}

// Usage
const response = await callServiceWithBreaker('USER', {
  method: 'GET',
  url: `${SERVICES.USER}/balance`,
  headers: { 'X-User-Id': userId },
  timeout: 5000,
});
```

## Benefits

### Before Circuit Breaker
```
User Request → API Gateway
  → Market Service (DOWN, waiting 30s...)
  → Market Service (TIMEOUT after 30s)
  → Retry 1 (30s...)
  → Retry 2 (30s...)
Total: 90+ seconds của agony
```

### After Circuit Breaker
```
User Request → API Gateway
  → Market Service (Circuit OPEN)
  → Instant rejection (< 10ms)
  → Return error immediately
Total: < 100ms
```

## Monitoring

### Health Check Endpoint

```bash
GET /api/health/circuit-breakers
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "USER": {
      "state": "CLOSED",
      "isHealthy": true,
      "stats": {
        "fires": 120,
        "successes": 118,
        "failures": 2,
        "timeouts": 0,
        "rejects": 0
      }
    },
    "MARKET": {
      "state": "OPEN",
      "isHealthy": false,
      "stats": {
        "fires": 50,
        "successes": 20,
        "failures": 30,
        "timeouts": 25,
        "rejects": 10
      }
    }
  }
}
```

### Log Events

Circuit breaker tự động log các events:

```
🟢 [Circuit Breaker] UserService - Circuit CLOSED (service recovered)
🟡 [Circuit Breaker] MarketService - Circuit HALF-OPEN (testing recovery)
🔴 [Circuit Breaker] MarketService - Circuit OPENED (too many failures)
⏱️ [Circuit Breaker] PortfolioService - Request TIMEOUT (>5000ms)
❌ [Circuit Breaker] TradeService - Request REJECTED (circuit open)
```

## Error Handling

### Circuit Open Error

```javascript
{
  status: 503,
  message: "MarketService is temporarily unavailable",
  circuitOpen: true
}
```

### Timeout Error

```javascript
{
  status: 504,
  message: "MarketService request timeout",
  timeout: true
}
```

## Best Practices

### 1. Set Appropriate Timeouts

- **Critical Services**: 5s timeout
- **Non-critical Services**: 3s timeout
- **Rollback Operations**: 10s timeout (2x normal)

### 2. Implement Fallbacks

```javascript
const breaker = createCircuitBreakerWithFallback(
  'MarketService',
  async () => {
    // Return cached data or default values
    return { price: 0, cached: true };
  }
);
```

### 3. Monitor Circuit Status

```javascript
// Check before critical operations
if (!SERVICE_BREAKERS.MARKET.opened) {
  // Proceed with operation
} else {
  // Use cached data or skip
}
```

### 4. Graceful Degradation

```javascript
try {
  const price = await getMarketPrice(coinId);
} catch (error) {
  if (error.circuitOpen) {
    // Use last known price from cache
    const cachedPrice = await getCachedPrice(coinId);
    logger.warn('Using cached price due to circuit open');
    return cachedPrice;
  }
  throw error;
}
```

## Testing Circuit Breaker

### Simulate Service Down

1. Stop Market Service:
   ```bash
   # Stop port 3002
   ```

2. Make multiple requests (>5):
   ```bash
   # Send 10 buy requests
   ```

3. Check circuit status:
   ```bash
   curl http://localhost:3000/api/health/circuit-breakers
   ```

4. Verify circuit is OPEN after 50% failures

### Expected Behavior

- First 5 requests: Slow (5s timeout each)
- After 50% fail: Circuit OPENS
- Next requests: Instant rejection (< 10ms)
- After 30s: Circuit goes HALF-OPEN
- Next request: If success → CLOSED, if fail → OPEN again

## Performance Impact

### Without Circuit Breaker
- 100 requests to down service = 500 seconds (5s each)
- System blocked, other users affected
- Resource exhaustion

### With Circuit Breaker
- First 5 requests = 25 seconds (5s each)
- Circuit opens
- Next 95 requests = < 1 second total
- **Total: 26s instead of 500s** (19x faster!)

## Integration with Rollback

```javascript
// Longer timeout for rollback operations
await callServiceWithBreaker('USER', {
  method: 'PUT',
  url: `${SERVICES.USER}/balance`,
  data: { userId, amount: refundAmount },
  timeout: REQUEST_TIMEOUT * 2, // 10s instead of 5s
});
```

## Future Improvements

1. **Adaptive Timeout**: Auto-adjust based on service latency
2. **Circuit Breaker Dashboard**: Real-time visualization
3. **Alert System**: Notify admin when circuit opens
4. **Circuit Breaker per User**: Isolate failures
5. **Bulkhead Pattern**: Limit concurrent requests

## Troubleshooting

### Circuit Keeps Opening

**Problem**: Circuit opens frequently

**Solutions**:
- Check service health: `docker ps` or `ps aux`
- Increase timeout: `timeout: 10000`
- Reduce error threshold: `errorThresholdPercentage: 70`
- Check network latency

### Circuit Never Opens

**Problem**: Service slow but circuit stays closed

**Solutions**:
- Reduce volume threshold: `volumeThreshold: 3`
- Reduce error threshold: `errorThresholdPercentage: 30`
- Check if timeout is too high

### Rollback Failures

**Problem**: Rollback fails when circuit is open

**Solutions**:
- Use separate breaker for rollback with higher timeout
- Implement retry with exponential backoff
- Log critical inconsistencies for manual fix

## References

- [Circuit Breaker Pattern - Martin Fowler](https://martinfowler.com/bliki/CircuitBreaker.html)
- [Opossum Circuit Breaker](https://nodeshift.dev/opossum/)
- [Netflix Hystrix](https://github.com/Netflix/Hystrix/wiki)

---

**Author**: CryptoTrading SOA Team  
**Last Updated**: 2025-11-21  
**Version**: 1.0.0
