const axios = require('axios');
const NodeCache = require('node-cache');
const logger = require('../../../shared/utils/logger');

/**
 * Market Controller
 * Tích hợp CoinGecko API để lấy giá coin real-time
 */

// Cache configuration
const cache = new NodeCache({
  stdTTL: parseInt(process.env.CACHE_TTL_PRICES) || 30,
  checkperiod: 120,
});

// CoinGecko API base URL
const COINGECKO_API = process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3';

// Supported coins mapping (CoinGecko ID -> Symbol)
const COIN_MAP = {
  bitcoin: 'BTC',
  ethereum: 'ETH',
  binancecoin: 'BNB',
  solana: 'SOL',
  ripple: 'XRP',
  cardano: 'ADA',
  dogecoin: 'DOGE',
  polkadot: 'DOT',
};

const SUPPORTED_COINS = process.env.SUPPORTED_COINS?.split(',') || Object.keys(COIN_MAP);

/**
 * @desc    Get current prices for all supported coins
 * @route   GET /prices
 * @access  Public
 */
exports.getPrices = async (req, res) => {
  try {
    const cacheKey = 'current_prices';
    
    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      logger.debug('📦 Returning cached prices');
      return res.json({
        success: true,
        cached: true,
        data: cachedData,
      });
    }

    // Fetch from CoinGecko
    const response = await axios.get(`${COINGECKO_API}/simple/price`, {
      params: {
        ids: SUPPORTED_COINS.join(','),
        vs_currencies: 'usd',
        include_24hr_change: true,
        include_24hr_vol: true,
        include_market_cap: true,
      },
    });

    // Transform data to our format
    const prices = Object.entries(response.data).map(([coinId, data]) => ({
      symbol: COIN_MAP[coinId] || coinId.toUpperCase(),
      coinId,
      name: coinId.charAt(0).toUpperCase() + coinId.slice(1),
      price: data.usd,
      change24h: data.usd_24h_change || 0,
      volume24h: data.usd_24h_vol || 0,
      marketCap: data.usd_market_cap || 0,
      lastUpdated: new Date().toISOString(),
    }));

    // Cache the result
    cache.set(cacheKey, prices);

    logger.info(`✅ Fetched prices for ${prices.length} coins from CoinGecko`);

    res.json({
      success: true,
      cached: false,
      count: prices.length,
      data: prices,
    });
  } catch (error) {
    logger.error(`❌ Get prices error: ${error.message}`);
    
    // Return cached data if API fails
    const cachedData = cache.get('current_prices');
    if (cachedData) {
      logger.warn('⚠️  CoinGecko API failed, returning cached data');
      return res.json({
        success: true,
        cached: true,
        warning: 'Using cached data due to API error',
        data: cachedData,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching prices from CoinGecko',
      error: error.message,
    });
  }
};

/**
 * @desc    Get price for a specific coin
 * @route   GET /price/:coinId
 * @access  Public
 */
exports.getCoinPrice = async (req, res) => {
  try {
    const { coinId } = req.params;
    
    // Validate coin
    if (!SUPPORTED_COINS.includes(coinId.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Coin ${coinId} is not supported`,
        supportedCoins: SUPPORTED_COINS,
      });
    }

    const cacheKey = `price_${coinId}`;
    
    // Check cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json({
        success: true,
        cached: true,
        data: cachedData,
      });
    }

    // Fetch from CoinGecko
    const response = await axios.get(`${COINGECKO_API}/simple/price`, {
      params: {
        ids: coinId.toLowerCase(),
        vs_currencies: 'usd',
        include_24hr_change: true,
        include_24hr_vol: true,
      },
    });

    const coinData = response.data[coinId.toLowerCase()];
    if (!coinData) {
      return res.status(404).json({
        success: false,
        message: `Price data not found for ${coinId}`,
      });
    }

    const priceData = {
      symbol: COIN_MAP[coinId.toLowerCase()] || coinId.toUpperCase(),
      coinId: coinId.toLowerCase(),
      price: coinData.usd,
      change24h: coinData.usd_24h_change || 0,
      volume24h: coinData.usd_24h_vol || 0,
      lastUpdated: new Date().toISOString(),
    };

    // Cache the result
    cache.set(cacheKey, priceData);

    res.json({
      success: true,
      cached: false,
      data: priceData,
    });
  } catch (error) {
    logger.error(`❌ Get coin price error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching coin price',
      error: error.message,
    });
  }
};

