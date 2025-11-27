const fs = require('fs');
const path = require('path');

// Load .env.staging file
const envPath = path.join(__dirname, '.env.staging');
const envConfig = {};

if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envConfig[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
}

module.exports = {
  apps: [{
    name: 'goatgoat-staging',
    script: './dist/app.js',
    cwd: '/var/www/goatgoat-staging/server',
    env: envConfig
  }]
};

