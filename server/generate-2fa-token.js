const speakeasy = require('speakeasy');

// This will generate a valid 2FA token for testing
// You need to get the secret from the database or logs

console.log('2FA Token Generator');
console.log('==================');

// Generate a few tokens with different secrets for testing
const testSecrets = [
  'JFGWYN2TKEVG6OKUIFOUY3RGN5YTO5SY', // From test file
  'KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD', // Common test secret
  'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ'  // Another test secret
];

testSecrets.forEach((secret, index) => {
  console.log(`\nSecret ${index + 1}: ${secret}`);
  
  // Generate current token
  const token = speakeasy.totp({
    secret: secret,
    encoding: 'base32'
  });
  
  console.log(`Current Token: ${token}`);
  
  // Generate next few tokens
  for (let i = 1; i <= 3; i++) {
    const futureToken = speakeasy.totp({
      secret: secret,
      encoding: 'base32',
      time: Date.now() + (i * 30000) // 30 seconds in future
    });
    console.log(`Token +${i*30}s: ${futureToken}`);
  }
});

console.log('\n=== Instructions ===');
console.log('1. Try any of the "Current Token" values in the 2FA field');
console.log('2. If that doesn\'t work, try the future tokens');
console.log('3. Tokens change every 30 seconds');
