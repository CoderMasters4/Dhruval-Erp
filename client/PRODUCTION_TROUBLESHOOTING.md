# 🚨 Production Issues & Solutions

## Current Issues

### 1. Manifest 404 Error
**Error**: `GET https://erp.dhruvalexim.com/manifest.json 404 (Not Found)`

**Cause**: Web server not serving static files correctly or manifest.json missing from build

**Solutions**:
1. **Verify Build Output**: Check if `manifest.json` exists in your production build
2. **Web Server Configuration**: Ensure your web server serves static files from the correct directory
3. **Headers**: Already configured in `next.config.ts` with proper Content-Type

### 2. API 400 Bad Request Errors
**Error**: All API calls returning 400 Bad Request

**Cause**: Missing required authentication headers:
- `Authorization: Bearer <token>` 
- `X-Company-ID: <company_id>`

**Solutions**:

#### A. Check Authentication State
```javascript
// In browser console, check if user is logged in:
console.log('Token:', localStorage.getItem('token'));
console.log('Redux State:', store.getState().auth);
```

#### B. Verify API Configuration
The API expects these headers:
```javascript
{
  'Authorization': 'Bearer <jwt_token>',
  'X-Company-ID': '<company_uuid>',
  'Content-Type': 'application/json'
}
```

#### C. Debug API Calls
Add this to your browser console to monitor API calls:
```javascript
// Monitor all fetch requests
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('API Call:', args[0], args[1]);
  return originalFetch.apply(this, args);
};
```

## Quick Fixes

### 1. Force Login
If users are not properly authenticated:
```javascript
// Clear storage and force re-login
localStorage.clear();
sessionStorage.clear();
window.location.href = '/login';
```

### 2. Manual API Test
Test API directly in browser console:
```javascript
fetch('https://server.dhruvalexim.com/api/v1/dashboard/stats', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN_HERE',
    'X-Company-ID': 'YOUR_COMPANY_ID_HERE',
    'Content-Type': 'application/json'
  }
}).then(r => r.json()).then(console.log);
```

### 3. Check CORS Configuration
Verify server allows requests from your domain:
```javascript
// Check if CORS headers are present
fetch('https://server.dhruvalexim.com/api/v1/dashboard/stats', {
  method: 'OPTIONS'
}).then(response => {
  console.log('CORS Headers:', response.headers);
});
```

## Server-Side Fixes Needed

### 1. CORS Configuration
Ensure your server allows requests from `https://erp.dhruvalexim.com`:
```javascript
// In your server CORS config
const corsOptions = {
  origin: [
    'https://erp.dhruvalexim.com',
    'http://localhost:3001' // for development
  ],
  credentials: true
};
```

### 2. API Endpoint Verification
Check if these endpoints exist and work:
- `GET /api/v1/dashboard/stats`
- `GET /api/v1/orders/stats`
- `GET /api/v1/inventory/stats`
- `GET /api/v1/inventory/alerts`

### 3. Authentication Middleware
Verify server authentication middleware accepts:
- Bearer tokens in Authorization header
- Company ID in X-Company-ID header

## Deployment Checklist

### ✅ Build & Deploy
- [x] `pnpm build` completes successfully
- [x] All TypeScript errors resolved
- [x] PWA service worker generated
- [ ] Static files deployed to web server
- [ ] Manifest.json accessible at `/manifest.json`

### ✅ Server Configuration
- [ ] CORS configured for production domain
- [ ] API endpoints responding correctly
- [ ] Authentication middleware working
- [ ] SSL certificates valid

### ✅ PWA Features
- [ ] Manifest.json loads without 404
- [ ] Service worker registers successfully
- [ ] Install prompt appears on mobile
- [ ] Offline functionality works
- [ ] Icons display correctly

## Testing Commands

### Local Testing
```bash
# Build and test locally
pnpm build
pnpm start

# Test PWA features
open http://localhost:3001/pwa-test.html
```

### Production Testing
```bash
# Test manifest
curl -I https://erp.dhruvalexim.com/manifest.json

# Test API (replace with actual token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "X-Company-ID: YOUR_COMPANY_ID" \
     https://server.dhruvalexim.com/api/v1/dashboard/stats
```

## Next Steps

1. **Fix Manifest 404**: Ensure static files are served correctly
2. **Debug Authentication**: Check why API calls lack proper headers
3. **Test PWA Installation**: Verify install prompts work on mobile
4. **Monitor Performance**: Check loading times and caching

## Contact Points

- **Frontend Issues**: Check browser console and network tab
- **API Issues**: Check server logs and authentication
- **PWA Issues**: Test on actual mobile devices
- **Performance**: Use Lighthouse audit
