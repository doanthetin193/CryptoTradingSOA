const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User');
const logger = require('../../../shared/utils/logger');

/**
 * User Controller
 * Xử lý logic nghiệp vụ cho authentication và quản lý user
 */

// ===========================
// Validation Schemas
// ===========================
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  fullName: Joi.string().min(2).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// ===========================
// Generate JWT Token
// ===========================
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * @desc    Register new user
 * @route   POST /register
 * @access  Public
 */
exports.register = async (req, res) => {
  try {
    // Validate input
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { email, password, fullName } = value;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      fullName,
      balance: parseFloat(process.env.INITIAL_BALANCE) || 1000,
      balanceHistory: [
        {
          amount: parseFloat(process.env.INITIAL_BALANCE) || 1000,
          type: 'initial',
          description: 'Initial wallet balance',
        },
      ],
    });

    // Generate token
    const token = generateToken(user._id);

    logger.info(`✅ New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          balance: user.balance,
        },
        token,
      },
    });
  } catch (error) {
    logger.error(`❌ Register error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message,
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    // Validate input
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { email, password } = value;

    // Find user and include password for comparison
    const user = await User.findByEmail(email).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.',
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    logger.info(`✅ User logged in: ${email}`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          balance: user.balance,
        },
        token,
      },
    });
  } catch (error) {
    logger.error(`❌ Login error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message,
    });
  }
};

/**
 * @desc    Get user profile
 * @route   GET /profile
 * @access  Private
 */
exports.getProfile = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found in request',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          balance: user.balance,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    logger.error(`❌ Get profile error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message,
    });
  }
};

/**
 * @desc    Get user balance
 * @route   GET /balance
 * @access  Private (Internal service call)
 */
exports.getBalance = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: {
        userId: user._id,
        balance: user.balance,
      },
    });
  } catch (error) {
    logger.error(`❌ Get balance error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching balance',
      error: error.message,
    });
  }
};

/**
 * @desc    Update user balance (Internal service call only)
 * @route   PUT /balance
 * @access  Private (Internal)
 */
exports.updateBalance = async (req, res) => {
  try {
    const { userId, amount, type, description } = req.body;

    if (!userId || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'User ID and amount are required',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if balance would go negative
    if (user.balance + amount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance',
      });
    }

    // Update balance
    await user.updateBalance(amount, type || 'trade', description || 'Balance update');

    logger.info(`💰 Balance updated for user ${userId}: ${amount > 0 ? '+' : ''}${amount} USDT`);

    res.json({
      success: true,
      message: 'Balance updated successfully',
      data: {
        userId: user._id,
        balance: user.balance,
        change: amount,
      },
    });
  } catch (error) {
    logger.error(`❌ Update balance error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error updating balance',
      error: error.message,
    });
  }
};

/**
 * @desc    Get user info (for other services)
 * @route   GET /info/:userId
 * @access  Private (Internal)
 */
exports.getUserInfo = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          balance: user.balance,
        },
      },
    });
  } catch (error) {
    logger.error(`❌ Get user info error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching user info',
      error: error.message,
    });
  }
};
