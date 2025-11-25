const axios = require('axios');

async function testAnalyticsAPI() {
  try {
    console.log('Testing Analytics API...');
    
    // Test the analytics dashboard endpoint
    const response = await axios.get('http://localhost:5000/api/v1/analytics/dashboard', {
      headers: {
        'Authorization': 'Bearer your-token-here', // You'll need to replace this with a valid token
        'Content-Type': 'application/json'
      },
      params: {
        timeRange: '30d',
        companyId: 'your-company-id' // You'll need to replace this with a valid company ID
      }
    });

    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('Error testing analytics API:', error.response?.data || error.message);
  }
}

// Run the test
testAnalyticsAPI();
