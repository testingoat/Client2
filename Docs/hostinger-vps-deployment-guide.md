# Hostinger VPS Deployment Guide

## Overview
Complete guide for deploying the Node.js/Fastify grocery backend server on Hostinger VPS alongside existing Odoo instance.

## Current VPS Setup Analysis
- **Existing**: Odoo ERP system (running on port 8069)
- **Adding**: Node.js grocery backend server
- **Database**: MongoDB Atlas (external, no changes needed)
- **Domain**: Can use subdomain or different port

## Deployment Architecture

### Port Configuration
```bash
# Existing services
Odoo ERP:           Port 8069 (existing, untouched)
SSH:                Port 22 (existing)

# New services  
Node.js App:        Port 3000 (new)
Nginx Proxy:        Port 80/443 (HTTP/HTTPS)
```

### Domain Structure Options
```bash
# Option 1: Subdomain approach (recommended)
https://yourdomain.com          → Odoo (existing)
https://api.yourdomain.com      → Node.js App (new)
https://admin.yourdomain.com    → AdminJS Panel (new)

# Option 2: Port-based approach
https://yourdomain.com:8069     → Odoo (existing)  
https://yourdomain.com:3000     → Node.js App (new)
```

## Prerequisites Check

### System Requirements
```bash
# Check current system
cat /etc/os-release              # OS version
free -h                          # Memory usage
df -h                           # Disk space
systemctl status odoo           # Odoo status (should be running)
```

### Required Software Installation
```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Nginx (if not already installed)
sudo apt update
sudo apt install nginx

# Install Git (if not already installed)
sudo apt install git
```

## Step-by-Step Deployment

### Step 1: Clone Repository
```bash
# Navigate to web directory
cd /var/www/

# Clone your repository
sudo git clone https://github.com/testingoat/client.git grocery-app
sudo chown -R $USER:$USER /var/www/grocery-app

# Navigate to server directory
cd /var/www/grocery-app/server
```

### Step 2: Install Dependencies
```bash
# Install Node.js dependencies
npm install --production

# Install PM2 if not already global
sudo npm install -g pm2
```

### Step 3: Environment Configuration
```bash
# Create production environment file
sudo nano /var/www/grocery-app/server/.env

# Add environment variables:
NODE_ENV=production
PORT=3000
MONGO_URI=mongodb+srv://testingoat24:Qwe_2897@cluster6.l5jkmi9.mongodb.net/Goatgoat?retryWrites=true&w=majority&appName=Cluster6
COOKIE_PASSWORD=sieL67H7GbkzJ4XCoH0IHcmO1hGBSiG6
ACCESS_TOKEN_SECRET=rsa_encrypted_secret
REFRESH_TOKEN_SECRET=rsa_encrypted_refresh_secret
```

### Step 4: PM2 Configuration
```bash
# Create PM2 ecosystem file
sudo nano /var/www/grocery-app/server/ecosystem.config.js

# Add PM2 configuration:
module.exports = {
  apps: [{
    name: 'grocery-backend',
    script: 'app.js',
    cwd: '/var/www/grocery-app/server',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

### Step 5: Start Application
```bash
# Start with PM2
cd /var/www/grocery-app/server
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions provided by the command above
```

### Step 6: Nginx Configuration
```bash
# Create Nginx configuration for API subdomain
sudo nano /etc/nginx/sites-available/grocery-api

