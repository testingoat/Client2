#!/bin/bash

# VPS Deployment Script for Grocery Backend
# This script automates the deployment process to fix the 502 Bad Gateway error

set -e  # Exit on any error

echo "🚀 Starting VPS Deployment Process..."

# Configuration
VPS_HOST="168.231.123.247"
VPS_USER="root"  # Change this to your VPS username
APP_DIR="/var/www/grocery-app/server"
REPO_URL="https://github.com/testingoat/client.git"

echo "📋 Deployment Configuration:"
echo "   VPS Host: $VPS_HOST"
echo "   VPS User: $VPS_USER"
echo "   App Directory: $APP_DIR"
echo "   Repository: $REPO_URL"

# Function to run commands on VPS
run_on_vps() {
    ssh $VPS_USER@$VPS_HOST "$1"
}

# Function to copy files to VPS
copy_to_vps() {
    scp "$1" $VPS_USER@$VPS_HOST:"$2"
}

echo "🔍 Step 1: Checking VPS connectivity..."
if ! ssh -o ConnectTimeout=10 $VPS_USER@$VPS_HOST "echo 'VPS connection successful'"; then
    echo "❌ Cannot connect to VPS. Please check:"
    echo "   - VPS IP address: $VPS_HOST"
    echo "   - SSH credentials"
    echo "   - Network connectivity"
    exit 1
fi

echo "✅ VPS connection successful"

echo "📦 Step 2: Preparing application directory..."
run_on_vps "mkdir -p $APP_DIR"
run_on_vps "cd $APP_DIR && pwd"

echo "🔄 Step 3: Updating application code..."
if run_on_vps "cd $APP_DIR && git status" 2>/dev/null; then
    echo "   Git repository exists, pulling latest changes..."
    run_on_vps "cd $APP_DIR && git pull origin main"
else
    echo "   Cloning repository..."
    run_on_vps "cd $(dirname $APP_DIR) && git clone $REPO_URL $(basename $APP_DIR)"
fi

echo "📁 Step 4: Navigating to server directory..."
run_on_vps "cd $APP_DIR && ls -la"

echo "📋 Step 5: Installing dependencies..."
echo "   Installing all dependencies (including TypeScript for build)"
echo "   Using --legacy-peer-deps to resolve dependency conflicts"
run_on_vps "cd $APP_DIR && npm install --legacy-peer-deps"

echo "🔨 Step 6: Building application..."
run_on_vps "cd $APP_DIR && npm run build"

echo "⚙️ Step 7: Setting up environment variables..."
# Copy the .env file from local to VPS
if [ -f "server/.env" ]; then
    echo "   Copying .env file to VPS..."
    copy_to_vps "server/.env" "$APP_DIR/.env"
else
    echo "   Creating .env file on VPS..."
    run_on_vps "cat > $APP_DIR/.env << 'EOF'
# Production Environment Variables for VPS Deployment
NODE_ENV=production
PORT=3000

# MongoDB Configuration
MONGO_URI=mongodb+srv://testingoat24:Qwe_2897@cluster6.l5jkmi9.mongodb.net/Goatgoat?retryWrites=true&w=majority&appName=Cluster6

# Authentication Secrets
COOKIE_PASSWORD=sieL67H7GbkzJ4XCoH0IHcmO1hGBSiG6
ACCESS_TOKEN_SECRET=rsa_encrypted_secret
REFRESH_TOKEN_SECRET=rsa_encrypted_refresh_secret

# Fast2SMS Configuration for OTP (safe defaults)
FAST2SMS_API_KEY=TBXtyM2OVn0ra5SPdRCH48pghNkzm3w1xFoKIsYJGDEeb7Lvl6wShBusoREfqr0kO3M5jJdexvGQctbn
FAST2SMS_SENDER_ID=OTP
DLT_ENTITY_ID=YOUR_DEFAULT_ENTITY_ID
DLT_TEMPLATE_ID=YOUR_DEFAULT_TEMPLATE_ID
FAST2SMS_USE_DLT=false

# OTP Configuration
OTP_RATE_LIMITS={\"window\": 300, \"maxRequests\": 3}
OTP_TTL=300
OTP_LENGTH=6
OTP_BACKOFF_POLICY={\"baseDelay\": 1000, \"maxDelay\": 300000, \"multiplier\": 2}

# Feature Flags
NOTIFY_ENABLED=true
EOF"
fi

echo "🔧 Step 8: Setting up PM2 configuration..."
run_on_vps "cat > $APP_DIR/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'grocery-backend',
    script: 'dist/app.js',
    cwd: '$APP_DIR',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/grocery-backend-error.log',
    out_file: '/var/log/pm2/grocery-backend-out.log',
    log_file: '/var/log/pm2/grocery-backend.log'
  }]
};
EOF"

echo "🛑 Step 9: Stopping existing processes..."
run_on_vps "pm2 delete grocery-backend || true"
run_on_vps "pkill -f 'node.*app.js' || true"

echo "🚀 Step 10: Starting application with PM2..."
run_on_vps "cd $APP_DIR && pm2 start ecosystem.config.js"
run_on_vps "pm2 save"

echo "⏳ Step 11: Waiting for application to start..."
sleep 10

echo "🔍 Step 12: Verifying deployment..."
echo "   Checking PM2 status..."
run_on_vps "pm2 list"

echo "   Checking if port 3000 is listening..."
if run_on_vps "netstat -tlnp | grep :3000"; then
    echo "   ✅ Application is listening on port 3000"
else
    echo "   ❌ Application is not listening on port 3000"
    echo "   Checking PM2 logs..."
    run_on_vps "pm2 logs grocery-backend --lines 20"
    exit 1
fi

echo "   Testing health endpoint locally on VPS..."
if run_on_vps "curl -s http://localhost:3000/health | grep -q 'healthy'"; then
    echo "   ✅ Health endpoint responding"
else
    echo "   ❌ Health endpoint not responding"
    run_on_vps "pm2 logs grocery-backend --lines 20"
    exit 1
fi

echo "🌐 Step 13: Testing external access..."
echo "   Testing HTTPS health endpoint..."
if curl -s https://api.goatgoat.xyz/health | grep -q "healthy"; then
    echo "   ✅ External HTTPS health endpoint working"
else
    echo "   ⚠️ External HTTPS health endpoint not responding (may need nginx restart)"
    echo "   Restarting nginx..."
    run_on_vps "systemctl restart nginx"
    sleep 5
    if curl -s https://api.goatgoat.xyz/health | grep -q "healthy"; then
        echo "   ✅ External HTTPS health endpoint working after nginx restart"
    else
        echo "   ❌ External HTTPS health endpoint still not working"
        echo "   Please check nginx configuration manually"
    fi
fi

echo "🎉 Deployment completed successfully!"
echo ""
echo "📊 Deployment Summary:"
echo "   ✅ Code updated from git"
echo "   ✅ Dependencies installed"
echo "   ✅ Application built"
echo "   ✅ Environment configured"
echo "   ✅ PM2 process started"
echo "   ✅ Health endpoint responding"
echo ""
echo "🔗 Test URLs:"
echo "   Health: https://api.goatgoat.xyz/health"
echo "   Admin:  https://api.goatgoat.xyz/admin/login"
echo ""
echo "📋 Next Steps:"
echo "   1. Test admin panel login"
echo "   2. Test OTP functionality"
echo "   3. Monitor PM2 logs: ssh $VPS_USER@$VPS_HOST 'pm2 logs grocery-backend'"
echo "   4. Check nginx logs if issues: ssh $VPS_USER@$VPS_HOST 'tail -f /var/log/nginx/error.log'"
