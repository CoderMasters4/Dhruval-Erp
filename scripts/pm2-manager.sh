#!/bin/bash

# =============================================
# DHRUVAL EXIM ERP PM2 MANAGEMENT SCRIPT
# =============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SERVER_NAME="dhruval-erp-server"
CLIENT_NAME="dhruval-erp-client"
LOG_DIR="/var/log/dhruval-erp"

# Functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

success() {
    echo -e "${CYAN}[$(date +'%Y-%m-%d %H:%M:%S')] SUCCESS: $1${NC}"
}

# Help function
show_help() {
    echo -e "${PURPLE}Dhruval Exim ERP PM2 Management Script${NC}"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  start           Start both server and client"
    echo "  stop            Stop both server and client"
    echo "  restart         Restart both server and client"
    echo "  reload          Reload both server and client (zero downtime)"
    echo "  status          Show status of all processes"
    echo "  logs            Show logs for all processes"
    echo "  monitor         Open PM2 monitoring dashboard"
    echo "  deploy          Deploy to production"
    echo "  setup           Initial PM2 setup"
    echo "  cleanup         Clean up old logs and processes"
    echo "  health          Check health of all services"
    echo ""
    echo "Service-specific commands:"
    echo "  start-server    Start only server"
    echo "  start-client    Start only client"
    echo "  stop-server     Stop only server"
    echo "  stop-client     Stop only client"
    echo "  logs-server     Show server logs"
    echo "  logs-client     Show client logs"
    echo ""
    echo "Options:"
    echo "  --env           Environment (production, staging, development)"
    echo "  --follow        Follow logs in real-time"
    echo "  --lines         Number of log lines to show (default: 100)"
    echo ""
    echo "Examples:"
    echo "  $0 start --env production"
    echo "  $0 logs --follow"
    echo "  $0 deploy --env production"
}

# Check if PM2 is installed
check_pm2() {
    if ! command -v pm2 &> /dev/null; then
        error "PM2 is not installed. Installing PM2..."
        npm install -g pm2
        success "PM2 installed successfully"
    fi
}

# Setup PM2
setup_pm2() {
    log "Setting up PM2 for Dhruval Exim ERP..."
    
    check_pm2
    
    # Create log directory
    mkdir -p $LOG_DIR
    chown -R www-data:www-data $LOG_DIR
    
    # Install PM2 modules
    pm2 install pm2-logrotate
    pm2 set pm2-logrotate:max_size 10M
    pm2 set pm2-logrotate:retain 30
    pm2 set pm2-logrotate:compress true
    
    # Setup startup script
    pm2 startup
    
    success "PM2 setup completed"
}

# Start services
start_services() {
    local env=${1:-production}
    
    log "Starting Dhruval Exim ERP services in $env environment..."
    
    # Start server
    cd /www/wwwroot/Dhruval-Erp/server
    pm2 start ecosystem.config.js --env $env
    
    # Start client
    cd /www/wwwroot/Dhruval-Erp/client
    pm2 start ecosystem.config.js --env $env
    
    # Save PM2 configuration
    pm2 save
    
    success "All services started successfully"
}

# Stop services
stop_services() {
    log "Stopping Dhruval Exim ERP services..."
    
    pm2 stop $SERVER_NAME 2>/dev/null || warning "Server was not running"
    pm2 stop $CLIENT_NAME 2>/dev/null || warning "Client was not running"
    
    success "All services stopped"
}

# Restart services
restart_services() {
    local env=${1:-production}
    
    log "Restarting Dhruval Exim ERP services..."
    
    pm2 restart $SERVER_NAME --env $env
    pm2 restart $CLIENT_NAME --env $env
    
    success "All services restarted"
}

# Reload services (zero downtime)
reload_services() {
    local env=${1:-production}
    
    log "Reloading Dhruval Exim ERP services (zero downtime)..."
    
    pm2 reload $SERVER_NAME --env $env
    pm2 reload $CLIENT_NAME --env $env
    
    success "All services reloaded"
}

