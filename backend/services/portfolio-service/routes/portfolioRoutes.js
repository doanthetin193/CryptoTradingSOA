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

// Add holding (Internal - called by API Gateway)
router.post('/holding', portfolioController.addHolding);

// Reduce holding (Internal - called by API Gateway)
router.put('/holding', portfolioController.reduceHolding);

module.exports = router;
