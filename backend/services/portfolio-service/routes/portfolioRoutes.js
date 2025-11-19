const express = require('express');
const portfolioController = require('../controllers/portfolioController');

const router = express.Router();

/**
 * Portfolio Service Routes
 */

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'Portfolio Service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Get user portfolio
router.get('/', portfolioController.getPortfolio);

// Update portfolio value (Internal - called by API Gateway)
router.put('/value', portfolioController.updatePortfolioValue);

// Get specific holding
router.get('/holding/:symbol', portfolioController.getHolding);

// Add holding (Internal - called by API Gateway)
router.post('/holding', portfolioController.addHolding);

// Reduce holding (Internal - called by API Gateway)
router.put('/holding', portfolioController.reduceHolding);

module.exports = router;
