/**
 * Test Email Validation in Controllers - Task 35.1
 * Tests email format validation in authController and userController
 * Validates Requirements: 20.2, 21.5
 */

const { login } = require('./controllers/authController');

console.log('=== Controller Email Validation Tests ===\n');

// Test authController.login with invalid email
async function testAuthControllerEmailValidation() {
  console.log('Testing authController.login email validation...\n');
  
  const invalidEmails = [
    'invalid.email',
    '@example.com',
    'user@',
    'user @example.com',
    ''
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const email of invalidEmails) {
    try {
      await login(email, 'password123');
      console.log(`✗ FAIL: Should reject invalid email "${email}"`);
      failed++;
    } catch (error) {
      if (error.message === 'Invalid email format') {
        console.log(`✓ PASS: Correctly rejected invalid email "${email}"`);
        passed++;
      } else {
        console.log(`✗ FAIL: Wrong error for "${email}": ${error.message}`);
        failed++;
      }
    }
  }
  
  console.log(`\nAuth Controller Tests: ${passed} passed, ${failed} failed\n`);
  return { passed, failed };
}

// Test with valid email format (will fail at DB lookup, but should pass validation)
async function testValidEmailFormat() {
  console.log('Testing valid email format passes validation...\n');
  
  try {
    await login('valid@example.com', 'password123');
    console.log('✗ FAIL: Should fail at DB lookup, not validation');
    return { passed: 0, failed: 1 };
  } catch (error) {
    if (error.message === 'Invalid email format') {
      console.log('✗ FAIL: Valid email rejected by validation');
      return { passed: 0, failed: 1 };
    } else {
      // Expected to fail at DB lookup or authentication, not validation
      console.log(`✓ PASS: Valid email passed validation (failed later: ${error.message})`);
      return { passed: 1, failed: 0 };
    }
  }
}

// Run tests
async function runTests() {
  const results = [];
  
  results.push(await testAuthControllerEmailValidation());
  results.push(await testValidEmailFormat());
  
  const totalPassed = results.reduce((sum, r) => sum + r.passed, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
  
  console.log('=== Test Summary ===');
  console.log(`Total Passed: ${totalPassed}`);
  console.log(`Total Failed: ${totalFailed}`);
  
  if (totalFailed === 0) {
    console.log('\n✓ All controller email validation tests passed!');
    process.exit(0);
  } else {
    console.log('\n✗ Some tests failed!');
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('Test execution error:', error);
  process.exit(1);
});
