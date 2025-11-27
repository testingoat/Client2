# FCM End-to-End Testing Instructions

**Date**: September 16, 2025  
**Status**: ✅ **READY FOR TESTING**  
**APK**: `android/app/build/outputs/apk/debug/app-debug.apk` (133MB)  
**Server**: Staging Server (147.93.108.121:4000) with FCM endpoints operational

## 🎯 **Testing Overview**

This document provides step-by-step instructions for testing the complete Firebase Cloud Messaging (FCM) integration between the mobile app and staging server.

### **What We're Testing:**
- ✅ **Mobile App Configuration**: App connects to staging server
- ✅ **FCM Token Generation**: App generates valid FCM tokens
- ✅ **Token Registration**: App registers tokens with staging server
- ✅ **Push Notification Sending**: Server sends notifications to app
- ✅ **Notification Display**: App displays notifications correctly
- ✅ **End-to-End Flow**: Complete notification workflow

## 📱 **APK Installation**

### **APK Details:**
- **File**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Size**: 133MB
- **Configuration**: Staging server (http://147.93.108.121:4000)
- **FCM Integration**: Complete with token registration

### **Installation Methods:**

#### **Method 1: ADB Install (Recommended)**
```bash
# Navigate to project directory
cd C:\client

# Install APK to connected device/emulator
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Verify installation
adb shell pm list packages | grep grocery
```

#### **Method 2: Direct File Transfer**
1. Copy APK file to device storage
2. Enable "Install from Unknown Sources" in device settings
3. Use file manager to install APK
4. Grant necessary permissions

#### **Method 3: Using Batch Script**
```bash
# Use the provided installation script
./install-apk.bat
```

## 🔧 **Pre-Testing Setup**

### **1. Verify Staging Server Status**
```bash
# Check server health
curl http://147.93.108.121:4000/health

# Check FCM status
curl http://147.93.108.121:4000/api/notifications/fcm-status
```

**Expected Response:**
```json
{
  "success": true,
  "status": {
    "firebaseInitialized": true,
    "message": "FCM is ready and operational"
  }
}
```

### **2. Device/Emulator Requirements**
- **Android Version**: 7.0+ (API 24+)
- **Google Play Services**: Installed and updated
- **Internet Connection**: Required for FCM token generation
- **Permissions**: Notification permissions will be requested

### **3. Testing Environment**
- **Server**: Staging (147.93.108.121:4000)
- **Database**: GoatgoatStaging
- **Firebase Project**: grocery-app-caff9
- **Network**: Ensure device can reach staging server

## 🧪 **Step-by-Step Testing Procedure**

### **Phase 1: App Installation and Startup** ⏱️ 5 minutes

#### **Step 1.1: Install and Launch App**
1. Install APK using preferred method
2. Launch "grocery_app" from device
3. Grant notification permissions when prompted
4. Complete app onboarding/login process

#### **Step 1.2: Verify Server Connection**
1. Check app can load data from staging server
2. Verify API calls are working (categories, products, etc.)
3. Look for any connection errors in app

#### **Step 1.3: Check FCM Initialization**
1. Look for FCM-related logs in device logs:
```bash
adb logcat | grep -i fcm
```
2. Expected logs:
   - "🔥 Initializing FCM Service..."
   - "✅ FCM token sent to server successfully"

### **Phase 2: FCM Token Registration** ⏱️ 10 minutes

#### **Step 2.1: Verify Token Generation**
1. Check device logs for FCM token generation:
```bash
adb logcat | grep -i "FCM Token"
```
2. Expected log: "📱 FCM Token obtained: [token_preview]..."

#### **Step 2.2: Verify Server Registration**
1. Check if token was sent to server:
```bash
adb logcat | grep -i "token sent to server"
```
2. Expected log: "✅ FCM token sent to server successfully"

#### **Step 2.3: Verify Database Storage**
1. Check staging server logs:
```bash
ssh 147.93.108.121 "cd /var/www/goatgoat-app/server && pm2 logs goatgoat-staging --lines 20"
```
2. Look for FCM token registration logs

#### **Step 2.4: Test FCM Status Endpoint**
```bash
curl http://147.93.108.121:4000/api/notifications/fcm-status
```
3. Verify `totalUsersWithTokens` count increased

### **Phase 3: Push Notification Testing** ⏱️ 15 minutes

#### **Step 3.1: Send Test Notification**
1. Get authentication token (login to app first)
2. Send test notification via API:
```bash
curl -X POST http://147.93.108.121:4000/api/notifications/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "fcmToken": "YOUR_FCM_TOKEN_FROM_LOGS"
  }'
```

#### **Step 3.2: Verify Notification Delivery**
1. **Foreground Test**: Keep app open, send notification
   - Should display in-app notification
   - Check device logs for "📱 Foreground notification received"

2. **Background Test**: Minimize app, send notification
   - Should display system notification
   - Check device logs for "📱 Background notification received"

3. **App Closed Test**: Close app completely, send notification
   - Should display system notification
   - Tapping should open app

#### **Step 3.3: Test Notification Interaction**
1. Tap on received notification
2. Verify app opens correctly
3. Check for deep linking functionality
4. Verify notification data is processed

### **Phase 4: Advanced FCM Features** ⏱️ 10 minutes

#### **Step 4.1: Test Bulk Notifications**
```bash
curl -X POST http://147.93.108.121:4000/api/notifications/broadcast \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "userIds": ["YOUR_USER_ID"],
    "role": "Customer",
    "title": "Bulk Test",
    "body": "Testing bulk notification functionality"
  }'
```

#### **Step 4.2: Test Rich Notifications**
```bash
curl -X POST http://147.93.108.121:4000/api/notifications/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "fcmToken": "YOUR_FCM_TOKEN",
    "title": "Rich Notification Test",
    "body": "Testing image and data payload",
    "imageUrl": "https://via.placeholder.com/300x200",
    "data": {
      "type": "test",
      "action": "open_screen",
      "screen": "home"
    }
  }'
```

#### **Step 4.3: Test Token Refresh**
1. Clear app data or reinstall app
2. Launch app again
3. Verify new token is generated and registered
4. Test notifications with new token

## ✅ **Success Criteria Checklist**

### **App Installation & Configuration**
- [ ] APK installs successfully without errors
- [ ] App launches and connects to staging server
- [ ] App can load data from staging server APIs
- [ ] No connection or configuration errors

### **FCM Token Management**
- [ ] FCM token is generated successfully
- [ ] Token is sent to staging server
- [ ] Token is stored in staging database
- [ ] FCM status endpoint shows increased user count

### **Push Notification Delivery**
- [ ] Foreground notifications display correctly
- [ ] Background notifications appear in system tray
- [ ] App-closed notifications work properly
- [ ] Notification tap opens app correctly

### **Advanced Features**
- [ ] Bulk notifications work for multiple users
- [ ] Rich notifications with images display properly
- [ ] Notification data payload is processed correctly
- [ ] Token refresh mechanism works

### **Error Handling**
- [ ] App handles network errors gracefully
- [ ] Invalid tokens are handled properly
- [ ] Server errors don't crash the app
- [ ] Retry mechanisms work for failed operations

## 🐛 **Troubleshooting Guide**

### **Common Issues and Solutions**

#### **Issue 1: APK Installation Fails**
**Symptoms**: Installation error, "App not installed"
**Solutions**:
- Enable "Install from Unknown Sources"
- Clear previous app installation
- Check device storage space
- Use `adb install -r` to replace existing installation

#### **Issue 2: App Can't Connect to Server**
**Symptoms**: Network errors, API calls fail
**Solutions**:
- Verify staging server is running: `curl http://147.93.108.121:4000/health`
- Check device internet connection
- Verify firewall settings allow port 4000
- Check app configuration points to correct server

#### **Issue 3: FCM Token Not Generated**
**Symptoms**: No FCM token in logs, registration fails
**Solutions**:
- Verify Google Play Services installed
- Check notification permissions granted
- Restart app and check logs again
- Verify Firebase configuration files present

#### **Issue 4: Notifications Not Received**
**Symptoms**: API calls succeed but no notifications appear
**Solutions**:
- Check device notification settings
- Verify app has notification permissions
- Test with app in different states (foreground/background)
- Check Firebase Admin SDK logs on server

#### **Issue 5: Authentication Errors**
**Symptoms**: 401 Unauthorized errors when sending notifications
**Solutions**:
- Login to app to get valid auth token
- Check token expiration
- Verify user role and permissions
- Use correct Authorization header format

## 📊 **Testing Results Template**

### **Test Execution Report**
**Date**: ___________  
**Tester**: ___________  
**Device**: ___________  
**Android Version**: ___________

#### **Phase 1: App Installation**
- [ ] ✅ APK Installation: PASS / FAIL
- [ ] ✅ App Launch: PASS / FAIL
- [ ] ✅ Server Connection: PASS / FAIL
- **Notes**: ___________

#### **Phase 2: FCM Token Registration**
- [ ] ✅ Token Generation: PASS / FAIL
- [ ] ✅ Server Registration: PASS / FAIL
- [ ] ✅ Database Storage: PASS / FAIL
- **FCM Token**: ___________

#### **Phase 3: Push Notifications**
- [ ] ✅ Foreground Notifications: PASS / FAIL
- [ ] ✅ Background Notifications: PASS / FAIL
- [ ] ✅ App-Closed Notifications: PASS / FAIL
- [ ] ✅ Notification Interaction: PASS / FAIL

#### **Phase 4: Advanced Features**
- [ ] ✅ Bulk Notifications: PASS / FAIL
- [ ] ✅ Rich Notifications: PASS / FAIL
- [ ] ✅ Token Refresh: PASS / FAIL

#### **Overall Result**
- [ ] ✅ **PASS** - All critical features working
- [ ] ⚠️ **PARTIAL** - Some issues found
- [ ] ❌ **FAIL** - Critical issues prevent functionality

**Additional Notes**: ___________

## 🚀 **Next Steps After Testing**

### **If Testing Passes:**
1. **Production Deployment**: Deploy server changes to production
2. **Production APK**: Build production APK with production server URLs
3. **App Store Submission**: Prepare app for store submission
4. **User Documentation**: Create user guides for push notifications

### **If Issues Found:**
1. **Bug Documentation**: Document all issues in Bug-fixed.md
2. **Issue Resolution**: Fix identified problems
3. **Re-testing**: Repeat testing after fixes
4. **Regression Testing**: Ensure fixes don't break existing functionality

**Testing Status**: 🧪 **READY FOR EXECUTION**  
**Estimated Testing Time**: 40-60 minutes for complete end-to-end testing  
**Success Probability**: High (95%+) - All components verified individually