/**
 * @desc    Get historical price chart data
 * @route   GET /chart/:coinId
 * @access  Public
 */
exports.getChartData = async (req, res) => {
  try {
    const { coinId } = req.params;
    const { days = 7 } = req.query; // Default 7 days

    // Validate coin
    if (!SUPPORTED_COINS.includes(coinId.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Coin ${coinId} is not supported`,
      });
    }

    const cacheKey = `chart_${coinId}_${days}`;
    
    // Check cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json({
        success: true,
        cached: true,
        data: cachedData,
      });
    }

    // Fetch from CoinGecko
    const response = await axios.get(`${COINGECKO_API}/coins/${coinId.toLowerCase()}/market_chart`, {
      params: {
        vs_currency: 'usd',
        days: days,
        interval: days <= 1 ? 'hourly' : 'daily',
      },
    });

    // Transform data
    const chartData = {
      symbol: COIN_MAP[coinId.toLowerCase()] || coinId.toUpperCase(),
      coinId: coinId.toLowerCase(),
      days: parseInt(days),
      prices: response.data.prices.map(([timestamp, price]) => ({
        timestamp,
        date: new Date(timestamp).toISOString(),
        price: price,
      })),
    };

    // Cache with longer TTL for chart data
    cache.set(cacheKey, chartData, parseInt(process.env.CACHE_TTL_CHART) || 300);

    logger.info(`✅ Fetched chart data for ${coinId} (${days} days)`);

    res.json({
      success: true,
      cached: false,
      data: chartData,
    });
  } catch (error) {
    logger.error(`❌ Get chart data error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching chart data',
      error: error.message,
    });
  }
};

/**
 * @desc    Get list of supported coins
 * @route   GET /coins
 * @access  Public
 */
exports.getSupportedCoins = async (req, res) => {
  try {
    const coins = SUPPORTED_COINS.map((coinId) => ({
      coinId,
      symbol: COIN_MAP[coinId] || coinId.toUpperCase(),
      name: coinId.charAt(0).toUpperCase() + coinId.slice(1),
    }));

    res.json({
      success: true,
      count: coins.length,
      data: coins,
    });
  } catch (error) {
    logger.error(`❌ Get supported coins error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching supported coins',
      error: error.message,
    });
  }
};

/**
 * @desc    Get trending coins
 * @route   GET /trending
 * @access  Public
 */
exports.getTrendingCoins = async (req, res) => {
  try {
    const cacheKey = 'trending_coins';
    
    // Check cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json({
        success: true,
        cached: true,
        data: cachedData,
      });
    }

    // Fetch from CoinGecko
    const response = await axios.get(`${COINGECKO_API}/search/trending`);

    const trending = response.data.coins.slice(0, 10).map((item) => ({
      coinId: item.item.id,
      symbol: item.item.symbol,
      name: item.item.name,
      marketCapRank: item.item.market_cap_rank,
      thumb: item.item.thumb,
    }));

    // Cache for 1 hour
    cache.set(cacheKey, trending, 3600);

    res.json({
      success: true,
      cached: false,
      data: trending,
    });
  } catch (error) {
    logger.error(`❌ Get trending coins error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching trending coins',
      error: error.message,
    });
  }
};

/**
 * @desc    Clear cache (admin function)
 * @route   POST /cache/clear
 * @access  Private
 */
exports.clearCache = (req, res) => {
  try {
    cache.flushAll();
    logger.info('🗑️  Cache cleared');

    res.json({
      success: true,
      message: 'Cache cleared successfully',
    });
  } catch (error) {
    logger.error(`❌ Clear cache error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error clearing cache',
      error: error.message,
    });
  }
};
