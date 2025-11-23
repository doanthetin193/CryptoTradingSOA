const axios = require('axios');
const Joi = require('joi');
const logger = require('../../shared/utils/logger');
const websocket = require('../../shared/utils/websocket');
const { createCircuitBreaker } = require('../../shared/utils/circuitBreaker');
const serviceDiscovery = require('../../shared/utils/serviceDiscovery');

/**
 * Trade Orchestration
 * API Gateway orchestrates calls to multiple services for buy/sell operations
 * Includes Circuit Breaker pattern for resilience
 */

// Service URLs - Dynamic discovery via Consul
const getServiceUrl = async (serviceName) => {
  return await serviceDiscovery.getServiceUrl(serviceName);
};

// Circuit Breakers for each service
const SERVICE_BREAKERS = {
  USER: createCircuitBreaker('UserService', { timeout: 5000 }),
  MARKET: createCircuitBreaker('MarketService', { timeout: 5000 }),
  PORTFOLIO: createCircuitBreaker('PortfolioService', { timeout: 5000 }),
  TRADE: createCircuitBreaker('TradeService', { timeout: 5000 }),
  NOTIFICATION: createCircuitBreaker('NotificationService', { timeout: 5000 }),
};

// Service name mappings for Consul
const SERVICE_NAMES = {
  USER: 'user-service',
  MARKET: 'market-service',
  PORTFOLIO: 'portfolio-service',
  TRADE: 'trade-service',
  NOTIFICATION: 'notification-service',
};

// Request timeout configuration
const REQUEST_TIMEOUT = 5000; // 5 seconds

// Validation schemas
const buySchema = Joi.object({
  symbol: Joi.string().required(),
  coinId: Joi.string().required(),
  amount: Joi.number().positive().required(),
});

const sellSchema = Joi.object({
  symbol: Joi.string().required(),
  amount: Joi.number().positive().required(),
});

// Trading configuration
const TRADING_FEE_PERCENTAGE = 0.1; // 0.1%
const MIN_TRADE_AMOUNT_USD = 5; // Minimum $5 USD per trade

/**
 * Helper: Call service with circuit breaker
 * @param {string} serviceName - Name of the service (USER, MARKET, etc.)
 * @param {string} endpoint - API endpoint path (e.g., '/balance', '/price/bitcoin')
 * @param {object} config - Axios config (method, headers, data, timeout)
 * @returns {Promise} Response data
 */
async function callServiceWithBreaker(serviceName, endpoint, config = {}) {
  const breaker = SERVICE_BREAKERS[serviceName];
  if (!breaker) {
    throw new Error(`Circuit breaker not found for service: ${serviceName}`);
  }

  try {
    // Get dynamic service URL from Consul
    const serviceUrl = await getServiceUrl(SERVICE_NAMES[serviceName]);
    const fullConfig = {
      ...config,
      url: `${serviceUrl}${endpoint}`,
    };
    
    const response = await breaker.fire(fullConfig);
    return response;
  } catch (error) {
    // Check if circuit is open
    if (breaker.opened) {
      logger.error(`🔴 [${serviceName}] Circuit is OPEN - Service unavailable`);
      const err = new Error(`${serviceName} is temporarily unavailable`);
      err.serviceUnavailable = true;
      err.circuitOpen = true;
      throw err;
    }

    // Check if timeout
    if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
      logger.error(`⏱️ [${serviceName}] Request timeout after ${REQUEST_TIMEOUT}ms`);
      const err = new Error(`${serviceName} request timeout`);
      err.timeout = true;
      throw err;
    }

    throw error;
  }
}

/**
 * Get circuit breaker health status
 */
function getCircuitBreakerStatus() {
  const status = {};
  for (const [name, breaker] of Object.entries(SERVICE_BREAKERS)) {
    status[name] = {
      state: breaker.opened ? 'OPEN' : breaker.halfOpen ? 'HALF-OPEN' : 'CLOSED',
      isHealthy: !breaker.opened,
      stats: {
        fires: breaker.stats.fires,
        successes: breaker.stats.successes,
        failures: breaker.stats.failures,
        timeouts: breaker.stats.timeouts,
        rejects: breaker.stats.rejects,
      },
    };
  }
  return status;
}

