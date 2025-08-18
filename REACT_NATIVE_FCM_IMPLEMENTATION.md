# 🔔 React Native FCM Implementation Guide
## Firebase Cloud Messaging for Multi-App Ecosystem

### 🎯 **Objective**
Implement FCM push notifications in React Native apps using the same Firebase project as your Flutter app.

---

## 🔥 **Firebase Configuration (Reuse Existing)**

### **Existing Firebase Project**
- **Project ID**: `goat-goat-8e3da`
- **Project Name**: Goat Goat
- **Web App ID**: `1:188247457782:web:e0a140ed5104e96c2f91d7`

### **Add React Native Apps to Firebase**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `goat-goat-8e3da`
3. Add Android app:
   - Package name: `com.grocery_app` (your current package)
   - Download `google-services.json`
4. Add iOS app:
   - Bundle ID: `org.reactjs.native.example.grocery_app`
   - Download `GoogleService-Info.plist`

---

## 📦 **Install Dependencies**

### **Core FCM Dependencies**
```bash
# Install React Native Firebase
npm install @react-native-firebase/app @react-native-firebase/messaging

# Install AsyncStorage for token persistence
npm install @react-native-async-storage/async-storage

# Install permissions (Android)
npm install react-native-permissions
```

### **iOS Setup**
```bash
cd ios
pod install
cd ..
```

---

## 🔧 **Configuration Files**

### **Android Configuration**

#### **1. Add google-services.json**
Place the downloaded `google-services.json` in `android/app/`

#### **2. Update android/build.gradle**
```gradle
buildscript {
    dependencies {
        classpath("com.android.tools.build:gradle")
        classpath("com.facebook.react:react-native-gradle-plugin")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin")
        classpath 'com.google.gms:google-services:4.3.15' // Add this
    }
}
```

#### **3. Update android/app/build.gradle**
```gradle
apply plugin: "com.android.application"
apply plugin: "org.jetbrains.kotlin.android"
apply plugin: "com.facebook.react"
apply plugin: 'com.google.gms.google-services' // Add this

dependencies {
    implementation("com.facebook.react:react-android")
    implementation 'com.google.firebase:firebase-messaging:23.1.2' // Add this
    
    if (hermesEnabled.toBoolean()) {
        implementation("com.facebook.react:hermes-android")
    } else {
        implementation jscFlavor
    }
}
```

#### **4. Update AndroidManifest.xml**
```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.VIBRATE" />
    
    <application>
        <!-- FCM Service -->
        <service
            android:name="com.google.firebase.messaging.FirebaseMessagingService"
            android:exported="false">
            <intent-filter>
                <action android:name="com.google.firebase.MESSAGING_EVENT" />
            </intent-filter>
        </service>
        
        <!-- Notification Channel -->
        <meta-data
            android:name="com.google.firebase.messaging.default_notification_channel_id"
            android:value="grocery_app_notifications" />
            
        <!-- Notification Icon -->
        <meta-data
            android:name="com.google.firebase.messaging.default_notification_icon"
            android:resource="@drawable/ic_notification" />
            
        <!-- Notification Color -->
        <meta-data
            android:name="com.google.firebase.messaging.default_notification_color"
            android:resource="@color/notification_color" />
    </application>
</manifest>
```

### **iOS Configuration**

#### **1. Add GoogleService-Info.plist**
Place the downloaded `GoogleService-Info.plist` in `ios/grocery_app/`

#### **2. Update ios/Podfile**
```ruby
platform :ios, min_ios_version_supported
prepare_react_native_project!

target 'grocery_app' do
  config = use_native_modules!
  
  # Add Firebase pods
  pod 'Firebase/Core'
  pod 'Firebase/Messaging'
  
  use_react_native!(
    :path => config[:reactNativePath],
    :app_path => "#{Pod::Config.instance.installation_root}/.."
  )
end
```

---

## 🔔 **FCM Service Implementation**

