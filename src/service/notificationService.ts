import { appAxios } from './apiInterceptors';

export interface ServerNotification {
  _id: string;
  title: string;
  body: string;
  imageUrl?: string;
  type?: string;
  read?: boolean;
  createdAt?: string;
  data?: any;
}

export interface NotificationResponse {
  success: boolean;
  data?: ServerNotification[];
  notifications?: ServerNotification[];
}

export const fetchCustomerNotifications = async (
  page = 1,
  limit = 50
): Promise<NotificationResponse> => {
  const response = await appAxios.get('/customers/notifications', {
    params: { page, limit },
  });
  return response.data;
};

export const markNotificationRead = async (notificationId: string) => {
  return appAxios.post(`/customers/notifications/${notificationId}/read`);
};

export const deleteNotification = async (notificationId: string) => {
  return appAxios.delete(`/customers/notifications/${notificationId}`);
};

export const clearNotifications = async () => {
  return appAxios.post('/customers/notifications/clear');
};

export const markAllNotificationsRead = async () => {
  return appAxios.post('/customers/notifications/mark-all-read');
};
