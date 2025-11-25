module.exports = {
  apps: [
    {
      // 🧪 STAGING GOATGOAT APP 🟢
      name: 'goatgoat-staging',
      script: './dist/app.js',
      cwd: '/var/www/goatgoat-staging/server',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'staging',
        PORT: 4000,
        MONGO_URI: 'mongodb+srv://testingoat24:Qwe_2897@cluster6.l5jkmi9.mongodb.net/GoatgoatStaging?retryWrites=true&w=majority&appName=Cluster6',
        FAST2SMS_API_KEY: 'TBXtyM2OVn0ra5SPdRCH48pghNkzm3w1xFoKIsYJGDEeb7Lvl6wShBusoREfqr0kO3M5jJdexvGQctbn',
        FIREBASE_SERVICE_ACCOUNT_PATH: '/var/www/goatgoat-staging/server/secure/firebase-service-account.json',
        DISABLE_FIREBASE: 'false',
        // 🔐 JWT SECRETS FOR TOKEN GENERATION
        ACCESS_TOKEN_SECRET: 'goatgoat_super_secret_access_key_staging_2024',
        REFRESH_TOKEN_SECRET: 'goatgoat_super_secret_refresh_key_staging_2024',
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
