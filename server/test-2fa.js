const speakeasy = require('speakeasy');

// Test TOTP generation with the secret from the logs
const secret = 'JFGWYN2TKEVG6OKUIFOUY3RGN5YTO5SY';

console.log('Testing 2FA with secret:', secret);

// Generate current TOTP token
const token = speakeasy.totp({
  secret: secret,
  encoding: 'base32'
});

console.log('Current TOTP token:', token);

// Verify the token
const verified = speakeasy.totp.verify({
  secret: secret,
  encoding: 'base32',
  token: token,
  window: 2
});

console.log('Token verification:', verified);

// Generate a few tokens for testing
console.log('\nGenerated tokens for testing:');
for (let i = 0; i < 5; i++) {
  const testToken = speakeasy.totp({
    secret: secret,
    encoding: 'base32',
    time: Date.now() + (i * 30000) // 30 seconds apart
  });
  console.log(`Token ${i + 1}:`, testToken);
}
