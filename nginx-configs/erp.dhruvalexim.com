# =============================================
# DHRUVAL EXIM ERP CLIENT NGINX CONFIGURATION
# =============================================
# File: /etc/nginx/sites-available/erp.dhruvalexim.com

server {
    server_name erp.dhruvalexim.com www.erp.dhruvalexim.com;
    
    # Root directory for static files
    root /www/wwwroot/Dhruval-Erp/client/public;
    index index.html index.htm;
    
    # File upload size limit
    client_max_body_size 50M;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' https://server.dhruvalexim.com http: https: data: blob: 'unsafe-inline' 'unsafe-eval'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/x-javascript
        application/xml+rss
        application/javascript
        application/json
        application/xml
        image/svg+xml;
    
    # Next.js static files with long-term caching
    location /_next/static/ {
        proxy_pass http://127.0.0.1:4001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Cache-Status "STATIC";
    }
    
    # Next.js image optimization
    location /_next/image {
        proxy_pass http://127.0.0.1:4001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static assets with caching
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Cache-Status "STATIC";
        try_files $uri $uri/ @nextjs;
    }
    
    # Favicon and other root files
    location ~* \.(ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri @nextjs;
    }
    
    # API routes (proxy to server)
    location /api/ {
        proxy_pass https://server.dhruvalexim.com;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host server.dhruvalexim.com;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
        client_max_body_size 50M;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # Main Next.js application
    location / {
        proxy_pass http://127.0.0.1:4001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
        
        # Handle Next.js routing
        proxy_intercept_errors on;
        error_page 404 = @nextjs;
    }
    
    # Fallback to Next.js for all routes
    location @nextjs {
        proxy_pass http://127.0.0.1:4001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Error pages
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
    
    # Logging
    access_log /var/log/nginx/dhruval-erp-client.access.log;
    error_log /var/log/nginx/dhruval-erp-client.error.log;

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/erp.dhruvalexim.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/erp.dhruvalexim.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

# HTTP to HTTPS redirect
server {
    if ($host = erp.dhruvalexim.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name erp.dhruvalexim.com www.erp.dhruvalexim.com;
    return 404; # managed by Certbot
}
