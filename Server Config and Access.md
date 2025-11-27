# Server Configuration and Access Guide

## VPS Server Details
- **Server IP**: 147.93.108.121
- **User**: root
- **SSH Key**: ~/.ssh/id_ed25519
- **SSH Config**: Already configured in ~/.ssh/config

## Direct SSH Access Capabilities
✅ **Confirmed Working**: AI Assistant can directly access VPS via SSH  
✅ **Real-time Changes**: Can edit files, restart services, check logs immediately  
✅ **Service Management**: Can manage PM2 processes directly  
✅ **Database Access**: Can run database queries and operations  
✅ **Configuration Updates**: Can modify nginx, environment files, etc.  

## Project Structure on VPS

### Main Project Directory
```
/var/www/goatgoat-app/
├── server/                 # Server-side code
│   ├── src/               # Source code
│   ├── dist/              # Built/compiled code
│   ├── node_modules/      # Dependencies
│   ├── package.json       # Server dependencies
│   ├── .env.production    # Production environment variables
│   ├── .env.staging       # Staging environment variables
│   └── ecosystem.config.cjs # PM2 configuration
├── android/               # Android app code
├── src/                   # React Native source
├── node_modules/          # Client dependencies
├── package.json           # Client dependencies
├── Bug-fixed.md          # Bug tracking document
└── .git/                 # Git repository
```

### PM2 Processes
- **goatgoat-production** (ID: 0)
  - Script: `/var/www/goatgoat-app/server/dist/app.js`
  - Working Dir: `/var/www/goatgoat-app/server`
  - Status: Online (17h uptime)
  
- **goatgoat-staging** (ID: 1)
  - Script: `/var/www/goatgoat-app/server/dist/app.js`
  - Working Dir: `/var/www/goatgoat-app/server`
  - Status: Online (17h uptime)

## Recommended Development Workflow

### 🎯 **BEST PRACTICE APPROACH**

#### Phase 1: Development & Testing (Staging)
1. **Direct Server Changes for Quick Testing**
   ```bash
   # Make changes directly on staging server
   ssh 147.93.108.121
   cd /var/www/goatgoat-app
   # Edit files directly for rapid testing
   nano server/src/someFile.js
   # Restart staging process
   pm2 restart goatgoat-staging
   ```

2. **Benefits of Direct Changes**:
   - ⚡ Immediate testing
   - 🔄 Rapid iteration
   - 🐛 Real-time debugging
   - 📊 Live log monitoring

#### Phase 2: Staging Validation
1. **Test thoroughly on staging environment**
2. **Verify all functionality works**
3. **Check logs for any issues**
4. **Performance testing**

#### Phase 3: Production Deployment (Git Workflow)
1. **Once staging is stable, commit changes locally**:
   ```bash
   git add .
   git commit -m "Feature: Description of changes"
   git push origin main
   ```

2. **Deploy to production**:
   ```bash
   ssh 147.93.108.121
   cd /var/www/goatgoat-app
   git pull origin main
   npm install  # if dependencies changed
   npm run build  # if build needed
   pm2 restart goatgoat-production
   ```

### 🚨 **CRITICAL WORKFLOW RULES**

#### DO's ✅
- **Always test on staging first**
- **Use direct changes for rapid development**
- **Commit to git only after staging validation**
- **Keep staging and production environments separate**
- **Monitor logs after each change**
- **Backup before major changes**

#### DON'Ts ❌
- **Never make direct changes to production**
- **Don't skip staging testing**
- **Don't commit untested code**
- **Don't restart production without staging validation**

## Development Process Flow

```
Local Development
       ↓
Direct Changes on Staging Server
       ↓
Test & Validate on Staging
       ↓
Commit Changes to Git (Local)
       ↓
Push to Repository
       ↓
Pull on Production Server
       ↓
Deploy to Production
```

## Quick Commands Reference

### SSH Access
```bash
ssh 147.93.108.121
```

### PM2 Management
```bash
pm2 list                    # List all processes
pm2 restart goatgoat-staging    # Restart staging
pm2 restart goatgoat-production # Restart production
pm2 logs goatgoat-staging       # View staging logs
pm2 logs goatgoat-production    # View production logs
```

### File Locations
```bash
# Server source code
/var/www/goatgoat-app/server/src/

# Built server code
/var/www/goatgoat-app/server/dist/

# Environment files
/var/www/goatgoat-app/server/.env.staging
/var/www/goatgoat-app/server/.env.production

# Client source code
/var/www/goatgoat-app/src/
```

## Environment Management

### Staging Environment
- **Purpose**: Development, testing, debugging
- **Changes**: Direct file editing allowed
- **Risk**: Low (isolated environment)
- **Process**: `goatgoat-staging`

### Production Environment
- **Purpose**: Live application
- **Changes**: Only via git workflow
- **Risk**: High (affects users)
- **Process**: `goatgoat-production`

## Security & Best Practices

1. **Always backup before major changes**
2. **Test database changes on staging first**
3. **Monitor server resources during deployment**
4. **Keep environment variables secure**
5. **Regular security updates**
6. **Log monitoring and alerting**

---

**Last Updated**: September 14, 2025  
**AI Assistant**: Has direct SSH access and can assist with real-time server management
