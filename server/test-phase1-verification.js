/**
 * Phase 1 Verification Test - Task 9 Checkpoint
 * 
 * Verifies:
 * - All 4 seeded users can log in
 * - Token generation and verification
 * - Role-based authentication
 * - Settings endpoint accessibility
 * - Navbar data availability
 */

const dotenv = require('dotenv');
const { connectDB } = require('./config/database');
const User = require('./models/User');
const Settings = require('./models/Settings');
const authController = require('./controllers/authController');

dotenv.config();

// Test utilities
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.yellow}${'='.repeat(60)}${colors.reset}\n${colors.yellow}${msg}${colors.reset}\n${colors.yellow}${'='.repeat(60)}${colors.reset}`)
};

// Test users (seeded in database)
const TEST_USERS = [
  { email: 'admin@club.com', password: 'password123', role: 'admin' },
  { email: 'manager@club.com', password: 'password123', role: 'manager' },
  { email: 'coach@club.com', password: 'password123', role: 'coach' },
  { email: 'player@club.com', password: 'password123', role: 'player' }
];

let testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

function recordTest(passed, message) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    log.success(message);
  } else {
    testResults.failed++;
    log.error(message);
  }
}

async function runTests() {
  try {
    log.section('PHASE 1 VERIFICATION - TASK 9 CHECKPOINT');
    
    // Connect to database
    log.section('1. Database Connection');
    await connectDB();
    log.success('Database connected successfully');

    // Test 1: Verify all 4 users exist in database
    log.section('2. Verify Seeded Users Exist');
    for (const testUser of TEST_USERS) {
      const user = await User.findOne({ email: testUser.email });
      if (user && user.role === testUser.role) {
        recordTest(true, `User ${testUser.email} exists with role: ${testUser.role}`);
      } else {
        recordTest(false, `User ${testUser.email} not found or has wrong role`);
      }
    }

    // Test 2: Login with all 4 users
    log.section('3. Test Login for All Users');
    const tokens = {};
    
    for (const testUser of TEST_USERS) {
      try {
        const result = await authController.login(testUser.email, testUser.password);
        
        if (result.token && result.role === testUser.role && result.userId) {
          tokens[testUser.role] = result.token;
          recordTest(true, `${testUser.role} login successful - token generated`);
          log.info(`  Token: ${result.token.substring(0, 30)}...`);
          log.info(`  Role: ${result.role}`);
          log.info(`  User ID: ${result.userId}`);
        } else {
          recordTest(false, `${testUser.role} login returned incomplete data`);
        }
      } catch (error) {
        recordTest(false, `${testUser.role} login failed: ${error.message}`);
      }
    }

    // Test 3: Verify tokens for all users
    log.section('4. Verify Tokens for All Users');
    for (const testUser of TEST_USERS) {
      const token = tokens[testUser.role];
      if (token) {
        try {
          const verifyResult = authController.verifyToken(token);
          
          if (verifyResult.valid && verifyResult.user.role === testUser.role) {
            recordTest(true, `${testUser.role} token verification successful`);
            log.info(`  Valid: ${verifyResult.valid}`);
            log.info(`  Role: ${verifyResult.user.role}`);
          } else {
            recordTest(false, `${testUser.role} token verification returned invalid data`);
          }
        } catch (error) {
          recordTest(false, `${testUser.role} token verification failed: ${error.message}`);
        }
      } else {
        recordTest(false, `${testUser.role} token not available for verification`);
      }
    }

    // Test 4: Test invalid credentials
    log.section('5. Test Invalid Credentials Handling');
    try {
      await authController.login('invalid@club.com', 'wrongpassword');
      recordTest(false, 'Invalid credentials should throw error');
    } catch (error) {
      if (error.message === 'Invalid credentials') {
        recordTest(true, 'Invalid credentials correctly rejected');
      } else {
        recordTest(false, `Unexpected error message: ${error.message}`);
      }
    }

    // Test 5: Verify Settings exist for Navbar
    log.section('6. Verify Settings for Navbar Display');
    const settings = await Settings.findOne();
    if (settings && settings.clubName) {
      recordTest(true, `Settings exist with club name: "${settings.clubName}"`);
      log.info(`  Club Name: ${settings.clubName}`);
      if (settings.logoUrl) {
        log.info(`  Logo URL: ${settings.logoUrl}`);
      }
    } else {
      recordTest(false, 'Settings not found or missing club name');
    }

    // Test 6: Verify token expiry is 8 hours
    log.section('7. Verify Token Expiry Duration');
    const jwt = require('jsonwebtoken');
    const adminToken = tokens['admin'];
    if (adminToken) {
      const decoded = jwt.decode(adminToken);
      const expiryDuration = decoded.exp - decoded.iat;
      const expectedExpiry = 8 * 60 * 60; // 8 hours in seconds
      
      if (expiryDuration === expectedExpiry) {
        recordTest(true, 'Token has correct 8-hour expiry');
        log.info(`  Issued: ${new Date(decoded.iat * 1000).toISOString()}`);
        log.info(`  Expires: ${new Date(decoded.exp * 1000).toISOString()}`);
      } else {
        recordTest(false, `Token expiry is ${expiryDuration / 3600} hours, expected 8 hours`);
      }
    }

    // Test 7: Verify logout function
    log.section('8. Verify Logout Function');
    const logoutResult = authController.logout();
    if (logoutResult.message === 'Logged out successfully') {
      recordTest(true, 'Logout function returns correct message');
    } else {
      recordTest(false, 'Logout function returned unexpected message');
    }

    // Test 8: Verify role-based redirects (documented)
    log.section('9. Role-Based Redirect Expectations');
    log.info('Frontend should redirect users after login:');
    log.info('  Admin → /admin');
    log.info('  Manager → /manager');
    log.info('  Coach → /coach');
    log.info('  Player → /player');
    log.info('(This must be verified manually in the browser)');

    // Print summary
    log.section('TEST SUMMARY');
    console.log(`\nTotal Tests: ${testResults.total}`);
    console.log(`${colors.green}Passed: ${testResults.passed}${colors.reset}`);
    console.log(`${testResults.failed > 0 ? colors.red : colors.green}Failed: ${testResults.failed}${colors.reset}`);
    
    const passRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
    console.log(`Pass Rate: ${passRate}%\n`);

    if (testResults.failed === 0) {
      log.section('✅ PHASE 1 BACKEND VERIFICATION COMPLETE');
      console.log('\nBackend tests passed! Next steps:');
      console.log('1. Start frontend: cd client && npm run dev');
      console.log('2. Test manual login flows in browser');
      console.log('3. Verify role-based access control');
      console.log('4. Verify Navbar displays club name');
      console.log('5. Verify logout functionality');
      console.log('\nSee TASK_9_VERIFICATION_GUIDE.md for manual testing steps.');
    } else {
      log.section('⚠️  SOME TESTS FAILED');
      console.log('\nPlease review the failed tests above.');
    }

    process.exit(testResults.failed === 0 ? 0 : 1);

  } catch (error) {
    log.error(`Test suite failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runTests();
