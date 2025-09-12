module.exports = {
  apps: [
    {
      // 🐐 PRODUCTION GOATGOAT APP
      name: 'goatgoat-production',
      script: './dist/app.js',
      cwd: '/var/www/goatgoat-app/server',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_file: '.env.production',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        // Intentionally DO NOT set other env vars to avoid overriding .env files
      },
      // 📝 ENHANCED LOGGING CONFIGURATION
      error_file: './logs/🚨-production-error.log',
      out_file: './logs/📄-production-output.log',
      log_file: './logs/📋-production-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // ⚡ PERFORMANCE TUNING
      max_restarts: 10,
      min_uptime: '10s',
      kill_timeout: 5000,
    },
    {
      // 🧪 STAGING GOATGOAT APP 🟢
      name: 'goatgoat-staging',
      script: './dist/app.js',
      cwd: '/var/www/goatgoat-app/server',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env_file: '.env.staging',
      env: {
        NODE_ENV: 'staging',
        PORT: 4000,
        // Intentionally DO NOT set other env vars to avoid overriding .env files
      },
      // 📝 ENHANCED LOGGING CONFIGURATION
      error_file: './logs/🚨-staging-error.log',
      out_file: './logs/📄-staging-output.log',
      log_file: './logs/📋-staging-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // ⚡ PERFORMANCE TUNING 🟢
      max_restarts: 15,
      min_uptime: '10s',
      kill_timeout: 5000,
    },
  ],
};
      name: 'grocery-backend',
      script: './dist/app.js',
      cwd: '/var/www/grocery-app/server',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        // Intentionally DO NOT set FAST2SMS_* or DLT_* here to avoid overriding .env
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
    },
  ],
};

