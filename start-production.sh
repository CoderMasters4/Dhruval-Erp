#!/bin/bash

# =============================================
# DHRUVAL EXIM ERP PRODUCTION STARTUP SCRIPT
# =============================================

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
    exit 1
}

# Configuration
BASE_DIR="/www/wwwroot/Dhruval-Erp"
SERVER_DIR="$BASE_DIR/server"
CLIENT_DIR="$BASE_DIR/client"
LOG_DIR="/var/log/dhruval-erp"

log "🚀 Starting Dhruval Exim ERP Production Services..."

# Check if directories exist
if [ ! -d "$BASE_DIR" ]; then
    error "Base directory not found: $BASE_DIR"
fi

if [ ! -d "$SERVER_DIR" ]; then
    error "Server directory not found: $SERVER_DIR"
fi

if [ ! -d "$CLIENT_DIR" ]; then
    error "Client directory not found: $CLIENT_DIR"
fi

# Create log directory
log "📁 Creating log directory..."
mkdir -p $LOG_DIR
chown -R www-data:www-data $LOG_DIR 2>/dev/null || true

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    log "📦 Installing PM2..."
    npm install -g pm2
fi

# Stop existing processes
log "🛑 Stopping existing processes..."
pm2 stop dhruval-erp-server 2>/dev/null || warning "Server was not running"
pm2 stop dhruval-erp-client 2>/dev/null || warning "Client was not running"

# Start server
log "🖥️  Starting server..."
cd $SERVER_DIR

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    if [ -f ".env.production" ]; then
        log "📋 Copying .env.production to .env.local..."
        cp .env.production .env.local
    else
        error "No environment file found! Please create .env.local or .env.production"
    fi
fi

# Check if build exists
if [ ! -d "dist" ]; then
    log "🔨 Building server..."
    pnpm install --prod
    pnpm build
fi

# Start server with PM2
pm2 start ecosystem.config.js --env production

# Start client
log "🌐 Starting client..."
cd $CLIENT_DIR

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    if [ -f ".env.production" ]; then
        log "📋 Copying .env.production to .env.local..."
        cp .env.production .env.local
    else
        error "No environment file found! Please create .env.local or .env.production"
    fi
fi

# Check if build exists
if [ ! -d ".next" ]; then
    log "🔨 Building client..."
    pnpm install --prod
    pnpm run build
fi

# Start client with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
log "💾 Saving PM2 configuration..."
pm2 save

# Setup PM2 startup
log "🔄 Setting up PM2 startup..."
pm2 startup

# Show status
log "📊 Current status:"
pm2 status

# Health check
log "🏥 Performing health check..."
sleep 10

# Check server health
if curl -f http://localhost:4000/api/v1/health > /dev/null 2>&1; then
    log "✅ Server is healthy (http://localhost:4000)"
else
    warning "⚠️  Server health check failed"
fi

# Check client health
if curl -f http://localhost:4001 > /dev/null 2>&1; then
    log "✅ Client is healthy (http://localhost:4001)"
else
    warning "⚠️  Client health check failed"
fi

log "🎉 Dhruval Exim ERP started successfully!"
info "📍 Server: http://server.dhruvalexim.com (port 4000)"
info "📍 Client: http://erp.dhruvalexim.com (port 4001)"
info "📊 Monitor: pm2 monit"
info "📋 Logs: pm2 logs"
info "🔄 Status: pm2 status"

echo ""
echo "==================================="
echo "🎉 PRODUCTION SERVICES STARTED!"
echo "==================================="
echo "Server: http://localhost:4000"
echo "Client: http://localhost:4001"
echo "Monitor: pm2 monit"
echo "Logs: pm2 logs"
echo "==================================="
