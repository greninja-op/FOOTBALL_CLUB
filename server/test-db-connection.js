/**
 * Database Connection Test Script
 * Run this script to verify MongoDB connection configuration
 * Usage: node test-db-connection.js
 */

require('dotenv').config();
const { connectDB, isConnected, getConnectionState } = require('./config/database');

const testConnection = async () => {
  console.log('=== Database Connection Test ===\n');
  console.log('Configuration:');
  console.log(`- MONGODB_URI: ${process.env.MONGODB_URI ? '✓ Set' : '✗ Not set'}`);
  console.log(`- JWT_SECRET: ${process.env.JWT_SECRET ? '✓ Set' : '✗ Not set'}`);
  console.log(`- PORT: ${process.env.PORT || '5000 (default)'}`);
  console.log(`- CLIENT_URL: ${process.env.CLIENT_URL || 'http://localhost:5173 (default)'}`);
  console.log('\nAttempting database connection...\n');

  try {
    await connectDB();
    
    console.log('\n=== Connection Test Results ===');
    console.log(`Status: ${isConnected() ? '✓ Connected' : '✗ Not Connected'}`);
    console.log(`State: ${getConnectionState()}`);
    console.log('\n✓ Database connection test passed!');
    
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Database connection test failed!');
    console.error('Error:', error.message);
    process.exit(1);
  }
};

testConnection();
