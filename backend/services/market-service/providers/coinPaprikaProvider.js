const axios = require('axios');
const logger = require('../../../shared/utils/logger');

/**
 * CoinPaprika Provider
 * Free: 20k requests/month, 10 calls/second
 * Docs: https://api.coinpaprika.com/
 */

const COINPAPRIKA_API = 'https://api.coinpaprika.com/v1';

// CoinPaprika coin IDs mapping
const COIN_MAP = {
  bitcoin: { id: 'btc-bitcoin', symbol: 'BTC' },
  ethereum: { id: 'eth-ethereum', symbol: 'ETH' },
  binancecoin: { id: 'bnb-binance-coin', symbol: 'BNB' },
  solana: { id: 'sol-solana', symbol: 'SOL' },
  ripple: { id: 'xrp-xrp', symbol: 'XRP' },
  cardano: { id: 'ada-cardano', symbol: 'ADA' },
  dogecoin: { id: 'doge-dogecoin', symbol: 'DOGE' },
  polkadot: { id: 'dot-polkadot', symbol: 'DOT' },
};

class CoinPaprikaProvider {
  constructor() {
    this.name = 'CoinPaprika';
  }

  /**
   * Get current price for single coin
   */
  async getPrice(coinId) {
    try {
      const paprikaId = COIN_MAP[coinId]?.id;
      if (!paprikaId) {
        throw new Error(`Coin ${coinId} not supported by CoinPaprika`);
      }

      const response = await axios.get(`${COINPAPRIKA_API}/tickers/${paprikaId}`, {
        timeout: 5000,
      });

      const data = response.data;
      
      return {
        symbol: COIN_MAP[coinId].symbol,
        coinId,
        name: data.name,
        price: data.quotes.USD.price,
        change24h: data.quotes.USD.percent_change_24h || 0,
        volume24h: data.quotes.USD.volume_24h || 0,
        marketCap: data.quotes.USD.market_cap || 0,
        provider: 'CoinPaprika',
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      logger.error(`❌ [${this.name}] Get price error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get historical chart data (OHLC)
   */
  async getChartData(coinId, days = 7) {
    try {
      const paprikaId = COIN_MAP[coinId]?.id;
      if (!paprikaId) {
        throw new Error(`Coin ${coinId} not supported by CoinPaprika`);
      }

      // Calculate date range
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - days);

      const response = await axios.get(`${COINPAPRIKA_API}/tickers/${paprikaId}/historical`, {
        params: {
          start: start.toISOString().split('T')[0], // YYYY-MM-DD
          end: end.toISOString().split('T')[0],
          interval: days <= 1 ? '1h' : '1d',
        },
        timeout: 10000,
      });

      // Transform to CoinGecko format [timestamp, price]
      const prices = response.data.map(point => [
        new Date(point.timestamp).getTime(),
        point.price,
      ]);

      return {
        prices,
        volumes: [], // CoinPaprika historical doesn't have volume in same format
        provider: 'CoinPaprika',
      };
    } catch (error) {
      logger.error(`❌ [${this.name}] Get chart data error: ${error.message}`);
      throw error;
    }
  }

  isAvailable() {
    return true; // CoinPaprika has high rate limits
  }
}

module.exports = new CoinPaprikaProvider();
