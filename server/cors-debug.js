#!/usr/bin/env node

/**
 * CORS Debug Script for Dhruval ERP
 * This script helps debug CORS issues in production
 */

const https = require('https');
const http = require('http');

const SERVER_URL = 'https://server.dhruvalexim.com';
const CLIENT_ORIGIN = 'https://erp.dhruvalexim.com';

console.log('🔍 CORS Debug Script for Dhruval ERP');
console.log('=====================================');
console.log(`Server URL: ${SERVER_URL}`);
console.log(`Client Origin: ${CLIENT_ORIGIN}`);
console.log('');

// Test 1: Simple GET request to health endpoint
function testHealthEndpoint() {
  return new Promise((resolve, reject) => {
    console.log('📋 Test 1: Health Endpoint Check');
    console.log('--------------------------------');
    
    const options = {
      hostname: 'server.dhruvalexim.com',
      port: 443,
      path: '/api/v1/health',
      method: 'GET',
      headers: {
        'Origin': CLIENT_ORIGIN,
        'User-Agent': 'CORS-Debug-Script/1.0'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      console.log('Response Headers:');
      Object.keys(res.headers).forEach(key => {
        if (key.toLowerCase().includes('access-control') || key.toLowerCase().includes('cors')) {
          console.log(`  ${key}: ${res.headers[key]}`);
        }
      });

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log('Response Body:', parsed);
        } catch (e) {
          console.log('Response Body (raw):', data);
        }
        console.log('✅ Health endpoint test completed\n');
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('❌ Health endpoint test failed:', error.message);
      console.log('');
      resolve();
    });

    req.end();
  });
}

// Test 2: OPTIONS preflight request
function testPreflightRequest() {
  return new Promise((resolve, reject) => {
    console.log('📋 Test 2: CORS Preflight Request');
    console.log('----------------------------------');
    
    const options = {
      hostname: 'server.dhruvalexim.com',
      port: 443,
      path: '/api/v1/health',
      method: 'OPTIONS',
      headers: {
        'Origin': CLIENT_ORIGIN,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type,Authorization',
        'User-Agent': 'CORS-Debug-Script/1.0'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      console.log('Response Headers:');
      Object.keys(res.headers).forEach(key => {
        console.log(`  ${key}: ${res.headers[key]}`);
      });

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (data) {
          console.log('Response Body:', data);
        }
        console.log('✅ Preflight request test completed\n');
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('❌ Preflight request test failed:', error.message);
      console.log('');
      resolve();
    });

    req.end();
  });
}

// Test 3: POST request with credentials
function testPostRequest() {
  return new Promise((resolve, reject) => {
    console.log('📋 Test 3: POST Request with Credentials');
    console.log('----------------------------------------');
    
    const postData = JSON.stringify({
      test: 'cors-debug'
    });

    const options = {
      hostname: 'server.dhruvalexim.com',
      port: 443,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Origin': CLIENT_ORIGIN,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'CORS-Debug-Script/1.0'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      console.log('Response Headers:');
      Object.keys(res.headers).forEach(key => {
        if (key.toLowerCase().includes('access-control') || key.toLowerCase().includes('cors')) {
          console.log(`  ${key}: ${res.headers[key]}`);
        }
      });

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log('Response Body:', parsed.message || parsed.error || 'No message');
        } catch (e) {
          console.log('Response Body (raw):', data.substring(0, 200));
        }
        console.log('✅ POST request test completed\n');
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('❌ POST request test failed:', error.message);
      console.log('');
      resolve();
    });

    req.write(postData);
    req.end();
  });
}

// Run all tests
async function runTests() {
  try {
    await testHealthEndpoint();
    await testPreflightRequest();
    await testPostRequest();
    
    console.log('🎉 All CORS tests completed!');
    console.log('');
    console.log('💡 Troubleshooting Tips:');
    console.log('- Check if Access-Control-Allow-Origin header is present');
    console.log('- Verify Access-Control-Allow-Credentials is set to true');
    console.log('- Ensure preflight OPTIONS requests return 200 status');
    console.log('- Check server logs for CORS-related errors');
    console.log('');
    console.log('📝 Next Steps:');
    console.log('1. Update server CORS configuration if needed');
    console.log('2. Restart server after configuration changes');
    console.log('3. Clear browser cache and try again');
    console.log('4. Check browser developer tools for detailed error messages');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

// Run the tests
runTests();
