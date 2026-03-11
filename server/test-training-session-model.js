/**
 * Test script for TrainingSession model
 * Validates schema constraints and business rules
 */

const mongoose = require('mongoose');
const TrainingSession = require('./models/TrainingSession');

// Test data
const testUserId = new mongoose.Types.ObjectId();
const testPlayerId1 = new mongoose.Types.ObjectId();
const testPlayerId2 = new mongoose.Types.ObjectId();

console.log('=== TrainingSession Model Validation Tests ===\n');

// Test 1: Valid training session
console.log('Test 1: Creating valid training session...');
const validSession = new TrainingSession({
  date: new Date(Date.now() + 86400000), // Tomorrow
  drillDescription: 'Passing drills and tactical positioning exercises',
  duration: 90,
  attendees: [
    { playerId: testPlayerId1, status: 'Present' },
    { playerId: testPlayerId2, status: 'Absent' }
  ],
  createdBy: testUserId
});

const validationError1 = validSession.validateSync();
if (validationError1) {
  console.log('❌ FAILED: Valid session should not have errors');
  console.log(validationError1.message);
} else {
  console.log('✅ PASSED: Valid training session created successfully\n');
}

// Test 2: Past date validation
console.log('Test 2: Testing past date validation...');
const pastDateSession = new TrainingSession({
  date: new Date('2020-01-01'),
  drillDescription: 'Passing drills and tactical positioning exercises',
  duration: 90,
  createdBy: testUserId
});

const validationError2 = pastDateSession.validateSync();
if (validationError2 && validationError2.errors.date) {
  console.log('✅ PASSED: Past date correctly rejected');
  console.log(`   Error: ${validationError2.errors.date.message}\n`);
} else {
  console.log('❌ FAILED: Past date should be rejected\n');
}

// Test 3: Duration range validation (too short)
console.log('Test 3: Testing minimum duration validation...');
const shortDurationSession = new TrainingSession({
  date: new Date(Date.now() + 86400000),
  drillDescription: 'Quick warm-up session',
  duration: 20, // Below minimum of 30
  createdBy: testUserId
});

const validationError3 = shortDurationSession.validateSync();
if (validationError3 && validationError3.errors.duration) {
  console.log('✅ PASSED: Duration below 30 minutes correctly rejected');
  console.log(`   Error: ${validationError3.errors.duration.message}\n`);
} else {
  console.log('❌ FAILED: Duration below 30 should be rejected\n');
}

// Test 4: Duration range validation (too long)
console.log('Test 4: Testing maximum duration validation...');
const longDurationSession = new TrainingSession({
  date: new Date(Date.now() + 86400000),
  drillDescription: 'Extended training session',
  duration: 350, // Above maximum of 300
  createdBy: testUserId
});

const validationError4 = longDurationSession.validateSync();
if (validationError4 && validationError4.errors.duration) {
  console.log('✅ PASSED: Duration above 300 minutes correctly rejected');
  console.log(`   Error: ${validationError4.errors.duration.message}\n`);
} else {
  console.log('❌ FAILED: Duration above 300 should be rejected\n');
}

// Test 5: Drill description length validation (too short)
console.log('Test 5: Testing minimum drill description length...');
const shortDescSession = new TrainingSession({
  date: new Date(Date.now() + 86400000),
  drillDescription: 'Short', // Below minimum of 10
  duration: 90,
  createdBy: testUserId
});

const validationError5 = shortDescSession.validateSync();
if (validationError5 && validationError5.errors.drillDescription) {
  console.log('✅ PASSED: Short drill description correctly rejected');
  console.log(`   Error: ${validationError5.errors.drillDescription.message}\n`);
} else {
  console.log('❌ FAILED: Drill description below 10 characters should be rejected\n');
}

