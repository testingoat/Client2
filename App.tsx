import React, { useEffect } from 'react'
import Navigation from './src/navigation/Navigation'
import FCMService from './src/services/FCMService'
import FirebaseConfig from './src/config/firebase'
import FCMTest from './src/utils/FCMTest'

const App = () => {
  useEffect(() => {
    // Initialize Firebase and FCM service when app starts
    const initializeServices = async () => {
      try {
        // First initialize Firebase
        console.log('🔥 App: Initializing Firebase...');
        const firebaseReady = await FirebaseConfig.initialize();

        if (firebaseReady) {
          console.log('✅ App: Firebase initialized successfully');

          // Then initialize FCM service
          console.log('📱 App: Initializing FCM Service...');
          await FCMService.initialize();
          console.log('🚀 App: FCM Service initialized successfully');

          // Run FCM test after successful initialization
          console.log('🧪 App: Running FCM tests...');
          await FCMTest.runFullTest();
        } else {
          console.warn('⚠️ App: Firebase initialization failed, FCM service may not work properly');
        }
      } catch (error) {
        console.error('❌ App: Service initialization failed:', error);
      }
    };

    initializeServices();
  }, []);

  return (
    <Navigation />
  )
}

export default App