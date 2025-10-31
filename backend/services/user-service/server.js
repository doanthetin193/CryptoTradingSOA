require('dotenv').config();
const express = require('express');
const connectDB = require('../../shared/config/db');
const userRoutes = require('./routes/userRoutes');
const ServiceRegistry = require('./utils/registerService');
const logger = require('../../shared/utils/logger');

// Load models before routes
require('./models/User');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// ===========================
// Middleware
// ===========================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger (skip health checks to reduce noise)
app.use((req, res, next) => {
  if (req.path !== '/health') {
    logger.info(`${req.method} ${req.path}`);
  }
  next();
});

// ===========================
// Routes
// ===========================
app.use('/', userRoutes);

// ===========================
// Error Handler
// ===========================
app.use((err, req, res, next) => {
  logger.error(`❌ Error: ${err.message}`);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ===========================
// Start Server
// ===========================
const startServer = async () => {
  try {
    await connectDB(process.env.MONGODB_URI);
  } catch (error) {
    logger.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }

  app.listen(PORT, async () => {
    logger.info(`
  ╔═══════════════════════════════════════════════════════╗
  ║   👤 USER SERVICE STARTED                            ║
  ║   Port: ${PORT}                                      ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}              ║
  ║   Database: Connected                                 ║
  ╚═══════════════════════════════════════════════════════╝
    `);

    const serviceRegistry = new ServiceRegistry({
      name: process.env.SERVICE_NAME || 'user-service',
      host: 'localhost',
      port: PORT,
      healthCheck: '/health',
      tags: ['user', 'authentication', 'wallet'],
    });

    await serviceRegistry.register();
  });
};

// Start the server
startServer().catch((err) => {
  logger.error(`❌ Failed to start server: ${err.message}`);
  process.exit(1);
});

module.exports = app;
