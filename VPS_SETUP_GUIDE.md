# 🚀 Complete VPS Setup Guide - Staging + Production

## 🎯 VPS Configuration Choice

**RECOMMENDED: Plain OS - Ubuntu 22.04 LTS**

### Why Plain OS?
- ✅ Full control over server configuration
- ✅ Better performance (no panel overhead)
- ✅ Industry standard for Node.js applications
- ✅ Perfect for PM2 and custom deployments
- ✅ More RAM and CPU for your applications

## 🏗️ Architecture Overview

```
┌───────────────────────────────────────────────────────────┐
│                    HOSTINGER VPS                          │
│                                                           │
│ ┌─────────────────┐      ┌─────────────────────────────┐  │
│ │   PRODUCTION    │      │         STAGING             │  │
│ │                 │      │                             │  │
│ │ Port: 3000      │      │ Port: 4000                  │  │
│ │ PM2: grocery-prod│     │ PM2: grocery-staging        │  │
│ │ Branch: main    │      │ Branch: develop             │  │
│ │ DB: production  │      │ DB: staging                 │  │
│ └─────────────────┘      └─────────────────────────────┘  │
│                                                           │
│ ┌───────────────────────────────────────────────────────┐ │
│ │                 NGINX REVERSE PROXY                   │ │
│ │                                                       │ │
│ │ api.yourdomain.com        → localhost:3000 (PROD)    │ │
│ │ staging-api.yourdomain.com → localhost:4000 (STAGING)│ │
│ └───────────────────────────────────────────────────────┘ │
│                                                           │
│ ┌───────────────────────────────────────────────────────┐ │
│ │                 SSL CERTIFICATES                      │ │
│ │ Let's Encrypt for both domains                        │ │
│ └───────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────┘
```

## 📋 Step-by-Step Setup Process

### Step 1: Initial VPS Setup

After getting your VPS credentials, connect via SSH:

```bash
# Connect to your VPS (replace with your VPS IP)
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Install essential packages
apt install -y curl wget git htop nano ufw
```

### Step 2: Install Node.js 20.x

```bash
# Install Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show npm version

# Install PM2 globally
npm install -g pm2
```

### Step 3: Install and Configure Nginx

```bash
# Install Nginx
apt install -y nginx

# Enable and start Nginx
systemctl enable nginx
systemctl start nginx

# Check status
systemctl status nginx
```

### Step 4: Configure Firewall

```bash
# Configure UFW firewall
ufw allow ssh
ufw allow 'Nginx Full'
ufw allow 22
ufw allow 80
ufw allow 443

# Enable firewall
ufw --force enable

# Check status
ufw status
```

### Step 5: Setup Application Directories

```bash
# Create application directory
mkdir -p /var/www
cd /var/www

# Clone your repository
git clone https://github.com/your-username/your-repo.git grocery-app
cd grocery-app

# Set proper permissions
chown -R $USER:$USER /var/www/grocery-app
```

### Step 6: Environment Configuration

```bash
# Navigate to server directory
cd /var/www/grocery-app/server

# Create production environment file
nano .env.production
```

**Production Environment (.env.production):**
```env
NODE_ENV=production
PORT=3000
MONGO_URI=mongodb+srv://your-production-db-connection
COOKIE_PASSWORD=your-secure-cookie-password-prod
ACCESS_TOKEN_SECRET=your-production-access-token-secret
REFRESH_TOKEN_SECRET=your-production-refresh-token-secret
FAST2SMS_API_KEY=your-api-key
FAST2SMS_SENDER_ID=your-sender-id
```

```bash
# Create staging environment file
nano .env.staging
```

**Staging Environment (.env.staging):**
```env
NODE_ENV=staging
PORT=4000
MONGO_URI=mongodb+srv://your-staging-db-connection
COOKIE_PASSWORD=your-secure-cookie-password-staging
ACCESS_TOKEN_SECRET=your-staging-access-token-secret
REFRESH_TOKEN_SECRET=your-staging-refresh-token-secret
FAST2SMS_API_KEY=your-api-key
FAST2SMS_SENDER_ID=your-sender-id
```

### Step 7: Install Dependencies and Build

```bash
# Install production dependencies
npm install --production

# Build TypeScript (if needed)
npm run build
```

### Step 8: PM2 Ecosystem Configuration

```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

**PM2 Configuration (ecosystem.config.js):**
```javascript
module.exports = {
  apps: [
    {
      name: 'grocery-production',
      script: './dist/app.js',
      cwd: '/var/www/grocery-app/server',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_file: '.env.production',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/prod-err.log',
      out_file: './logs/prod-out.log',
      log_file: './logs/prod-combined.log',
      time: true
    },
    {
      name: 'grocery-staging',
      script: './dist/app.js',
      cwd: '/var/www/grocery-app/server',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env_file: '.env.staging',
      env: {
        NODE_ENV: 'staging',
        PORT: 4000
      },
      error_file: './logs/staging-err.log',
      out_file: './logs/staging-out.log',
      log_file: './logs/staging-combined.log',
      time: true
    }
  ]
};
```

### Step 9: Create Log Directories and Start Applications

```bash
# Create logs directory
mkdir -p logs

# Start both applications
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions provided by the startup command

# Check PM2 status
pm2 status
```

### Step 10: Configure Nginx Reverse Proxy

```bash
# Create Nginx configuration for production
nano /etc/nginx/sites-available/grocery-production
```

**Production Nginx Config:**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }
}
```

