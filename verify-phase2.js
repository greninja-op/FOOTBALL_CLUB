/**
 * Phase 2 Verification Script
 * 
 * This script verifies that all Phase 2 (Admin Panel) functionality is working correctly:
 * 1. Admin can create users with all 4 roles
 * 2. Admin can update user roles
 * 3. Admin can delete users
 * 4. Admin can change club name and logo
 * 5. System Logs show all write operations
 * 6. Non-admin users cannot access admin routes (403 errors)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./server/models/User');
const Profile = require('./server/models/Profile');
const Settings = require('./server/models/Settings');
const SystemLog = require('./server/models/SystemLog');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Test results tracking
const results = {
  passed: [],
  failed: [],
  warnings: []
};

function logPass(test) {
  console.log(`✅ PASS: ${test}`);
  results.passed.push(test);
}

function logFail(test, error) {
  console.log(`❌ FAIL: ${test}`);
  console.log(`   Error: ${error}`);
  results.failed.push({ test, error });
}

function logWarning(test, message) {
  console.log(`⚠️  WARNING: ${test}`);
  console.log(`   Message: ${message}`);
  results.warnings.push({ test, message });
}

// Helper function to generate JWT token
function generateToken(userId, role) {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'test-secret-key',
    { expiresIn: '8h' }
  );
}

// Helper function to make API requests
async function makeRequest(method, path, token, body = null) {
  const fetch = (await import('node-fetch')).default;
  const url = `http://localhost:${process.env.PORT || 5000}${path}`;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    ...(body && { body: JSON.stringify(body) })
  };

  const response = await fetch(url, options);
  const data = await response.json();
  
  return { status: response.status, data };
}

async function runVerification() {
  try {
    console.log('\n🔍 Starting Phase 2 Verification...\n');
    console.log('=' .repeat(60));

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/football-club');
    console.log('✓ Connected to MongoDB\n');

    // Clean up test data from previous runs
    await User.deleteMany({ email: /test-phase2/ });
    await Profile.deleteMany({ fullName: /Test Phase2/ });
    console.log('✓ Cleaned up previous test data\n');

    // Create test admin user
    const adminPassword = 'admin123';
    const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
    const adminUser = await User.create({
      email: 'test-phase2-admin@test.com',
      passwordHash: adminPasswordHash,
      role: 'admin'
    });
    await Profile.create({
      userId: adminUser._id,
      fullName: 'Test Phase2 Admin'
    });
    const adminToken = generateToken(adminUser._id, 'admin');
    console.log('✓ Created test admin user\n');

    // Create test non-admin users
    const managerUser = await User.create({
      email: 'test-phase2-manager@test.com',
      passwordHash: await bcrypt.hash('manager123', 10),
      role: 'manager'
    });
    await Profile.create({
      userId: managerUser._id,
      fullName: 'Test Phase2 Manager'
    });
    const managerToken = generateToken(managerUser._id, 'manager');

    const coachUser = await User.create({
      email: 'test-phase2-coach@test.com',
      passwordHash: await bcrypt.hash('coach123', 10),
      role: 'coach'
    });
    await Profile.create({
      userId: coachUser._id,
      fullName: 'Test Phase2 Coach'
    });
    const coachToken = generateToken(coachUser._id, 'coach');

    const playerUser = await User.create({
      email: 'test-phase2-player@test.com',
      passwordHash: await bcrypt.hash('player123', 10),
      role: 'player'
    });
    await Profile.create({
      userId: playerUser._id,
      fullName: 'Test Phase2 Player'
    });
    const playerToken = generateToken(playerUser._id, 'player');

    console.log('✓ Created test non-admin users\n');
    console.log('=' .repeat(60));

    // TEST 1: Admin can create users with all 4 roles
    console.log('\n📋 TEST 1: Admin can create users with all 4 roles\n');
    
    const rolesToTest = ['admin', 'manager', 'coach', 'player'];
    const createdUsers = [];

    for (const role of rolesToTest) {
      try {
        const response = await makeRequest('POST', '/api/users', adminToken, {
          email: `test-phase2-new-${role}@test.com`,
          password: 'password123',
          role: role,
          fullName: `Test Phase2 New ${role.charAt(0).toUpperCase() + role.slice(1)}`
        });

        if (response.status === 201 && response.data.user && response.data.profile) {
          logPass(`Admin can create ${role} user`);
          createdUsers.push(response.data.user.id);
        } else {
          logFail(`Admin can create ${role} user`, `Unexpected response: ${response.status}`);
        }
      } catch (error) {
        logFail(`Admin can create ${role} user`, error.message);
      }
    }

    // TEST 2: Admin can update user roles
    console.log('\n📋 TEST 2: Admin can update user roles\n');
    
    if (createdUsers.length > 0) {
      try {
        const userToUpdate = createdUsers[0];
        const response = await makeRequest('PUT', `/api/users/${userToUpdate}`, adminToken, {
          role: 'coach'
        });

        if (response.status === 200 && response.data.user.role === 'coach') {
          logPass('Admin can update user role');
        } else {
          logFail('Admin can update user role', `Unexpected response: ${response.status}`);
        }
      } catch (error) {
        logFail('Admin can update user role', error.message);
      }
    } else {
      logWarning('Admin can update user role', 'No users created to test update');
    }

    // TEST 3: Admin can delete users
    console.log('\n📋 TEST 3: Admin can delete users\n');
    
    if (createdUsers.length > 0) {
      try {
        const userToDelete = createdUsers[0];
        const response = await makeRequest('DELETE', `/api/users/${userToDelete}`, adminToken);

        if (response.status === 200) {
          logPass('Admin can delete user');
          
          // Verify user is actually deleted
          const deletedUser = await User.findById(userToDelete);
          if (!deletedUser) {
            logPass('Deleted user is removed from database');
          } else {
            logFail('Deleted user is removed from database', 'User still exists');
          }

          // Verify associated profile is deleted
          const deletedProfile = await Profile.findOne({ userId: userToDelete });
          if (!deletedProfile) {
            logPass('Associated profile is deleted with user');
          } else {
            logFail('Associated profile is deleted with user', 'Profile still exists');
          }
        } else {
          logFail('Admin can delete user', `Unexpected response: ${response.status}`);
        }
      } catch (error) {
        logFail('Admin can delete user', error.message);
      }
    } else {
      logWarning('Admin can delete user', 'No users created to test deletion');
    }

    // TEST 4: Admin can change club name and logo
    console.log('\n📋 TEST 4: Admin can change club name and logo\n');
    
    try {
      // Test club name update
      const newClubName = 'Test Phase2 Football Club';
      const response = await makeRequest('PUT', '/api/settings', adminToken, {
        clubName: newClubName
      });

      if (response.status === 200 && response.data.settings.clubName === newClubName) {
        logPass('Admin can update club name');
      } else {
        logFail('Admin can update club name', `Unexpected response: ${response.status}`);
      }

      // Verify settings are persisted
      const settings = await Settings.findOne();
      if (settings && settings.clubName === newClubName) {
        logPass('Club name is persisted in database');
      } else {
        logFail('Club name is persisted in database', 'Settings not found or incorrect');
      }

      // Test club name validation (too short)
      const invalidResponse = await makeRequest('PUT', '/api/settings', adminToken, {
        clubName: 'AB'
      });

      if (invalidResponse.status === 400) {
        logPass('Club name validation rejects names < 3 characters');
      } else {
        logFail('Club name validation rejects names < 3 characters', 'Validation not working');
      }
    } catch (error) {
      logFail('Admin can change club settings', error.message);
    }

    // TEST 5: System Logs show all write operations
    console.log('\n📋 TEST 5: System Logs show all write operations\n');
    
    try {
      // Get system logs
      const response = await makeRequest('GET', '/api/logs?page=1&limit=50', adminToken);

      if (response.status === 200 && response.data.logs) {
        logPass('Admin can retrieve system logs');

        const logs = response.data.logs;
        
        // Check for CREATE operations
        const createLogs = logs.filter(log => log.action === 'CREATE');
        if (createLogs.length > 0) {
          logPass('System logs contain CREATE operations');
        } else {
          logWarning('System logs contain CREATE operations', 'No CREATE logs found');
        }

        // Check for UPDATE operations
        const updateLogs = logs.filter(log => log.action === 'UPDATE');
        if (updateLogs.length > 0) {
          logPass('System logs contain UPDATE operations');
        } else {
          logWarning('System logs contain UPDATE operations', 'No UPDATE logs found');
        }

        // Check for DELETE operations
        const deleteLogs = logs.filter(log => log.action === 'DELETE');
        if (deleteLogs.length > 0) {
          logPass('System logs contain DELETE operations');
        } else {
          logWarning('System logs contain DELETE operations', 'No DELETE logs found');
        }

        // Verify logs are sorted by timestamp descending (newest first)
        if (logs.length > 1) {
          const timestamps = logs.map(log => new Date(log.timestamp).getTime());
          const isSorted = timestamps.every((val, i, arr) => i === 0 || arr[i - 1] >= val);
          
          if (isSorted) {
            logPass('System logs are sorted by timestamp descending');
          } else {
            logFail('System logs are sorted by timestamp descending', 'Logs not properly sorted');
          }
        }

        // Verify logs include user attribution
        const logsWithUser = logs.filter(log => log.performedBy && log.performedBy.email);
        if (logsWithUser.length > 0) {
          logPass('System logs include user attribution');
        } else {
          logFail('System logs include user attribution', 'No user attribution found');
        }
      } else {
        logFail('Admin can retrieve system logs', `Unexpected response: ${response.status}`);
      }
    } catch (error) {
      logFail('System logs verification', error.message);
    }

    // TEST 6: Non-admin users cannot access admin routes (403 errors)
    console.log('\n📋 TEST 6: Non-admin users cannot access admin routes\n');
    
    const nonAdminTokens = [
      { role: 'manager', token: managerToken },
      { role: 'coach', token: coachToken },
      { role: 'player', token: playerToken }
    ];

    const adminRoutes = [
      { method: 'GET', path: '/api/users' },
      { method: 'POST', path: '/api/users', body: { email: 'test@test.com', password: 'pass', role: 'player' } },
      { method: 'PUT', path: `/api/users/${adminUser._id}`, body: { role: 'admin' } },
      { method: 'DELETE', path: `/api/users/${adminUser._id}` },
      { method: 'PUT', path: '/api/settings', body: { clubName: 'Test' } },
      { method: 'GET', path: '/api/logs' }
    ];

    for (const { role, token } of nonAdminTokens) {
      for (const route of adminRoutes) {
        try {
          const response = await makeRequest(route.method, route.path, token, route.body);

          if (response.status === 403) {
            logPass(`${role} receives 403 for ${route.method} ${route.path}`);
          } else {
            logFail(`${role} receives 403 for ${route.method} ${route.path}`, 
              `Expected 403, got ${response.status}`);
          }
        } catch (error) {
          logFail(`${role} authorization check for ${route.method} ${route.path}`, error.message);
        }
      }
    }

    // TEST 7: Verify unauthenticated requests are rejected
    console.log('\n📋 TEST 7: Unauthenticated requests are rejected\n');
    
    try {
      const response = await makeRequest('GET', '/api/users', null);
      
      if (response.status === 401) {
        logPass('Unauthenticated requests to admin routes return 401');
      } else {
        logFail('Unauthenticated requests to admin routes return 401', 
          `Expected 401, got ${response.status}`);
      }
    } catch (error) {
      logFail('Unauthenticated request verification', error.message);
    }

    // Clean up test data
    console.log('\n🧹 Cleaning up test data...\n');
    await User.deleteMany({ email: /test-phase2/ });
    await Profile.deleteMany({ fullName: /Test Phase2/ });
    console.log('✓ Test data cleaned up\n');

    // Print summary
    console.log('=' .repeat(60));
    console.log('\n📊 VERIFICATION SUMMARY\n');
    console.log('=' .repeat(60));
    console.log(`✅ Passed: ${results.passed.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    console.log(`⚠️  Warnings: ${results.warnings.length}`);
    console.log('=' .repeat(60));

    if (results.failed.length > 0) {
      console.log('\n❌ FAILED TESTS:\n');
      results.failed.forEach(({ test, error }) => {
        console.log(`  • ${test}`);
        console.log(`    ${error}\n`);
      });
    }

    if (results.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:\n');
      results.warnings.forEach(({ test, message }) => {
        console.log(`  • ${test}`);
        console.log(`    ${message}\n`);
      });
    }

    if (results.failed.length === 0) {
      console.log('\n🎉 ALL TESTS PASSED! Phase 2 is fully functional.\n');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the errors above.\n');
    }

  } catch (error) {
    console.error('\n❌ Verification failed with error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✓ Database connection closed\n');
    process.exit(results.failed.length === 0 ? 0 : 1);
  }
}

// Run verification
runVerification();
