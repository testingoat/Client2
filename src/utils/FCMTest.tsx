import messaging from '@react-native-firebase/messaging';
import { getApps } from '@react-native-firebase/app';

class FCMTest {
  static async testFirebaseConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing Firebase connection...');
      
      // Check if Firebase apps are available
      const apps = getApps();
      console.log('📱 Firebase apps available:', apps.length);
      
      if (apps.length === 0) {
        console.error('❌ No Firebase apps found');
        return false;
      }
      
      console.log('✅ Firebase app found:', apps[0].name);
      return true;
    } catch (error) {
      console.error('❌ Firebase connection test failed:', error);
      return false;
    }
  }

  static async testFCMToken(): Promise<string | null> {
    try {
      console.log('🧪 Testing FCM token generation...');
      
      // Test Firebase connection first
      const firebaseReady = await this.testFirebaseConnection();
      if (!firebaseReady) {
        console.error('❌ Firebase not ready, cannot test FCM token');
        return null;
      }
      
      // Try to get FCM token
      const token = await messaging().getToken();
      
      if (token) {
        console.log('✅ FCM Token generated successfully!');
        console.log('📱 Token (first 20 chars):', token.substring(0, 20) + '...');
        return token;
      } else {
        console.error('❌ Failed to generate FCM token');
        return null;
      }
    } catch (error) {
      console.error('❌ FCM token test failed:', error);
      return null;
    }
  }

  static async runFullTest(): Promise<void> {
    console.log('🚀 Starting FCM Full Test...');
    console.log('================================');
    
    // Test 1: Firebase Connection
    const firebaseReady = await this.testFirebaseConnection();
    console.log('🔥 Firebase Connection:', firebaseReady ? '✅ PASS' : '❌ FAIL');
    
    if (!firebaseReady) {
      console.log('❌ Stopping tests - Firebase not available');
      return;
    }
    
    // Test 2: FCM Token Generation
    const token = await this.testFCMToken();
    console.log('📱 FCM Token Generation:', token ? '✅ PASS' : '❌ FAIL');
    
    // Test 3: Messaging Service
    try {
      const messaging_instance = messaging();
      console.log('📨 Messaging Service:', messaging_instance ? '✅ PASS' : '❌ FAIL');
    } catch (error) {
      console.log('📨 Messaging Service: ❌ FAIL -', error);
    }
    
    console.log('================================');
    console.log('🏁 FCM Test Complete!');
    
    if (firebaseReady && token) {
      console.log('🎉 All tests passed! FCM is working properly.');
    } else {
      console.log('⚠️ Some tests failed. Check the logs above.');
    }
  }
}

export default FCMTest;
