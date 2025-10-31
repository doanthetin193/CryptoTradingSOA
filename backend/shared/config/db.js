const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Kết nối MongoDB - Sử dụng chung cho tất cả các services
 * @param {string} dbUri - MongoDB connection string
 */
const connectDB = async (dbUri) => {
  // Nếu đã connected rồi thì return
  if (mongoose.connection.readyState === 1) {
    logger.info('✅ MongoDB already connected');
    return mongoose;
  }

  try {
    await mongoose.connect(dbUri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });

    logger.info(`✅ MongoDB Connected: ${mongoose.connection.host}`);
    logger.info(`📦 Database: ${mongoose.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });

    return mongoose;
  } catch (error) {
    logger.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

// Export both connectDB and mongoose instance
module.exports = connectDB;
module.exports.mongoose = mongoose;
