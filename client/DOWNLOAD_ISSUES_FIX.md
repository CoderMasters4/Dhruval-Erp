# 🔧 Download Issues in Production - Diagnosis & Fixes

## 🚨 Common Download Issues in Production

### 1. **Blob Downloads Not Working**
**Symptoms**: CSV exports, backup codes, chart data downloads fail
**Affected Components**:
- Chart data exports (`ChartContainer.tsx`)
- 2FA backup codes (`TwoFactorSetup.tsx`, `TwoFactorToggle.tsx`)
- Report exports (`supplier-wise-purchase/page.tsx`)

### 2. **API Download URLs Not Opening**
**Symptoms**: `window.open()` calls fail or are blocked
**Affected Components**:
- Purchase exports (`purchase/page.tsx`)
- Sales exports (`sales/page.tsx`)
- Analytics reports (`operations/analytics/page.tsx`)

### 3. **Service Worker Interference**
**Symptoms**: Downloads intercepted by service worker
**Cause**: PWA service worker caching download requests

## 🛠️ Solutions

### Fix 1: Enhanced Blob Download Function
Create a robust download utility that works across all browsers and PWA contexts.

```javascript
// utils/downloadUtils.ts
export const downloadBlob = (blob: Blob, filename: string) => {
  try {
    // Method 1: Try modern approach first
    if (navigator.msSaveBlob) {
      // IE/Edge
      navigator.msSaveBlob(blob, filename);
      return;
    }

    // Method 2: Standard approach
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Ensure link is not visible
    link.style.display = 'none';
    
    // Add to DOM, click, and remove
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
    
  } catch (error) {
    console.error('Download failed:', error);
    // Fallback: Open in new tab
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
  }
};

export const downloadFromUrl = (url: string, filename?: string) => {
  try {
    // Method 1: Try direct download
    const link = document.createElement('a');
    link.href = url;
    if (filename) link.download = filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
  } catch (error) {
    console.error('URL download failed:', error);
    // Fallback: Open in new window
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};
```

### Fix 2: Service Worker Download Bypass
Update service worker to not intercept download requests.

```javascript
// In sw.js - add this to the fetch event handler
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Don't intercept download requests
  if (
    event.request.headers.get('accept')?.includes('application/octet-stream') ||
    event.request.headers.get('content-disposition')?.includes('attachment') ||
    url.pathname.includes('/download') ||
    url.pathname.includes('/export') ||
    url.searchParams.has('download')
  ) {
    // Let download requests pass through
    return;
  }
  
  // Handle other requests normally...
});
```

### Fix 3: Content Security Policy (CSP) Fix
Ensure CSP allows blob downloads and data URLs.

```html
<!-- Add to your HTML head or server headers -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               blob: data: 'unsafe-inline'; 
               connect-src 'self' https://server.dhruvalexim.com;">
```

### Fix 4: HTTPS and CORS Headers
Ensure server sends proper headers for downloads.

```javascript
// Server-side headers for download endpoints
res.setHeader('Content-Disposition', 'attachment; filename="export.csv"');
res.setHeader('Content-Type', 'application/octet-stream');
res.setHeader('Access-Control-Allow-Origin', 'https://erp.dhruvalexim.com');
res.setHeader('Access-Control-Allow-Headers', 'Content-Disposition');
```

## 🧪 Testing Downloads in Production

### Test Script for Browser Console
```javascript
// Test blob downloads
function testBlobDownload() {
  const testData = 'Name,Email,Phone\nJohn Doe,john@example.com,123-456-7890';
  const blob = new Blob([testData], { type: 'text/csv' });
  
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'test-download.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
  
  console.log('Blob download test completed');
}

// Test API downloads
async function testAPIDownload() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('https://server.dhruvalexim.com/api/v1/purchase/export', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ format: 'csv' })
    });
    
    const result = await response.json();
    if (result.data?.downloadUrl) {
      window.open(result.data.downloadUrl, '_blank');
      console.log('API download test completed');
    }
  } catch (error) {
    console.error('API download test failed:', error);
  }
}

// Run tests
testBlobDownload();
testAPIDownload();
```

## 🔍 Debug Download Issues

### Check Browser Compatibility
```javascript
// Check download support
const downloadSupport = {
  blob: typeof Blob !== 'undefined',
  url: typeof URL !== 'undefined' && typeof URL.createObjectURL !== 'undefined',
  download: 'download' in document.createElement('a'),
  msSaveBlob: typeof navigator.msSaveBlob !== 'undefined'
};

console.log('Download Support:', downloadSupport);
```

### Monitor Download Attempts
```javascript
// Add to your app to monitor downloads
const originalCreateObjectURL = URL.createObjectURL;
URL.createObjectURL = function(blob) {
  console.log('Creating object URL for blob:', blob);
  return originalCreateObjectURL.call(this, blob);
};

// Monitor link clicks
document.addEventListener('click', (e) => {
  if (e.target.tagName === 'A' && e.target.download) {
    console.log('Download link clicked:', e.target.href, e.target.download);
  }
});
```

## 🚀 Quick Fixes to Implement

### 1. Update Chart Downloads
Replace the current download function in `ChartContainer.tsx`:

```typescript
const handleDownload = () => {
  if (data && data.length > 0) {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `${title.toLowerCase().replace(/\s+/g, '_')}_data.csv`);
  }
  
  actions?.onDownload?.();
};
```

### 2. Update API Downloads
Replace `window.open()` calls with proper download handling:

```typescript
// Instead of: window.open(result.data.downloadUrl, '_blank')
// Use:
downloadFromUrl(result.data.downloadUrl, 'export.csv');
```

### 3. Add Download Fallbacks
For critical downloads, provide multiple options:

```typescript
const downloadWithFallback = async (url: string, filename: string) => {
  try {
    // Try direct download
    downloadFromUrl(url, filename);
  } catch (error) {
    // Fallback: Copy URL to clipboard
    await navigator.clipboard.writeText(url);
    toast.info('Download URL copied to clipboard. Paste in new tab to download.');
  }
};
```

## 📱 PWA-Specific Considerations

### 1. Install Prompt Interference
Downloads might be blocked if install prompt is active.

### 2. Standalone Mode
In standalone PWA mode, some download behaviors change.

### 3. iOS Safari Limitations
iOS Safari has specific restrictions on downloads.

## ✅ Verification Checklist

- [ ] Blob downloads work in Chrome
- [ ] Blob downloads work in Safari
- [ ] Blob downloads work in Firefox
- [ ] API downloads work with authentication
- [ ] Downloads work in PWA standalone mode
- [ ] Downloads work on mobile devices
- [ ] Service worker doesn't interfere
- [ ] CSP allows blob/data URLs
- [ ] Server sends proper headers
