require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Seed Admin User Script
 * Tạo admin user mặc định cho hệ thống
 */

const MONGODB_URI = process.env.USER_DB_URI;

// Admin user credentials
const ADMIN_USER = {
  email: 'admin@crypto.com',
  password: 'admin123456',
  fullName: 'System Administrator',
  role: 'admin',
  balance: 10000,
  isActive: true,
};

// User Schema (copy từ User model)
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    balance: {
      type: Number,
      default: 1000,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
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
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);

async function seedAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_USER.email });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log(`📧 Email: ${existingAdmin.email}`);
      console.log(`👤 Name: ${existingAdmin.fullName}`);
      console.log(`🔑 Role: ${existingAdmin.role}`);

      // Update to admin role if not already
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ Updated existing user to admin role');
      }

      await mongoose.connection.close();
      return;
    }

    // Create admin user
    console.log('👤 Creating admin user...');
    const admin = await User.create({
      ...ADMIN_USER,
      balanceHistory: [
        {
          amount: ADMIN_USER.balance,
          type: 'initial',
          description: 'Initial admin balance',
          timestamp: new Date(),
        },
      ],
    });

    console.log('\n🎉 Admin user created successfully!');
    console.log('═══════════════════════════════════════');
    console.log(`📧 Email:    ${admin.email}`);
    console.log(`🔒 Password: ${ADMIN_USER.password}`);
    console.log(`👤 Name:     ${admin.fullName}`);
    console.log(`🔑 Role:     ${admin.role}`);
    console.log(`💰 Balance:  $${admin.balance}`);
    console.log('═══════════════════════════════════════');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    console.log('📝 Login URL: http://localhost:5173/auth\n');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
    process.exit(1);
  }
}

// Run seed
seedAdmin();
