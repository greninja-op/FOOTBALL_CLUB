/**
 * Test script for User model validation
 * Run with: node test-user-model.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function testUserModel() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Test 1: Valid user creation
    console.log('Test 1: Creating valid user...');
    const validUser = new User({
      email: 'test.admin@footballclub.com',
      passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz123456', // Mock bcrypt hash
      role: 'admin'
    });
    
    const validationError = validUser.validateSync();
    if (validationError) {
      console.log('✗ Validation failed:', validationError.message);
    } else {
      console.log('✓ Valid user passed validation');
      console.log('  Email:', validUser.email);
      console.log('  Role:', validUser.role);
      console.log('  CreatedAt:', validUser.createdAt);
    }

    // Test 2: Invalid email format
    console.log('\nTest 2: Testing invalid email format...');
    const invalidEmailUser = new User({
      email: 'invalid-email',
      passwordHash: '$2b$10$test',
      role: 'player'
    });
    
    const emailError = invalidEmailUser.validateSync();
    if (emailError && emailError.errors.email) {
      console.log('✓ Invalid email correctly rejected:', emailError.errors.email.message);
    } else {
      console.log('✗ Invalid email was not caught');
    }

    // Test 3: Invalid role
    console.log('\nTest 3: Testing invalid role...');
    const invalidRoleUser = new User({
      email: 'test@example.com',
      passwordHash: '$2b$10$test',
      role: 'superuser'
    });
    
    const roleError = invalidRoleUser.validateSync();
    if (roleError && roleError.errors.role) {
      console.log('✓ Invalid role correctly rejected:', roleError.errors.role.message);
    } else {
      console.log('✗ Invalid role was not caught');
    }

    // Test 4: Missing required fields
    console.log('\nTest 4: Testing missing required fields...');
    const incompleteUser = new User({
      email: 'test@example.com'
    });
    
    const requiredError = incompleteUser.validateSync();
    if (requiredError) {
      console.log('✓ Missing required fields correctly rejected');
      if (requiredError.errors.passwordHash) {
        console.log('  - passwordHash:', requiredError.errors.passwordHash.message);
      }
      if (requiredError.errors.role) {
        console.log('  - role:', requiredError.errors.role.message);
      }
    } else {
      console.log('✗ Missing fields were not caught');
    }

    // Test 5: Email lowercase conversion
    console.log('\nTest 5: Testing email lowercase conversion...');
    const uppercaseEmailUser = new User({
      email: 'TEST.USER@EXAMPLE.COM',
      passwordHash: '$2b$10$test',
      role: 'coach'
    });
    
    if (uppercaseEmailUser.email === 'test.user@example.com') {
      console.log('✓ Email correctly converted to lowercase');
    } else {
      console.log('✗ Email not converted to lowercase:', uppercaseEmailUser.email);
    }

    // Test 6: Valid roles
    console.log('\nTest 6: Testing all valid roles...');
    const roles = ['admin', 'manager', 'coach', 'player'];
    let allRolesValid = true;
    
    for (const role of roles) {
      const testUser = new User({
        email: `${role}@example.com`,
        passwordHash: '$2b$10$test',
        role: role
      });
      
      const error = testUser.validateSync();
      if (error) {
        console.log(`✗ Valid role '${role}' was rejected`);
        allRolesValid = false;
      }
    }
    
    if (allRolesValid) {
      console.log('✓ All valid roles accepted:', roles.join(', '));
    }

    // Test 7: Index verification
    console.log('\nTest 7: Verifying indexes...');
    const indexes = User.schema.indexes();
    console.log('✓ Defined indexes:');
    indexes.forEach(index => {
      console.log('  -', JSON.stringify(index[0]));
    });

    console.log('\n✓ All tests completed successfully!');

  } catch (error) {
    console.error('✗ Test failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run tests
testUserModel();
