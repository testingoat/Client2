import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navigation from '@navigation/Navigation';
import FirebaseConfig from '@config/firebase';
import FCMService from './src/services/FCMService';
import FCMTest from './src/utils/FCMTest';

const queryClient = new QueryClient();

const App: React.FC = () => {
  useEffect(() => {
    const initializeServices = async () => {
      try {
        console.log('dY"� App: Initializing Firebase...');
        const firebaseReady = await FirebaseConfig.initialize();

        if (firebaseReady) {
          console.log('�o. App: Firebase initialized successfully');

          console.log('dY"� App: Initializing FCM Service...');
          await FCMService.initialize();
          console.log('dYs? App: FCM Service initialized successfully');

          console.log('dY� App: Running FCM tests...');
          await FCMTest.runFullTest();
        } else {
          console.warn('�s��,? App: Firebase initialization failed, FCM service may not work properly');
        }
      } catch (error) {
        console.error('�?O App: Service initialization failed:', error);
      }
    };

    initializeServices();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Navigation />
    </QueryClientProvider>
  );
};

export default App;
