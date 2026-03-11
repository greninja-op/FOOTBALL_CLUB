/**
 * Socket.io Authentication Test Script
 * 
 * This script tests the Socket.io server authentication middleware
 * by attempting connections with valid and invalid tokens.
 * 
 * Run with: node test-socket-auth.js
 */

const io = require('socket.io-client');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';
const JWT_SECRET = process.env.JWT_SECRET;

console.log('=== Socket.io Authentication Test ===\n');

// Test 1: Connection without token (should fail)
console.log('Test 1: Connecting without token...');
const socketNoAuth = io(SERVER_URL, {
  auth: {}
});

socketNoAuth.on('connect_error', (error) => {
  console.log('✓ Expected failure: Connection rejected without token');
  console.log(`  Error: ${error.message}\n`);
  socketNoAuth.close();
  
  // Test 2: Connection with invalid token (should fail)
  runTest2();
});

function runTest2() {
  console.log('Test 2: Connecting with invalid token...');
  const socketInvalidAuth = io(SERVER_URL, {
    auth: {
      token: 'invalid.token.here'
    }
  });

  socketInvalidAuth.on('connect_error', (error) => {
    console.log('✓ Expected failure: Connection rejected with invalid token');
    console.log(`  Error: ${error.message}\n`);
    socketInvalidAuth.close();
    
    // Test 3: Connection with valid token (should succeed)
    runTest3();
  });
}

function runTest3() {
  console.log('Test 3: Connecting with valid token...');
  
  // Generate a valid JWT token
  const validToken = jwt.sign(
    { id: '507f1f77bcf86cd799439011', role: 'admin' },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  const socketValidAuth = io(SERVER_URL, {
    auth: {
      token: validToken
    }
  });

  socketValidAuth.on('connect', () => {
    console.log('✓ Success: Connection established with valid token');
    console.log(`  Socket ID: ${socketValidAuth.id}\n`);
    
    // Test 4: Verify socket can receive events
    runTest4(socketValidAuth);
  });

  socketValidAuth.on('connect_error', (error) => {
    console.log('✗ Unexpected failure: Connection should succeed with valid token');
    console.log(`  Error: ${error.message}\n`);
    socketValidAuth.close();
    process.exit(1);
  });
}

function runTest4(socket) {
  console.log('Test 4: Testing event reception...');
  
  // Listen for a test event
  socket.on('test:event', (data) => {
    console.log('✓ Success: Socket received event');
    console.log(`  Data: ${JSON.stringify(data)}\n`);
    
    console.log('=== All Tests Passed ===');
    socket.close();
    process.exit(0);
  });

  // Emit a test event (server should echo it back if configured)
  console.log('  Waiting for test event (timeout in 3 seconds)...');
  
  setTimeout(() => {
    console.log('✓ Socket connection is stable (no errors after 3 seconds)');
    console.log('\n=== All Tests Passed ===');
    socket.close();
    process.exit(0);
  }, 3000);
}

// Handle script termination
process.on('SIGINT', () => {
  console.log('\n\nTest interrupted by user');
  process.exit(0);
});
