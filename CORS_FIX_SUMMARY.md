# CORS Error Fix for Production Deployment

## Problem Identified
The application was experiencing CORS (Cross-Origin Resource Sharing) errors in production, preventing the client from communicating with the server API.

## Root Cause Analysis

### 1. **Configuration Mismatch**
- **Client Domain**: `https://erp.dhruvalexim.com` (where the React app is hosted)
- **Server Domain**: `https://server.dhruvalexim.com` (where the API is hosted)
- **Issue**: Server CORS was only allowing the client domain, but missing proper headers and preflight handling

### 2. **Missing CORS Headers**
- Insufficient allowed headers in CORS configuration
- Missing proper preflight OPTIONS handling
- Inadequate exposed headers for client consumption

### 3. **Cookie Configuration Issues**
- **COOKIE_SECURE=false** in production (should be `true` for HTTPS)
- **COOKIE_SAME_SITE=lax** preventing cross-origin cookie sharing
- Missing proper cookie domain configuration for cross-domain authentication

### 4. **Environment-Specific Issues**
- Production CORS configuration was too restrictive
- Missing development vs production CORS handling
- Cookie settings not optimized for cross-domain production deployment

## Fixes Applied

### 1. **Updated Server CORS Configuration**

#### File: `server/.env.production`
```env
# CORS Configuration (Production) - UPDATED
CORS_ORIGIN=https://erp.dhruvalexim.com,https://www.erp.dhruvalexim.com,http://erp.dhruvalexim.com,http://www.erp.dhruvalexim.com
CORS_CREDENTIALS=true
CORS_METHODS=GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With,X-Company-ID,X-API-Key,X-Request-ID,X-User-Agent,X-Forwarded-For,Origin,Accept
```

**Changes Made:**
- Added multiple origin variations (www, http, https)
- Enhanced allowed headers list
- Ensured credentials are enabled

### 2. **Enhanced CORS Middleware**

#### File: `server/src/middleware/security.ts`
```typescript
export const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // In development, be more permissive
    if (config.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    if (config.CORS_ORIGIN.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked request', { 
        origin, 
        allowedOrigins: config.CORS_ORIGIN,
        nodeEnv: config.NODE_ENV 
      });
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: config.CORS_CREDENTIALS,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Company-ID',
    'X-API-Key',
    'X-Request-ID',
    'X-User-Agent',
    'X-Forwarded-For',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Current-Page',
    'X-Per-Page',
    'X-Rate-Limit-Remaining',
    'X-Rate-Limit-Reset'
  ],
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};
```

**Improvements:**
- Added development environment bypass
- Enhanced logging for debugging
- Added more allowed headers
- Set proper OPTIONS success status

### 3. **Added Global OPTIONS Handler**

#### File: `server/src/server.ts`
```typescript
// Handle preflight OPTIONS requests for all routes
app.options('*', (req: Request, res: Response) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,X-Company-ID,X-API-Key,X-Request-ID,X-User-Agent,X-Forwarded-For,Origin,Accept,Cache-Control,Pragma');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  res.status(200).end();
});
```

**Benefits:**
- Handles all preflight requests globally
- Ensures consistent CORS headers
- Provides fallback for any missed routes

### 4. **Added Health Check Endpoint**

#### File: `server/src/server.ts`
```typescript
// Health check endpoint (public)
apiRouter.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    version: config.APP_VERSION
  });
});
```

**Purpose:**
- Provides a simple endpoint for CORS testing
- Used by the offline page for connectivity checks
- Helps with debugging and monitoring

### 6. **Fixed Cookie Configuration**

#### File: `server/.env.production`
```env
# Cookie Configuration (Production) - UPDATED
COOKIE_SECURE=true          # Changed from false - Required for HTTPS
COOKIE_SAME_SITE=none       # Changed from lax - Required for cross-origin
```

#### Files: `server/src/routes/auth.ts` & `server/src/server.ts`
```typescript
// Enhanced cookie settings for cross-domain authentication
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: config.COOKIE_SECURE,
  sameSite: config.COOKIE_SAME_SITE as 'strict' | 'lax' | 'none',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  domain: config.NODE_ENV === 'production' ? config.COOKIE_DOMAIN : undefined,
  path: '/'  // Added explicit path
});
```

