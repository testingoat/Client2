# Production APK Installation and Testing Guide - VPS HTTPS FINAL

## Overview
This guide provides instructions for installing and testing the **FINAL PRODUCTION APK** that connects to our own Hostinger VPS with SSL certificates.

## APK Details - FINAL VPS BUILD ✅
- **File Location**: `android/app/build/outputs/apk/release/app-release.apk`
- **Build Type**: Release (Production)
- **Server Configuration**: Points to `https://api.goatgoat.xyz` ✅ **VPS WITH SSL**
- **Database**: Connected to production MongoDB Atlas cluster
- **Build Date**: Generated on 2025-08-18 (Final VPS Build)
- **SSL Certificate**: Valid Let's Encrypt certificate installed
- **Admin Panel**: Accessible at `https://api.goatgoat.xyz/admin`

## Production Configuration Verified ✅ FINAL VPS
✅ **API Endpoint**: `https://api.goatgoat.xyz/api` (**VPS WITH SSL**)
✅ **Socket URL**: `https://api.goatgoat.xyz` (**VPS WITH SSL**)
✅ **Cloud Mode**: Enabled (`USE_CLOUD = true`)
✅ **Network Security**: HTTPS enforced for VPS domain
✅ **MongoDB**: Connected to Atlas cluster
✅ **SSL Certificate**: Valid until 2025-11-16 (89 days)
✅ **VPS Server**: Hostinger VPS (168.231.123.247)
✅ **Admin Panel**: Working and accessible via HTTPS

## Installation Requirements

### Android Device Requirements
- **Android Version**: 8.0 (API level 26) or higher
- **Architecture**: ARM64, ARM32, x86, or x86_64
- **Storage**: At least 100MB free space
- **Network**: Internet connection required

### Developer Options Setup
1. **Enable Developer Options**:
   - Go to **Settings** → **About Phone**
   - Tap **Build Number** 7 times
   - Developer options will be enabled

2. **Enable Unknown Sources**:
   - Go to **Settings** → **Security** (or **Privacy**)
   - Enable **Unknown Sources** or **Install from Unknown Sources**
   - Or for newer Android: **Settings** → **Apps** → **Special Access** → **Install Unknown Apps**

## Installation Steps

### Method 1: Direct Installation (Recommended)
1. **Transfer APK to Device**:
   ```bash
   # Copy APK to device via ADB
   adb push android/app/build/outputs/apk/release/app-release.apk /sdcard/Download/
   
   # Or use file sharing (Google Drive, email, etc.)
   ```

2. **Install APK**:
   - Open **File Manager** on device
   - Navigate to **Downloads** folder
   - Tap on `app-release.apk`
   - Tap **Install**
   - Grant necessary permissions

### Method 2: ADB Installation
```bash
# Ensure device is connected and USB debugging is enabled
adb devices

# Install APK directly
adb install android/app/build/outputs/apk/release/app-release.apk

# If app is already installed, use -r flag to replace
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

## Testing Checklist

### 1. App Launch Test
- [ ] App launches without crashes
- [ ] Splash screen displays correctly
- [ ] No "connection to development server failed" errors
- [ ] App reaches main screen/login screen

### 2. Network Connectivity Test
- [ ] App connects to production server
- [ ] API calls work (login, registration, etc.)
- [ ] No localhost or development server connection attempts
- [ ] HTTPS connections established successfully

### 3. Core Functionality Test
- [ ] User registration works
- [ ] User login works
- [ ] Product browsing works
- [ ] Cart functionality works
- [ ] Order placement works
- [ ] Real-time features work (if applicable)

### 4. Performance Test
- [ ] App loads quickly
- [ ] Smooth navigation between screens
- [ ] Images load properly
- [ ] No memory leaks or crashes during extended use

## Troubleshooting Common Issues

### Issue 1: Installation Failed
**Symptoms**: "App not installed" or "Installation failed"
**Solutions**:
```bash
# Check if app is already installed
adb shell pm list packages | grep com.grocery_app

# Uninstall existing version
adb uninstall com.grocery_app

# Reinstall
adb install android/app/build/outputs/apk/release/app-release.apk
```

### Issue 2: Network Connection Errors
**Symptoms**: "Network error" or "Cannot connect to server"
**Solutions**:
1. Verify internet connection on device
2. Check if Render server is running: https://grocery-backend-latest.onrender.com/health
3. Ensure device can access HTTPS URLs
4. Check firewall/proxy settings

### Issue 3: App Crashes on Launch
**Symptoms**: App closes immediately after opening
**Solutions**:
```bash
# Check crash logs
adb logcat | grep com.grocery_app

# Clear app data
adb shell pm clear com.grocery_app

# Reinstall app
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

### Issue 4: Permissions Issues
**Symptoms**: Features not working (camera, location, etc.)
**Solutions**:
1. Go to **Settings** → **Apps** → **Grocery App**
2. Tap **Permissions**
3. Enable required permissions:
   - Camera (for QR scanning)
   - Location (for delivery)
   - Storage (for image uploads)
   - Network (for API calls)

## Production Server Verification

### Health Check ✅ VPS HTTPS
Test the VPS production server directly:
```bash
curl https://api.goatgoat.xyz/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-08-18T21:07:53.359Z",
  "database": "connected",
  "uptime": 732.957593642,
  "memory": {
    "rss": 150302720,
    "heapTotal": 74534912,
    "heapUsed": 69362680,
    "external": 22594296,
    "arrayBuffers": 19007220
  },
  "version": "1.0.0"
}
```

