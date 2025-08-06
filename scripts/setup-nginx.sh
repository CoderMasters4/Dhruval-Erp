#!/bin/bash

# =============================================
# DHRUVAL EXIM ERP NGINX SETUP SCRIPT
# =============================================

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
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

success() {
    echo -e "${PURPLE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

# Configuration
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"
PROJECT_DIR="/www/wwwroot/Dhruval-Erp"

log "🌐 Setting up Nginx for Dhruval Exim ERP..."

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   error "This script must be run as root (use sudo)"
fi

# Check if Nginx is installed
if ! command -v nginx &> /dev/null; then
    log "📦 Installing Nginx..."
    apt-get update
    apt-get install -y nginx
    systemctl enable nginx
    systemctl start nginx
fi

# Create backup of existing configs
log "💾 Creating backup of existing Nginx configs..."
mkdir -p /etc/nginx/backups/$(date +%Y%m%d-%H%M%S)
cp -r $NGINX_SITES_AVAILABLE/* /etc/nginx/backups/$(date +%Y%m%d-%H%M%S)/ 2>/dev/null || true

# Copy server configuration
log "🖥️  Setting up server.dhruvalexim.com configuration..."
if [ -f "$PROJECT_DIR/nginx-configs/server.dhruvalexim.com" ]; then
    cp "$PROJECT_DIR/nginx-configs/server.dhruvalexim.com" "$NGINX_SITES_AVAILABLE/"
    success "Server config copied successfully"
else
    error "Server config file not found: $PROJECT_DIR/nginx-configs/server.dhruvalexim.com"
fi

# Copy client configuration
log "🌐 Setting up erp.dhruvalexim.com configuration..."
if [ -f "$PROJECT_DIR/nginx-configs/erp.dhruvalexim.com" ]; then
    cp "$PROJECT_DIR/nginx-configs/erp.dhruvalexim.com" "$NGINX_SITES_AVAILABLE/"
    success "Client config copied successfully"
else
    error "Client config file not found: $PROJECT_DIR/nginx-configs/erp.dhruvalexim.com"
fi

# Enable sites
log "🔗 Enabling sites..."
ln -sf "$NGINX_SITES_AVAILABLE/server.dhruvalexim.com" "$NGINX_SITES_ENABLED/"
ln -sf "$NGINX_SITES_AVAILABLE/erp.dhruvalexim.com" "$NGINX_SITES_ENABLED/"

# Remove default site if exists
if [ -f "$NGINX_SITES_ENABLED/default" ]; then
    warning "Removing default Nginx site..."
    rm -f "$NGINX_SITES_ENABLED/default"
fi

# Test Nginx configuration
log "🧪 Testing Nginx configuration..."
if nginx -t; then
    success "Nginx configuration test passed"
else
    error "Nginx configuration test failed"
fi

# Create log directories
log "📁 Creating log directories..."
mkdir -p /var/log/nginx
touch /var/log/nginx/dhruval-erp-server.access.log
touch /var/log/nginx/dhruval-erp-server.error.log
touch /var/log/nginx/dhruval-erp-client.access.log
touch /var/log/nginx/dhruval-erp-client.error.log

# Set proper permissions
chown -R www-data:www-data /var/log/nginx/dhruval-erp-*

# Setup SSL certificates with Certbot (if not already done)
log "🔒 Setting up SSL certificates..."
if ! command -v certbot &> /dev/null; then
    log "📦 Installing Certbot..."
    apt-get install -y certbot python3-certbot-nginx
fi

# Check if certificates already exist
if [ ! -f "/etc/letsencrypt/live/server.dhruvalexim.com/fullchain.pem" ]; then
    warning "SSL certificate for server.dhruvalexim.com not found"
    info "Run: certbot --nginx -d server.dhruvalexim.com"
else
    success "SSL certificate for server.dhruvalexim.com exists"
fi

if [ ! -f "/etc/letsencrypt/live/erp.dhruvalexim.com/fullchain.pem" ]; then
    warning "SSL certificate for erp.dhruvalexim.com not found"
    info "Run: certbot --nginx -d erp.dhruvalexim.com -d www.erp.dhruvalexim.com"
else
    success "SSL certificate for erp.dhruvalexim.com exists"
fi

# Reload Nginx
log "🔄 Reloading Nginx..."
systemctl reload nginx

# Setup log rotation
log "📝 Setting up log rotation..."
cat > /etc/logrotate.d/dhruval-erp-nginx << EOF
/var/log/nginx/dhruval-erp-*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload nginx
    endscript
}
EOF

# Final status check
log "🏥 Checking Nginx status..."
if systemctl is-active --quiet nginx; then
    success "Nginx is running successfully"
else
    error "Nginx is not running"
fi

# Show configuration summary
log "📋 Configuration Summary:"
info "Server API: https://server.dhruvalexim.com"
info "Client App: https://erp.dhruvalexim.com"
info "Nginx Config: $NGINX_SITES_AVAILABLE/"
info "Nginx Logs: /var/log/nginx/dhruval-erp-*"

success "🎉 Nginx setup completed successfully!"

echo ""
echo "==================================="
echo "🌐 NGINX SETUP COMPLETE!"
echo "==================================="
echo "Server: https://server.dhruvalexim.com"
echo "Client: https://erp.dhruvalexim.com"
echo ""
echo "Next Steps:"
echo "1. Ensure DNS points to this server"
echo "2. Run SSL setup if needed:"
echo "   certbot --nginx -d server.dhruvalexim.com"
echo "   certbot --nginx -d erp.dhruvalexim.com"
echo "3. Start ERP services: ./start-production.sh"
echo "==================================="
