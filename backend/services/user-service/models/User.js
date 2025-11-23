const { mongoose } = require('../../../shared/config/db');
const bcrypt = require('bcryptjs');

/**
 * User Schema - Collection: users
 * Lưu trữ thông tin người dùng và ví ảo USDT
 */

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    // Role - Admin or User
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    // Ví ảo USDT
    balance: {
      type: Number,
      default: parseFloat(process.env.INITIAL_BALANCE) || 1000,
      min: [0, 'Balance cannot be negative'],
    },
    // Trạng thái tài khoản
    isActive: {
      type: Boolean,
      default: true,
    },
    // Lịch sử thay đổi số dư (optional - để audit)
    balanceHistory: [
      {
        amount: Number,
        type: {
          type: String,
          enum: ['deposit', 'withdraw', 'trade', 'initial', 'admin'],
        },
        description: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

// ===========================
// Middleware: Hash password before saving
// ===========================
userSchema.pre('save', async function (next) {
  // Only hash password if it's modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ===========================
// Instance Methods
// ===========================

/**
 * Compare password with hashed password
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Update balance and log history
 */
userSchema.methods.updateBalance = async function (amount, type, description) {
  this.balance += amount;
  
  this.balanceHistory.push({
    amount,
    type,
    description,
    timestamp: new Date(),
  });

  return await this.save();
};

/**
 * Get user info without sensitive data
 */
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

// ===========================
// Static Methods
// ===========================

/**
 * Find user by email
 */
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

/**
 * Find active users only
 */
userSchema.statics.findActiveUsers = function () {
  return this.find({ isActive: true });
};

module.exports = mongoose.model('User', userSchema);
