import { getApps, getApp } from '@react-native-firebase/app';
import { Platform } from 'react-native';

class FirebaseConfig {
  private static instance: FirebaseConfig;
  private isInitialized: boolean = false;

  private constructor() {}

  public static getInstance(): FirebaseConfig {
    if (!FirebaseConfig.instance) {
      FirebaseConfig.instance = new FirebaseConfig();
    }
    return FirebaseConfig.instance;
  }

  public async initialize(): Promise<boolean> {
    try {
      console.log('🔥 Initializing Firebase configuration...');

      // Check if Firebase is already initialized
      if (this.isInitialized) {
        console.log('✅ Firebase already initialized');
        return true;
      }

      // For Android, Firebase should auto-initialize from google-services.json
      // Wait a bit longer for auto-initialization
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        try {
          const apps = getApps();
          if (apps.length > 0) {
            console.log('✅ Firebase app detected:', apps[0].name);
            console.log('📱 Firebase options:', apps[0].options);
            this.isInitialized = true;
            return true;
          }
        } catch (error) {
          console.log(`⏳ Firebase check attempt ${attempts + 1}/${maxAttempts}:`, error.message);
        }

        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }

      // If we reach here, Firebase didn't auto-initialize
      console.error('❌ Firebase failed to auto-initialize after', maxAttempts, 'attempts');
      console.log('💡 Check google-services.json package name matches com.grocery_app');
      return false;

    } catch (error) {
      console.error('❌ Firebase initialization error:', error);
      return false;
    }
  }

  public isFirebaseReady(): boolean {
    return this.isInitialized && getApps().length > 0;
  }

  public getFirebaseApp() {
    if (!this.isFirebaseReady()) {
      throw new Error('Firebase is not initialized. Call initialize() first.');
    }
    return getApp();
  }

  public async waitForFirebase(timeoutMs: number = 10000): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      if (this.isFirebaseReady()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return false;
  }
}

export default FirebaseConfig.getInstance();
