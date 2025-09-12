import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationManager from '@utils/NotificationManager';

const FCM_TOKEN_KEY = 'fcm_token';
const FCM_PERMISSION_REQUESTED = 'fcm_permission_requested';

class FCMService {
  private fcmToken: string | null = null;
  private isInitialized: boolean = false;

  async initialize(): Promise<void> {
    try {
      console.log('🔥 Initializing FCM Service...');

      // Skip Firebase dependency check for now - try direct FCM
      console.log('📱 Attempting direct FCM initialization...');

      // Check if device is registered for remote messages (Android only)
      if (Platform.OS === 'android') {
        try {
          if (!messaging().isDeviceRegisteredForRemoteMessages) {
            await messaging().registerDeviceForRemoteMessages();
            console.log('✅ Device registered for remote messages');
          }
        } catch (error) {
          console.log('⚠️ Device registration not required or already done');
        }
      }

      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn('⚠️ FCM: Notification permissions not granted');
        return;
      }

      // Get FCM token
      await this.getFCMToken();

      // Set up message handlers
      this.setupMessageHandlers();

      // Set up token refresh listener
      this.setupTokenRefreshListener();

      this.isInitialized = true;
      console.log('✅ FCM Service initialized successfully');
    } catch (error) {
      console.error('❌ FCM Service initialization failed:', error);
      console.log('💡 Error details:', error.message);
    }
  }



  private async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          console.log('iOS: FCM permission not granted');
          return false;
        }
      } else if (Platform.OS === 'android') {
        // For Android 13+ (API level 33+), we need to request POST_NOTIFICATIONS permission
        if (Platform.Version >= 33) {
          const hasRequested = await AsyncStorage.getItem(FCM_PERMISSION_REQUESTED);
          
          if (!hasRequested) {
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
              {
                title: 'Notification Permission',
                message: 'This app needs notification permission to send you updates about your orders and deliveries.',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
              }
            );

            await AsyncStorage.setItem(FCM_PERMISSION_REQUESTED, 'true');

            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
              console.log('Android: Notification permission not granted');
              return false;
            }
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Error requesting FCM permissions:', error);
      return false;
    }
  }

  private async getFCMToken(): Promise<string | null> {
    try {
      // Get cached token first
      const cachedToken = await AsyncStorage.getItem(FCM_TOKEN_KEY);
      
      // Get fresh token from Firebase
      const token = await messaging().getToken();
      
      if (token) {
        this.fcmToken = token;
        
        // Cache the token
        await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
        
        // Send token to server if it's new or different
        if (token !== cachedToken) {
          await this.sendTokenToServer(token);
        }
        
        console.log('📱 FCM Token obtained:', token.substring(0, 20) + '...');
        return token;
      } else {
        console.warn('Failed to get FCM token');
        return null;
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  private async sendTokenToServer(token: string): Promise<void> {
    try {
      // TODO: Replace with your actual server endpoint
      const serverEndpoint = 'YOUR_SERVER_ENDPOINT/api/users/fcm-token';
      
      console.log('📤 Sending FCM token to server...');
      
      // For now, just log the token since server integration is ready
      console.log('FCM Token to send to server:', token);
      
      // Uncomment when ready to integrate with your server
      /*
      const response = await fetch(serverEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_AUTH_TOKEN', // Add your auth token
        },
        body: JSON.stringify({
          fcmToken: token,
          platform: Platform.OS,
          deviceId: 'DEVICE_ID', // Add device ID if available
        }),
      });

      if (response.ok) {
        console.log('✅ FCM token sent to server successfully');
      } else {
        console.error('❌ Failed to send FCM token to server:', response.status);
      }
      */
    } catch (error) {
      console.error('Error sending FCM token to server:', error);
    }
  }

  private setupMessageHandlers(): void {
    // Handle background messages
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('📨 Background message received:', remoteMessage);
      await this.handleBackgroundMessage(remoteMessage);
    });

    // Handle foreground messages
    messaging().onMessage(async (remoteMessage) => {
      console.log('📨 Foreground message received:', remoteMessage);
      await this.handleForegroundMessage(remoteMessage);
    });

    // Handle notification opened app
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('📱 Notification opened app:', remoteMessage);
      this.handleNotificationOpened(remoteMessage);
    });

    // Check if app was opened from a notification
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('📱 App opened from notification:', remoteMessage);
          this.handleNotificationOpened(remoteMessage);
        }
      });
  }

  private setupTokenRefreshListener(): void {
    messaging().onTokenRefresh(async (token) => {
      console.log('🔄 FCM Token refreshed:', token.substring(0, 20) + '...');
      this.fcmToken = token;
      await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
      await this.sendTokenToServer(token);
    });
  }

  private async handleBackgroundMessage(remoteMessage: any): Promise<void> {
    try {
      // Add notification to local storage
      await NotificationManager.addNotification({
        title: remoteMessage.notification?.title || 'New Notification',
        body: remoteMessage.notification?.body || 'You have a new message',
        type: this.getNotificationType(remoteMessage.data?.type),
        data: remoteMessage.data,
      });
    } catch (error) {
      console.error('Error handling background message:', error);
    }
  }

  private async handleForegroundMessage(remoteMessage: any): Promise<void> {
    try {
      // Add notification to local storage
      await NotificationManager.addNotification({
        title: remoteMessage.notification?.title || 'New Notification',
        body: remoteMessage.notification?.body || 'You have a new message',
        type: this.getNotificationType(remoteMessage.data?.type),
        data: remoteMessage.data,
      });

      // Show in-app notification or alert
      Alert.alert(
        remoteMessage.notification?.title || 'New Notification',
        remoteMessage.notification?.body || 'You have a new message',
        [
          { text: 'OK', onPress: () => console.log('Notification acknowledged') }
        ]
      );
    } catch (error) {
      console.error('Error handling foreground message:', error);
    }
  }

  private handleNotificationOpened(remoteMessage: any): void {
    try {
      // Handle navigation based on notification data
      const { data } = remoteMessage;
      
      if (data?.screen) {
        // Navigate to specific screen
        console.log('Navigate to screen:', data.screen);
        // TODO: Implement navigation logic
      }
      
      if (data?.orderId) {
        // Navigate to order details
        console.log('Navigate to order:', data.orderId);
        // TODO: Implement order navigation
      }
    } catch (error) {
      console.error('Error handling notification opened:', error);
    }
  }

  private getNotificationType(type?: string): 'order' | 'delivery' | 'promotion' | 'system' | 'general' {
    switch (type) {
      case 'order':
        return 'order';
      case 'delivery':
        return 'delivery';
      case 'promotion':
      case 'offer':
        return 'promotion';
      case 'system':
        return 'system';
      default:
        return 'general';
    }
  }

  // Public methods
  public async getToken(): Promise<string | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.fcmToken;
  }

  public async refreshToken(): Promise<string | null> {
    try {
      await messaging().deleteToken();
      return await this.getFCMToken();
    } catch (error) {
      console.error('Error refreshing FCM token:', error);
      return null;
    }
  }

  public isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  public async subscribeToTopic(topic: string): Promise<void> {
    try {
      await messaging().subscribeToTopic(topic);
      console.log(`✅ Subscribed to topic: ${topic}`);
    } catch (error) {
      console.error(`❌ Failed to subscribe to topic ${topic}:`, error);
    }
  }

  public async unsubscribeFromTopic(topic: string): Promise<void> {
    try {
      await messaging().unsubscribeFromTopic(topic);
      console.log(`✅ Unsubscribed from topic: ${topic}`);
    } catch (error) {
      console.error(`❌ Failed to unsubscribe from topic ${topic}:`, error);
    }
  }
}

export default new FCMService();
