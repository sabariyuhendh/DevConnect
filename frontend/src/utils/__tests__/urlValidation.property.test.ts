/**
 * Property-Based Tests for URL Validation
 * **Feature: messaging-and-user-management**
 * **Property 12: URL Validation and Storage**
 * **Validates: Requirements 4.3**
 * 
 * These tests verify that URL validation correctly handles various input formats
 * and consistently normalizes URLs for storage and retrieval.
 */

import {
  validateGitHubUrl,
  validateLinkedInUrl,
  validateWebsiteUrl,
  validateSocialLinks
} from '../urlValidation';

// Simple property test runner (since fast-check isn't available in frontend)
interface TestResult {
  passed: number;
  failed: number;
  errors: string[];
}

function runPropertyTest(
  name: string,
  property: () => boolean,
  iterations: number = 100
): TestResult {
  const result: TestResult = { passed: 0, failed: 0, errors: [] };

  for (let i = 0; i < iterations; i++) {
    try {
      if (!property()) {
        result.failed++;
        result.errors.push(`Iteration ${i + 1}: Property returned false`);
      } else {
        result.passed++;
      }
    } catch (error) {
      result.failed++;
      result.errors.push(`Iteration ${i + 1}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return result;
}

// Test data generators
function generateValidGitHubUsername(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789-';
  let username = '';
  const length = Math.floor(Math.random() * 38) + 1; // 1-39 chars
  
  // Ensure it doesn't start or end with hyphen
  for (let i = 0; i < length; i++) {
    if (i === 0 || i === length - 1) {
      username += chars.substring(0, chars.length - 1).charAt(Math.floor(Math.random() * (chars.length - 1)));
    } else {
      username += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return username;
}

function generateValidDomain(): string {
  const tlds = ['com', 'org', 'net', 'io', 'dev', 'co'];
  const domain = 'example' + Math.floor(Math.random() * 1000);
  const tld = tlds[Math.floor(Math.random() * tlds.length)];
  return `${domain}.${tld}`;
}

// Property Tests

/**
 * Property: GitHub URLs in various formats normalize to the same canonical form
 */
function testGitHubUrlNormalization(): boolean {
  const username = generateValidGitHubUsername();
  
  const formats = [
    username,
    `github.com/${username}`,
    `https://github.com/${username}`,
    `http://github.com/${username}`,
    `https://www.github.com/${username}`
  ];

  const results = formats.map(format => validateGitHubUrl(format));
  
  // All valid formats should normalize to the same URL
  const validResults = results.filter(r => r.isValid);
  if (validResults.length === 0) return false;
  
  const firstNormalized = validResults[0].normalizedUrl;
  return validResults.every(r => r.normalizedUrl === firstNormalized);
}

/**
 * Property: Invalid GitHub usernames are rejected
 */
function testGitHubUrlValidation(): boolean {
  const invalidUsernames = [
    '', // empty
    'user@name', // invalid character
    'user name', // space
    'user/name', // slash
    '-username', // starts with hyphen
    'username-', // ends with hyphen
    'a'.repeat(40) // too long
  ];

  return invalidUsernames.every(username => {
    const result = validateGitHubUrl(username);
    return !result.isValid;
  });
}

/**
 * Property: LinkedIn URLs in various formats normalize to the same canonical form
 */
function testLinkedInUrlNormalization(): boolean {
  const username = generateValidGitHubUsername(); // Reuse username generator
  
  const formats = [
    username,
    `linkedin.com/in/${username}`,
    `https://linkedin.com/in/${username}`,
    `http://linkedin.com/in/${username}`,
    `https://www.linkedin.com/in/${username}`
  ];

  const results = formats.map(format => validateLinkedInUrl(format));
  
  const validResults = results.filter(r => r.isValid);
  if (validResults.length === 0) return false;
  
  const firstNormalized = validResults[0].normalizedUrl;
  return validResults.every(r => r.normalizedUrl === firstNormalized);
}

/**
 * Property: Website URLs normalize to valid URL objects
 */
function testWebsiteUrlNormalization(): boolean {
  const domain = generateValidDomain();
  
  const formats = [
    domain,
    `https://${domain}`,
    `http://${domain}`,
    `https://www.${domain}`
  ];

  const results = formats.map(format => validateWebsiteUrl(format));
  
  // All should be valid
  if (!results.every(r => r.isValid)) return false;
  
  // All should normalize to valid URLs
  return results.every(r => {
    try {
      new URL(r.normalizedUrl || '');
      return true;
    } catch {
      return false;
    }
  });
}

/**
 * Property: Empty URLs are valid (optional fields)
 */
function testEmptyUrlsAreValid(): boolean {
  const emptyTests = [
    validateGitHubUrl(''),
    validateGitHubUrl('   '),
    validateLinkedInUrl(''),
    validateLinkedInUrl('   '),
    validateWebsiteUrl(''),
    validateWebsiteUrl('   ')
  ];

  return emptyTests.every(result => result.isValid && result.normalizedUrl === '');
}

/**
 * Property: Normalized URLs are idempotent (validating again produces same result)
 */
function testUrlIdempotence(): boolean {
  const username = generateValidGitHubUsername();
  const url = `https://github.com/${username}`;
  
  const result1 = validateGitHubUrl(url);
  if (!result1.isValid || !result1.normalizedUrl) return false;
  
  const result2 = validateGitHubUrl(result1.normalizedUrl);
  if (!result2.isValid || !result2.normalizedUrl) return false;
  
  return result1.normalizedUrl === result2.normalizedUrl;
}

/**
 * Property: Social links validation returns consistent results
 */
function testSocialLinksValidation(): boolean {
  const links = {
    github: generateValidGitHubUsername(),
    linkedin: generateValidGitHubUsername(),
    website: generateValidDomain()
  };

  const result = validateSocialLinks(links);
  
  // All should be valid
  return result.github.isValid && result.linkedin.isValid && result.website.isValid;
}

// Run all tests
export function runAllTests(): void {
  const tests = [
    { name: 'GitHub URL Normalization', fn: testGitHubUrlNormalization },
    { name: 'GitHub URL Validation', fn: testGitHubUrlValidation },
    { name: 'LinkedIn URL Normalization', fn: testLinkedInUrlNormalization },
    { name: 'Website URL Normalization', fn: testWebsiteUrlNormalization },
    { name: 'Empty URLs Are Valid', fn: testEmptyUrlsAreValid },
    { name: 'URL Idempotence', fn: testUrlIdempotence },
    { name: 'Social Links Validation', fn: testSocialLinksValidation }
  ];

  console.log('Running Property-Based Tests for URL Validation');
  console.log('='.repeat(60));

  let totalPassed = 0;
  let totalFailed = 0;

  tests.forEach(test => {
    const result = runPropertyTest(test.name, test.fn, 100);
    totalPassed += result.passed;
    totalFailed += result.failed;

    const status = result.failed === 0 ? '✓ PASS' : '✗ FAIL';
    console.log(`${status}: ${test.name} (${result.passed}/100 iterations)`);

    if (result.errors.length > 0 && result.errors.length <= 3) {
      result.errors.forEach(error => console.log(`  - ${error}`));
    }
  });

  console.log('='.repeat(60));
  console.log(`Total: ${totalPassed} passed, ${totalFailed} failed`);
  console.log('');
}

// Export for testing
export {
  testGitHubUrlNormalization,
  testGitHubUrlValidation,
  testLinkedInUrlNormalization,
  testWebsiteUrlNormalization,
  testEmptyUrlsAreValid,
  testUrlIdempotence,
  testSocialLinksValidation
};
