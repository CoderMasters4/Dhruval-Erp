# 🚀 Dhruval Exim ERP - Production Deployment Guide

## 🌐 Production Domains
- **Server API**: http://server.dhruvalexim.com
- **Client App**: http://erp.dhruvalexim.com

## 🔧 MongoDB Connection Fix Applied

### ✅ Issue Resolved
The `option sslvalidate is not supported` error has been fixed by updating the MongoDB connection configuration to use modern TLS options instead of deprecated SSL options.

**Changes Made:**
- Replaced `sslValidate: true` with `tlsAllowInvalidCertificates: false`
- Updated SSL certificate options to use TLS equivalents
- Compatible with MongoDB Atlas and modern MongoDB drivers

## 📋 Production Deployment Steps

### 🖥️ Server Deployment (server.dhruvalexim.com)

1. **Clone Repository**
   ```bash
   cd /www/wwwroot/
   git clone https://github.com/CoderMasters4/Dhruval-Erp.git
   cd Dhruval-Erp/server
   ```

2. **Setup Environment**
   ```bash
   # Copy production environment template
   cp .env.example .env.production
   
   # Edit with your actual production values
   nano .env.production
   ```

3. **Install Dependencies & Build**
   ```bash
   pnpm install --prod
   pnpm build
   ```

4. **Deploy with Script**
   ```bash
   chmod +x scripts/deploy-production.sh
   ./scripts/deploy-production.sh
   ```

### 🌐 Client Deployment (erp.dhruvalexim.com)

1. **Navigate to Client**
   ```bash
   cd /www/wwwroot/Dhruval-Erp/client
   ```

2. **Setup Environment**
   ```bash
   # Copy production environment template
   cp .env.example .env.production
   
   # Edit with production API URL
   nano .env.production
   ```

3. **Install Dependencies & Build**
   ```bash
   pnpm install --prod
   pnpm run build:prod
   ```

4. **Deploy with Script**
   ```bash
   chmod +x scripts/deploy-production.sh
   ./scripts/deploy-production.sh
   ```

## ⚙️ Environment Configuration

### 🔐 Server Environment (.env.production)
```bash
# Application
NODE_ENV=production
PORT=4000
HOST=0.0.0.0

# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/erp?retryWrites=true&w=majority

# Security
JWT_SECRET=your-ultra-secure-jwt-secret
SESSION_SECRET=your-ultra-secure-session-secret

# CORS
CORS_ORIGIN=http://erp.dhruvalexim.com
```

### 🌐 Client Environment (.env.production)
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://server.dhruvalexim.com/api/v1
NEXT_PUBLIC_SERVER_URL=http://server.dhruvalexim.com

# Application
NODE_ENV=production
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_DOMAIN=erp.dhruvalexim.com
```

## 🔄 Process Management

### PM2 Commands
```bash
# Check status
pm2 status

# View logs
pm2 logs dhruval-erp-server
pm2 logs dhruval-erp-client

# Restart services
pm2 restart dhruval-erp-server
pm2 restart dhruval-erp-client

# Monitor
pm2 monit

# Save configuration
pm2 save
pm2 startup
```

## 🏥 Health Checks

### Server Health Check
```bash
curl http://server.dhruvalexim.com/api/v1/health
```

### Client Health Check
```bash
curl http://erp.dhruvalexim.com/health
```

## 📊 Monitoring & Logs

### Log Locations
- **Server Logs**: `/var/log/dhruval-erp/`
- **Client Logs**: `/var/log/dhruval-erp/client-*.log`
- **Nginx Logs**: `/var/log/nginx/`

### Log Commands
```bash
# View server logs
tail -f /var/log/dhruval-erp/combined.log

# View client logs
tail -f /var/log/dhruval-erp/client-combined.log

# View Nginx access logs
tail -f /var/log/nginx/access.log
```

## 🔒 Security Checklist

- ✅ Environment files (.env.production) not committed to git
- ✅ Strong JWT and session secrets configured
- ✅ CORS properly configured for production domains
- ✅ MongoDB Atlas connection secured with TLS
- ✅ Nginx security headers enabled
- ✅ File upload restrictions in place
- ✅ Rate limiting configured

## 🚨 Troubleshooting

### MongoDB Connection Issues
If you see `option sslvalidate is not supported`:
1. ✅ **FIXED**: Updated to use modern TLS options
2. Ensure MongoDB Atlas connection string is correct
3. Check network connectivity to MongoDB Atlas

### Port Conflicts
- Server runs on port 4000
- Client runs on port 4001
- Nginx proxies port 80 to applications

### Permission Issues
```bash
# Fix file permissions
chown -R www-data:www-data /www/wwwroot/Dhruval-Erp
chmod -R 755 /www/wwwroot/Dhruval-Erp
```

## 📞 Support

For deployment issues:
1. Check logs: `pm2 logs`
2. Verify environment variables
3. Test health endpoints
4. Check Nginx configuration

## 🎉 Success Indicators

✅ Server responds at: http://server.dhruvalexim.com/api/v1/health
✅ Client loads at: http://erp.dhruvalexim.com
✅ PM2 shows both processes running
✅ MongoDB connection successful
✅ No errors in logs

---

**Deployment Status**: ✅ Ready for Production
**Last Updated**: 2025-08-06
**Version**: 2.0.0
