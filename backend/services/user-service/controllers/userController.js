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

const updateProfileSchema = Joi.object({
  fullName: Joi.string().min(2).required(),
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
          role: user.role,
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
          role: user.role,
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
          role: user.role,
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
 * @desc    Update user profile
 * @route   PUT /profile
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found in request',
      });
    }

    // Validate input
    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { fullName } = value;

    // Find and update user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.fullName = fullName;
    await user.save();

    logger.info(`✅ Profile updated for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          balance: user.balance,
          role: user.role,
        },
      },
    });
  } catch (error) {
    logger.error(`❌ Update profile error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
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

    if (!isFinite(amount) || isNaN(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount',
      });
    }

    // First, check current balance if deducting (amount < 0)
    if (amount < 0) {
      const user = await User.findById(userId).select('balance');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      if (user.balance + amount < 0) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient balance',
          currentBalance: user.balance,
          requested: Math.abs(amount),
        });
      }
    }

    // ==========================================
    // ATOMIC OPERATION: Update balance and history
    // ==========================================
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $inc: { balance: amount },
        $push: {
          balanceHistory: {
            amount,
            type: type || 'trade',
            description: description || 'Balance update',
            timestamp: new Date(),
          },
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    logger.info(`💰 Balance updated atomically for user ${userId}: ${amount > 0 ? '+' : ''}${amount} USDT`);

    res.json({
      success: true,
      message: 'Balance updated successfully',
      data: {
        userId: updatedUser._id,
        balance: updatedUser.balance,
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

// ===========================
// ADMIN FUNCTIONS
// ===========================

/**
 * @desc    Get all users (Admin only)
 * @route   GET /admin/users
 * @access  Admin
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery = search
      ? {
          $or: [
            { email: { $regex: search, $options: 'i' } },
            { fullName: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const users = await User.find(searchQuery)
      .select('-password')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(searchQuery);

    logger.info(`✅ Admin fetched ${users.length} users`);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error(`❌ Get all users error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message,
    });
  }
};

/**
 * @desc    Get system statistics (Admin only)
 * @route   GET /admin/stats
 * @access  Admin
 */
exports.getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });

    // Calculate total balance
    const balanceAgg = await User.aggregate([
      {
        $group: {
          _id: null,
          totalBalance: { $sum: '$balance' },
          avgBalance: { $avg: '$balance' },
        },
      },
    ]);

    const balanceStats = balanceAgg[0] || { totalBalance: 0, avgBalance: 0 };

    // Get recent users
    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);

    logger.info('✅ Admin fetched system stats');

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        totalBalance: balanceStats.totalBalance,
        avgBalance: balanceStats.avgBalance,
        recentUsers,
      },
    });
  } catch (error) {
    logger.error(`❌ Get system stats error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching system statistics',
      error: error.message,
    });
  }
};

/**
 * @desc    Toggle user status (Block/Unblock)
 * @route   PUT /admin/users/:userId/toggle
 * @access  Admin
 */
exports.toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Toggle status
    user.isActive = !user.isActive;
    await user.save();

    logger.info(`✅ Admin toggled user status: ${user.email} -> ${user.isActive ? 'Active' : 'Blocked'}`);

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          isActive: user.isActive,
        },
      },
    });
  } catch (error) {
    logger.error(`❌ Toggle user status error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error toggling user status',
      error: error.message,
    });
  }
};

/**
 * @desc    Update user balance (Admin only)
 * @route   PUT /admin/users/:userId/balance
 * @access  Admin
 */
exports.adminUpdateBalance = async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, description } = req.body;

    // Validate input
    if (amount === undefined || amount === null) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update balance
    await user.updateBalance(
      parseFloat(amount),
      'admin',
      description || `Admin adjustment by ${req.adminUser?.email || 'admin'}`
    );

    logger.info(`✅ Admin updated balance for ${user.email}: ${amount > 0 ? '+' : ''}${amount}`);

    res.json({
      success: true,
      message: 'Balance updated successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          newBalance: user.balance,
        },
      },
    });
  } catch (error) {
    logger.error(`❌ Admin update balance error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error updating balance',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete user (Admin only)
 * @route   DELETE /admin/users/:userId
 * @access  Admin
 */
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent deleting admin users
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users',
      });
    }

    await User.findByIdAndDelete(userId);

    logger.info(`✅ Admin deleted user: ${user.email}`);

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    logger.error(`❌ Delete user error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message,
    });
  }
};

