#!/bin/bash

# =============================================
# DHRUVAL EXIM ERP PRODUCTION STOP SCRIPT
# =============================================

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

log "🛑 Stopping Dhruval Exim ERP Production Services..."

# Stop server
log "🖥️  Stopping server..."
pm2 stop dhruval-erp-server 2>/dev/null || warning "Server was not running"

# Stop client
log "🌐 Stopping client..."
pm2 stop dhruval-erp-client 2>/dev/null || warning "Client was not running"

# Show status
log "📊 Current status:"
pm2 status

log "✅ All services stopped successfully!"

echo ""
echo "==================================="
echo "🛑 PRODUCTION SERVICES STOPPED!"
echo "==================================="
echo "To start again: ./start-production.sh"
echo "To check status: pm2 status"
echo "==================================="
