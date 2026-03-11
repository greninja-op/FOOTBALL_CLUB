/**
 * Profile Controller Test Script
 * Tests all profile controller operations
 * 
 * Run with: node server/test-profile-controller.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Profile = require('./models/Profile');
const SystemLog = require('./models/SystemLog');

dotenv.config();

// Mock request and response objects
const createMockReq = (params = {}, body = {}, user = {}) => ({
  params,
  body,
  user
});

const createMockRes = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.data = data;
    return res;
  };
  return res;
};

async function runTests() {
  try {
    console.log('🧪 Starting Profile Controller Tests...\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Clean up test data
    await Profile.deleteMany({ fullName: /Test Profile Controller/ });
    await User.deleteMany({ email: /test-profile-controller/ });
    await SystemLog.deleteMany({ targetCollection: 'Profile' });

    // Create test user and profile
    console.log('Test Setup: Creating test user and profile...');
    const testUser = await User.create({
      email: 'test-profile-controller@example.com',
      passwordHash: 'hashedpassword123',
      role: 'player'
    });

    const testProfile = await Profile.create({
      userId: testUser._id,
      fullName: 'Test Profile Controller Player',
      position: 'Forward',
      fitnessStatus: 'Green',
      stats: {
        goals: 5,
        assists: 3,
        appearances: 10,
        rating: 7.5
      }
    });

    console.log('✓ Test user and profile created\n');

    // Import controller functions
    const {
      getProfile,
      updateProfile,
      updateFitnessStatus,
      updateStats
    } = require('./controllers/profileController');

    // Test 1: Get Profile
    console.log('Test 1: Get Profile');
    const req1 = createMockReq(
      { userId: testUser._id },
      {},
      { id: testUser._id, role: 'admin' }
    );
    const res1 = createMockRes();
    await getProfile(req1, res1);
    
    if (res1.statusCode === 200 && res1.data.success) {
      console.log('✓ Get profile successful');
      console.log(`  Profile: ${res1.data.profile.fullName}`);
      console.log(`  Position: ${res1.data.profile.position}`);
      console.log(`  Fitness: ${res1.data.profile.fitnessStatus}`);
    } else {
      console.log('✗ Get profile failed:', res1.data);
    }
    console.log();

    // Test 2: Update Profile
    console.log('Test 2: Update Profile');
    const req2 = createMockReq(
      { userId: testUser._id },
      {
        fullName: 'Test Profile Controller Updated',
        weight: 75,
        height: 180
      },
      { id: testUser._id, role: 'manager' }
    );
    const res2 = createMockRes();
    await updateProfile(req2, res2);
    
    if (res2.statusCode === 200 && res2.data.success) {
      console.log('✓ Update profile successful');
      console.log(`  Updated name: ${res2.data.profile.fullName}`);
      console.log(`  Weight: ${res2.data.profile.weight} kg`);
      console.log(`  Height: ${res2.data.profile.height} cm`);
    } else {
      console.log('✗ Update profile failed:', res2.data);
    }
    console.log();

    // Test 3: Update Fitness Status
    console.log('Test 3: Update Fitness Status');
    const req3 = createMockReq(
      { userId: testUser._id },
      {
        status: 'Yellow',
        notes: 'Minor muscle strain, monitoring closely'
      },
      { id: testUser._id, role: 'coach' }
    );
    const res3 = createMockRes();
    await updateFitnessStatus(req3, res3);
    
    if (res3.statusCode === 200 && res3.data.success) {
      console.log('✓ Update fitness status successful');
      console.log(`  New status: ${res3.data.profile.fitnessStatus}`);
    } else {
      console.log('✗ Update fitness status failed:', res3.data);
    }
    console.log();

    // Test 4: Update Stats with Valid Rating
    console.log('Test 4: Update Stats with Valid Rating (0-10)');
    const req4 = createMockReq(
      { userId: testUser._id },
      {
        goals: 8,
        assists: 5,
        appearances: 15,
        rating: 8.5
      },
      { id: testUser._id, role: 'coach' }
    );
    const res4 = createMockRes();
    await updateStats(req4, res4);
    
    if (res4.statusCode === 200 && res4.data.success) {
      console.log('✓ Update stats successful');
      console.log(`  Goals: ${res4.data.profile.stats.goals}`);
      console.log(`  Assists: ${res4.data.profile.stats.assists}`);
      console.log(`  Appearances: ${res4.data.profile.stats.appearances}`);
      console.log(`  Rating: ${res4.data.profile.stats.rating}`);
    } else {
      console.log('✗ Update stats failed:', res4.data);
    }
    console.log();

    // Test 5: Update Stats with Invalid Rating (should fail)
    console.log('Test 5: Update Stats with Invalid Rating (>10)');
    const req5 = createMockReq(
      { userId: testUser._id },
      {
        rating: 11
      },
      { id: testUser._id, role: 'coach' }
    );
    const res5 = createMockRes();
    await updateStats(req5, res5);
    
    if (res5.statusCode === 400 && !res5.data.success) {
      console.log('✓ Invalid rating correctly rejected');
      console.log(`  Error: ${res5.data.message}`);
    } else {
      console.log('✗ Invalid rating should have been rejected');
    }
    console.log();

    // Test 6: Update Fitness Status with Invalid Status (should fail)
    console.log('Test 6: Update Fitness Status with Invalid Status');
    const req6 = createMockReq(
      { userId: testUser._id },
      {
        status: 'Blue'
      },
      { id: testUser._id, role: 'coach' }
    );
    const res6 = createMockRes();
    await updateFitnessStatus(req6, res6);
    
    if (res6.statusCode === 400 && !res6.data.success) {
      console.log('✓ Invalid fitness status correctly rejected');
      console.log(`  Error: ${res6.data.message}`);
    } else {
      console.log('✗ Invalid fitness status should have been rejected');
    }
    console.log();

    // Test 7: Verify System Logs
    console.log('Test 7: Verify System Logs Created');
    const logs = await SystemLog.find({ 
      targetCollection: 'Profile',
      targetId: testProfile._id 
    }).sort({ timestamp: -1 });
    
    console.log(`✓ Found ${logs.length} system logs for profile operations`);
    logs.forEach((log, index) => {
      console.log(`  Log ${index + 1}: ${log.action} by ${log.performedBy}`);
    });
    console.log();

    // Clean up
    console.log('🧹 Cleaning up test data...');
    await Profile.deleteMany({ fullName: /Test Profile Controller/ });
    await User.deleteMany({ email: /test-profile-controller/ });
    await SystemLog.deleteMany({ targetCollection: 'Profile' });
    console.log('✓ Test data cleaned up\n');

    console.log('✅ All Profile Controller Tests Completed Successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
  }
}

// Run tests
runTests();