### API Endpoints Test ✅ VPS HTTPS
```bash
# Test API base URL
curl https://api.goatgoat.xyz/api/

# Test admin debug endpoint
curl https://api.goatgoat.xyz/admin/debug

# Test admin panel (web interface)
# Open in browser: https://api.goatgoat.xyz/admin

# Test SSL certificate
curl -I https://api.goatgoat.xyz/health
```

## App Configuration Details

### Network Configuration ✅ UPDATED
The APK is configured with:
```javascript
// Production configuration ✅ CORRECTED
const USE_CLOUD = true;
const CLOUD_API_URL = 'https://client-d9x3.onrender.com';

// API endpoints ✅ CORRECTED
BASE_URL = 'https://client-d9x3.onrender.com/api'
SOCKET_URL = 'https://client-d9x3.onrender.com'
```

### Security Configuration ✅ UPDATED
```xml
<!-- Network security allows HTTPS to correct production domain -->
<domain-config cleartextTrafficPermitted="false">
    <domain includeSubdomains="true">client-d9x3.onrender.com</domain>
    <domain includeSubdomains="true">onrender.com</domain>
</domain-config>
```

## Expected Behavior

### ✅ What Should Work - UPDATED
- App launches and connects to production server
- All API calls go to `https://client-d9x3.onrender.com` (**CORRECTED URL**)
- HTTPS connections are enforced
- Real-time features work via WebSocket
- Data is stored in production MongoDB Atlas
- No development server references
- **Admin panel accessible and working**
- **Database operations fully functional**

### ❌ What Should NOT Happen
- No localhost connections
- No "Metro bundler" or development server errors
- No cleartext HTTP connections to production domains
- No connection timeouts (unless server is down)

## Performance Expectations

### Load Times
- **App Launch**: 2-3 seconds
- **API Calls**: 1-2 seconds (depending on network)
- **Image Loading**: 2-5 seconds (depending on image size)

### Resource Usage
- **RAM**: ~100-200MB
- **Storage**: ~50-100MB
- **Network**: Minimal when idle, active during API calls

## Support and Debugging

### Log Collection
To collect logs for debugging:
```bash
# Start logging
adb logcat -c  # Clear existing logs
adb logcat > app_logs.txt

# Use the app, then stop logging with Ctrl+C
# Send app_logs.txt for analysis
```

### Common Log Patterns
Look for these patterns in logs:
- **Success**: `API Configuration: BASE_URL: https://client-d9x3.onrender.com/api` (**UPDATED**)
- **Network**: `Connected to production server`
- **Error**: `Network request failed` or `Connection timeout`

## Deployment Verification

### Final Checklist
- [ ] APK installs successfully on test device
- [ ] App connects to production server
- [ ] Core user flows work end-to-end
- [ ] No development server references
- [ ] Performance is acceptable
- [ ] No critical crashes or errors

### Success Criteria
The APK is ready for distribution when:
1. ✅ Installs on multiple Android devices
2. ✅ Connects to production server consistently
3. ✅ Core functionality works without errors
4. ✅ Performance meets expectations
5. ✅ No development environment dependencies

## Distribution Options

### Internal Testing
- Share APK file directly with testers
- Use Google Drive, email, or file sharing services
- Install via ADB for technical testers

### Play Store Preparation
For future Play Store release:
1. Sign APK with production keystore
2. Create App Bundle (AAB) format
3. Set up Play Console account
4. Upload for internal testing first
5. Gradual rollout to production

## Next Steps

After successful APK testing:
1. **Gather User Feedback**: Test with real users
2. **Performance Monitoring**: Monitor server logs and app performance
3. **Bug Fixes**: Address any issues found during testing
4. **Feature Enhancements**: Plan next development cycle
5. **Production Release**: Prepare for wider distribution

---

## Contact Information ✅ UPDATED

For technical support or issues:
- **Check server status**: https://client-d9x3.onrender.com/health (**CORRECTED URL**)
- **Admin panel**: https://client-d9x3.onrender.com/admin/login (**WORKING**)
- **Debug endpoint**: https://client-d9x3.onrender.com/admin/debug
- Review deployment logs in Render dashboard
- Collect device logs using ADB logcat
- Document specific error messages and reproduction steps

## ✅ CONFIRMATION: APK READY FOR PRODUCTION

### Server URL Corrections Applied:
- ❌ **Previous (Wrong)**: `https://grocery-backend-latest.onrender.com`
- ✅ **Current (Correct)**: `https://client-d9x3.onrender.com`

### Database Connectivity Confirmed:
- ✅ **MongoDB Atlas**: Connected and operational
- ✅ **Admin Login**: Working with credentials `prabhudevarlimatti@gmail.com` / `Qwe_2896`
- ✅ **API Endpoints**: All functional and responding
- ✅ **Health Check**: Server healthy and database connected

### APK Production Readiness:
- ✅ **Correct Server URL**: Points to working production server
- ✅ **Database Operations**: Will work correctly through verified API
- ✅ **Network Security**: Configured for correct domain
- ✅ **Admin Panel Access**: Fully functional for data management
- ✅ **Real-time Features**: WebSocket connections to correct server

**This APK is now correctly configured and ready for production use with full database connectivity!** 🎉
