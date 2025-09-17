const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000/api/v1';
const CLIENT_URL = 'http://localhost:3000';

// You'll need to replace these with actual credentials
const AUTH_TOKEN = 'your-auth-token-here';
const COMPANY_ID = 'your-company-id-here';

// Headers for API requests
const headers = {
  'Authorization': `Bearer ${AUTH_TOKEN}`,
  'Content-Type': 'application/json'
};

// Helper function to make API requests
async function makeRequest(endpoint, params = {}) {
  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      headers,
      params
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error.response?.data || error.message);
    return null;
  }
}

// Helper function to format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

// Helper function to format number
function formatNumber(num) {
  return new Intl.NumberFormat('en-IN').format(num || 0);
}

// Main function to fetch and display all analytics data
async function fetchAllAnalyticsData() {
  console.log('🚀 Fetching Complete Analytics Data...\n');
  console.log('=' * 80);
  
  // 1. Dashboard Analytics
  console.log('\n📊 DASHBOARD ANALYTICS');
  console.log('=' * 50);
  
  const dashboardData = await makeRequest('/analytics/dashboard', {
    timeRange: '30d',
    companyId: COMPANY_ID
  });
  
  if (dashboardData?.success && dashboardData.data) {
    const data = dashboardData.data;
    
    // KPI Data
    console.log('\n📈 KEY PERFORMANCE INDICATORS (KPIs):');
    console.log('-'.repeat(40));
    if (data.kpiData) {
      const kpi = data.kpiData;
      console.log(`💰 Total Revenue: ${formatCurrency(kpi.totalRevenue)}`);
      console.log(`📋 Total Orders: ${formatNumber(kpi.totalOrders)}`);
      console.log(`🏭 Production Orders: ${formatNumber(kpi.productionOrders)}`);
      console.log(`✅ Completed Production: ${formatNumber(kpi.completedProduction)}`);
      console.log(`📦 Total Inventory Items: ${formatNumber(kpi.totalInventory)}`);
      console.log(`👥 Total Employees: ${formatNumber(kpi.totalEmployees)}`);
      console.log(`👤 Total Customers: ${formatNumber(kpi.totalCustomers)}`);
      console.log(`🏢 Total Suppliers: ${formatNumber(kpi.totalSuppliers)}`);
      console.log(`🚶 Total Visitors: ${formatNumber(kpi.totalVisitors)}`);
    }
    
    // Revenue Data
    console.log('\n💵 REVENUE DATA:');
    console.log('-'.repeat(40));
    if (data.revenueData) {
      console.log(`💰 Total Revenue: ${formatCurrency(data.revenueData.total)}`);
      if (data.revenueData.breakdown && data.revenueData.breakdown.length > 0) {
        console.log('\n📅 Revenue Breakdown by Time:');
        data.revenueData.breakdown.forEach((item, index) => {
          console.log(`  ${index + 1}. ${item.time}: ${formatCurrency(item.revenue)} (${item.orders} orders)`);
        });
      }
    }
    
    // Department Data
    console.log('\n🏢 DEPARTMENT DATA:');
    console.log('-'.repeat(40));
    if (data.departmentData && data.departmentData.length > 0) {
      data.departmentData.forEach((dept, index) => {
        console.log(`  ${index + 1}. ${dept.department}: ${dept.count} employees`);
      });
    }
    
    // Resource Data
    console.log('\n⚙️ RESOURCE DATA:');
    console.log('-'.repeat(40));
    if (data.resourceData) {
      console.log(`👥 Total Employees: ${formatNumber(data.resourceData.totalEmployees)}`);
      console.log(`🏭 Active Production: ${formatNumber(data.resourceData.activeProduction)}`);
      console.log(`📦 Total Inventory: ${formatNumber(data.resourceData.totalInventory)}`);
    }
    
    // Inventory Distribution
    console.log('\n📦 INVENTORY DISTRIBUTION:');
    console.log('-'.repeat(40));
    if (data.inventoryDistribution && data.inventoryDistribution.length > 0) {
      data.inventoryDistribution.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.category}: ${formatCurrency(item.value)} (${item.percentage}%)`);
      });
    }
  } else {
    console.log('❌ No dashboard data available');
  }
  
  // 2. Daily Reports
  console.log('\n\n📅 DAILY REPORTS');
  console.log('=' * 50);
  
  const today = new Date().toISOString().split('T')[0];
  const dailyData = await makeRequest('/analytics/reports/daily', {
    date: today,
    companyId: COMPANY_ID,
    includeDetails: true
  });
  
  if (dailyData?.success && dailyData.data) {
    const data = dailyData.data;
    console.log(`📅 Date: ${data.date}`);
    
    if (data.summary) {
      const summary = data.summary;
      console.log('\n📊 Daily Summary:');
      console.log('-'.repeat(30));
      console.log(`📋 Total Orders: ${formatNumber(summary.totalOrders)}`);
      console.log(`💰 Total Revenue: ${formatCurrency(summary.totalRevenue)}`);
      console.log(`🏭 Production Orders: ${formatNumber(summary.productionOrders)}`);
      console.log(`✅ Completed Production: ${formatNumber(summary.completedProduction)}`);
      console.log(`🚶 Visitors: ${formatNumber(summary.visitors)}`);
      console.log(`💸 Total Expenses: ${formatCurrency(summary.totalExpenses)}`);
      console.log(`💵 Total Income: ${formatCurrency(summary.totalIncome)}`);
      console.log(`📦 Inventory Items: ${formatNumber(summary.inventoryItems)}`);
      console.log(`⚠️ Low Stock Items: ${formatNumber(summary.lowStockItems)}`);
    }
    
    if (data.data) {
      console.log('\n📋 Detailed Data:');
      console.log('-'.repeat(30));
      
      if (data.data.orders && data.data.orders.length > 0) {
        console.log('\n🛒 Orders:');
        data.data.orders.slice(0, 5).forEach((order, index) => {
          console.log(`  ${index + 1}. ${order.orderNumber} - ${order.customerName} - ${formatCurrency(order.totalAmount)} - ${order.status}`);
        });
        if (data.data.orders.length > 5) {
          console.log(`  ... and ${data.data.orders.length - 5} more orders`);
        }
      }
      
      if (data.data.production && data.data.production.length > 0) {
        console.log('\n🏭 Production Orders:');
        data.data.production.slice(0, 5).forEach((prod, index) => {
          console.log(`  ${index + 1}. ${prod.orderNumber} - ${prod.productName} - Qty: ${prod.quantity} - ${prod.status}`);
        });
        if (data.data.production.length > 5) {
          console.log(`  ... and ${data.data.production.length - 5} more production orders`);
        }
      }
      
      if (data.data.visitors && data.data.visitors.length > 0) {
        console.log('\n🚶 Visitors:');
        data.data.visitors.slice(0, 5).forEach((visitor, index) => {
          console.log(`  ${index + 1}. ${visitor.name} - ${visitor.purpose} - Meeting: ${visitor.personToMeet}`);
        });
        if (data.data.visitors.length > 5) {
          console.log(`  ... and ${data.data.visitors.length - 5} more visitors`);
        }
      }
    }
  } else {
    console.log('❌ No daily data available');
  }
  
  // 3. Weekly Reports
  console.log('\n\n📅 WEEKLY REPORTS');
  console.log('=' * 50);
  
  const weeklyData = await makeRequest('/analytics/reports/weekly', {
    companyId: COMPANY_ID,
    includeDetails: true
  });
  
  if (weeklyData?.success && weeklyData.data) {
    const data = weeklyData.data;
    console.log(`📅 Week: ${data.weekStart} to ${data.weekEnd}`);
    
    if (data.summary) {
      const summary = data.summary;
      console.log('\n📊 Weekly Summary:');
      console.log('-'.repeat(30));
      console.log(`📋 Total Orders: ${formatNumber(summary.totalOrders)}`);
      console.log(`💰 Total Revenue: ${formatCurrency(summary.totalRevenue)}`);
      console.log(`🏭 Production Orders: ${formatNumber(summary.productionOrders)}`);
      console.log(`✅ Completed Production: ${formatNumber(summary.completedProduction)}`);
      console.log(`🚶 Visitors: ${formatNumber(summary.visitors)}`);
      console.log(`💸 Total Expenses: ${formatCurrency(summary.totalExpenses)}`);
      console.log(`💵 Total Income: ${formatCurrency(summary.totalIncome)}`);
      console.log(`📦 Inventory Items: ${formatNumber(summary.inventoryItems)}`);
      console.log(`⚠️ Low Stock Items: ${formatNumber(summary.lowStockItems)}`);
    }
  } else {
    console.log('❌ No weekly data available');
  }
  
  // 4. Monthly Reports
  console.log('\n\n📅 MONTHLY REPORTS');
  console.log('=' * 50);
  
  const currentDate = new Date();
  const monthlyData = await makeRequest('/analytics/reports/monthly', {
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1,
    companyId: COMPANY_ID,
    includeDetails: true
  });
  
  if (monthlyData?.success && monthlyData.data) {
    const data = monthlyData.data;
    console.log(`📅 Month: ${data.year}-${String(data.month).padStart(2, '0')}`);
    
    if (data.summary) {
      const summary = data.summary;
      console.log('\n📊 Monthly Summary:');
      console.log('-'.repeat(30));
      console.log(`📋 Total Orders: ${formatNumber(summary.totalOrders)}`);
      console.log(`💰 Total Revenue: ${formatCurrency(summary.totalRevenue)}`);
      console.log(`🏭 Production Orders: ${formatNumber(summary.productionOrders)}`);
      console.log(`✅ Completed Production: ${formatNumber(summary.completedProduction)}`);
      console.log(`🚶 Visitors: ${formatNumber(summary.visitors)}`);
      console.log(`💸 Total Expenses: ${formatCurrency(summary.totalExpenses)}`);
      console.log(`💵 Total Income: ${formatCurrency(summary.totalIncome)}`);
      console.log(`📦 Inventory Items: ${formatNumber(summary.inventoryItems)}`);
      console.log(`⚠️ Low Stock Items: ${formatNumber(summary.lowStockItems)}`);
    }
  } else {
    console.log('❌ No monthly data available');
  }
  
  // 5. Custom Reports
  console.log('\n\n🔍 CUSTOM REPORTS');
  console.log('=' * 50);
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  const endDate = new Date();
  
  const customData = await makeRequest('/analytics/reports/custom', {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    companyId: COMPANY_ID,
    groupBy: 'date',
    sortBy: 'revenue',
    sortOrder: 'desc',
    page: 1,
    limit: 10
  });
  
  if (customData?.success && customData.data) {
    const data = customData.data;
    console.log(`📅 Custom Report Period: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
    
    if (data.summary) {
      const summary = data.summary;
      console.log('\n📊 Custom Report Summary:');
      console.log('-'.repeat(30));
      console.log(`📋 Total Orders: ${formatNumber(summary.totalOrders)}`);
      console.log(`💰 Total Revenue: ${formatCurrency(summary.totalRevenue)}`);
      console.log(`🏭 Production Orders: ${formatNumber(summary.productionOrders)}`);
      console.log(`✅ Completed Production: ${formatNumber(summary.completedProduction)}`);
      console.log(`🚶 Visitors: ${formatNumber(summary.visitors)}`);
      console.log(`💸 Total Expenses: ${formatCurrency(summary.totalExpenses)}`);
      console.log(`💵 Total Income: ${formatCurrency(summary.totalIncome)}`);
      console.log(`📦 Inventory Items: ${formatNumber(summary.inventoryItems)}`);
      console.log(`⚠️ Low Stock Items: ${formatNumber(summary.lowStockItems)}`);
    }
    
    if (data.data && data.data.length > 0) {
      console.log('\n📋 Custom Report Data (Top 10):');
      console.log('-'.repeat(30));
      data.data.forEach((item, index) => {
        console.log(`  ${index + 1}. [${item.type.toUpperCase()}] ${item.orderNumber || item.id} - ${formatCurrency(item.totalAmount || 0)} - ${item.status || 'N/A'}`);
      });
      
      if (data.total > 10) {
        console.log(`  ... and ${data.total - 10} more items`);
      }
    }
    
    console.log(`\n📊 Pagination: Page ${data.page} of ${data.totalPages} (${data.total} total items)`);
  } else {
    console.log('❌ No custom data available');
  }
  
  // 6. Filter Options
  console.log('\n\n🔧 FILTER OPTIONS');
  console.log('=' * 50);
  
  const filterOptions = await makeRequest('/analytics/filters', {
    companyId: COMPANY_ID
  });
  
  if (filterOptions?.success && filterOptions.data) {
    const data = filterOptions.data;
    
    if (data.departments && data.departments.length > 0) {
      console.log('\n🏢 Available Departments:');
      data.departments.forEach((dept, index) => {
        console.log(`  ${index + 1}. ${dept.label} (${dept.value})`);
      });
    }
    
    if (data.products && data.products.length > 0) {
      console.log('\n📦 Available Products:');
      data.products.slice(0, 10).forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.label} (${product.value})`);
      });
      if (data.products.length > 10) {
        console.log(`  ... and ${data.products.length - 10} more products`);
      }
    }
    
    if (data.statuses && data.statuses.length > 0) {
      console.log('\n📊 Available Statuses:');
      data.statuses.forEach((status, index) => {
        console.log(`  ${index + 1}. ${status.label} (${status.value})`);
      });
    }
    
    if (data.metrics && data.metrics.length > 0) {
      console.log('\n📈 Available Metrics:');
      data.metrics.forEach((metric, index) => {
        console.log(`  ${index + 1}. ${metric.label} (${metric.value})`);
      });
    }
  } else {
    console.log('❌ No filter options available');
  }
  
  // 7. Real-time Analytics
  console.log('\n\n⚡ REAL-TIME ANALYTICS');
  console.log('=' * 50);
  
  const realTimeData = await makeRequest('/analytics/realtime', {
    companyId: COMPANY_ID,
    refreshInterval: 30
  });
  
  if (realTimeData?.success && realTimeData.data) {
    const data = realTimeData.data;
    console.log(`🕐 Timestamp: ${data.timestamp}`);
    
    if (data.metrics) {
      console.log('\n📊 Real-time Metrics (Last 30 minutes):');
      console.log('-'.repeat(40));
      console.log(`📋 Orders: ${formatNumber(data.metrics.orders)}`);
      console.log(`🏭 Production: ${formatNumber(data.metrics.production)}`);
      console.log(`🚶 Visitors: ${formatNumber(data.metrics.visitors)}`);
    }
  } else {
    console.log('❌ No real-time data available');
  }
  
  console.log('\n\n✅ Analytics data fetch completed!');
  console.log('=' * 80);
}

// Run the analytics data fetch
if (require.main === module) {
  console.log('🔧 Note: Please update AUTH_TOKEN and COMPANY_ID in the script before running');
  console.log('📝 You can get these from your browser\'s developer tools when logged into the app');
  console.log('🌐 Open http://localhost:3000/analytics/advanced in your browser');
  console.log('🔍 Check Network tab for API calls to get the required tokens\n');
  
  fetchAllAnalyticsData().catch(console.error);
}

module.exports = { fetchAllAnalyticsData };
