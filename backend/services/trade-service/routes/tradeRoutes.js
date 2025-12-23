const express = require('express');
const tradeController = require('../controllers/tradeController');

const router = express.Router();

/**
 * Trade Service Routes
 * CHỈ quản lý trade records - không có business logic
 */

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'Trade Service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Create trade record (Internal - called by API Gateway)
router.post('/', tradeController.createTrade);

// Get trade history
router.get('/history', tradeController.getTradeHistory);

module.exports = router;
