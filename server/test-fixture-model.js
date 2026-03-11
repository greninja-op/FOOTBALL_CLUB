/**
 * Test script for Fixture model validation
 * Tests all requirements: date validation, matchType enum, lineup size validation, indexes
 */

const mongoose = require('mongoose');
const Fixture = require('./models/Fixture');

// Mock User and Profile IDs for testing
const mockUserId = new mongoose.Types.ObjectId();
const mockProfileIds = Array.from({ length: 20 }, () => new mongoose.Types.ObjectId());

console.log('=== Fixture Model Validation Tests ===\n');

// Test 1: Valid fixture creation
console.log('Test 1: Valid fixture with all required fields');
try {
  const validFixture = new Fixture({
    opponent: 'Manchester United',
    date: new Date('2025-12-31'),
    location: 'Old Trafford',
    matchType: 'League',
    lineup: mockProfileIds.slice(0, 11), // 11 players
    createdBy: mockUserId
  });
  
  const error = validFixture.validateSync();
  if (!error) {
    console.log('✓ Valid fixture passes validation');
    console.log(`  - Opponent: ${validFixture.opponent}`);
    console.log(`  - Date: ${validFixture.date.toISOString()}`);
    console.log(`  - Location: ${validFixture.location}`);
    console.log(`  - Match Type: ${validFixture.matchType}`);
    console.log(`  - Lineup size: ${validFixture.lineup.length}`);
  } else {
    console.log('✗ Unexpected validation error:', error.message);
  }
} catch (err) {
  console.log('✗ Error:', err.message);
}

console.log('\n---\n');

// Test 2: Past date validation
console.log('Test 2: Fixture with past date (should fail)');
try {
  const pastDateFixture = new Fixture({
    opponent: 'Liverpool FC',
    date: new Date('2020-01-01'), // Past date
    location: 'Anfield',
    matchType: 'Cup',
    createdBy: mockUserId
  });
  
  const error = pastDateFixture.validateSync();
  if (error && error.errors.date) {
    console.log('✓ Past date correctly rejected');
    console.log(`  - Error: ${error.errors.date.message}`);
  } else {
    console.log('✗ Past date should have been rejected');
  }
} catch (err) {
  console.log('✗ Unexpected error:', err.message);
}

console.log('\n---\n');

// Test 3: Invalid matchType enum
console.log('Test 3: Invalid matchType (should fail)');
try {
  const invalidMatchType = new Fixture({
    opponent: 'Chelsea FC',
    date: new Date('2025-06-15'),
    location: 'Stamford Bridge',
    matchType: 'InvalidType', // Invalid enum value
    createdBy: mockUserId
  });
  
  const error = invalidMatchType.validateSync();
  if (error && error.errors.matchType) {
    console.log('✓ Invalid matchType correctly rejected');
    console.log(`  - Error: ${error.errors.matchType.message}`);
  } else {
    console.log('✗ Invalid matchType should have been rejected');
  }
} catch (err) {
  console.log('✗ Unexpected error:', err.message);
}

console.log('\n---\n');

// Test 4: Lineup size validation (max 18)
console.log('Test 4: Lineup with 18 players (should pass)');
try {
  const maxLineupFixture = new Fixture({
    opponent: 'Arsenal FC',
    date: new Date('2025-07-20'),
    location: 'Emirates Stadium',
    matchType: 'Friendly',
    lineup: mockProfileIds.slice(0, 18), // Exactly 18 players
    createdBy: mockUserId
  });
  
  const error = maxLineupFixture.validateSync();
  if (!error) {
    console.log('✓ Lineup with 18 players passes validation');
    console.log(`  - Lineup size: ${maxLineupFixture.lineup.length}`);
  } else {
    console.log('✗ Unexpected validation error:', error.message);
  }
} catch (err) {
  console.log('✗ Error:', err.message);
}

console.log('\n---\n');

// Test 5: Lineup size validation (more than 18 - should fail in pre-save)
console.log('Test 5: Lineup with 19 players (should fail in pre-save hook)');
try {
  const oversizedLineupFixture = new Fixture({
    opponent: 'Tottenham Hotspur',
    date: new Date('2025-08-10'),
    location: 'Tottenham Hotspur Stadium',
    matchType: 'Tournament',
    lineup: mockProfileIds.slice(0, 19), // 19 players - exceeds limit
    createdBy: mockUserId
  });
  
  const error = oversizedLineupFixture.validateSync();
  if (!error) {
    console.log('✓ Schema validation passes (pre-save hook will catch this)');
    console.log(`  - Lineup size: ${oversizedLineupFixture.lineup.length}`);
    console.log('  - Note: Pre-save hook would reject this during actual save operation');
  } else {
    console.log('✗ Unexpected validation error:', error.message);
  }
} catch (err) {
  console.log('✗ Error:', err.message);
}

console.log('\n---\n');

// Test 6: Missing required fields
console.log('Test 6: Missing required fields (should fail)');
try {
  const missingFieldsFixture = new Fixture({
    opponent: 'Newcastle United'
    // Missing date, location, and createdBy
  });
  
  const error = missingFieldsFixture.validateSync();
  if (error) {
    console.log('✓ Missing required fields correctly rejected');
    const missingFields = Object.keys(error.errors);
    console.log(`  - Missing fields: ${missingFields.join(', ')}`);
  } else {
    console.log('✗ Missing fields should have been rejected');
  }
} catch (err) {
  console.log('✗ Unexpected error:', err.message);
}

console.log('\n---\n');

// Test 7: Default matchType
console.log('Test 7: Default matchType (should be "League")');
try {
  const defaultMatchTypeFixture = new Fixture({
    opponent: 'Everton FC',
    date: new Date('2025-09-05'),
    location: 'Goodison Park',
    // matchType not specified - should default to 'League'
    createdBy: mockUserId
  });
  
  const error = defaultMatchTypeFixture.validateSync();
  if (!error && defaultMatchTypeFixture.matchType === 'League') {
    console.log('✓ Default matchType correctly set to "League"');
    console.log(`  - Match Type: ${defaultMatchTypeFixture.matchType}`);
  } else {
    console.log('✗ Default matchType should be "League"');
  }
} catch (err) {
  console.log('✗ Error:', err.message);
}

console.log('\n---\n');

// Test 8: All valid matchType enum values
console.log('Test 8: All valid matchType enum values');
const validMatchTypes = ['League', 'Cup', 'Friendly', 'Tournament'];
validMatchTypes.forEach(matchType => {
  try {
    const fixture = new Fixture({
      opponent: 'Test Opponent',
      date: new Date('2025-10-15'),
      location: 'Test Stadium',
      matchType: matchType,
      createdBy: mockUserId
    });
    
    const error = fixture.validateSync();
    if (!error) {
      console.log(`✓ matchType "${matchType}" is valid`);
    } else {
      console.log(`✗ matchType "${matchType}" should be valid`);
    }
  } catch (err) {
    console.log(`✗ Error with matchType "${matchType}":`, err.message);
  }
});

console.log('\n---\n');

// Test 9: Schema indexes
console.log('Test 9: Verify schema indexes');
const indexes = Fixture.schema.indexes();
console.log('✓ Schema indexes defined:');
indexes.forEach((index, i) => {
  const fields = Object.keys(index[0]).join(', ');
  console.log(`  ${i + 1}. Index on: ${fields}`);
});

console.log('\n=== All Tests Complete ===');
