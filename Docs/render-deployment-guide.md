# Render Deployment Guide

## Overview
Complete guide for deploying the Node.js/Fastify server with AdminJS, MongoDB Atlas, and Socket.IO to Render cloud platform.

## Prerequisites
- GitHub repository with the server code
- MongoDB Atlas cluster configured
- Render account (free tier sufficient)

## Required Environment Variables

### Production Environment Variables (Render Dashboard)
Set these exact values in Render Dashboard → Your Service → Environment:

```
mongodb+srv://testingoat24:Qwe_2897@cluster6.l5jkmi9.mongodb.net/Goatgoat?retryWrites=true&w=majority&appName=Cluster6
COOKIE_PASSWORD=sieL67H7GbkzJ4XCoH0IHcmO1hGBSiG6
ACCESS_TOKEN_SECRET=rsa_encrypted_secret
REFRESH_TOKEN_SECRET=rsa_encrypted_refresh_secret
NODE_ENV=production
PORT=10000
```

**Important Notes**:
- Do NOT include `KEY=` prefix in the value field
- PORT is automatically set by Render, but can be overridden
- NODE_ENV should be exactly `production` (not `NODE_ENV=production`)

## Node.js Version Configuration

### .nvmrc File
Create `/server/.nvmrc` with:
```
20.19.4
```

### package.json Engines
```json
{
  "engines": {
    "node": "20.x",
    "npm": "10.x"
  }
}
```

## Build and Start Commands

### Build Command
```bash
npm install --legacy-peer-deps
```

### Start Command
```bash
node app.js
```

### Pre-Deploy Command (Optional)
```bash
# Leave empty or use for database migrations
```

## Package.json Dependencies Configuration

### Critical Dependencies with Exact Versions
```json
{
  "dependencies": {
    "@adminjs/fastify": "^4.2.0",
    "@adminjs/mongoose": "^4.1.0",
    "@adminjs/themes": "^1.0.1",
    "@fastify/cookie": "^11.0.2",
    "@fastify/session": "^11.1.0",
    "adminjs": "7.8.17",
    "connect-mongodb-session": "^5.0.0",
    "dotenv": "^16.4.7",
    "fastify": "^5.5.0",
    "fastify-socket.io": "^5.1.0",
    "jsonwebtoken": "^9.0.2",
    "mongodb": "^6.18.0",
    "mongoose": "^8.10.0",
    "nodemon": "^3.1.9",
    "socket.io": "^4.7.5"
  },
  "overrides": {
    "@tiptap/core": "2.1.13",
    "@tiptap/extension-horizontal-rule": "2.1.13",
    "@tiptap/extension-blockquote": "2.1.13",
    "@tiptap/extension-bold": "2.1.13",
    "@tiptap/extension-bullet-list": "2.1.13",
    "@tiptap/extension-code": "2.1.13",
    "@tiptap/extension-code-block": "2.1.13",
    "@tiptap/extension-document": "2.1.13",
    "@tiptap/extension-dropcursor": "2.1.13",
    "@tiptap/extension-gapcursor": "2.1.13",
    "@tiptap/extension-hard-break": "2.1.13",
    "@tiptap/extension-heading": "2.1.13",
    "@tiptap/extension-history": "2.1.13",
    "@tiptap/extension-italic": "2.1.13",
    "@tiptap/extension-list-item": "2.1.13",
    "@tiptap/extension-ordered-list": "2.1.13",
    "@tiptap/extension-paragraph": "2.1.13",
    "@tiptap/extension-strike": "2.1.13",
    "@tiptap/extension-text": "2.1.13",
    "@tiptap/pm": "2.1.13",
    "@tiptap/starter-kit": "2.1.13"
  }
}
```

