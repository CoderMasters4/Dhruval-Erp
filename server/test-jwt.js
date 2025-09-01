const jwt = require('jsonwebtoken');
const path = require('path');

// Load environment variables from .env.local for testing
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

// Test JWT configuration
console.log('Testing JWT Configuration...');
console.log('Environment:', process.env.NODE_ENV);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET ? 'SET' : 'NOT SET');
console.log('JWT_ISSUER:', process.env.JWT_ISSUER);
console.log('JWT_AUDIENCE:', process.env.JWT_AUDIENCE);

// Test token generation
const testPayload = {
  userId: 'test-user-id',
  username: 'testuser',
  email: 'test@example.com',
  isSuperAdmin: false,
  companyId: 'test-company-id',
  role: 'user'
};

try {
  // Generate access token
  const accessToken = jwt.sign(testPayload, process.env.JWT_SECRET, {
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE,
    expiresIn: '15d'
  });
  
  console.log('✅ Access token generated successfully');
  console.log('Token length:', accessToken.length);
  
  // Generate refresh token
  const refreshPayload = {
    userId: testPayload.userId,
    tokenVersion: 1
  };
  
  const refreshToken = jwt.sign(refreshPayload, process.env.JWT_REFRESH_SECRET, {
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE,
    expiresIn: '30d'
  });
  
  console.log('✅ Refresh token generated successfully');
  console.log('Token length:', refreshToken.length);
  
  // Verify access token
  const decodedAccess = jwt.verify(accessToken, process.env.JWT_SECRET, {
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE
  });
  
  console.log('✅ Access token verified successfully');
  console.log('Decoded payload:', decodedAccess);
  
  // Verify refresh token
  const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, {
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE
  });
  
  console.log('✅ Refresh token verified successfully');
  console.log('Decoded payload:', decodedRefresh);
  
  console.log('\n🎉 All JWT tests passed!');
  
} catch (error) {
  console.error('❌ JWT test failed:', error.message);
  process.exit(1);
}
