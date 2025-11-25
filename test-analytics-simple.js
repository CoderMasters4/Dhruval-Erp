const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000/api/v1';

// Test function to check if server is running
async function testServerConnection() {
  try {
    console.log('🔍 Testing server connection...');
    const response = await axios.get(`${BASE_URL}/analytics/dashboard`, {
      timeout: 5000
    });
    console.log('✅ Server is running and responding');
    console.log('📊 Response status:', response.status);
    return true;
  } catch (error) {
    console.log('❌ Server connection failed:');
    if (error.code === 'ECONNREFUSED') {
      console.log('   - Server is not running on port 5000');
      console.log('   - Please start the server with: cd server && npm start');
    } else if (error.response) {
      console.log('   - Server responded with status:', error.response.status);
      console.log('   - Response:', error.response.data);
    } else {
      console.log('   - Error:', error.message);
    }
    return false;
  }
}

// Test function to check analytics endpoints
async function testAnalyticsEndpoints() {
  console.log('\n🚀 Testing Analytics Endpoints...\n');
  
  const endpoints = [
    {
      name: 'Dashboard Analytics',
      path: '/analytics/dashboard',
      params: { timeRange: '30d' }
    },
    {
      name: 'KPI Data',
      path: '/analytics/kpi',
      params: { timeRange: '30d' }
    },
    {
      name: 'Daily Reports',
      path: '/analytics/reports/daily',
      params: { includeDetails: true }
    },
    {
      name: 'Weekly Reports',
      path: '/analytics/reports/weekly',
      params: { includeDetails: true }
    },
    {
      name: 'Monthly Reports',
      path: '/analytics/reports/monthly',
      params: { includeDetails: true }
    },
    {
      name: 'Filter Options',
      path: '/analytics/filters',
      params: {}
    }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Testing ${endpoint.name}...`);
      const response = await axios.get(`${BASE_URL}${endpoint.path}`, {
        params: endpoint.params,
        timeout: 10000
      });
      
      console.log(`✅ ${endpoint.name}: Success (${response.status})`);
      
      if (response.data) {
        console.log(`   📊 Data structure:`, Object.keys(response.data));
        if (response.data.data) {
          console.log(`   📈 Data keys:`, Object.keys(response.data.data));
        }
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: Failed`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Message: ${error.response.data?.message || 'Unknown error'}`);
      } else {
        console.log(`   Error: ${error.message}`);
      }
    }
    console.log('');
  }
}

// Main function
async function main() {
  console.log('🧪 Analytics API Test Script');
  console.log('=' * 50);
  
  const isServerRunning = await testServerConnection();
  
  if (isServerRunning) {
    await testAnalyticsEndpoints();
  }
  
  console.log('\n📝 Next Steps:');
  console.log('1. Make sure you are logged into the application');
  console.log('2. Get your auth token from browser developer tools');
  console.log('3. Update the test-analytics-complete.js script with your token');
  console.log('4. Run: node test-analytics-complete.js');
}

// Run the test
main().catch(console.error);
