const express = require('express');
const tradeController = require('../controllers/tradeController');

const router = express.Router();

/**
 * Trade Service Routes
 */

// Health check (must be before /:tradeId to avoid conflict)
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'Trade Service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Buy coin
router.post('/buy', tradeController.buyCoin);

// Sell coin
router.post('/sell', tradeController.sellCoin);

// Get trade history
router.get('/history', tradeController.getTradeHistory);

// Get trade statistics
router.get('/stats', tradeController.getTradeStats);

// Get specific trade (must be last to avoid catching other routes)
router.get('/:tradeId', tradeController.getTradeById);

module.exports = router;
