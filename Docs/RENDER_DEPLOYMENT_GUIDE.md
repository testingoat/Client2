# 🚀 Render.com Deployment Guide
## Deploy Your Grocery App Backend for FREE

### 🎯 **Why Render.com?**
- **Free Tier**: 750 hours/month (enough for development)
- **No Credit Card Required**
- **Automatic HTTPS**
- **Easy GitHub Integration**
- **Better than Railway's limited plan**

---

## 📋 **Step-by-Step Deployment**

### **Step 1: Prepare Your Repository**

Your code is already ready! The server folder contains:
- ✅ `package.json` with correct start script
- ✅ `Procfile` for deployment
- ✅ Environment variables in `.env`
- ✅ Health check endpoint

### **Step 2: Create Render Account**

1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account: `testingoat24@gmail.com`
3. Connect your GitHub repository

### **Step 3: Deploy Web Service**

1. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repo: `testingoat/client`
   - Select the repository

2. **Configure Service**
   ```
   Name: grocery-backend
   Environment: Node
   Region: Oregon (US West)
   Branch: main
   Root Directory: server
   Build Command: npm install
   Start Command: node app.js
   ```

3. **Set Environment Variables**
   ```
   MONGO_URI=mongodb+srv://testingoat24:Qwe_2897@cluster6.l5jkmi9.mongodb.net/Goatgoat?retryWrites=true&w=majority&appName=Cluster6
   COOKIE_PASSWORD=sieL67H7GbkzJ4XCoH0IHcmO1hGBSiG6
   ACCESS_TOKEN_SECRET=rsa_encrypted_secret
   REFRESH_TOKEN_SECRET=rsa_encrypted_refresh_secret
   NODE_ENV=production
   PORT=10000
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)

### **Step 4: Get Your URL**

After deployment, you'll get a URL like:
```
https://grocery-backend-xxxx.onrender.com
```

---

## 🔧 **Alternative: Manual Deployment Steps**

If you prefer manual setup:

### **1. Create render.yaml**
```yaml
services:
  - type: web
    name: grocery-backend
    env: node
    buildCommand: npm install
    startCommand: node app.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGO_URI
        value: mongodb+srv://testingoat24:Qwe_2897@cluster6.l5jkmi9.mongodb.net/Goatgoat?retryWrites=true&w=majority&appName=Cluster6
      - key: COOKIE_PASSWORD
        value: sieL67H7GbkzJ4XCoH0IHcmO1hGBSiG6
      - key: ACCESS_TOKEN_SECRET
        value: rsa_encrypted_secret
      - key: REFRESH_TOKEN_SECRET
        value: rsa_encrypted_refresh_secret
```

### **2. Push to GitHub**
```bash
# From your client directory
git add .
git commit -m "Add Render deployment config"
git push origin main
```

---

## 🧪 **Testing Your Deployment**

### **1. Health Check**
```bash
curl https://your-app-name.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-XX...",
  "database": "connected",
  "uptime": 123.45
}
```

### **2. API Test**
```bash
curl https://your-app-name.onrender.com/api/auth/test
```

---

## 📱 **Update React Native Configuration**

Once deployed, update your React Native app:

```javascript
// src/service/config.tsx
const USE_CLOUD = true;
const CLOUD_API_URL = 'https://your-app-name.onrender.com';
```

---

## 🔄 **Expected Timeline**

- **Account Setup**: 2 minutes
- **Repository Connection**: 1 minute  
- **Service Configuration**: 3 minutes
- **Deployment**: 5-10 minutes
- **Testing**: 2 minutes

**Total: ~15 minutes to live deployment!**

---

## 💡 **Render.com Advantages**

✅ **Free Forever Plan**
✅ **No Credit Card Required**
✅ **Automatic SSL/HTTPS**
✅ **GitHub Integration**
✅ **Custom Domains**
✅ **Environment Variables**
✅ **Automatic Deployments**
✅ **Build Logs & Monitoring**

---

## 🆘 **If Render Doesn't Work**

### **Backup Option: Vercel**
```bash
npm install -g vercel
cd server
vercel --prod
```

### **Backup Option: Netlify Functions**
Convert to serverless functions (more complex)

---

**🎯 Render.com is your best bet for free, reliable hosting!**
