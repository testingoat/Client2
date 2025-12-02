import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationManager from '@utils/NotificationManager';
import { navigate } from '@utils/NavigationUtils';
import { appAxios } from '@service/apiInterceptors';
import { tokenStorage } from '@state/storage';

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
      const accessToken = tokenStorage.getString('accessToken');
      if (!accessToken) {
        console.warn('⚠️ No access token available, skipping FCM token registration');
        return;
      }

      console.log('📤 Sending FCM token to server via appAxios...');

      const response = await appAxios.post('/users/fcm-token', {
        fcmToken: token,
        platform: Platform.OS,
      });

      console.log('✅ FCM token sent to server successfully:', response.data);
    } catch (error: any) {
      console.error('Error sending FCM token to server:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
    }
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      const accessToken = tokenStorage.getString('accessToken');
      if (accessToken) {
        return accessToken;
      }

      // Fallback for any older AsyncStorage-based tokens
      const legacyAuthToken =
        (await AsyncStorage.getItem('authToken')) ||
        (await AsyncStorage.getItem('userToken')) ||
        (await AsyncStorage.getItem('access_token'));

      return legacyAuthToken;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
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
      const source = remoteMessage.data?.source;
      const shouldSkipLocal = source === 'admin-dashboard';

      // For admin-dashboard campaigns we rely on server-stored notifications
      if (!shouldSkipLocal) {
        await NotificationManager.addNotification({
          title: remoteMessage.notification?.title || 'New Notification',
          body: remoteMessage.notification?.body || 'You have a new message',
          type: this.getNotificationType(remoteMessage.data?.type),
          data: remoteMessage.data,
        });
      }
    } catch (error) {
      console.error('Error handling background message:', error);
    }
  }

  private async handleForegroundMessage(remoteMessage: any): Promise<void> {
    try {
      const source = remoteMessage.data?.source;
      const shouldSkipLocal = source === 'admin-dashboard';

      if (!shouldSkipLocal) {
        await NotificationManager.addNotification({
          title: remoteMessage.notification?.title || 'New Notification',
          body: remoteMessage.notification?.body || 'You have a new message',
          type: this.getNotificationType(remoteMessage.data?.type),
          data: remoteMessage.data,
        });
      }

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
      
      if (!data) {
        return;
      }

      // Highest priority: explicit screen navigation from payload
      if (data.screen) {
        console.log('Navigate to screen from notification:', data.screen, 'with params:', data);
        navigate(data.screen as string, data);
        return;
      }

      // Fallbacks based on type / orderId
      if (data.type === 'order' && data.orderId) {
        console.log('Navigate to order from notification:', data.orderId);
        navigate('OrdersScreen', { orderId: data.orderId });
        return;
      }

      if (data.type === 'delivery' && data.orderId) {
        console.log('Navigate to live tracking from notification:', data.orderId);
        navigate('LiveTracking', { orderId: data.orderId });
        return;
      }

      if (data.type === 'promotion') {
        console.log('Navigate to ProductDashboard from promotion notification');
        navigate('MainStack');
        return;
      }

      // Default: open main dashboard
      console.log('Navigate to main dashboard from notification');
      navigate('MainStack');
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
    // Re-fetch to ensure we have a fresh token and that it is registered
    return await this.getFCMToken();
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
