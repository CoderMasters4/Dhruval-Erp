module.exports = {
  apps: [
    {
      name: 'dhruval-erp-server',
      script: './dist/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 4000,
        HOST: 'localhost'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000,
        HOST: '0.0.0.0'
      },
      // Logging
      log_file: '/var/log/dhruval-erp/combined.log',
      out_file: '/var/log/dhruval-erp/out.log',
      error_file: '/var/log/dhruval-erp/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Process management
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      
      // Monitoring
      monitoring: true,
      pmx: true,
      
      // Advanced features
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'uploads'],
      
      // Auto restart on file changes (development only)
      watch_options: {
        followSymlinks: false,
        usePolling: false
      },
      
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // Environment variables
      env_file: '.env',
      
      // Cron restart (optional - restart every day at 3 AM)
      cron_restart: '0 3 * * *',
      
      // Merge logs
      merge_logs: true,
      
      // Time zone
      time: true,
      
      // Auto dump PM2 configuration
      autorestart: true,
      
      // Source map support
      source_map_support: true,
      
      // Instance variables
      instance_var: 'INSTANCE_ID',
      
      // Health check
      health_check_http: {
        url: 'http://localhost:4000/api/v1/health',
        interval: 30000,
        timeout: 5000
      }
    }
  ],

  deploy: {
    production: {
      user: 'www-data',
      host: 'server.dhruvalexim.com',
      ref: 'origin/main',
      repo: 'https://github.com/CoderMasters4/Dhruval-Erp.git',
      path: '/var/www/dhruval-erp',
      'pre-deploy-local': '',
      'post-deploy': 'cd server && npm ci --only=production && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'mkdir -p /var/www/dhruval-erp && mkdir -p /var/log/dhruval-erp'
    }
  }
};