### **Create FCM Service**
```javascript
// src/services/FCMService.js
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, PermissionsAndroid } from 'react-native';

class FCMService {
  constructor() {
    this.isInitialized = false;
    this.fcmToken = null;
  }

  async initialize() {
    try {
      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('🔔 FCM: Permission denied');
        return false;
      }

      // Get FCM token
      await this.getFCMToken();

      // Set up message handlers
      this.setupMessageHandlers();

      // Subscribe to default topics
      await this.subscribeToDefaultTopics();

      this.isInitialized = true;
      console.log('🔔 FCM: Successfully initialized');
      return true;
    } catch (error) {
      console.error('🔔 FCM: Initialization failed', error);
      return false;
    }
  }

  async requestPermissions() {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      return enabled;
    }

    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }

    return true;
  }

  async getFCMToken() {
    try {
      const token = await messaging().getToken();
      this.fcmToken = token;
      
      // Store token locally
      await AsyncStorage.setItem('fcm_token', token);
      
      // Send token to server
      await this.sendTokenToServer(token);
      
      console.log('🔔 FCM Token:', token.substring(0, 20) + '...');
      
      // Listen for token refresh
      messaging().onTokenRefresh(async (newToken) => {
        this.fcmToken = newToken;
        await AsyncStorage.setItem('fcm_token', newToken);
        await this.sendTokenToServer(newToken);
        console.log('🔔 FCM Token refreshed');
      });
      
    } catch (error) {
      console.error('🔔 FCM: Token retrieval failed', error);
    }
  }

  async sendTokenToServer(token) {
    try {
      // Send token to your backend
      const response = await fetch(`${BASE_URL}/users/fcm-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await AsyncStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ fcmToken: token }),
      });
      
      if (response.ok) {
        console.log('🔔 FCM Token sent to server');
      }
    } catch (error) {
      console.error('🔔 Failed to send token to server', error);
    }
  }

  setupMessageHandlers() {
    // Foreground message handler
    messaging().onMessage(async (remoteMessage) => {
      console.log('🔔 Foreground message:', remoteMessage);
      this.showLocalNotification(remoteMessage);
    });

    // Background message handler
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('🔔 Background message:', remoteMessage);
    });

    // Notification opened handler
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('🔔 Notification opened:', remoteMessage);
      this.handleNotificationTap(remoteMessage);
    });

    // App opened from quit state
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('🔔 App opened from notification:', remoteMessage);
          this.handleNotificationTap(remoteMessage);
        }
      });
  }

  showLocalNotification(remoteMessage) {
    // You can use react-native-push-notification or similar
    // For now, just log the message
    console.log('🔔 Show notification:', remoteMessage.notification?.title);
  }

  handleNotificationTap(remoteMessage) {
    // Handle deep linking based on notification data
    const { data } = remoteMessage;
    
    if (data?.screen) {
      // Navigate to specific screen
      console.log('🔔 Navigate to:', data.screen);
      // NavigationService.navigate(data.screen, data.params);
    }
  }

  async subscribeToDefaultTopics() {
    try {
      // Subscribe to user-type specific topics
      await messaging().subscribeToTopic('all_users');
      await messaging().subscribeToTopic('buyer_notifications');
      
      console.log('🔔 Subscribed to default topics');
    } catch (error) {
      console.error('🔔 Topic subscription failed', error);
    }
  }

  async subscribeToTopic(topic) {
    try {
      await messaging().subscribeToTopic(topic);
      console.log(`🔔 Subscribed to topic: ${topic}`);
      return true;
    } catch (error) {
      console.error(`🔔 Failed to subscribe to topic: ${topic}`, error);
      return false;
    }
  }

  async unsubscribeFromTopic(topic) {
    try {
      await messaging().unsubscribeFromTopic(topic);
      console.log(`🔔 Unsubscribed from topic: ${topic}`);
      return true;
    } catch (error) {
      console.error(`🔔 Failed to unsubscribe from topic: ${topic}`, error);
      return false;
    }
  }
}