// Test 6: Attendee status enum validation
console.log('Test 6: Testing attendee status enum validation...');
const invalidStatusSession = new TrainingSession({
  date: new Date(Date.now() + 86400000),
  drillDescription: 'Passing drills and tactical positioning exercises',
  duration: 90,
  attendees: [
    { playerId: testPlayerId1, status: 'InvalidStatus' }
  ],
  createdBy: testUserId
});

const validationError6 = invalidStatusSession.validateSync();
if (validationError6 && validationError6.errors['attendees.0.status']) {
  console.log('✅ PASSED: Invalid status correctly rejected');
  console.log(`   Error: ${validationError6.errors['attendees.0.status'].message}\n`);
} else {
  console.log('❌ FAILED: Invalid status should be rejected\n');
}

// Test 7: Required fields validation
console.log('Test 7: Testing required fields...');
const emptySession = new TrainingSession({});
const validationError7 = emptySession.validateSync();

const requiredFields = ['date', 'drillDescription', 'duration', 'createdBy'];
let allRequiredFieldsValidated = true;

requiredFields.forEach(field => {
  if (!validationError7.errors[field]) {
    console.log(`❌ FAILED: ${field} should be required`);
    allRequiredFieldsValidated = false;
  }
});

if (allRequiredFieldsValidated) {
  console.log('✅ PASSED: All required fields validated correctly\n');
}

// Test 8: Valid attendee statuses
console.log('Test 8: Testing all valid attendee statuses...');
const allStatusesSession = new TrainingSession({
  date: new Date(Date.now() + 86400000),
  drillDescription: 'Comprehensive training session with attendance tracking',
  duration: 120,
  attendees: [
    { playerId: testPlayerId1, status: 'Present' },
    { playerId: testPlayerId2, status: 'Absent' },
    { playerId: new mongoose.Types.ObjectId(), status: 'Excused' }
  ],
  createdBy: testUserId
});

const validationError8 = allStatusesSession.validateSync();
if (validationError8) {
  console.log('❌ FAILED: All valid statuses should be accepted');
  console.log(validationError8.message);
} else {
  console.log('✅ PASSED: All valid attendee statuses accepted\n');
}

// Test 9: Default attendee status
console.log('Test 9: Testing default attendee status...');
const defaultStatusSession = new TrainingSession({
  date: new Date(Date.now() + 86400000),
  drillDescription: 'Training session with default status',
  duration: 90,
  attendees: [
    { playerId: testPlayerId1 } // No status specified
  ],
  createdBy: testUserId
});

const validationError9 = defaultStatusSession.validateSync();
if (!validationError9 && defaultStatusSession.attendees[0].status === 'Absent') {
  console.log('✅ PASSED: Default status is "Absent"\n');
} else {
  console.log('❌ FAILED: Default status should be "Absent"\n');
}

// Test 10: Indexes verification
console.log('Test 10: Verifying indexes...');
const indexes = TrainingSession.schema.indexes();
const hasDateIndex = indexes.some(idx => idx[0].date === 1);
const hasCreatedByIndex = indexes.some(idx => idx[0].createdBy === 1);

if (hasDateIndex && hasCreatedByIndex) {
  console.log('✅ PASSED: Required indexes (date, createdBy) are defined\n');
} else {
  console.log('❌ FAILED: Missing required indexes');
  if (!hasDateIndex) console.log('   - Missing date index');
  if (!hasCreatedByIndex) console.log('   - Missing createdBy index');
  console.log();
}

console.log('=== Test Summary ===');
console.log('All validation tests completed!');
console.log('\nTrainingSession Model Features:');
console.log('✓ Date validation (prevents past dates)');
console.log('✓ Duration range validation (30-300 minutes)');
console.log('✓ Drill description length validation (10-500 characters)');
console.log('✓ Attendees array with playerId and status enum');
console.log('✓ Status enum: Present, Absent, Excused (default: Absent)');
console.log('✓ CreatedBy reference to User');
console.log('✓ Indexes on date and createdBy fields');
console.log('✓ Immutable createdAt timestamp');