```bash
# Create Nginx configuration for staging
nano /etc/nginx/sites-available/grocery-staging
```

**Staging Nginx Config:**
```nginx
server {
    listen 80;
    server_name staging-api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }
}
```

```bash
# Enable sites
ln -s /etc/nginx/sites-available/grocery-production /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/grocery-staging /etc/nginx/sites-enabled/

# Remove default site
rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

### Step 11: SSL Certificates Setup

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate for production domain
certbot --nginx -d api.yourdomain.com

# Get SSL certificate for staging domain
certbot --nginx -d staging-api.yourdomain.com

# Test auto-renewal
certbot renew --dry-run
```

### Step 12: DNS Configuration

**In your domain's DNS settings, add:**

```
Type: A
Name: api
Value: [Your VPS IP Address]

Type: A  
Name: staging-api
Value: [Your VPS IP Address]
```

## 🔄 Deployment Scripts

Create deployment scripts for easy updates:

```bash
# Create deployment scripts directory
mkdir -p /var/www/grocery-app/scripts
```

**Production Deployment Script:**
```bash
nano /var/www/grocery-app/scripts/deploy-production.sh
```

```bash
#!/bin/bash
set -e

echo "🚀 Starting Production Deployment..."

# Navigate to app directory
cd /var/www/grocery-app

# Pull latest changes from main branch
git checkout main
git pull origin main

# Navigate to server directory
cd server

# Install dependencies
npm install --production

# Build application
npm run build

# Restart production app
pm2 restart grocery-production

# Check status
pm2 status grocery-production

echo "✅ Production deployment completed!"
```

**Staging Deployment Script:**
```bash
nano /var/www/grocery-app/scripts/deploy-staging.sh
```

```bash
#!/bin/bash
set -e

echo "🧪 Starting Staging Deployment..."

# Navigate to app directory
cd /var/www/grocery-app

# Pull latest changes from develop branch
git checkout develop
git pull origin develop

# Navigate to server directory
cd server

# Install dependencies
npm install --production

# Build application
npm run build

# Restart staging app
pm2 restart grocery-staging

# Check status
pm2 status grocery-staging

echo "✅ Staging deployment completed!"
```

```bash
# Make scripts executable
chmod +x /var/www/grocery-app/scripts/deploy-production.sh
chmod +x /var/www/grocery-app/scripts/deploy-staging.sh
```

## 📊 Monitoring Setup

```bash
# Install htop for system monitoring
apt install -y htop

# Setup log rotation for PM2 logs
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## 🧪 Testing Your Setup

```bash
# Test production endpoint
curl https://api.yourdomain.com/health

# Test staging endpoint
curl https://staging-api.yourdomain.com/health

# Check PM2 status
pm2 status

# Monitor logs
pm2 logs grocery-production --lines 50
pm2 logs grocery-staging --lines 50

# Monitor system resources
htop
```

## 🔧 Useful Commands

```bash
# PM2 Commands
pm2 status                    # Check all apps status
pm2 logs                     # View all logs
pm2 logs grocery-production  # View production logs
pm2 logs grocery-staging     # View staging logs
pm2 restart grocery-production # Restart production
pm2 restart grocery-staging    # Restart staging
pm2 monit                    # Real-time monitoring

# Nginx Commands
nginx -t                     # Test configuration
systemctl reload nginx      # Reload Nginx
systemctl restart nginx     # Restart Nginx
tail -f /var/log/nginx/error.log # View error logs

# System Monitoring
htop                        # System resources
df -h                       # Disk usage
free -h                     # Memory usage
netstat -tlnp               # Check ports
```

## 🚨 Backup Strategy

```bash
# Create backup script
nano /root/backup-grocery.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/root/backups/grocery-$DATE"
mkdir -p $BACKUP_DIR

# Backup application files
cp -r /var/www/grocery-app $BACKUP_DIR/
cp /etc/nginx/sites-available/grocery-* $BACKUP_DIR/
cp /var/www/grocery-app/server/ecosystem.config.js $BACKUP_DIR/

# Save PM2 config
pm2 save --force

# Compress backup
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR
rm -rf $BACKUP_DIR

echo "Backup created: $BACKUP_DIR.tar.gz"
```

```bash
# Make backup script executable
chmod +x /root/backup-grocery.sh

# Setup daily backups
crontab -e
# Add: 0 2 * * * /root/backup-grocery.sh
```

## ✅ Final Checklist

- [ ] VPS with Ubuntu 22.04 LTS setup
- [ ] Node.js 20.x installed
- [ ] PM2 installed and configured
- [ ] Nginx installed and configured
- [ ] SSL certificates installed
- [ ] DNS records configured
- [ ] Both staging and production apps running
- [ ] Monitoring setup complete
- [ ] Backup strategy implemented
- [ ] Deployment scripts created

## 🎯 Next Steps

1. **Choose Plain OS Ubuntu 22.04 LTS** when setting up your VPS
2. **Follow this guide step by step**
3. **Test both staging and production environments**
4. **Setup your local development workflow**

This setup gives you professional-grade infrastructure with both staging and production on the same VPS! 🚀

## 📞 Support

If you encounter any issues during setup:
1. Check the logs: `pm2 logs`
2. Check Nginx: `nginx -t`
3. Check system resources: `htop`
4. Check ports: `netstat -tlnp`
