const express = require('express');
const portfolioController = require('../controllers/portfolioController');

const router = express.Router();

/**
 * Portfolio Service Routes
 */

// Get user portfolio
router.get('/', portfolioController.getPortfolio);

// Get portfolio summary
router.get('/summary', portfolioController.getPortfolioSummary);

// Get specific holding
router.get('/holding/:symbol', portfolioController.getHolding);

// Add or update holding (Internal - called by Trade Service)
router.post('/holding', portfolioController.addHolding);

// Reduce holding (Internal - called by Trade Service)
router.put('/holding/reduce', portfolioController.reduceHolding);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'Portfolio Service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
