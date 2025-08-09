#!/usr/bin/env node

/**
 * Cookie Debug Script for Dhruval ERP
 * Tests cookie functionality across domains
 */

const https = require('https');

const SERVER_URL = 'https://server.dhruvalexim.com';
const CLIENT_ORIGIN = 'https://erp.dhruvalexim.com';

console.log('🍪 Cookie Debug Script for Dhruval ERP');
console.log('======================================');
console.log(`Server URL: ${SERVER_URL}`);
console.log(`Client Origin: ${CLIENT_ORIGIN}`);
console.log('');

// Test 1: Check cookie debug endpoint
function testCookieDebug() {
  return new Promise((resolve) => {
    console.log('📋 Test 1: Cookie Debug Endpoint');
    console.log('---------------------------------');
    
    const options = {
      hostname: 'server.dhruvalexim.com',
      port: 443,
      path: '/api/v1/debug/cookies',
      method: 'GET',
      headers: {
        'Origin': CLIENT_ORIGIN,
        'Cookie': 'test-cookie=test-value; another-cookie=another-value',
        'User-Agent': 'Cookie-Debug-Script/1.0'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      console.log('Response Headers:');
      Object.keys(res.headers).forEach(key => {
        if (key.toLowerCase().includes('set-cookie') || key.toLowerCase().includes('access-control')) {
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
          console.log('Cookie Configuration:');
          console.log('  Domain:', parsed.config?.cookieDomain);
          console.log('  Secure:', parsed.config?.cookieSecure);
          console.log('  SameSite:', parsed.config?.cookieSameSite);
          console.log('  Environment:', parsed.config?.nodeEnv);
          console.log('Received Cookies:', parsed.cookies?.received);
          console.log('Cookie Header:', parsed.cookies?.headers);
        } catch (e) {
          console.log('Response Body (raw):', data);
        }
        console.log('✅ Cookie debug test completed\n');
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('❌ Cookie debug test failed:', error.message);
      console.log('');
      resolve();
    });

    req.end();
  });
}

// Test 2: Test login with cookie setting
function testLoginCookies() {
  return new Promise((resolve) => {
    console.log('📋 Test 2: Login Cookie Setting');
    console.log('-------------------------------');
    
    const postData = JSON.stringify({
      email: 'test@example.com',
      password: 'testpassword'
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
        'User-Agent': 'Cookie-Debug-Script/1.0'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      console.log('Response Headers:');
      Object.keys(res.headers).forEach(key => {
        console.log(`  ${key}: ${res.headers[key]}`);
      });

      // Check for Set-Cookie headers
      const setCookieHeaders = res.headers['set-cookie'];
      if (setCookieHeaders) {
        console.log('\n🍪 Set-Cookie Analysis:');
        setCookieHeaders.forEach((cookie, index) => {
          console.log(`  Cookie ${index + 1}: ${cookie}`);
          
          // Parse cookie attributes
          const parts = cookie.split(';').map(part => part.trim());
          const [nameValue] = parts;
          const attributes = parts.slice(1);
          
          console.log(`    Name=Value: ${nameValue}`);
          attributes.forEach(attr => {
            console.log(`    Attribute: ${attr}`);
          });
          console.log('');
        });
      } else {
        console.log('\n❌ No Set-Cookie headers found');
      }

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log('Login Response:', parsed.success ? 'Success' : 'Failed');
          if (parsed.message) console.log('Message:', parsed.message);
        } catch (e) {
          console.log('Response Body (raw):', data.substring(0, 200));
        }
        console.log('✅ Login cookie test completed\n');
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('❌ Login cookie test failed:', error.message);
      console.log('');
      resolve();
    });

    req.write(postData);
    req.end();
  });
}

// Test 3: Test cookie with credentials
function testCookieWithCredentials() {
  return new Promise((resolve) => {
    console.log('📋 Test 3: Cookie with Credentials');
    console.log('----------------------------------');
    
    const options = {
      hostname: 'server.dhruvalexim.com',
      port: 443,
      path: '/api/v1/health',
      method: 'GET',
      headers: {
        'Origin': CLIENT_ORIGIN,
        'Cookie': 'refreshToken=test-refresh-token; sessionId=test-session',
        'User-Agent': 'Cookie-Debug-Script/1.0'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      console.log('CORS Headers:');
      Object.keys(res.headers).forEach(key => {
        if (key.toLowerCase().includes('access-control')) {
          console.log(`  ${key}: ${res.headers[key]}`);
        }
      });

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('✅ Cookie with credentials test completed\n');
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('❌ Cookie with credentials test failed:', error.message);
      console.log('');
      resolve();
    });

    req.end();
  });
}

// Run all tests
async function runTests() {
  try {
    await testCookieDebug();
    await testLoginCookies();
    await testCookieWithCredentials();
    
    console.log('🎉 All cookie tests completed!');
    console.log('');
    console.log('💡 Cookie Troubleshooting Tips:');
    console.log('- Check if cookies have correct Domain attribute (.dhruvalexim.com)');
    console.log('- Verify Secure=true for HTTPS');
    console.log('- Ensure SameSite=None for cross-origin requests');
    console.log('- Check browser developer tools Application > Cookies');
    console.log('- Verify CORS credentials are enabled');
    console.log('');
    console.log('📝 Next Steps:');
    console.log('1. Deploy server changes with updated cookie configuration');
    console.log('2. Test login flow in browser');
    console.log('3. Check browser cookies in DevTools');
    console.log('4. Monitor server logs for cookie-related issues');
    
  } catch (error) {
    console.error('❌ Cookie test suite failed:', error);
  }
}

// Run the tests
runTests();
