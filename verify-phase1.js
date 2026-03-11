/**
 * Phase 1 Verification Script
 * Automated testing for Football Club Management System - Phase 1 Checkpoint
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:5173';

// Test users
const TEST_USERS = [
  { email: 'admin@club.com', password: 'password123', role: 'admin', expectedRoute: '/admin' },
  { email: 'manager@club.com', password: 'password123', role: 'manager', expectedRoute: '/manager' },
  { email: 'coach@club.com', password: 'password123', role: 'coach', expectedRoute: '/coach' },
  { email: 'player@club.com', password: 'password123', role: 'player', expectedRoute: '/player' }
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

let passCount = 0;
let failCount = 0;

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function pass(message) {
  passCount++;
  log(`✅ PASS: ${message}`, colors.green);
}

function fail(message, error = '') {
  failCount++;
  log(`❌ FAIL: ${message}`, colors.red);
  if (error) {
    log(`   Error: ${error}`, colors.red);
  }
}

function section(title) {
  log(`\n${'='.repeat(60)}`, colors.cyan);
  log(title, colors.cyan);
  log('='.repeat(60), colors.cyan);
}

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({
            status: res.statusCode,
            data: jsonBody,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: body,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testServerConnection() {
  section('1. Server Connection Tests');
  
  try {
    const response = await makeRequest('GET', '/api/settings');
    if (response.status === 200) {
      pass('Backend server is running and accessible');
      return true;
    } else {
      fail('Backend server returned unexpected status', `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    fail('Backend server is not accessible', error.message);
    return false;
  }
}

async function testLogin(user) {
  try {
    const response = await makeRequest('POST', '/api/auth/login', {
      email: user.email,
      password: user.password
    });
    
    if (response.status === 200 && response.data.token) {
      pass(`${user.role} can log in successfully`);
      return response.data.token;
    } else {
      fail(`${user.role} login did not return expected data`);
      return null;
    }
  } catch (error) {
    fail(`${user.role} login failed`, error.message);
    return null;
  }
}

async function testInvalidLogin() {
  try {
    const response = await makeRequest('POST', '/api/auth/login', {
      email: 'invalid@club.com',
      password: 'wrongpassword'
    });
    
    if (response.status === 401) {
      pass('Invalid credentials correctly return 401');
    } else {
      fail('Invalid credentials should return 401', `Got status: ${response.status}`);
    }
  } catch (error) {
    fail('Invalid credentials test failed', error.message);
  }
}

async function testTokenVerification(token, role) {
  try {
    const response = await makeRequest('GET', '/api/auth/verify', null, token);
    
    if (response.status === 200 && response.data.user) {
      pass(`${role} token verification successful`);
      return true;
    } else {
      fail(`${role} token verification did not return expected data`);
      return false;
    }
  } catch (error) {
    fail(`${role} token verification failed`, error.message);
    return false;
  }
}

async function testInvalidToken() {
  try {
    const response = await makeRequest('GET', '/api/auth/verify', null, 'invalid_token_12345');
    
    if (response.status === 401) {
      pass('Invalid token correctly returns 401');
    } else {
      fail('Invalid token should return 401', `Got status: ${response.status}`);
    }
  } catch (error) {
    fail('Invalid token test failed', error.message);
  }
}

async function testSettingsEndpoint() {
  section('5. Settings Endpoint Tests');
  
  try {
    const response = await makeRequest('GET', '/api/settings');
    
    if (response.status === 200 && response.data.clubName) {
      pass('Settings endpoint returns club name');
    } else {
      fail('Settings endpoint did not return club name');
    }
  } catch (error) {
    fail('Settings endpoint failed', error.message);
  }
}

async function testRoleBasedAccess(tokens) {
  section('6. Role-Based Access Control Tests');
  
  // Test that each role can only access their own endpoints
  // Note: This requires implementing role-specific endpoints in Phase 2+
  // For Phase 1, we just verify tokens work
  
  for (const user of TEST_USERS) {
    const token = tokens[user.role];
    if (token) {
      try {
        const response = await makeRequest('GET', '/api/auth/verify', null, token);
        
        if (response.data.user && response.data.user.role === user.role) {
          pass(`${user.role} token contains correct role`);
        } else {
          fail(`${user.role} token has incorrect role`);
        }
      } catch (error) {
        fail(`${user.role} role verification failed`, error.message);
      }
    }
  }
}

async function runAllTests() {
  log('\n' + '█'.repeat(60), colors.blue);
  log('PHASE 1 VERIFICATION - AUTOMATED TEST SUITE', colors.blue);
  log('█'.repeat(60) + '\n', colors.blue);
  
  // Test 1: Server Connection
  const serverRunning = await testServerConnection();
  if (!serverRunning) {
    log('\n⚠️  Backend server is not running. Please start it with:', colors.yellow);
    log('   cd server && npm start', colors.yellow);
    return;
  }
  
  // Test 2: Authentication
  section('2. Authentication Tests');
  const tokens = {};
  
  for (const user of TEST_USERS) {
    const token = await testLogin(user);
    if (token) {
      tokens[user.role] = token;
    }
  }
  
  await testInvalidLogin();
  
  // Test 3: Token Verification
  section('3. Token Verification Tests');
  for (const user of TEST_USERS) {
    if (tokens[user.role]) {
      await testTokenVerification(tokens[user.role], user.role);
    }
  }
  
  await testInvalidToken();
  
  // Test 4: Settings
  await testSettingsEndpoint();
  
  // Test 5: Role-Based Access
  await testRoleBasedAccess(tokens);
  
  // Summary
  section('TEST SUMMARY');
  const total = passCount + failCount;
  const passRate = total > 0 ? ((passCount / total) * 100).toFixed(1) : 0;
  
  log(`\nTotal Tests: ${total}`, colors.cyan);
  log(`Passed: ${passCount}`, colors.green);
  log(`Failed: ${failCount}`, failCount > 0 ? colors.red : colors.green);
  log(`Pass Rate: ${passRate}%\n`, passRate === '100.0' ? colors.green : colors.yellow);
  
  if (failCount === 0) {
    log('🎉 ALL TESTS PASSED! Phase 1 is ready for sign-off.', colors.green);
  } else {
    log('⚠️  Some tests failed. Please review the errors above.', colors.yellow);
  }
  
  log('\n' + '█'.repeat(60) + '\n', colors.blue);
  
  // Frontend reminder
  log('📝 MANUAL TESTING REQUIRED:', colors.yellow);
  log('   1. Frontend routing and redirects', colors.yellow);
  log('   2. Navbar display and logout button', colors.yellow);
  log('   3. Role-based panel access in browser', colors.yellow);
  log('   4. Token storage in localStorage', colors.yellow);
  log(`   5. Visit ${FRONTEND_URL} to test manually\n`, colors.yellow);
}

// Run tests
runAllTests().catch(error => {
  log('\n❌ Test suite crashed:', colors.red);
  log(error.message, colors.red);
  process.exit(1);
});
