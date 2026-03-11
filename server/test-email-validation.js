/**
 * Test Email Validation - Task 35.1
 * Tests email format validation using validator library for RFC 5322 compliance
 * Validates Requirements: 20.2, 21.5
 */

const validator = require('validator');

console.log('=== Email Validation Tests ===\n');

// Test cases for email validation
const testCases = [
  // Valid emails
  { email: 'user@example.com', expected: true, description: 'Standard email' },
  { email: 'john.doe@company.co.uk', expected: true, description: 'Email with subdomain' },
  { email: 'admin+test@football.club', expected: true, description: 'Email with plus sign' },
  { email: 'user_123@test-domain.org', expected: true, description: 'Email with underscore and hyphen' },
  
  // Invalid emails
  { email: 'invalid.email', expected: false, description: 'Missing @ symbol' },
  { email: '@example.com', expected: false, description: 'Missing local part' },
  { email: 'user@', expected: false, description: 'Missing domain' },
  { email: 'user @example.com', expected: false, description: 'Space in email' },
  { email: 'user@example', expected: false, description: 'Missing TLD' },
  { email: '', expected: false, description: 'Empty string' },
  { email: 'user@@example.com', expected: false, description: 'Double @ symbol' },
  { email: 'user@.com', expected: false, description: 'Domain starts with dot' }
];

let passed = 0;
let failed = 0;

testCases.forEach(({ email, expected, description }) => {
  const result = validator.isEmail(email);
  const status = result === expected ? '✓ PASS' : '✗ FAIL';
  
  if (result === expected) {
    passed++;
  } else {
    failed++;
  }
  
  console.log(`${status}: ${description}`);
  console.log(`  Email: "${email}"`);
  console.log(`  Expected: ${expected}, Got: ${result}\n`);
});

console.log('=== Test Summary ===');
console.log(`Total: ${testCases.length}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed === 0) {
  console.log('\n✓ All email validation tests passed!');
  process.exit(0);
} else {
  console.log('\n✗ Some tests failed!');
  process.exit(1);
}