# Add configuration:
server {
    listen 80;
    server_name api.yourdomain.com;  # Replace with your actual domain
    
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
    }
    
    # Admin panel specific location
    location /admin {
        proxy_pass http://localhost:3000/admin;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable the site
sudo ln -s /etc/nginx/sites-available/grocery-api /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Step 7: SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal setup (should be automatic)
sudo systemctl status certbot.timer
```

## Verification Steps

### Step 1: Check Application Status
```bash
# Check PM2 status
pm2 status

# Check application logs
pm2 logs grocery-backend

# Check if app is responding
curl http://localhost:3000/health
```

### Step 2: Check Nginx Status
```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx configuration
sudo nginx -t

# Check access logs
sudo tail -f /var/log/nginx/access.log
```

### Step 3: Test Endpoints
```bash
# Test health endpoint
curl https://api.yourdomain.com/health

# Test admin panel
curl https://api.yourdomain.com/admin/login

# Test API endpoints
curl https://api.yourdomain.com/api/
```

## Updating the React Native App

### Update Configuration
```javascript
// Update src/service/config.tsx
const CLOUD_API_URL = 'https://api.yourdomain.com'; // Your VPS domain

// Update network security config
// android/app/src/main/res/xml/network_security_config.xml
<domain includeSubdomains="true">api.yourdomain.com</domain>
```

## Monitoring and Maintenance

### PM2 Monitoring
```bash
# Monitor in real-time
pm2 monit

# View logs
pm2 logs grocery-backend --lines 100

# Restart application
pm2 restart grocery-backend

# Update application
cd /var/www/grocery-app
git pull origin main
cd server
npm install --production
pm2 restart grocery-backend
```

### System Monitoring
```bash
# Check system resources
htop
df -h
free -h

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## Backup Strategy

### Application Backup
```bash
# Create backup script
sudo nano /home/backup-grocery.sh

#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/backups/grocery-$DATE"
mkdir -p $BACKUP_DIR

# Backup application files
cp -r /var/www/grocery-app $BACKUP_DIR/
cp /etc/nginx/sites-available/grocery-api $BACKUP_DIR/
pm2 save --force

# Compress backup
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR
rm -rf $BACKUP_DIR

# Make executable
sudo chmod +x /home/backup-grocery.sh

# Setup cron job for daily backups
crontab -e
# Add: 0 2 * * * /home/backup-grocery.sh
```

## Advantages of VPS Deployment

### Performance Benefits
- **Dedicated Resources**: No shared hosting limitations
- **Better Response Times**: Direct server access
- **Custom Optimizations**: Tune for your specific needs
- **No Build Timeouts**: Deploy anytime without restrictions

### Cost Benefits
- **No Monthly Fees**: One-time VPS cost
- **Existing Infrastructure**: Leverage current Odoo setup
- **Scalability**: Upgrade VPS as needed
- **Full Control**: No platform restrictions

### Integration Benefits
- **Direct Odoo Access**: Same server communication
- **Custom Domain**: Professional appearance
- **SSL Certificates**: Free Let's Encrypt certificates
- **Backup Control**: Your own backup strategy

## Troubleshooting

### Common Issues
```bash
# Port already in use
sudo lsof -i :3000
sudo kill -9 <PID>

# Permission issues
sudo chown -R $USER:$USER /var/www/grocery-app

# Nginx configuration errors
sudo nginx -t
sudo systemctl reload nginx

# PM2 issues
pm2 delete all
pm2 start ecosystem.config.js

# MongoDB connection issues
# Check environment variables in .env file
# Verify MongoDB Atlas IP whitelist includes VPS IP
```

## Security Considerations

### Firewall Configuration
```bash
# Check current firewall status
sudo ufw status

# Allow necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 8069  # Odoo (if needed externally)

# Enable firewall
sudo ufw enable
```

### Application Security
- **Environment Variables**: Secure .env file permissions
- **Regular Updates**: Keep Node.js and packages updated
- **SSL Certificates**: Always use HTTPS in production
- **Access Logs**: Monitor for suspicious activity

## Success Criteria

### Deployment Success
- ✅ Node.js app running on PM2
- ✅ Nginx proxy working correctly
- ✅ SSL certificate installed
- ✅ Health endpoint responding
- ✅ Admin panel accessible
- ✅ Existing Odoo unaffected

### Performance Targets
- **Response Time**: <500ms for API calls
- **Uptime**: 99.9% availability
- **Memory Usage**: <512MB RAM
- **CPU Usage**: <50% average load

This VPS deployment will give you full control, better performance, and cost savings compared to Render! 🚀
