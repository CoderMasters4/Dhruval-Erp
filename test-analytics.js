const axios = require('axios');

async function testAnalytics() {
  try {
    console.log('Testing analytics API...');
    
    // Test the analytics dashboard endpoint
    const response = await axios.get('http://localhost:4000/api/v1/analytics/dashboard', {
      params: {
        timeRange: '30d'
      },
      headers: {
        'Authorization': 'Bearer your-test-token-here', // You'll need a valid token
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('Error testing analytics:', error.response?.data || error.message);
  }
}

testAnalytics();