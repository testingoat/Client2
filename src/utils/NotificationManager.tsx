import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
  type: 'order' | 'delivery' | 'promotion' | 'system' | 'general';
  data?: any;
}

const NOTIFICATIONS_KEY = 'app_notifications';
const MAX_NOTIFICATIONS = 100;

class NotificationManager {
  private notifications: NotificationItem[] = [];
  private listeners: ((notifications: NotificationItem[]) => void)[] = [];

  async initialize(): Promise<void> {
    try {
      await this.loadNotifications();
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
    const newNotification: NotificationItem = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      read: false,
    };

    this.notifications.unshift(newNotification);

    // Keep only the latest notifications
    if (this.notifications.length > MAX_NOTIFICATIONS) {
      this.notifications = this.notifications.slice(0, MAX_NOTIFICATIONS);
    }

    await this.saveNotifications();
    this.notifyListeners();
  }

  async markAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      await this.saveNotifications();
      this.notifyListeners();
    }
  }

  async markAllAsRead(): Promise<void> {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    await this.saveNotifications();
    this.notifyListeners();
  }

  async deleteNotification(notificationId: string): Promise<void> {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    await this.saveNotifications();
    this.notifyListeners();
  }

  async clearAllNotifications(): Promise<void> {
    this.notifications = [];
    await this.saveNotifications();
    this.notifyListeners();
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
}

export default new NotificationManager();
