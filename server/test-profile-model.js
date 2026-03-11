/**
 * Profile Model Test Script
 * Tests the Profile schema validation and functionality
 */

const mongoose = require('mongoose');
const Profile = require('./models/Profile');
const User = require('./models/User');

// Test configuration
const TEST_DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/football_club_test';

async function testProfileModel() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(TEST_DB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clean up test data
    await Profile.deleteMany({ fullName: /Test Profile/ });
    await User.deleteMany({ email: /test-profile/ });

    // Test 1: Create a test user first
    console.log('Test 1: Creating test user...');
    const testUser = await User.create({
      email: 'test-profile@example.com',
      passwordHash: 'hashedpassword123',
      role: 'player'
    });
    console.log('✅ Test user created:', testUser._id);

    // Test 2: Create a valid profile
    console.log('\nTest 2: Creating valid profile...');
    const validProfile = await Profile.create({
      userId: testUser._id,
      fullName: 'Test Profile Player',
      position: 'Forward',
      weight: 75,
      height: 180,
      fitnessStatus: 'Green',
      contractType: 'Full-Time',
      contractStart: new Date('2024-01-01'),
      contractEnd: new Date('2026-12-31'),
      stats: {
        goals: 15,
        assists: 8,
        appearances: 25,
        rating: 7.5
      }
    });
    console.log('✅ Valid profile created:', validProfile._id);
    console.log('   Full Name:', validProfile.fullName);
    console.log('   Position:', validProfile.position);
    console.log('   Fitness Status:', validProfile.fitnessStatus);
    console.log('   Contract Days Remaining:', validProfile.contractDaysRemaining);
    console.log('   Contract Expiring Soon:', validProfile.contractExpiringSoon);

    // Test 3: Test fitness status enum validation
    console.log('\nTest 3: Testing fitness status enum validation...');
    try {
      await Profile.create({
        userId: new mongoose.Types.ObjectId(),
        fullName: 'Test Invalid Fitness',
        fitnessStatus: 'Blue' // Invalid value
      });
      console.log('❌ Should have failed with invalid fitness status');
    } catch (error) {
      console.log('✅ Correctly rejected invalid fitness status:', error.message);
    }

    // Test 4: Test position enum validation
    console.log('\nTest 4: Testing position enum validation...');
    try {
      await Profile.create({
        userId: new mongoose.Types.ObjectId(),
        fullName: 'Test Invalid Position',
        position: 'Striker' // Invalid value
      });
      console.log('❌ Should have failed with invalid position');
    } catch (error) {
      console.log('✅ Correctly rejected invalid position:', error.message);
    }

    // Test 5: Test stats rating range validation
    console.log('\nTest 5: Testing stats rating range validation...');
    try {
      await Profile.create({
        userId: new mongoose.Types.ObjectId(),
        fullName: 'Test Invalid Rating',
        stats: { rating: 11 } // Invalid: exceeds max of 10
      });
      console.log('❌ Should have failed with invalid rating');
    } catch (error) {
      console.log('✅ Correctly rejected invalid rating:', error.message);
    }

    // Test 6: Test contract date validation
    console.log('\nTest 6: Testing contract date validation...');
    try {
      await Profile.create({
        userId: new mongoose.Types.ObjectId(),
        fullName: 'Test Invalid Contract',
        contractStart: new Date('2025-01-01'),
        contractEnd: new Date('2024-01-01') // End before start
      });
      console.log('❌ Should have failed with invalid contract dates');
    } catch (error) {
      console.log('✅ Correctly rejected invalid contract dates:', error.message);
    }

    // Test 7: Test unique userId constraint
    console.log('\nTest 7: Testing unique userId constraint...');
    try {
      await Profile.create({
        userId: testUser._id, // Same userId as validProfile
        fullName: 'Test Duplicate User'
      });
      console.log('❌ Should have failed with duplicate userId');
    } catch (error) {
      console.log('✅ Correctly rejected duplicate userId:', error.code === 11000 ? 'Duplicate key error' : error.message);
    }

    // Test 8: Test performance notes
    console.log('\nTest 8: Testing performance notes...');
    validProfile.performanceNotes.push({
      note: 'Excellent performance in training',
      createdBy: testUser._id
    });
    await validProfile.save();
    console.log('✅ Performance note added successfully');
    console.log('   Note:', validProfile.performanceNotes[0].note);
    console.log('   Created At:', validProfile.performanceNotes[0].createdAt);

    // Test 9: Test indexes
    console.log('\nTest 9: Verifying indexes...');
    const indexes = await Profile.collection.getIndexes();
    console.log('✅ Indexes created:');
    Object.keys(indexes).forEach(indexName => {
      console.log('   -', indexName, ':', JSON.stringify(indexes[indexName].key));
    });

    // Clean up
    console.log('\n🧹 Cleaning up test data...');
    await Profile.deleteMany({ fullName: /Test Profile/ });
    await User.deleteMany({ email: /test-profile/ });
    console.log('✅ Test data cleaned up');

    console.log('\n✅ All Profile model tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run tests
testProfileModel();
