import API from './api';

export interface Notification {
  id: string;
  recipient: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  type: 'like' | 'comment' | 'friend_request' | 'friend_accepted';
  post?: string;
  comment?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  status: string;
  data: {
    notifications: Notification[];
  };
}

interface NotificationResponse {
  status: string;
  data: {
    notification: Notification;
  };
}

export const notificationsApi = {
  // Get user notifications
  getNotifications: async (): Promise<Notification[]> => {
    try {
      const response = await API.get<NotificationsResponse>('/notifications');
      return response.data.data.notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId: string): Promise<Notification> => {
    try {
      const response = await API.patch<NotificationResponse>('/notifications/mark-as-read', {
        notificationIds: [notificationId]
      });
      return response.data.data.notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<{ status: string; message: string }> => {
    try {
      const response = await API.patch<{ status: string; message: string }>('/notifications/mark-all-as-read');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  // Delete notification
  deleteNotification: async (notificationId: string): Promise<{ status: string; message: string }> => {
    try {
      const response = await API.delete<{ status: string; message: string }>(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await API.get<{ status: string; data: { pagination: { unreadCount: number } } }>('/notifications');
      return response.data.data.pagination.unreadCount;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }
};

export default notificationsApi; 