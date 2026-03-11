const mongoose = require('mongoose');

/**
 * MongoDB Connection Configuration
 * Implements connection with error handling and automatic reconnection strategy
 * Validates: Requirements 19.1, 25.1
 */

const connectDB = async () => {
  try {
    // Validate required environment variable
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Connection options for production-grade setup
    const options = {
      // Connection pool settings (Requirement 24.3)
      minPoolSize: 5,
      maxPoolSize: 20,
      
      // Timeout settings
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      
      // Automatic reconnection
      retryWrites: true,
      retryReads: true,
      
      // Use new URL parser
      useNewUrlParser: true,
      useUnifiedTopology: true
    };

    // Attempt connection
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
    console.log(`✓ Database: ${conn.connection.name}`);
    console.log(`✓ Connection pool: ${options.minPoolSize}-${options.maxPoolSize} connections`);

    // Connection event listeners for monitoring
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connection established');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
    });

    // Graceful shutdown handler
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        console.error('Error during MongoDB disconnection:', err);
        process.exit(1);
      }
    });

    return conn;

  } catch (error) {
    console.error('✗ MongoDB Connection Error:', error.message);
    
    // Implement exponential backoff reconnection strategy
    if (error.name === 'MongoServerSelectionError' || error.name === 'MongoNetworkError') {
      console.log('Retrying connection in 5 seconds...');
      setTimeout(() => {
        connectDB();
      }, 5000);
    } else {
      // For configuration errors, exit immediately
      console.error('Fatal database configuration error. Please check your MONGODB_URI.');
      process.exit(1);
    }
  }
};

/**
 * Check if database connection is ready
 * @returns {boolean} Connection status
 */
const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

/**
 * Get current connection state
 * @returns {string} Connection state description
 */
const getConnectionState = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  return states[mongoose.connection.readyState] || 'unknown';
};

module.exports = {
  connectDB,
  isConnected,
  getConnectionState
};