**Cookie Improvements:**
- **Secure=true**: Ensures cookies only sent over HTTPS
- **SameSite=none**: Allows cross-origin cookie sharing
- **Domain=.dhruvalexim.com**: Enables cookie sharing across subdomains
- **Path=/**: Ensures cookies available for all routes

### 7. **Added Cookie Debug Endpoint**

#### File: `server/src/server.ts`
```typescript
// Cookie debug endpoint for troubleshooting
apiRouter.get('/debug/cookies', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Cookie debug info',
    cookies: {
      received: req.cookies,
      headers: req.headers.cookie,
      origin: req.headers.origin
    },
    config: {
      cookieDomain: config.COOKIE_DOMAIN,
      cookieSecure: config.COOKIE_SECURE,
      cookieSameSite: config.COOKIE_SAME_SITE
    }
  });
});
```

### 5. **Client Configuration Verification**

#### File: `client/.env.production`
```env
# API Configuration - Production Server
NEXT_PUBLIC_API_URL=https://server.dhruvalexim.com/api/v1
NEXT_PUBLIC_SERVER_URL=https://server.dhruvalexim.com
```

**Confirmed:**
- Client is correctly configured to use the server domain
- API URL points to the correct server endpoint

## Testing and Verification

### 1. **CORS Debug Script**
Created `server/cors-debug.js` for testing CORS configuration:
- Tests health endpoint accessibility
- Verifies preflight OPTIONS requests
- Checks POST requests with credentials

### 2. **Manual Testing Steps**
1. **Browser Developer Tools**:
   - Check Network tab for CORS errors
   - Verify preflight OPTIONS requests
   - Confirm response headers

2. **Server Logs**:
   - Monitor for CORS-related warnings
   - Check origin validation logs

3. **API Testing**:
   - Test health endpoint: `GET https://server.dhruvalexim.com/api/v1/health`
   - Test with different origins
   - Verify credentials are included

## Deployment Steps

### 1. **Server Deployment**
```bash
# 1. Update server code
cd /www/wwwroot/Dhruval-Erp/server
git pull origin main

# 2. Rebuild TypeScript
npm run build

# 3. Restart server with production environment
pm2 restart dhruval-erp-server --env production
```

### 2. **Client Deployment**
```bash
# 1. Update client code
cd /www/wwwroot/Dhruval-Erp/client
git pull origin main

# 2. Rebuild with production environment
npm run build

# 3. Restart client
pm2 restart dhruval-erp-client --env production
```

### 3. **Verification**
```bash
# Test CORS configuration
node /www/wwwroot/Dhruval-Erp/server/cors-debug.js

# Check server logs
pm2 logs dhruval-erp-server

# Check client logs
pm2 logs dhruval-erp-client
```

## Additional Recommendations

### 1. **Monitoring**
- Set up CORS error monitoring in production
- Add alerts for blocked origins
- Monitor preflight request success rates

### 2. **Security**
- Regularly review allowed origins
- Implement origin validation logging
- Consider implementing CORS policy versioning

### 3. **Performance**
- Set appropriate CORS cache duration
- Optimize preflight request handling
- Consider CDN CORS configuration

## Troubleshooting Guide

### Common Issues:
1. **Still getting CORS errors**: Check browser cache, try incognito mode
2. **Preflight failures**: Verify OPTIONS handler is working
3. **Credentials not included**: Ensure `credentials: 'include'` in client
4. **Wrong origin**: Check exact domain spelling and protocol

### Debug Commands:
```bash
# Check server CORS configuration
curl -H "Origin: https://erp.dhruvalexim.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://server.dhruvalexim.com/api/v1/health

# Test health endpoint
curl -H "Origin: https://erp.dhruvalexim.com" \
     https://server.dhruvalexim.com/api/v1/health
```

## Status
✅ **CORS Configuration Updated**
✅ **Preflight Handler Added**
✅ **Health Endpoint Created**
✅ **Debug Tools Provided**
🔄 **Ready for Production Deployment**

The CORS issues should be resolved after deploying these changes and restarting both server and client applications.
