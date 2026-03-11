/**
 * Test script for Settings API endpoints
 * 
 * This script tests:
 * 1. GET /api/settings - Fetch club settings
 * 2. PUT /api/settings - Update club settings (admin only)
 * 
 * Prerequisites:
 * - Server must be running (npm start or npm run dev)
 * - Database must be connected
 * - At least one admin user must exist
 */

const BASE_URL = 'http://localhost:5000';

// Test credentials (use an existing admin user)
const ADMIN_CREDENTIALS = {
  email: 'admin@club.com',
  password: 'admin123'
};

let adminToken = null;

/**
 * Helper function to make API requests
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  const data = await response.json();
  return { status: response.status, data };
}

/**
 * Test 1: Login as admin to get token
 */
async function testAdminLogin() {
  console.log('\n=== Test 1: Admin Login ===');
  
  const { status, data } = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(ADMIN_CREDENTIALS)
  });
  
  if (status === 200 && data.token) {
    adminToken = data.token;
    console.log('✓ Admin login successful');
    console.log(`  Token: ${adminToken.substring(0, 20)}...`);
    console.log(`  Role: ${data.role}`);
    return true;
  } else {
    console.log('✗ Admin login failed');
    console.log(`  Status: ${status}`);
    console.log(`  Response:`, data);
    return false;
  }
}

/**
 * Test 2: Get settings (authenticated)
 */
async function testGetSettings() {
  console.log('\n=== Test 2: Get Settings ===');
  
  const { status, data } = await apiRequest('/api/settings', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  
  if (status === 200 && data.settings) {
    console.log('✓ Get settings successful');
    console.log(`  Club Name: ${data.settings.clubName}`);
    console.log(`  Logo URL: ${data.settings.logoUrl || 'Not set'}`);
    return true;
  } else {
    console.log('✗ Get settings failed');
    console.log(`  Status: ${status}`);
    console.log(`  Response:`, data);
    return false;
  }
}

/**
 * Test 3: Update settings (admin only)
 */
async function testUpdateSettings() {
  console.log('\n=== Test 3: Update Settings ===');
  
  const newSettings = {
    clubName: 'Test Football Club',
    logoUrl: 'https://example.com/logo.png'
  };
  
  const { status, data } = await apiRequest('/api/settings', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify(newSettings)
  });
  
  if (status === 200 && data.success) {
    console.log('✓ Update settings successful');
    console.log(`  Club Name: ${data.settings.clubName}`);
    console.log(`  Logo URL: ${data.settings.logoUrl}`);
    return true;
  } else {
    console.log('✗ Update settings failed');
    console.log(`  Status: ${status}`);
    console.log(`  Response:`, data);
    return false;
  }
}

/**
 * Test 4: Verify settings were updated
 */
async function testVerifyUpdate() {
  console.log('\n=== Test 4: Verify Settings Update ===');
  
  const { status, data } = await apiRequest('/api/settings', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  
  if (status === 200 && data.settings.clubName === 'Test Football Club') {
    console.log('✓ Settings update verified');
    console.log(`  Club Name: ${data.settings.clubName}`);
    console.log(`  Logo URL: ${data.settings.logoUrl}`);
    return true;
  } else {
    console.log('✗ Settings update verification failed');
    console.log(`  Status: ${status}`);
    console.log(`  Response:`, data);
    return false;
  }
}

/**
 * Test 5: Test unauthorized access (no token)
 */
async function testUnauthorizedAccess() {
  console.log('\n=== Test 5: Unauthorized Access ===');
  
  const { status, data } = await apiRequest('/api/settings', {
    method: 'GET'
  });
  
  if (status === 401) {
    console.log('✓ Unauthorized access correctly blocked');
    console.log(`  Status: ${status}`);
    return true;
  } else {
    console.log('✗ Unauthorized access test failed');
    console.log(`  Expected status 401, got ${status}`);
    console.log(`  Response:`, data);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('========================================');
  console.log('Settings API Test Suite');
  console.log('========================================');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Admin Email: ${ADMIN_CREDENTIALS.email}`);
  
  try {
    const results = [];
    
    // Test 1: Login
    results.push(await testAdminLogin());
    
    if (!adminToken) {
      console.log('\n✗ Cannot proceed without admin token');
      console.log('Make sure:');
      console.log('  1. Server is running on port 5000');
      console.log('  2. Database is connected');
      console.log('  3. Admin user exists with correct credentials');
      return;
    }
    
    // Test 2-5: Settings operations
    results.push(await testGetSettings());
    results.push(await testUpdateSettings());
    results.push(await testVerifyUpdate());
    results.push(await testUnauthorizedAccess());
    
    // Summary
    console.log('\n========================================');
    console.log('Test Summary');
    console.log('========================================');
    const passed = results.filter(r => r).length;
    const total = results.length;
    console.log(`Passed: ${passed}/${total}`);
    
    if (passed === total) {
      console.log('✓ All tests passed!');
    } else {
      console.log(`✗ ${total - passed} test(s) failed`);
    }
    
  } catch (error) {
    console.error('\n✗ Test suite error:', error.message);
    console.log('\nMake sure:');
    console.log('  1. Server is running (npm start or npm run dev)');
    console.log('  2. Database is connected');
    console.log('  3. Admin user exists');
  }
}

// Run tests
runTests();
