/**
 * Test script for remaining Mongoose models (Tasks 3.5-3.10)
 * Tests: Injury, DisciplinaryAction, LeaveRequest, Inventory, Settings, SystemLog
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Injury = require('./models/Injury');
const DisciplinaryAction = require('./models/DisciplinaryAction');
const LeaveRequest = require('./models/LeaveRequest');
const Inventory = require('./models/Inventory');
const Settings = require('./models/Settings');
const SystemLog = require('./models/SystemLog');
const User = require('./models/User');
const Profile = require('./models/Profile');

// Test results tracker
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, error = null) {
  results.tests.push({ name, passed, error });
  if (passed) {
    results.passed++;
    console.log(`✓ ${name}`);
  } else {
    results.failed++;
    console.log(`✗ ${name}`);
    if (error) console.log(`  Error: ${error.message}`);
  }
}

async function runTests() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Get test user and profile
    const testUser = await User.findOne({ email: 'coach@club.com' });
    const testProfile = await Profile.findOne({ userId: testUser._id });
    
    if (!testUser || !testProfile) {
      throw new Error('Test user or profile not found. Run seed script first.');
    }

    console.log('=== Testing Injury Model (Task 3.5) ===\n');

    // Test 1: Create valid injury
    try {
      const injury = new Injury({
        playerId: testProfile._id,
        injuryType: 'Hamstring Strain',
        severity: 'Moderate',
        description: 'Pulled hamstring during training',
        expectedRecovery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        loggedBy: testUser._id
      });
      await injury.validate();
      logTest('Injury: Valid injury creation', true);
    } catch (error) {
      logTest('Injury: Valid injury creation', false, error);
    }

    // Test 2: Injury severity enum validation
    try {
      const injury = new Injury({
        playerId: testProfile._id,
        injuryType: 'Test Injury',
        severity: 'Critical', // Invalid
        expectedRecovery: new Date(),
        loggedBy: testUser._id
      });
      await injury.validate();
      logTest('Injury: Severity enum validation', false, new Error('Should reject invalid severity'));
    } catch (error) {
      logTest('Injury: Severity enum validation', true);
    }

    // Test 3: Injury required fields
    try {
      const injury = new Injury({
        playerId: testProfile._id
        // Missing required fields
      });
      await injury.validate();
      logTest('Injury: Required fields validation', false, new Error('Should require fields'));
    } catch (error) {
      logTest('Injury: Required fields validation', true);
    }

    console.log('\n=== Testing DisciplinaryAction Model (Task 3.6) ===\n');

    // Test 4: Create valid disciplinary action
    try {
      const action = new DisciplinaryAction({
        playerId: testProfile._id,
        offense: 'Late to training',
        fineAmount: 500,
        issuedBy: testUser._id
      });
      await action.validate();
      logTest('DisciplinaryAction: Valid action creation', true);
    } catch (error) {
      logTest('DisciplinaryAction: Valid action creation', false, error);
    }

    // Test 5: Fine amount range validation
    try {
      const action = new DisciplinaryAction({
        playerId: testProfile._id,
        offense: 'Test offense',
        fineAmount: 150000, // Exceeds max
        issuedBy: testUser._id
      });
      await action.validate();
      logTest('DisciplinaryAction: Fine amount max validation', false, new Error('Should reject amount > 100000'));
    } catch (error) {
      logTest('DisciplinaryAction: Fine amount max validation', true);
    }

    // Test 6: Fine amount negative validation
    try {
      const action = new DisciplinaryAction({
        playerId: testProfile._id,
        offense: 'Test offense',
        fineAmount: -100, // Negative
        issuedBy: testUser._id
      });
      await action.validate();
      logTest('DisciplinaryAction: Fine amount min validation', false, new Error('Should reject negative amount'));
    } catch (error) {
      logTest('DisciplinaryAction: Fine amount min validation', true);
    }

    console.log('\n=== Testing LeaveRequest Model (Task 3.7) ===\n');

    // Test 7: Create valid leave request
    try {
      const leave = new LeaveRequest({
        playerId: testProfile._id,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-05'),
        reason: 'Family vacation planned in advance'
      });
      await leave.validate();
      logTest('LeaveRequest: Valid request creation', true);
    } catch (error) {
      logTest('LeaveRequest: Valid request creation', false, error);
    }

    // Test 8: Date range validation (endDate >= startDate)
    try {
      const leave = new LeaveRequest({
        playerId: testProfile._id,
        startDate: new Date('2024-06-10'),
        endDate: new Date('2024-06-05'), // Before start date
        reason: 'Test leave request with invalid dates'
      });
      await leave.validate();
      logTest('LeaveRequest: Date range validation', false, new Error('Should reject endDate < startDate'));
    } catch (error) {
      logTest('LeaveRequest: Date range validation', true);
    }

    // Test 9: Status enum validation
    try {
      const leave = new LeaveRequest({
        playerId: testProfile._id,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-05'),
        reason: 'Test leave request',
        status: 'Cancelled' // Invalid
      });
      await leave.validate();
      logTest('LeaveRequest: Status enum validation', false, new Error('Should reject invalid status'));
    } catch (error) {
      logTest('LeaveRequest: Status enum validation', true);
    }

    // Test 10: Default status is Pending
    try {
      const leave = new LeaveRequest({
        playerId: testProfile._id,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-05'),
        reason: 'Test leave request'
      });
      if (leave.status === 'Pending') {
        logTest('LeaveRequest: Default status is Pending', true);
      } else {
        logTest('LeaveRequest: Default status is Pending', false, new Error(`Status is ${leave.status}`));
      }
    } catch (error) {
      logTest('LeaveRequest: Default status is Pending', false, error);
    }

    console.log('\n=== Testing Inventory Model (Task 3.8) ===\n');

    // Test 11: Create valid inventory item
    try {
      const item = new Inventory({
        itemName: 'Training Jersey #10',
        itemType: 'Jersey'
      });
      await item.validate();
      logTest('Inventory: Valid item creation', true);
    } catch (error) {
      logTest('Inventory: Valid item creation', false, error);
    }

    // Test 12: Item type enum validation
    try {
      const item = new Inventory({
        itemName: 'Test Item',
        itemType: 'Uniform' // Invalid
      });
      await item.validate();
      logTest('Inventory: Item type enum validation', false, new Error('Should reject invalid item type'));
    } catch (error) {
      logTest('Inventory: Item type enum validation', true);
    }

    // Test 13: Virtual property isAssigned (not assigned)
    try {
      const item = new Inventory({
        itemName: 'Test Item',
        itemType: 'Boots'
      });
      if (item.isAssigned === false) {
        logTest('Inventory: isAssigned virtual (unassigned)', true);
      } else {
        logTest('Inventory: isAssigned virtual (unassigned)', false, new Error(`isAssigned is ${item.isAssigned}`));
      }
    } catch (error) {
      logTest('Inventory: isAssigned virtual (unassigned)', false, error);
    }

    // Test 14: Virtual property isAssigned (assigned)
    try {
      const item = new Inventory({
        itemName: 'Test Item',
        itemType: 'Boots',
        assignedTo: testProfile._id,
        assignedAt: new Date()
      });
      if (item.isAssigned === true) {
        logTest('Inventory: isAssigned virtual (assigned)', true);
      } else {
        logTest('Inventory: isAssigned virtual (assigned)', false, new Error(`isAssigned is ${item.isAssigned}`));
      }
    } catch (error) {
      logTest('Inventory: isAssigned virtual (assigned)', false, error);
    }

    // Test 15: Virtual property isAssigned (returned)
    try {
      const item = new Inventory({
        itemName: 'Test Item',
        itemType: 'Boots',
        assignedTo: testProfile._id,
        assignedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        returnedAt: new Date()
      });
      if (item.isAssigned === false) {
        logTest('Inventory: isAssigned virtual (returned)', true);
      } else {
        logTest('Inventory: isAssigned virtual (returned)', false, new Error(`isAssigned is ${item.isAssigned}`));
      }
    } catch (error) {
      logTest('Inventory: isAssigned virtual (returned)', false, error);
    }

    console.log('\n=== Testing Settings Model (Task 3.9) ===\n');

    // Test 16: Create valid settings
    try {
      const settings = new Settings({
        clubName: 'Test Football Club'
      });
      await settings.validate();
      logTest('Settings: Valid settings creation', true);
    } catch (error) {
      logTest('Settings: Valid settings creation', false, error);
    }

    // Test 17: Club name length validation (min)
    try {
      const settings = new Settings({
        clubName: 'FC' // Too short
      });
      await settings.validate();
      logTest('Settings: Club name min length validation', false, new Error('Should reject name < 3 chars'));
    } catch (error) {
      logTest('Settings: Club name min length validation', true);
    }

    // Test 18: Club name length validation (max)
    try {
      const settings = new Settings({
        clubName: 'A'.repeat(101) // Too long
      });
      await settings.validate();
      logTest('Settings: Club name max length validation', false, new Error('Should reject name > 100 chars'));
    } catch (error) {
      logTest('Settings: Club name max length validation', true);
    }

    // Test 19: getSingleton static method
    try {
      const settings = await Settings.getSingleton();
      if (settings && settings.clubName) {
        logTest('Settings: getSingleton static method', true);
      } else {
        logTest('Settings: getSingleton static method', false, new Error('Failed to get/create singleton'));
      }
    } catch (error) {
      logTest('Settings: getSingleton static method', false, error);
    }

    console.log('\n=== Testing SystemLog Model (Task 3.10) ===\n');

    // Test 20: Create valid system log
    try {
      const log = new SystemLog({
        action: 'CREATE',
        performedBy: testUser._id,
        targetCollection: 'users',
        targetId: testUser._id,
        changes: { email: 'test@example.com' }
      });
      await log.validate();
      logTest('SystemLog: Valid log creation', true);
    } catch (error) {
      logTest('SystemLog: Valid log creation', false, error);
    }

    // Test 21: Action enum validation
    try {
      const log = new SystemLog({
        action: 'MODIFY', // Invalid
        performedBy: testUser._id,
        targetCollection: 'users',
        targetId: testUser._id
      });
      await log.validate();
      logTest('SystemLog: Action enum validation', false, new Error('Should reject invalid action'));
    } catch (error) {
      logTest('SystemLog: Action enum validation', true);
    }

    // Test 22: Immutability - prevent updates
    try {
      const log = await SystemLog.create({
        action: 'CREATE',
        performedBy: testUser._id,
        targetCollection: 'test',
        targetId: testUser._id
      });
      
      await SystemLog.updateOne({ _id: log._id }, { action: 'UPDATE' });
      logTest('SystemLog: Immutability (prevent updates)', false, new Error('Should prevent updates'));
    } catch (error) {
      if (error.message.includes('cannot be modified')) {
        logTest('SystemLog: Immutability (prevent updates)', true);
      } else {
        logTest('SystemLog: Immutability (prevent updates)', false, error);
      }
    }

    // Test 23: Immutability - prevent deletes
    try {
      const log = await SystemLog.create({
        action: 'DELETE',
        performedBy: testUser._id,
        targetCollection: 'test',
        targetId: testUser._id
      });
      
      await SystemLog.deleteOne({ _id: log._id });
      logTest('SystemLog: Immutability (prevent deletes)', false, new Error('Should prevent deletes'));
    } catch (error) {
      if (error.message.includes('cannot be deleted')) {
        logTest('SystemLog: Immutability (prevent deletes)', true);
      } else {
        logTest('SystemLog: Immutability (prevent deletes)', false, error);
      }
    }

    // Print summary
    console.log('\n=== Test Summary ===\n');
    console.log(`Total Tests: ${results.tests.length}`);
    console.log(`Passed: ${results.passed}`);
    console.log(`Failed: ${results.failed}`);
    console.log(`Success Rate: ${((results.passed / results.tests.length) * 100).toFixed(1)}%`);

    if (results.failed > 0) {
      console.log('\nFailed Tests:');
      results.tests.filter(t => !t.passed).forEach(t => {
        console.log(`  - ${t.name}`);
        if (t.error) console.log(`    ${t.error.message}`);
      });
    }

  } catch (error) {
    console.error('Test execution error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
    process.exit(results.failed > 0 ? 1 : 0);
  }
}

runTests();
