const axios = require('axios');
const logger = require('../../shared/utils/logger');
const { createCircuitBreaker } = require('../../shared/utils/circuitBreaker');

/**
 * Portfolio Orchestration
 * Lấy portfolio data và enrich với current prices từ Market Service
 */

// Service URLs
const SERVICES = {
  MARKET: 'http://localhost:3002',
  PORTFOLIO: 'http://localhost:3003',
};

// Circuit Breakers
const BREAKERS = {
  MARKET: createCircuitBreaker('MarketService', { timeout: 5000 }),
  PORTFOLIO: createCircuitBreaker('PortfolioService', { timeout: 5000 }),
};

/**
 * Helper: Call service with circuit breaker
 */
async function callService(serviceName, config) {
  const breaker = BREAKERS[serviceName];
  try {
    return await breaker.fire(config);
  } catch (error) {
    if (breaker.opened) {
      logger.error(`🔴 [${serviceName}] Circuit is OPEN`);
      const err = new Error(`${serviceName} is temporarily unavailable`);
      err.serviceUnavailable = true;
      throw err;
    }
    throw error;
  }
}

/**
 * @desc    Get portfolio with current prices
 * @route   GET /api/portfolio
 * @access  Private
 */
exports.getEnrichedPortfolio = async (req, res) => {
  try {
    const userId = req.userId;

    // STEP 1: Get portfolio from Portfolio Service
    logger.info(`📊 [Portfolio] Getting portfolio for user ${userId}`);
    const portfolioResponse = await callService('PORTFOLIO', {
      method: 'GET',
      url: `${SERVICES.PORTFOLIO}/`,
      headers: { 'X-User-Id': userId },
      timeout: 5000,
    });

    const portfolio = portfolioResponse.data.data;

    // If no holdings, return empty portfolio
    if (!portfolio.holdings || portfolio.holdings.length === 0) {
      return res.json({
        success: true,
        data: {
          ...portfolio,
          totalValue: 0,
          totalInvested: 0,
          totalProfit: 0,
          profitPercentage: 0,
        },
      });
    }

    // STEP 2: Get current prices for all holdings from Market Service
    logger.info(`📊 [Portfolio] Fetching prices for ${portfolio.holdings.length} holdings`);
    
    const pricePromises = portfolio.holdings.map(async (holding) => {
      try {
        const priceResponse = await callService('MARKET', {
          method: 'GET',
          url: `${SERVICES.MARKET}/price/${holding.coinId}`,
          timeout: 5000,
        });
        return {
          symbol: holding.symbol,
          coinId: holding.coinId,
          currentPrice: priceResponse.data.data.price,
        };
      } catch (error) {
        logger.error(`❌ [Portfolio] Failed to get price for ${holding.symbol}: ${error.message}`);
        // Use average buy price as fallback
        return {
          symbol: holding.symbol,
          coinId: holding.coinId,
          currentPrice: holding.averageBuyPrice,
          fallback: true,
        };
      }
    });

    const prices = await Promise.all(pricePromises);
    const pricesMap = {};
    prices.forEach(p => {
      pricesMap[p.symbol] = p.currentPrice;
    });

    // STEP 3: Calculate portfolio values
    let totalValue = 0;
    let totalInvested = 0;

    const enrichedHoldings = portfolio.holdings.map(holding => {
      const currentPrice = pricesMap[holding.symbol] || holding.averageBuyPrice;
      const currentValue = holding.amount * currentPrice;
      const invested = holding.amount * holding.averageBuyPrice;
      const profit = currentValue - invested;
      const profitPercentage = invested > 0 ? (profit / invested) * 100 : 0;

      totalValue += currentValue;
      totalInvested += invested;

      return {
        ...holding.toObject ? holding.toObject() : holding,
        currentPrice,
        currentValue,
        invested,
        profit,
        profitPercentage,
      };
    });

    const totalProfit = totalValue - totalInvested;
    const totalProfitPercentage = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

    logger.info(`✅ [Portfolio] Calculated: Value=${totalValue.toFixed(2)}, Invested=${totalInvested.toFixed(2)}, Profit=${totalProfit.toFixed(2)}`);

    // Return enriched portfolio
    res.json({
      success: true,
      data: {
        userId: portfolio.userId,
        holdings: enrichedHoldings,
        totalValue: parseFloat(totalValue.toFixed(2)),
        totalInvested: parseFloat(totalInvested.toFixed(2)),
        totalProfit: parseFloat(totalProfit.toFixed(2)),
        profitPercentage: parseFloat(totalProfitPercentage.toFixed(2)),
        lastCalculated: new Date(),
      },
    });

  } catch (error) {
    logger.error(`❌ [Portfolio] Error: ${error.message}`);
    
    // If portfolio service unavailable, return error
    if (error.serviceUnavailable) {
      return res.status(503).json({
        success: false,
        message: 'Portfolio service is temporarily unavailable',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to get portfolio',
      error: error.message,
    });
  }
};
