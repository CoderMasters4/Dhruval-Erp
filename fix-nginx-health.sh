#!/bin/bash

# =============================================
# QUICK FIX FOR NGINX HEALTH ENDPOINT
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

log "🔧 Fixing Nginx health endpoint for server.dhruvalexim.com..."

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   error "This script must be run as root (use sudo)"
fi

# Backup current config
log "💾 Creating backup..."
cp /etc/nginx/sites-available/server.dhruvalexim.com /etc/nginx/sites-available/server.dhruvalexim.com.backup.$(date +%Y%m%d-%H%M%S)

# Copy fixed config
log "📋 Copying fixed configuration..."
if [ -f "/www/wwwroot/Dhruval-Erp/nginx-configs/server.dhruvalexim.com" ]; then
    cp /www/wwwroot/Dhruval-Erp/nginx-configs/server.dhruvalexim.com /etc/nginx/sites-available/
    info "Fixed config copied successfully"
else
    error "Fixed config file not found!"
fi

# Test Nginx configuration
log "🧪 Testing Nginx configuration..."
if nginx -t; then
    info "Nginx configuration test passed"
else
    error "Nginx configuration test failed"
fi

# Reload Nginx
log "🔄 Reloading Nginx..."
systemctl reload nginx

# Test the health endpoint
log "🏥 Testing health endpoint..."
sleep 2

# Test local server
if curl -f http://localhost:4000/health > /dev/null 2>&1; then
    info "✅ Local server health check passed"
else
    warning "⚠️  Local server health check failed"
fi

# Test through Nginx
if curl -f http://server.dhruvalexim.com/health > /dev/null 2>&1; then
    info "✅ Nginx proxy health check passed"
else
    warning "⚠️  Nginx proxy health check failed - check DNS and server status"
fi

log "🎉 Nginx health endpoint fix completed!"

echo ""
echo "==================================="
echo "🔧 NGINX HEALTH ENDPOINT FIXED!"
echo "==================================="
echo "Test URLs:"
echo "- Local: http://localhost:4000/health"
echo "- Nginx: http://server.dhruvalexim.com/health"
echo "- HTTPS: https://server.dhruvalexim.com/health (after SSL setup)"
echo ""
echo "Next steps:"
echo "1. Setup SSL: certbot --nginx -d server.dhruvalexim.com"
echo "2. Test HTTPS: https://server.dhruvalexim.com/health"
echo "==================================="
