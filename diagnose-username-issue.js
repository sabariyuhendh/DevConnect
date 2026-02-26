#!/usr/bin/env node

/**
 * Username Check Diagnostic Tool
 * Run this to diagnose username checking issues
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('=== DevConnect Username Check Diagnostic ===\n');

// Get API URL
rl.question('Enter your API URL (e.g., http://localhost:3001 or http://192.168.1.100:3001): ', async (apiUrl) => {
  apiUrl = apiUrl.trim();
  
  if (!apiUrl) {
    console.log('❌ API URL is required');
    rl.close();
    return;
  }

  console.log(`\nUsing API URL: ${apiUrl}\n`);

  // Test 1: Health Check
  console.log('Test 1: Health Check');
  console.log('-------------------');
  try {
    const fetch = (await import('node-fetch')).default;
    const healthRes = await fetch(`${apiUrl}/health`);
    const healthData = await healthRes.json();
    console.log('✓ Backend is reachable');
    console.log('Response:', JSON.stringify(healthData, null, 2));
  } catch (error) {
    console.log('❌ Cannot reach backend');
    console.log('Error:', error.message);
    console.log('\nMake sure:');
    console.log('1. Backend is running');
    console.log('2. API URL is correct');
    console.log('3. No firewall blocking the connection');
    rl.close();
    return;
  }

  console.log('\n');

  // Test 2: Username Check
  rl.question('Enter a username to check: ', async (username) => {
    username = username.trim();
    
    if (!username) {
      console.log('❌ Username is required');
      rl.close();
      return;
    }

    console.log('\nTest 2: Username Check');
    console.log('---------------------');
    console.log(`Checking username: "${username}"`);
    console.log(`URL: ${apiUrl}/api/auth/check-username?username=${encodeURIComponent(username)}`);
    
    try {
      const fetch = (await import('node-fetch')).default;
      const checkRes = await fetch(`${apiUrl}/api/auth/check-username?username=${encodeURIComponent(username)}`);
      const checkData = await checkRes.json();
      
      console.log('\nResponse Status:', checkRes.status);
      console.log('Response Headers:', JSON.stringify(Object.fromEntries(checkRes.headers.entries()), null, 2));
      console.log('Response Body:', JSON.stringify(checkData, null, 2));
      
      if (checkData.available === true) {
        console.log('\n✓ Username is AVAILABLE');
      } else if (checkData.available === false) {
        console.log('\n✗ Username is TAKEN');
      } else {
        console.log('\n⚠ Unexpected response format');
      }
      
      // Test 3: Check with different variations
      console.log('\n\nTest 3: Testing Variations');
      console.log('-------------------------');
      
      const variations = [
        username,
        username.toLowerCase(),
        username.toUpperCase(),
        username.trim(),
        username.toLowerCase().trim()
      ];
      
      for (const variant of variations) {
        const varRes = await fetch(`${apiUrl}/api/auth/check-username?username=${encodeURIComponent(variant)}`);
        const varData = await varRes.json();
        console.log(`"${variant}" -> available: ${varData.available}`);
      }
      
      console.log('\n\nDiagnostic complete!');
      console.log('\nNext steps:');
      console.log('1. Check backend console logs for detailed information');
      console.log('2. If username shows as taken but should be available, check database');
      console.log('3. Run: cd backend && npx prisma studio');
      console.log('4. Look at User table and search for the username');
      
    } catch (error) {
      console.log('❌ Username check failed');
      console.log('Error:', error.message);
    }
    
    rl.close();
  });
});
