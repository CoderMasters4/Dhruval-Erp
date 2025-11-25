const axios = require('axios');

async function testCompanyCreation() {
  try {
    // First, login to get a fresh token
    console.log('Logging in...');
    const loginResponse = await axios.post('http://localhost:4000/api/v1/auth/login', {
      username: 'superadmin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('Login successful, token received');
    
    // Now test company creation
    console.log('Testing company creation...');
    const testData = {
      companyCode: "COMP005",
      companyName: "Testing"
    };
    
    const response = await axios.post('http://localhost:4000/api/v1/companies', testData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Success! Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error occurred:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

testCompanyCreation();