export default new FCMService();
```

---

## 🚀 **Initialize FCM in App**

### **Update App.tsx**
```javascript
// App.tsx
import React, { useEffect } from 'react';
import FCMService from './src/services/FCMService';

const App = () => {
  useEffect(() => {
    initializeFCM();
  }, []);

  const initializeFCM = async () => {
    try {
      const initialized = await FCMService.initialize();
      if (initialized) {
        console.log('✅ FCM initialized successfully');
      } else {
        console.log('❌ FCM initialization failed');
      }
    } catch (error) {
      console.error('❌ FCM initialization error:', error);
    }
  };

  return (
    // Your app components
  );
};

export default App;
```

---

## 🔧 **Backend Integration**

### **Add FCM Token Endpoint**
```javascript
// server/src/routes/users.js
app.post('/users/fcm-token', async (request, reply) => {
  try {
    const { fcmToken } = request.body;
    const userId = request.user.id; // From JWT middleware
    
    // Update user's FCM token in database
    await User.findByIdAndUpdate(userId, { 
      fcmToken,
      lastTokenUpdate: new Date()
    });
    
    reply.send({ success: true, message: 'FCM token updated' });
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
});
```

### **Send Push Notifications**
```javascript
// server/src/services/NotificationService.js
import admin from 'firebase-admin';

// Initialize Firebase Admin (use your service account key)
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: 'goat-goat-8e3da',
    clientEmail: 'your-service-account@goat-goat-8e3da.iam.gserviceaccount.com',
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

export const sendPushNotification = async (tokens, title, body, data = {}) => {
  try {
    const message = {
      notification: { title, body },
      data,
      tokens: Array.isArray(tokens) ? tokens : [tokens],
    };
    
    const response = await admin.messaging().sendMulticast(message);
    console.log('🔔 Push notification sent:', response.successCount);
    return response;
  } catch (error) {
    console.error('🔔 Push notification failed:', error);
    throw error;
  }
};

export const sendTopicNotification = async (topic, title, body, data = {}) => {
  try {
    const message = {
      notification: { title, body },
      data,
      topic,
    };
    
    const response = await admin.messaging().send(message);
    console.log('🔔 Topic notification sent:', response);
    return response;
  } catch (error) {
    console.error('🔔 Topic notification failed:', error);
    throw error;
  }
};
```

---

## 🧪 **Testing FCM Implementation**

### **Test Push Notifications**
```bash
# Test from Firebase Console
# Go to Firebase Console > Cloud Messaging > Send test message
# Use your FCM token to send a test notification

# Test from backend
curl -X POST https://your-app-name.railway.app/api/test/notification \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "body": "FCM working!"}'
```

### **Debug Common Issues**
```javascript
// Add debug logging
console.log('🔔 FCM Token:', await messaging().getToken());
console.log('🔔 Permission status:', await messaging().hasPermission());
console.log('🔔 Is device registered:', await messaging().isDeviceRegisteredForRemoteMessages());
```

---

## 📱 **Multi-App Topic Strategy**

### **Topic Naming Convention**
```javascript
// User-specific
`user_${userId}`

// App-specific  
'buyer_notifications'
'seller_notifications'
'delivery_notifications'

// Location-based
`city_${cityName}`
`area_${areaCode}`

// Order-specific
`order_${orderId}`

// System-wide
'all_users'
'maintenance_alerts'
'promotional_offers'
```

### **Dynamic Topic Subscription**
```javascript
// Subscribe based on user type and location
const subscribeToRelevantTopics = async (userType, location) => {
  await FCMService.subscribeToTopic(`${userType}_notifications`);
  await FCMService.subscribeToTopic(`city_${location.city}`);
  await FCMService.subscribeToTopic('all_users');
};
```

---

**🎯 This FCM implementation will provide the same notification capabilities as your Flutter app across all React Native apps in the ecosystem!**
