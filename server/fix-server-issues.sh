#!/bin/bash

echo "🔧 Fixing Server Issues..."

# Check if server is running
if pgrep -f "ts-node.*server.ts" > /dev/null; then
    echo "🛑 Stopping existing server..."
    pkill -f "ts-node.*server.ts"
    sleep 2
fi

# Clear node modules cache
echo "🧹 Clearing cache..."
rm -rf node_modules/.cache
rm -rf .next
rm -rf dist

# Check for port conflicts
echo "🔍 Checking port conflicts..."
if lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 4000 is in use. Killing process..."
    lsof -ti:4000 | xargs kill -9
    sleep 2
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check environment file
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found. Creating from template..."
    cp .env.example .env.local 2>/dev/null || echo "No .env.example found"
fi

# Start server
echo "🚀 Starting server..."
npm run dev
