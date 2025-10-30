const express = require('express');
const marketController = require('../controllers/marketController');

const router = express.Router();

/**
 * Market Service Routes
 */

// Get all current prices
router.get('/prices', marketController.getPrices);

// Get specific coin price
router.get('/price/:coinId', marketController.getCoinPrice);

// Get historical chart data
router.get('/chart/:coinId', marketController.getChartData);

// Get supported coins list
router.get('/coins', marketController.getSupportedCoins);

// Get trending coins
router.get('/trending', marketController.getTrendingCoins);

// Clear cache (admin only)
router.post('/cache/clear', marketController.clearCache);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'Market Service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