### Version Compatibility Notes
- **Fastify 5.x**: All @fastify/* plugins must be v11+ for compatibility
- **AdminJS 7.8.17**: Pinned to avoid TipTap version conflicts
- **TipTap Overrides**: Forces consistent versions across all TipTap extensions
- **Socket.IO 4.7.5**: Required peer dependency for fastify-socket.io

## MongoDB Atlas Configuration

### Network Access Setup
1. Go to MongoDB Atlas Dashboard
2. Navigate to **Network Access**
3. Click **Add IP Address**
4. Select **Allow Access from Anywhere** (`0.0.0.0/0`)
5. Click **Confirm**

**Why**: Render uses dynamic IP addresses, so we need to allow all IPs.

### Connection String Format
```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority&appName=ClusterName
```

### Database User Permissions
Ensure the database user has:
- Read and write access to the target database
- Connection permissions from any IP

## Step-by-Step Deployment Process

### 1. Prepare Repository
```bash
# Ensure all changes are committed
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Create Render Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Select the repository containing your server code

### 3. Configure Service Settings
- **Name**: `grocery-server` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: `server` (if server code is in subdirectory)
- **Build Command**: `npm install --legacy-peer-deps`
- **Start Command**: `node app.js`

### 4. Set Environment Variables
In the **Environment** section, add each variable:
- Click **Add Environment Variable**
- Enter **Key** and **Value** (no `KEY=` prefix in value)
- Repeat for all required variables

### 5. Deploy
1. Click **Create Web Service**
2. Wait for build and deployment to complete
3. Monitor logs for any errors

### 6. Verify Deployment
- Check the provided Render URL
- Verify `/health` endpoint responds
- Test AdminJS at `/admin`
- Confirm database connectivity

## Health Check Configuration

### Health Check Endpoint
The server includes a `/health` endpoint:

```javascript
app.get('/health', async (request, reply) => {
    try {
        const dbState = mongoose.connection.readyState;
        const dbStatus = dbState === 1 ? 'connected' : 'disconnected';

        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: dbStatus,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: process.env.npm_package_version || '1.0.0'
        };
    } catch (error) {
        reply.code(500);
        return {
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
});
```

### Render Health Check Settings
- **Health Check Path**: `/health`
- **Health Check Grace Period**: 300 seconds
- **Health Check Interval**: 30 seconds

## Troubleshooting Common Issues

### Build Failures

#### Issue: npm install fails
**Solution**: Use `--legacy-peer-deps` flag in build command

#### Issue: Node.js version mismatch
**Solution**: Ensure `.nvmrc` file is in correct location with correct version

#### Issue: Package-lock.json conflicts
**Solution**: Delete package-lock.json and let Render regenerate it

### Runtime Errors

#### Issue: Environment variables not found
**Symptoms**: `MONGO_URI environment variable is required`
**Solution**: 
1. Check environment variables are set in Render dashboard
2. Ensure no `KEY=` prefix in values
3. Restart the service

#### Issue: MongoDB connection fails
**Symptoms**: `Could not connect to any servers in your MongoDB Atlas cluster`
**Solution**:
1. Whitelist `0.0.0.0/0` in MongoDB Atlas Network Access
2. Verify connection string format
3. Check database user permissions

#### Issue: Fastify plugin version mismatch
**Symptoms**: `expected '5.x' fastify version, '4.29.1' is installed`
**Solution**:
1. Ensure all Fastify plugins are compatible with Fastify 5.x
2. Clear build cache in Render settings
3. Delete package-lock.json and redeploy

#### Issue: TipTap export errors
**Symptoms**: `does not provide an export named 'canInsertNode'`
**Solution**:
1. Add npm overrides for all TipTap packages
2. Pin AdminJS to exact version
3. Force clean dependency resolution

### Performance Issues

#### Issue: Cold start delays
**Solution**: 
- Use Render's paid plans for faster cold starts
- Implement keep-alive pings
- Consider upgrading to dedicated instances

#### Issue: Memory usage high
**Solution**:
- Monitor `/health` endpoint for memory usage
- Optimize MongoDB connection pool settings
- Consider upgrading Render plan

## Monitoring and Maintenance

### Log Monitoring
- Access logs via Render Dashboard → Your Service → Logs
- Monitor for connection errors, memory issues, and performance problems
- Set up log alerts for critical errors

### Database Monitoring
- Monitor MongoDB Atlas metrics
- Watch connection pool usage
- Track query performance

### Uptime Monitoring
- Use external services like UptimeRobot
- Monitor `/health` endpoint
- Set up alerts for downtime

## Security Considerations

### Environment Variables
- Never commit sensitive data to repository
- Use Render's environment variable encryption
- Rotate secrets regularly

### Database Security
- Use strong passwords for database users
- Enable MongoDB Atlas security features
- Monitor access logs

### Network Security
- Use HTTPS only (Render provides SSL certificates)
- Implement rate limiting
- Monitor for suspicious activity

## Scaling Considerations

### Horizontal Scaling
- Render supports multiple instances
- Ensure session storage is external (MongoDB)
- Use load balancer-friendly configurations

### Database Scaling
- MongoDB Atlas supports automatic scaling
- Monitor connection limits
- Consider read replicas for heavy read workloads

## Backup and Recovery

### Database Backups
- MongoDB Atlas provides automatic backups
- Test restore procedures regularly
- Document recovery processes

### Code Backups
- GitHub serves as primary code backup
- Tag releases for easy rollback
- Maintain deployment documentation

## Cost Optimization

### Render Pricing
- Free tier: 750 hours/month, sleeps after 15 minutes of inactivity
- Paid plans: Always-on, faster builds, more resources
- Monitor usage to optimize costs

### MongoDB Atlas Pricing
- Free tier: 512MB storage, shared clusters
- Paid plans: Dedicated clusters, more storage, better performance
- Monitor data usage and optimize queries

## Support and Resources

### Render Documentation
- [Render Docs](https://render.com/docs)
- [Node.js on Render](https://render.com/docs/node-version)
- [Environment Variables](https://render.com/docs/environment-variables)

### MongoDB Atlas Documentation
- [Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Connection Strings](https://docs.atlas.mongodb.com/reference/connection-string-options/)
- [Network Security](https://docs.atlas.mongodb.com/security-whitelist/)

### Community Support
- Render Community Forum
- MongoDB Community Forums
- Stack Overflow for specific technical issues