/**
 * @desc    Get circuit breaker health status
 * @route   GET /api/trade/health/circuit-breakers
 * @access  Private
 */
exports.getCircuitBreakerStatus = (req, res) => {
  const status = getCircuitBreakerStatus();
  res.json({
    success: true,
    data: status,
  });
};

/**
 * @desc    Buy coin - Orchestrates multiple service calls
 * @route   POST /api/trade/buy
 * @access  Private
 */
exports.buyCoin = async (req, res) => {
  // Transaction state tracking for rollback
  const transactionState = {
    balanceDeducted: false,
    deductedAmount: 0,
    holdingAdded: false,
    addedHolding: null,
    tradeRecorded: false,
    tradeId: null,
  };

  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found',
      });
    }

    // Validate input
    const { error, value } = buySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { symbol, coinId, amount } = value;

    // Additional validation
    if (amount <= 0 || !isFinite(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount. Must be positive and finite.',
      });
    }

    // STEP 1: Get current price from Market Service
    logger.info(`🔄 [BUY] Step 1: Getting price for ${coinId}`);
    const priceResponse = await callServiceWithBreaker('MARKET', `/price/${coinId}`, {
      method: 'GET',
      timeout: REQUEST_TIMEOUT,
    });
    
    if (!priceResponse.data.success) {
      return res.status(503).json({
        success: false,
        message: 'Failed to get market price',
      });
    }

    const currentPrice = priceResponse.data.data.price;
    const coinName = priceResponse.data.data.name;

    // Calculate costs
    const totalCost = amount * currentPrice;
    const fee = totalCost * (TRADING_FEE_PERCENTAGE / 100);
    const finalCost = totalCost + fee;

    // Check minimum trade amount
    if (totalCost < MIN_TRADE_AMOUNT_USD) {
      return res.status(400).json({
        success: false,
        message: `Minimum trade amount is ${MIN_TRADE_AMOUNT_USD} USD`,
      });
    }

    // STEP 2: Get user balance from User Service
    logger.info(`🔄 [BUY] Step 2: Checking balance for user ${userId}`);
    const balanceResponse = await callServiceWithBreaker('USER', '/balance', {
      method: 'GET',
      headers: { 'X-User-Id': userId },
      timeout: REQUEST_TIMEOUT,
    });

    const currentBalance = balanceResponse.data.data.balance;

    if (currentBalance < finalCost) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Required: ${finalCost.toFixed(2)} USDT, Available: ${currentBalance.toFixed(2)} USDT`,
      });
    }

    // STEP 3: Update user balance (deduct cost)
    logger.info(`🔄 [BUY] Step 3: Deducting ${finalCost} from balance`);
    try {
      const updateBalanceResponse = await callServiceWithBreaker('USER', '/balance', {
        method: 'PUT',
        data: {
          userId,
          amount: -finalCost,
          type: 'trade',
          description: `Buy ${amount} ${symbol} at ${currentPrice} USDT`,
        },
        headers: { 'X-User-Id': userId },
        timeout: REQUEST_TIMEOUT,
      });

      const newBalance = updateBalanceResponse.data.data.balance;
      transactionState.balanceDeducted = true;
      transactionState.deductedAmount = finalCost;
      logger.info(`✅ [BUY] Step 3 completed: New balance ${newBalance}`);

      // STEP 4: Update portfolio (add holding)
      logger.info(`🔄 [BUY] Step 4: Adding ${amount} ${symbol} to portfolio`);
      try {
        await callServiceWithBreaker('PORTFOLIO', '/holding', {
          method: 'POST',
          data: {
            symbol: symbol.toUpperCase(),
            coinId: coinId.toLowerCase(),
            name: coinName,
            amount,
            buyPrice: currentPrice,
          },
          headers: { 'X-User-Id': userId },
          timeout: REQUEST_TIMEOUT,
        });

        transactionState.holdingAdded = true;
        transactionState.addedHolding = { symbol: symbol.toUpperCase(), amount };
        logger.info(`✅ [BUY] Step 4 completed: Holding added`);

        // STEP 5: Create trade record
        logger.info(`🔄 [BUY] Step 5: Creating trade record`);
        try {
          const tradeResponse = await callServiceWithBreaker('TRADE', '/', {
            method: 'POST',
            data: {
              userId,
              type: 'buy',
              symbol: symbol.toUpperCase(),
              coinId: coinId.toLowerCase(),
              coinName,
              amount,
              price: currentPrice,
              totalCost,
              fee,
              feePercentage: TRADING_FEE_PERCENTAGE,
              balanceBefore: currentBalance,
              balanceAfter: newBalance,
            },
            headers: { 'X-User-Id': userId },
            timeout: REQUEST_TIMEOUT,
          });

          const trade = tradeResponse.data.data;
          transactionState.tradeRecorded = true;
          transactionState.tradeId = trade._id;
          logger.info(`✅ [BUY] Step 5 completed: Trade recorded`)

    // STEP 6: Send notification (non-blocking)
    logger.info(`🔄 [BUY] Step 6: Sending notification`);
    getServiceUrl('notification-service').then(notificationUrl => {
      axios.post(
        `${notificationUrl}/send`,
        {
          userId,
          type: 'trade',
          title: 'Buy Order Completed',
          message: `Successfully bought ${amount} ${symbol} at ${currentPrice} USDT`,
          data: { tradeId: trade._id, type: 'buy', symbol, amount },
        },
        {
          headers: { 'X-User-Id': userId },
        }
      ).catch(err => logger.warn(`Failed to send notification: ${err.message}`));
    }).catch(err => logger.warn(`Failed to get notification service URL: ${err.message}`));

    // STEP 7: Send real-time WebSocket notification
    logger.info(`🔄 [BUY] Step 7: Sending WebSocket notification`);
    websocket.sendTradeConfirmation(userId, {
      type: 'buy',
      symbol,
      amount,
      price: currentPrice,
      totalCost: finalCost,
      newBalance,
      timestamp: new Date(),
    });

    logger.info(`✅ [BUY] Completed: ${amount} ${symbol} for user ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Buy order completed successfully',
      data: {
        trade,
        newBalance,
      },
    });
        } catch (tradeError) {
          logger.error(`❌ [BUY] Step 5 failed: ${tradeError.message}`);
          throw tradeError;
        }
      } catch (portfolioError) {
        logger.error(`❌ [BUY] Step 4 failed: ${portfolioError.message}`);
        throw portfolioError;
      }
    } catch (balanceError) {
      logger.error(`❌ [BUY] Step 3 failed: ${balanceError.message}`);
      throw balanceError;
    }

  } catch (error) {
    logger.error(`❌ [BUY] Transaction failed: ${error.message}`);
    if (error.response) {
      logger.error(`❌ [BUY] Response error: ${JSON.stringify(error.response.data)}`);
    }

    // ==========================================
    // ROLLBACK MECHANISM
    // ==========================================
    logger.warn(`🔄 [BUY] Starting rollback process...`);
    const rollbackErrors = [];

    // Rollback Step 4: Remove holding if added
    if (transactionState.holdingAdded && transactionState.addedHolding) {
      try {
        logger.info(`🔄 [BUY] Rolling back: Removing ${transactionState.addedHolding.amount} ${transactionState.addedHolding.symbol}`);
        await callServiceWithBreaker('PORTFOLIO', '/holding', {
          method: 'PUT',
          data: {
            symbol: transactionState.addedHolding.symbol,
            amount: transactionState.addedHolding.amount,
          },
          headers: { 'X-User-Id': userId },
          timeout: REQUEST_TIMEOUT * 2, // Longer timeout for rollback
        });
        logger.info(`✅ [BUY] Rollback: Holding removed`);
      } catch (rollbackError) {
        const errMsg = `Failed to rollback holding: ${rollbackError.message}`;
        logger.error(`❌ [BUY] CRITICAL: ${errMsg}`);
        rollbackErrors.push(errMsg);
      }
    }

    // Rollback Step 3: Refund balance if deducted
    if (transactionState.balanceDeducted && transactionState.deductedAmount > 0) {
      try {
        logger.info(`🔄 [BUY] Rolling back: Refunding ${transactionState.deductedAmount} USDT`);
        await callServiceWithBreaker('USER', '/balance', {
          method: 'PUT',
          data: {
            userId,
            amount: transactionState.deductedAmount,
            type: 'rollback',
            description: `Rollback failed buy transaction for ${amount} ${symbol}`,
          },
          headers: { 'X-User-Id': userId },
          timeout: REQUEST_TIMEOUT * 2, // Longer timeout for rollback
        });
        logger.info(`✅ [BUY] Rollback: Balance refunded`);
      } catch (rollbackError) {
        const errMsg = `Failed to rollback balance: ${rollbackError.message}`;
        logger.error(`❌ [BUY] CRITICAL: ${errMsg}`);
        rollbackErrors.push(errMsg);
        
        // CRITICAL: Send alert to admin
        logger.error(`🚨 [BUY] CRITICAL DATA INCONSISTENCY: User ${userId} may have lost ${transactionState.deductedAmount} USDT`);
      }
    }

    // Log rollback completion
    if (rollbackErrors.length > 0) {
      logger.error(`❌ [BUY] Rollback completed with ${rollbackErrors.length} error(s)`);
      logger.error(`❌ [BUY] Rollback errors: ${JSON.stringify(rollbackErrors)}`);
    } else if (transactionState.balanceDeducted || transactionState.holdingAdded) {
      logger.info(`✅ [BUY] Rollback completed successfully`);
    }

    // Return error response
    const responseMessage = rollbackErrors.length > 0
      ? 'Transaction failed. Rollback attempted but encountered errors. Please contact support.'
      : 'Transaction failed and has been rolled back.';

    res.status(500).json({
      success: false,
      message: responseMessage,
      error: error.response?.data?.message || error.message || 'Failed to process buy order',
      rolledBack: transactionState.balanceDeducted || transactionState.holdingAdded,
      rollbackErrors: rollbackErrors.length > 0 ? rollbackErrors : undefined,
      details: process.env.NODE_ENV === 'development' ? {
        originalError: error.message,
        serviceError: error.response?.data,
        transactionState,
      } : undefined,
    });
  }
};

