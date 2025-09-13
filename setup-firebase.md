# 🔥 Firebase Admin SDK Setup Guide

## Step 1: Download Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your GoatGoat project
3. Settings (⚙️) → Project settings
4. **"Service accounts"** tab
5. Click **"Generate new private key"**
6. Save as `firebase-service-account.json` (rename it for consistency)

## Step 2: Upload to Server

**Option A: Via WinSCP/FileZilla:**
```
Upload firebase-service-account.json to:
/home/goat/GoatGoat/server/firebase-service-account.json
```

**Option B: Via SSH (if you have direct access):**
```bash
# Copy the JSON content and create file on server
ssh goat@139.59.236.50
cd /home/goat/GoatGoat/server/
nano firebase-service-account.json
# Paste the JSON content, save and exit
```

## Step 3: Update PM2 Environment Configuration

Edit `/home/goat/GoatGoat/server/ecosystem.config.cjs`:

```javascript
module.exports = {
  apps: [
    {
      name: 'goatgoat-prod',
      script: 'dist/app.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        MONGO_URI: 'mongodb://127.0.0.1:27017/GoatGoat',
        FAST2SMS_API_KEY: 'TBXtyM2OVn0ra5SPdRCH48pghNkzm3w1xFoKIsYJGDEeb7Lvl6wShBusoREfqr0kO3M5jJdexvGQctbn',
        FIREBASE_SERVICE_ACCOUNT_PATH: './firebase-service-account.json',
        // Remove DISABLE_FIREBASE line to enable Firebase
        // DISABLE_FIREBASE: 'true',
      },
    },
    {
      name: 'goatgoat-staging',
      script: 'dist/app.js',
      env: {
        NODE_ENV: 'staging',
        PORT: 4000,
        MONGO_URI: 'mongodb://127.0.0.1:27017/GoatGoat-staging',
        FAST2SMS_API_KEY: 'TBXtyM2OVn0ra5SPdRCH48pghNkzm3w1xFoKIsYJGDEeb7Lvl6wShBusoREfqr0kO3M5jJdexvGQctbn',
        FIREBASE_SERVICE_ACCOUNT_PATH: './firebase-service-account.json',
        // Remove DISABLE_FIREBASE line to enable Firebase
        // DISABLE_FIREBASE: 'true',
      },
    },
  ],
};
```

## Step 4: Restart Services

```bash
# On the server
cd /home/goat/GoatGoat/server/
npm run build
pm2 restart goatgoat-prod
pm2 restart goatgoat-staging

# Check logs for successful Firebase initialization
pm2 logs goatgoat-prod --lines 50
pm2 logs goatgoat-staging --lines 50
```

## Step 5: Verify Firebase is Working

Look for these success messages in the logs:
```
✅ Firebase service account loaded from: file
📋 Project ID: your-project-id
📧 Client Email: firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
✅ Firebase Admin SDK initialized successfully.
```

## Security Note

The firebase-service-account.json file contains sensitive private keys. Make sure:
- File permissions are restricted: `chmod 600 firebase-service-account.json`
- File is not committed to git (already in .gitignore)
- Only the goat user can read it

## Alternative: Environment Variable Method

Instead of a file, you can also set the JSON as an environment variable:

```javascript
// In ecosystem.config.cjs
env: {
  FIREBASE_SERVICE_ACCOUNT_JSON: '{"type":"service_account","project_id":"your-project",...}',
  // No FIREBASE_SERVICE_ACCOUNT_PATH needed
}
```

This method is more secure for production deployments.
