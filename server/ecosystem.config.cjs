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
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        MONGO_URI: 'mongodb+srv://testingoat24:Qwe_2897@cluster6.l5jkmi9.mongodb.net/GoatgoatProduction?retryWrites=true&w=majority&appName=Cluster6',
        FAST2SMS_API_KEY: 'TBXtyM2OVn0ra5SPdRCH48pghNkzm3w1xFoKIsYJGDEeb7Lvl6wShBusoREfqr0kO3M5jJdexvGQctbn',
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
      env: {
        NODE_ENV: 'staging',
        PORT: 4000,
        MONGO_URI: 'mongodb+srv://testingoat24:Qwe_2897@cluster6.l5jkmi9.mongodb.net/GoatgoatStaging?retryWrites=true&w=majority&appName=Cluster6',
        FAST2SMS_API_KEY: 'TBXtyM2OVn0ra5SPdRCH48pghNkzm3w1xFoKIsYJGDEeb7Lvl6wShBusoREfqr0kO3M5jJdexvGQctbn',
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