/**
 * @desc    Sell coin - Orchestrates multiple service calls
 * @route   POST /api/trade/sell
 * @access  Private
 */
exports.sellCoin = async (req, res) => {
  // Transaction state tracking for rollback
  const transactionState = {
    balanceAdded: false,
    addedAmount: 0,
    holdingReduced: false,
    reducedHolding: null,
    originalHoldingAmount: 0,
    originalHolding: null,
    coinName: null,
    tradeRecorded: false,
    tradeId: null,
  };

  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found',
      });
    }

    // Validate input
    const { error, value } = sellSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { symbol, amount } = value;

    // Additional validation
    if (amount <= 0 || !isFinite(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount. Must be positive and finite.',
      });
    }

    // STEP 1: Get portfolio to check holdings
    logger.info(`🔄 [SELL] Step 1: Checking holdings for ${symbol}`);
    const portfolioResponse = await callServiceWithBreaker('PORTFOLIO', '/', {
      method: 'GET',
      headers: { 'X-User-Id': userId },
      timeout: REQUEST_TIMEOUT,
    });

    const portfolio = portfolioResponse.data.data;
    const holding = portfolio.holdings.find(h => h.symbol === symbol.toUpperCase());

    if (!holding || holding.amount < amount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient ${symbol}. Available: ${holding?.amount || 0}`,
      });
    }

    // Save holding data for potential rollback
    transactionState.originalHolding = holding;
    transactionState.originalHoldingAmount = holding.amount;

    // STEP 2: Get current price from Market Service
    logger.info(`🔄 [SELL] Step 2: Getting price for ${holding.coinId}`);
    const priceResponse = await callServiceWithBreaker('MARKET', `/price/${holding.coinId}`, {
      method: 'GET',
      timeout: REQUEST_TIMEOUT,
    });

    const currentPrice = priceResponse.data.data.price;
    const coinName = priceResponse.data.data.name;

    // Save coinName for potential rollback
    transactionState.coinName = coinName;

    // Calculate proceeds
    const totalProceeds = amount * currentPrice;
    const fee = totalProceeds * (TRADING_FEE_PERCENTAGE / 100);
    const finalProceeds = totalProceeds - fee;

    // STEP 3: Get current balance
    logger.info(`🔄 [SELL] Step 3: Getting current balance`);
    const balanceResponse = await callServiceWithBreaker('USER', '/balance', {
      method: 'GET',
      headers: { 'X-User-Id': userId },
      timeout: REQUEST_TIMEOUT,
    });
    const currentBalance = balanceResponse.data.data.balance;

    // STEP 4: Update user balance (add proceeds)
    logger.info(`🔄 [SELL] Step 4: Adding ${finalProceeds} to balance`);
    try {
      const updateBalanceResponse = await callServiceWithBreaker('USER', '/balance', {
        method: 'PUT',
        data: {
          userId,
          amount: finalProceeds,
          type: 'trade',
          description: `Sell ${amount} ${symbol} at ${currentPrice} USDT`,
        },
        headers: { 'X-User-Id': userId },
        timeout: REQUEST_TIMEOUT,
      });

      const newBalance = updateBalanceResponse.data.data.balance;
      transactionState.balanceAdded = true;
      transactionState.addedAmount = finalProceeds;
      logger.info(`✅ [SELL] Step 4 completed: New balance ${newBalance}`);

      // STEP 5: Update portfolio (reduce holding)
      logger.info(`🔄 [SELL] Step 5: Reducing ${amount} ${symbol} from portfolio`);
      try {
        await callServiceWithBreaker('PORTFOLIO', '/holding', {
          method: 'PUT',
          data: {
            symbol: symbol.toUpperCase(),
            amount,
          },
          headers: { 'X-User-Id': userId },
          timeout: REQUEST_TIMEOUT,
        });

        transactionState.holdingReduced = true;
        transactionState.reducedHolding = { symbol: symbol.toUpperCase(), amount };
        logger.info(`✅ [SELL] Step 5 completed: Holding reduced`);

    // STEP 6: Create trade record
    logger.info(`🔄 [SELL] Step 6: Creating trade record`);
    try {
      const profitLoss = (currentPrice - holding.averageBuyPrice) * amount - fee;
      
      const tradeResponse = await callServiceWithBreaker('TRADE', '/', {
        method: 'POST',
        data: {
          userId,
          type: 'sell',
          symbol: symbol.toUpperCase(),
          coinId: holding.coinId,
          coinName,
          amount,
          price: currentPrice,
          totalCost: totalProceeds,
          fee,
          feePercentage: TRADING_FEE_PERCENTAGE,
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
        },
        headers: { 'X-User-Id': userId },
        timeout: REQUEST_TIMEOUT,
      });

      const trade = tradeResponse.data.data;
      transactionState.tradeRecorded = true;
      transactionState.tradeId = trade._id;
      logger.info(`✅ [SELL] Step 6 completed: Trade recorded`);

      // STEP 7: Send notification (non-blocking)
      logger.info(`🔄 [SELL] Step 7: Sending notification`);
      getServiceUrl('notification-service').then(notificationUrl => {
        axios.post(
          `${notificationUrl}/send`,
          {
            userId,
            type: 'trade',
            title: 'Sell Order Completed',
            message: `Successfully sold ${amount} ${symbol} at ${currentPrice} USDT. P/L: ${profitLoss.toFixed(2)} USDT`,
            data: { 
              tradeId: trade._id, 
              type: 'sell', 
              symbol, 
              amount,
              profitLoss: profitLoss.toFixed(2),
            },
          },
          {
            headers: { 'X-User-Id': userId },
          }
        ).catch(err => logger.warn(`Failed to send notification: ${err.message}`));
      }).catch(err => logger.warn(`Failed to get notification service URL: ${err.message}`));

      // STEP 8: Send real-time WebSocket notification
      logger.info(`🔄 [SELL] Step 8: Sending WebSocket notification`);
      websocket.sendTradeConfirmation(userId, {
        type: 'sell',
        symbol,
        amount,
        price: currentPrice,
        totalProceeds: finalProceeds,
        profitLoss,
        newBalance,
        timestamp: new Date(),
      });

      logger.info(`✅ [SELL] Completed: ${amount} ${symbol} for user ${userId}`);

      res.status(200).json({
        success: true,
        message: 'Sell order completed successfully',
        data: {
          trade,
          newBalance,
          profitLoss,
        },
      });
    } catch (tradeError) {
      logger.error(`❌ [SELL] Step 6 failed: ${tradeError.message}`);
      throw tradeError;
    }
      } catch (portfolioError) {
        logger.error(`❌ [SELL] Step 5 failed: ${portfolioError.message}`);
        throw portfolioError;
      }
    } catch (balanceError) {
      logger.error(`❌ [SELL] Step 4 failed: ${balanceError.message}`);
      throw balanceError;
    }

  } catch (error) {
    logger.error(`❌ [SELL] Transaction failed: ${error.message}`);

    // ==========================================
    // ROLLBACK MECHANISM
    // ==========================================
    logger.warn(`🔄 [SELL] Starting rollback process...`);
    const rollbackErrors = [];

    // Rollback Step 5: Restore holding if reduced
    if (transactionState.holdingReduced && transactionState.reducedHolding && transactionState.originalHolding) {
      try {
        logger.info(`🔄 [SELL] Rolling back: Restoring ${transactionState.reducedHolding.amount} ${transactionState.reducedHolding.symbol}`);
        await callServiceWithBreaker('PORTFOLIO', '/holding', {
          method: 'POST',
          data: {
            symbol: transactionState.reducedHolding.symbol,
            coinId: transactionState.originalHolding.coinId.toLowerCase(),
            name: transactionState.coinName,
            amount: transactionState.reducedHolding.amount,
            buyPrice: transactionState.originalHolding.averageBuyPrice,
          },
          headers: { 'X-User-Id': userId },
          timeout: REQUEST_TIMEOUT * 2,
        });
        logger.info(`✅ [SELL] Rollback: Holding restored`);
      } catch (rollbackError) {
        const errMsg = `Failed to rollback holding: ${rollbackError.message}`;
        logger.error(`❌ [SELL] CRITICAL: ${errMsg}`);
        rollbackErrors.push(errMsg);
      }
    }

    // Rollback Step 4: Deduct balance if added
    if (transactionState.balanceAdded && transactionState.addedAmount > 0) {
      try {
        logger.info(`🔄 [SELL] Rolling back: Deducting ${transactionState.addedAmount} USDT`);
        await callServiceWithBreaker('USER', '/balance', {
          method: 'PUT',
          data: {
            userId,
            amount: -transactionState.addedAmount,
            type: 'rollback',
            description: `Rollback failed sell transaction for ${amount} ${symbol}`,
          },
          headers: { 'X-User-Id': userId },
          timeout: REQUEST_TIMEOUT * 2,
        });
        logger.info(`✅ [SELL] Rollback: Balance deducted`);
      } catch (rollbackError) {
        const errMsg = `Failed to rollback balance: ${rollbackError.message}`;
        logger.error(`❌ [SELL] CRITICAL: ${errMsg}`);
        rollbackErrors.push(errMsg);
        
        // CRITICAL: Send alert to admin
        logger.error(`🚨 [SELL] CRITICAL DATA INCONSISTENCY: User ${userId} may have gained ${transactionState.addedAmount} USDT incorrectly`);
      }
    }

    // Log rollback completion
    if (rollbackErrors.length > 0) {
      logger.error(`❌ [SELL] Rollback completed with ${rollbackErrors.length} error(s)`);
      logger.error(`❌ [SELL] Rollback errors: ${JSON.stringify(rollbackErrors)}`);
    } else if (transactionState.balanceAdded || transactionState.holdingReduced) {
      logger.info(`✅ [SELL] Rollback completed successfully`);
    }

    // Return error response
    const responseMessage = rollbackErrors.length > 0
      ? 'Transaction failed. Rollback attempted but encountered errors. Please contact support.'
      : 'Transaction failed and has been rolled back.';

    res.status(500).json({
      success: false,
      message: responseMessage,
      error: error.response?.data?.message || error.message || 'Failed to process sell order',
      rolledBack: transactionState.balanceAdded || transactionState.holdingReduced,
      rollbackErrors: rollbackErrors.length > 0 ? rollbackErrors : undefined,
      details: process.env.NODE_ENV === 'development' ? {
        originalError: error.message,
        serviceError: error.response?.data,
        transactionState,
      } : undefined,
    });
  }
};
