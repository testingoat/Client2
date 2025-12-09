import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATIONS_KEY = 'app_notifications';
const MAX_NOTIFICATIONS = 100;

type NotificationType = 'order' | 'delivery' | 'promotion' | 'system' | 'general';

const getNotificationType = (type?: string): NotificationType => {
  switch ((type || '').toLowerCase()) {
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
};

export const persistNotificationFromRemoteMessage = async (remoteMessage: any): Promise<void> => {
  const title =
    remoteMessage?.notification?.title ||
    remoteMessage?.data?.title ||
    'New Notification';

  const body =
    remoteMessage?.notification?.body ||
    remoteMessage?.data?.body ||
    'You have a new message';

  const imageUrl =
    remoteMessage?.notification?.android?.imageUrl ||
    remoteMessage?.notification?.imageUrl ||
    remoteMessage?.data?.imageUrl;

  const notificationEntry = {
    id: remoteMessage?.messageId || Date.now().toString(),
    title,
    body,
    type: getNotificationType(remoteMessage?.data?.type),
    timestamp: Date.now(),
    read: false,
    origin: 'local' as const,
    data: remoteMessage?.data || {},
    imageUrl,
  };

  try {
    const stored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
    const notifications = stored ? JSON.parse(stored) : [];
    notifications.unshift(notificationEntry);
    const trimmed = notifications.slice(0, MAX_NOTIFICATIONS);
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(trimmed));
    console.log('📥 Stored background notification for customer app');
  } catch (error) {
    console.error('❌ Failed to persist background notification:', error);
  }
};

export const BackgroundNotificationUtils = {
  persistNotificationFromRemoteMessage,
};

export default BackgroundNotificationUtils;
