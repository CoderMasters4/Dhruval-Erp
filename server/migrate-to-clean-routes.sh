#!/bin/bash

# Migration Script: Clean Routes Structure
# This script helps migrate from the old scattered routes to the new clean structure

echo "🚀 Starting migration to clean routes structure..."

# Check if we're in the right directory
if [ ! -f "src/server.ts" ]; then
    echo "❌ Error: Please run this script from the server directory"
    exit 1
fi

# Backup the old server file
echo "📋 Creating backup of old server.ts..."
cp src/server.ts src/server-backup-$(date +%Y%m%d-%H%M%S).ts
echo "✅ Backup created"

# Replace with clean server file
echo "🔄 Replacing server.ts with clean version..."
if [ -f "src/server-clean.ts" ]; then
    cp src/server-clean.ts src/server.ts
    echo "✅ Server file replaced successfully"
else
    echo "❌ Error: server-clean.ts not found"
    exit 1
fi

# Check if routes/index.ts exists
if [ ! -f "src/routes/index.ts" ]; then
    echo "❌ Error: src/routes/index.ts not found. Please create it first."
    exit 1
fi

echo "✅ Migration completed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Test the server: npm run dev"
echo "2. Check all endpoints are working"
echo "3. Remove old backup files when satisfied"
echo ""
echo "🔄 To rollback:"
echo "   cp src/server-backup-*.ts src/server.ts"
echo ""
echo "📚 Documentation: CLEAN_ROUTES_README.md"
