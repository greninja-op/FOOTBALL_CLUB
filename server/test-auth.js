/**
 * Authentication Controller and Routes Test
 * Tests Task 5.1 and 5.2 implementation
 * 
 * Tests:
 * - Login with valid credentials
 * - Login with invalid credentials
 * - Token verification
 * - JWT expiry validation
 * - Password comparison with bcrypt
 */

const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const { connectDB } = require('./config/database');
const User = require('./models/User');
const authController = require('./controllers/authController');

dotenv.config();

// Test utilities
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.yellow}ℹ${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.yellow}=== ${msg} ===${colors.reset}`)
};

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'TestPassword123!',
  role: 'player'
};

let createdUserId = null;

async function runTests() {
  try {
    log.section('Connecting to Database');
    await connectDB();
    log.success('Database connected');

    // Clean up any existing test user
    await User.deleteOne({ email: testUser.email });
    log.info('Cleaned up existing test data');

    // Test 1: Create test user with bcrypt hashed password
    log.section('Test 1: Create Test User');
    const passwordHash = await bcrypt.hash(testUser.password, 10);
    const user = await User.create({
      email: testUser.email,
      passwordHash: passwordHash,
      role: testUser.role
    });
    createdUserId = user._id.toString();
    log.success(`Created test user: ${user.email} (ID: ${createdUserId})`);

    // Test 2: Login with valid credentials
    log.section('Test 2: Login with Valid Credentials');
    try {
      const loginResult = await authController.login(testUser.email, testUser.password);
      
      if (!loginResult.token) {
        throw new Error('No token returned');
      }
      if (loginResult.role !== testUser.role) {
        throw new Error(`Expected role ${testUser.role}, got ${loginResult.role}`);
      }
      if (loginResult.userId !== createdUserId) {
        throw new Error(`Expected userId ${createdUserId}, got ${loginResult.userId}`);
      }
      
      log.success('Login successful with valid credentials');
      log.info(`Token: ${loginResult.token.substring(0, 20)}...`);
      log.info(`Role: ${loginResult.role}`);
      log.info(`User ID: ${loginResult.userId}`);

      // Test 3: Verify token
      log.section('Test 3: Verify Token');
      const verifyResult = authController.verifyToken(loginResult.token);
      
      if (!verifyResult.valid) {
        throw new Error('Token verification failed');
      }
      if (verifyResult.user.id !== createdUserId) {
        throw new Error(`Expected user ID ${createdUserId}, got ${verifyResult.user.id}`);
      }
      if (verifyResult.user.role !== testUser.role) {
        throw new Error(`Expected role ${testUser.role}, got ${verifyResult.user.role}`);
      }
      
      log.success('Token verification successful');
      log.info(`Valid: ${verifyResult.valid}`);
      log.info(`User ID: ${verifyResult.user.id}`);
      log.info(`Role: ${verifyResult.user.role}`);

    } catch (error) {
      log.error(`Login test failed: ${error.message}`);
      throw error;
    }

    // Test 4: Login with invalid password
    log.section('Test 4: Login with Invalid Password');
    try {
      await authController.login(testUser.email, 'WrongPassword123!');
      log.error('Should have thrown error for invalid password');
      throw new Error('Login succeeded with invalid password');
    } catch (error) {
      if (error.message === 'Invalid credentials') {
        log.success('Correctly rejected invalid password');
        log.info('Error message: Invalid credentials (generic message)');
      } else {
        throw error;
      }
    }

    // Test 5: Login with non-existent email
    log.section('Test 5: Login with Non-Existent Email');
    try {
      await authController.login('nonexistent@example.com', testUser.password);
      log.error('Should have thrown error for non-existent email');
      throw new Error('Login succeeded with non-existent email');
    } catch (error) {
      if (error.message === 'Invalid credentials') {
        log.success('Correctly rejected non-existent email');
        log.info('Error message: Invalid credentials (prevents email enumeration)');
      } else {
        throw error;
      }
    }

    // Test 6: Login with missing credentials
    log.section('Test 6: Login with Missing Credentials');
    try {
      await authController.login('', '');
      log.error('Should have thrown error for missing credentials');
      throw new Error('Login succeeded with missing credentials');
    } catch (error) {
      if (error.message === 'Email and password are required') {
        log.success('Correctly rejected missing credentials');
      } else {
        throw error;
      }
    }

    // Test 7: Verify invalid token
    log.section('Test 7: Verify Invalid Token');
    try {
      authController.verifyToken('invalid.token.here');
      log.error('Should have thrown error for invalid token');
      throw new Error('Verification succeeded with invalid token');
    } catch (error) {
      if (error.message === 'Invalid token') {
        log.success('Correctly rejected invalid token');
      } else {
        throw error;
      }
    }

    // Test 8: Verify expired token (simulated)
    log.section('Test 8: Verify Token Structure');
    const jwt = require('jsonwebtoken');
    const loginResult = await authController.login(testUser.email, testUser.password);
    const decoded = jwt.decode(loginResult.token);
    
    if (!decoded.id || !decoded.role || !decoded.exp || !decoded.iat) {
      throw new Error('Token missing required fields');
    }
    
    const expiryTime = decoded.exp - decoded.iat;
    const expectedExpiry = 8 * 60 * 60; // 8 hours in seconds
    
    if (expiryTime !== expectedExpiry) {
      throw new Error(`Expected 8-hour expiry (${expectedExpiry}s), got ${expiryTime}s`);
    }
    
    log.success('Token has correct 8-hour expiry');
    log.info(`Issued at: ${new Date(decoded.iat * 1000).toISOString()}`);
    log.info(`Expires at: ${new Date(decoded.exp * 1000).toISOString()}`);
    log.info(`Expiry duration: ${expiryTime / 3600} hours`);

    // Test 9: Logout function
    log.section('Test 9: Logout Function');
    const logoutResult = authController.logout();
    if (logoutResult.message !== 'Logged out successfully') {
      throw new Error('Logout returned unexpected message');
    }
    log.success('Logout function works correctly');

    // Test 10: Password hashing verification
    log.section('Test 10: Password Hashing with bcrypt');
    const storedUser = await User.findById(createdUserId).select('+passwordHash');
    const isMatch = await bcrypt.compare(testUser.password, storedUser.passwordHash);
    
    if (!isMatch) {
      throw new Error('Password hash verification failed');
    }
    
    log.success('Password correctly hashed with bcrypt');
    log.info(`Hash: ${storedUser.passwordHash.substring(0, 30)}...`);

    // Clean up
    log.section('Cleanup');
    await User.deleteOne({ _id: createdUserId });
    log.success('Test user deleted');

    log.section('All Tests Passed! ✓');
    console.log('\nTask 5.1 and 5.2 implementation verified:');
    console.log('✓ Login with valid credentials generates JWT');
    console.log('✓ JWT has 8-hour expiry');
    console.log('✓ Password verification uses bcrypt.compare()');
    console.log('✓ Returns {token, role, userId} on success');
    console.log('✓ Returns generic error without revealing email existence');
    console.log('✓ verifyToken validates JWT and returns user data');
    console.log('✓ Logout function implemented');

    process.exit(0);

  } catch (error) {
    log.error(`Test failed: ${error.message}`);
    console.error(error);
    
    // Clean up on error
    if (createdUserId) {
      try {
        await User.deleteOne({ _id: createdUserId });
        log.info('Cleaned up test user');
      } catch (cleanupError) {
        log.error(`Cleanup failed: ${cleanupError.message}`);
      }
    }
    
    process.exit(1);
  }
}

// Run tests
runTests();
