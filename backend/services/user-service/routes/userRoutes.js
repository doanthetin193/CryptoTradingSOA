const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

/**
 * User Service Routes
 */

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes (require authentication from API Gateway)
router.get('/profile', userController.getProfile);
router.get('/balance', userController.getBalance);

// Internal service routes (for inter-service communication)
router.put('/balance', userController.updateBalance);
router.get('/info/:userId', userController.getUserInfo);

// Admin routes (API Gateway will apply adminMiddleware)
router.get('/admin/users', userController.getAllUsers);
router.get('/admin/stats', userController.getSystemStats);
router.put('/admin/users/:userId/toggle', userController.toggleUserStatus);
router.put('/admin/users/:userId/balance', userController.adminUpdateBalance);
router.delete('/admin/users/:userId', userController.deleteUser);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'User Service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
