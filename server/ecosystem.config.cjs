module.exports = {
  apps: [
    {
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

