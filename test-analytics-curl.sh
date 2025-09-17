#!/bin/bash

# Analytics API Test Script using curl
BASE_URL="http://localhost:5000/api/v1"

echo "🧪 Analytics API Test Script"
echo "=============================="

# Test server connection
echo "🔍 Testing server connection..."
if curl -s --connect-timeout 5 "$BASE_URL/analytics/dashboard" > /dev/null 2>&1; then
    echo "✅ Server is running and responding"
else
    echo "❌ Server connection failed"
    echo "   Please make sure the server is running on port 5000"
    echo "   Start server with: cd server && npm start"
    exit 1
fi

echo ""
echo "🚀 Testing Analytics Endpoints..."
echo ""

# Test Dashboard Analytics
echo "🔍 Testing Dashboard Analytics..."
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/analytics/dashboard?timeRange=30d")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" -eq 200 ]; then
    echo "✅ Dashboard Analytics: Success ($http_code)"
    echo "📊 Response structure:"
    echo "$body" | jq -r 'keys[]' 2>/dev/null || echo "   (JSON parsing not available)"
else
    echo "❌ Dashboard Analytics: Failed ($http_code)"
    echo "   Response: $body"
fi

echo ""

# Test KPI Data
echo "🔍 Testing KPI Data..."
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/analytics/kpi?timeRange=30d")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" -eq 200 ]; then
    echo "✅ KPI Data: Success ($http_code)"
    echo "📊 Response structure:"
    echo "$body" | jq -r 'keys[]' 2>/dev/null || echo "   (JSON parsing not available)"
else
    echo "❌ KPI Data: Failed ($http_code)"
    echo "   Response: $body"
fi

echo ""

# Test Daily Reports
echo "🔍 Testing Daily Reports..."
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/analytics/reports/daily?includeDetails=true")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" -eq 200 ]; then
    echo "✅ Daily Reports: Success ($http_code)"
    echo "📊 Response structure:"
    echo "$body" | jq -r 'keys[]' 2>/dev/null || echo "   (JSON parsing not available)"
else
    echo "❌ Daily Reports: Failed ($http_code)"
    echo "   Response: $body"
fi

echo ""

# Test Weekly Reports
echo "🔍 Testing Weekly Reports..."
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/analytics/reports/weekly?includeDetails=true")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" -eq 200 ]; then
    echo "✅ Weekly Reports: Success ($http_code)"
    echo "📊 Response structure:"
    echo "$body" | jq -r 'keys[]' 2>/dev/null || echo "   (JSON parsing not available)"
else
    echo "❌ Weekly Reports: Failed ($http_code)"
    echo "   Response: $body"
fi

echo ""

# Test Monthly Reports
echo "🔍 Testing Monthly Reports..."
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/analytics/reports/monthly?includeDetails=true")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" -eq 200 ]; then
    echo "✅ Monthly Reports: Success ($http_code)"
    echo "📊 Response structure:"
    echo "$body" | jq -r 'keys[]' 2>/dev/null || echo "   (JSON parsing not available)"
else
    echo "❌ Monthly Reports: Failed ($http_code)"
    echo "   Response: $body"
fi

echo ""

# Test Filter Options
echo "🔍 Testing Filter Options..."
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/analytics/filters")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" -eq 200 ]; then
    echo "✅ Filter Options: Success ($http_code)"
    echo "📊 Response structure:"
    echo "$body" | jq -r 'keys[]' 2>/dev/null || echo "   (JSON parsing not available)"
else
    echo "❌ Filter Options: Failed ($http_code)"
    echo "   Response: $body"
fi

echo ""
echo "📝 Next Steps:"
echo "1. Make sure you are logged into the application at http://localhost:3000"
echo "2. Get your auth token from browser developer tools"
echo "3. Use the token to make authenticated requests"
echo "4. Check the server logs for detailed error information"