# Show status
show_status() {
    log "Dhruval Exim ERP Services Status:"
    pm2 status
    
    echo ""
    info "Detailed Information:"
    pm2 show $SERVER_NAME 2>/dev/null || warning "Server process not found"
    pm2 show $CLIENT_NAME 2>/dev/null || warning "Client process not found"
}

# Show logs
show_logs() {
    local follow=${1:-false}
    local lines=${2:-100}
    
    if [ "$follow" = "true" ]; then
        log "Following logs for all services (Ctrl+C to exit)..."
        pm2 logs --lines $lines
    else
        log "Showing last $lines lines of logs..."
        pm2 logs --lines $lines --nostream
    fi
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Check server health
    if curl -f http://localhost:4000/api/v1/health > /dev/null 2>&1; then
        success "Server is healthy (http://localhost:4000)"
    else
        error "Server health check failed"
    fi
    
    # Check client health
    if curl -f http://localhost:4001 > /dev/null 2>&1; then
        success "Client is healthy (http://localhost:4001)"
    else
        error "Client health check failed"
    fi
    
    # Check PM2 processes
    local server_status=$(pm2 jlist | jq -r ".[] | select(.name==\"$SERVER_NAME\") | .pm2_env.status" 2>/dev/null || echo "not found")
    local client_status=$(pm2 jlist | jq -r ".[] | select(.name==\"$CLIENT_NAME\") | .pm2_env.status" 2>/dev/null || echo "not found")
    
    info "Server PM2 Status: $server_status"
    info "Client PM2 Status: $client_status"
}

# Deploy to production
deploy_production() {
    log "Deploying Dhruval Exim ERP to production..."
    
    # Deploy server
    cd /www/wwwroot/Dhruval-Erp/server
    pm2 deploy ecosystem.config.js production
    
    # Deploy client
    cd /www/wwwroot/Dhruval-Erp/client
    pm2 deploy ecosystem.config.js production
    
    success "Production deployment completed"
}

# Cleanup
cleanup() {
    log "Cleaning up PM2 processes and logs..."
    
    # Clean up old processes
    pm2 delete all 2>/dev/null || warning "No processes to delete"
    
    # Clean up logs
    pm2 flush
    
    # Remove old log files
    find $LOG_DIR -name "*.log" -mtime +30 -delete 2>/dev/null || true
    
    success "Cleanup completed"
}

# Parse command line arguments
ENV="production"
FOLLOW=false
LINES=100

while [[ $# -gt 0 ]]; do
    case $1 in
        --env)
            ENV="$2"
            shift 2
            ;;
        --follow)
            FOLLOW=true
            shift
            ;;
        --lines)
            LINES="$2"
            shift 2
            ;;
        *)
            COMMAND="$1"
            shift
            ;;
    esac
done

# Main command handling
case ${COMMAND:-help} in
    start)
        start_services $ENV
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services $ENV
        ;;
    reload)
        reload_services $ENV
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs $FOLLOW $LINES
        ;;
    monitor)
        pm2 monit
        ;;
    deploy)
        deploy_production
        ;;
    setup)
        setup_pm2
        ;;
    cleanup)
        cleanup
        ;;
    health)
        health_check
        ;;
    start-server)
        cd /www/wwwroot/Dhruval-Erp/server && pm2 start ecosystem.config.js --env $ENV
        ;;
    start-client)
        cd /www/wwwroot/Dhruval-Erp/client && pm2 start ecosystem.config.js --env $ENV
        ;;
    stop-server)
        pm2 stop $SERVER_NAME
        ;;
    stop-client)
        pm2 stop $CLIENT_NAME
        ;;
    logs-server)
        pm2 logs $SERVER_NAME --lines $LINES
        ;;
    logs-client)
        pm2 logs $CLIENT_NAME --lines $LINES
        ;;
    help|*)
        show_help
        ;;
esac
