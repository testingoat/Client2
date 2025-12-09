import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fetchCustomerNotifications,
  markNotificationRead,
  deleteNotification as deleteNotificationRemote,
  clearNotifications as clearNotificationsRemote,
  markAllNotificationsRead as markAllNotificationsReadRemote,
} from '@service/notificationService';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  imageUrl?: string;
  timestamp: number;
  read: boolean;
  type: 'order' | 'delivery' | 'promotion' | 'system' | 'general';
  data?: any;
  origin?: 'local' | 'server';
}

const NOTIFICATIONS_KEY = 'app_notifications';
const MAX_NOTIFICATIONS = 100;

class NotificationManager {
  private notifications: NotificationItem[] = [];
  private listeners: ((notifications: NotificationItem[]) => void)[] = [];
  private initialized = false;

  async initialize(): Promise<void> {
    try {
      if (this.initialized) {
        return;
      }
      await this.loadNotifications();
      this.initialized = true;
      this.syncWithServer().catch(error => {
        console.error('Error syncing notifications during init:', error);
      });
    } catch (error) {
      console.error('Error initializing NotificationManager:', error);
    }
  }

  async loadNotifications(): Promise<NotificationItem[]> {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      if (stored) {
        this.notifications = JSON.parse(stored);
      }
      this.sortAndTrim();
      this.initialized = true;
      this.notifyListeners();
      return this.notifications;
    } catch (error) {
      console.error('Error loading notifications:', error);
      return [];
    }
  }

  async saveNotifications(): Promise<void> {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }

  async addNotification(notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>): Promise<void> {
    if (!this.initialized) {
      await this.loadNotifications();
    }

    const newNotification: NotificationItem = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      read: false,
      origin: 'local',
    };

    this.notifications.unshift(newNotification);
    this.sortAndTrim();

    await this.saveNotifications();
    this.notifyListeners();
  }

  async markAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (!notification || notification.read) {
      return;
    }

    notification.read = true;
    await this.saveNotifications();
    this.notifyListeners();

    if (notification.origin === 'server') {
      try {
        await markNotificationRead(notificationId);
      } catch (error) {
        console.error('Error marking server notification as read:', error);
      }
    }
  }

  async markAllAsRead(): Promise<void> {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    await this.saveNotifications();
    this.notifyListeners();
    try {
      await markAllNotificationsReadRemote();
    } catch (error) {
      console.error('Error marking all server notifications as read:', error);
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === notificationId);
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    await this.saveNotifications();
    this.notifyListeners();

    if (notification?.origin === 'server') {
      try {
        await deleteNotificationRemote(notificationId);
      } catch (error) {
        console.error('Error deleting server notification:', error);
      }
    }
  }

  async clearAllNotifications(): Promise<void> {
    this.notifications = [];
    await this.saveNotifications();
    this.notifyListeners();
    try {
      await clearNotificationsRemote();
    } catch (error) {
      console.error('Error clearing server notifications:', error);
    }
  }

  getNotifications(): NotificationItem[] {
    return this.notifications;
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  getNotificationsByType(type: NotificationItem['type']): NotificationItem[] {
    return this.notifications.filter(n => n.type === type);
  }

  addListener(listener: (notifications: NotificationItem[]) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.notifications);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  }

  // Helper method to create sample notifications for testing
  async createSampleNotifications(): Promise<void> {
    const sampleNotifications = [
      {
        title: 'Order Confirmed',
        body: 'Your order #12345 has been confirmed and is being prepared.',
        type: 'order' as const,
        data: { orderId: '12345' }
      },
      {
        title: 'Delivery Update',
        body: 'Your order is out for delivery and will arrive in 15 minutes.',
        type: 'delivery' as const,
        data: { orderId: '12345', eta: 15 }
      },
      {
        title: 'Special Offer',
        body: 'Get 20% off on your next order! Use code SAVE20',
        type: 'promotion' as const,
        data: { code: 'SAVE20', discount: 20 }
      }
    ];

    for (const notification of sampleNotifications) {
      await this.addNotification(notification);
    }
  }

  async refreshFromServer(): Promise<void> {
    await this.syncWithServer();
  }

  private async syncWithServer(): Promise<void> {
    try {
      const response = await fetchCustomerNotifications(1, MAX_NOTIFICATIONS);
      const serverData = response?.data || response?.notifications;
      if (!Array.isArray(serverData)) {
        return;
      }
      const serverNotifications = serverData.map(item => this.mapServerNotification(item));
      const localOnly = this.notifications.filter(n => n.origin === 'local');
      this.notifications = [...serverNotifications, ...localOnly];
      this.sortAndTrim();
      await this.saveNotifications();
      this.notifyListeners();
    } catch (error) {
      console.error('Error syncing notifications from server:', error);
    }
  }

  private mapServerNotification(notification: any): NotificationItem {
    return {
      id: notification?._id || notification?.id || Date.now().toString(),
      title: notification?.title || 'Notification',
      body: notification?.body || notification?.message || '',
      imageUrl: notification?.imageUrl,
      timestamp: notification?.createdAt ? new Date(notification.createdAt).getTime() : Date.now(),
      read: !!notification?.read,
      type: (notification?.type || 'general') as NotificationItem['type'],
      data: notification?.data,
      origin: 'server',
    };
  }

  private sortAndTrim(): void {
    this.notifications.sort((a, b) => b.timestamp - a.timestamp);
    if (this.notifications.length > MAX_NOTIFICATIONS) {
      this.notifications = this.notifications.slice(0, MAX_NOTIFICATIONS);
    }
  }
}

export default new NotificationManager();
