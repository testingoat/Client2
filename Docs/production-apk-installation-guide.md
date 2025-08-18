# Production APK Installation and Testing Guide

## Overview
This guide provides instructions for installing and testing the production APK that connects to the deployed Render server.

## APK Details
- **File Location**: `android/app/build/outputs/apk/release/app-release.apk`
- **Build Type**: Release (Production)
- **Server Configuration**: Points to `https://grocery-backend-latest.onrender.com`
- **Database**: Connected to production MongoDB Atlas cluster
- **Build Date**: Generated on 2025-08-18

## Production Configuration Verified
✅ **API Endpoint**: `https://grocery-backend-latest.onrender.com/api`  
✅ **Socket URL**: `https://grocery-backend-latest.onrender.com`  
✅ **Cloud Mode**: Enabled (`USE_CLOUD = true`)  
✅ **Network Security**: HTTPS enforced for production domains  
✅ **MongoDB**: Connected to Atlas cluster  

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

### Health Check
Test the production server directly:
```bash
curl https://grocery-backend-latest.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-08-18T...",
  "database": "connected",
  "uptime": 123.45,
  "memory": {...},
  "version": "1.0.0"
}
```

### API Endpoints Test
```bash
# Test API base URL
curl https://grocery-backend-latest.onrender.com/api/

# Test specific endpoints (if available)
curl https://grocery-backend-latest.onrender.com/api/auth/test
```

## App Configuration Details

### Network Configuration
The APK is configured with:
```javascript
// Production configuration
const USE_CLOUD = true;
const CLOUD_API_URL = 'https://grocery-backend-latest.onrender.com';

// API endpoints
BASE_URL = 'https://grocery-backend-latest.onrender.com/api'
SOCKET_URL = 'https://grocery-backend-latest.onrender.com'
```

### Security Configuration
```xml
<!-- Network security allows HTTPS to production domains -->
<domain-config cleartextTrafficPermitted="false">
    <domain includeSubdomains="true">grocery-backend-latest.onrender.com</domain>
    <domain includeSubdomains="true">onrender.com</domain>
</domain-config>
```

## Expected Behavior

### ✅ What Should Work
- App launches and connects to production server
- All API calls go to `https://grocery-backend-latest.onrender.com`
- HTTPS connections are enforced
- Real-time features work via WebSocket
- Data is stored in production MongoDB Atlas
- No development server references

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
- **Success**: `API Configuration: BASE_URL: https://grocery-backend-latest.onrender.com/api`
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

## Contact Information

For technical support or issues:
- Check server status: https://grocery-backend-latest.onrender.com/health
- Review deployment logs in Render dashboard
- Collect device logs using ADB logcat
- Document specific error messages and reproduction steps
