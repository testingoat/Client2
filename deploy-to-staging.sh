#!/bin/bash
# 🚀 Deploy to Staging Server Script
# Usage: Upload this file to VPS and run: chmod +x deploy-to-staging.sh && ./deploy-to-staging.sh

echo "🌍 Deploying to Staging Environment..."

# Navigate to project directory
cd /var/www/goatgoat-app

# Pull latest changes
echo "📥 Pulling latest changes from git..."
git pull origin main

# Navigate to server directory
cd server

# Install dependencies if package.json changed
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Restart staging process
echo "🔄 Restarting staging process..."
pm2 restart goatgoat-staging

# Show status
echo "📊 Current PM2 status:"
pm2 list

# Show recent logs
echo "📝 Recent staging logs:"
pm2 logs goatgoat-staging --lines 20

echo "✅ Staging deployment complete!"
