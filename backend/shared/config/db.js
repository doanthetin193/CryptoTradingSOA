const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Kết nối MongoDB - Sử dụng chung cho tất cả các services
 * @param {string} dbUri - MongoDB connection string
 */
const connectDB = async (dbUri) => {
  try {
    const conn = await mongoose.connect(dbUri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    logger.info(`📦 Database: ${conn.connection.name}`);
    
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

    return conn;
  } catch (error) {
    logger.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
