import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import axiosInstance from '../utils/axios';

export interface Notification {
  id: string;
  type: 'friend_request' | 'like' | 'comment' | 'system';
  message: string;
  timestamp: number;
  read: boolean;
  userId?: string;
  postId?: string;
  avatar?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  showNotificationPanel: boolean;
  setShowNotificationPanel: (show: boolean) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => Promise<void>;
  clearNotification: (id: string) => Promise<void>;
}

interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
}

interface NotificationResponse {
  notifications: Notification[];
  pagination: {
    total: number;
    unreadCount: number;
    page: number;
    limit: number;
    pages: number;
  };
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    if (!user || !user.id) {
      console.log('Skipping notification fetch: User or user ID is undefined');
      return;
    }

    try {
      console.log('Fetching notifications for user ID:', user.id);
      const response = await axiosInstance.get<ApiResponse<NotificationResponse>>('/api/notifications');
      
      if (response.data.status === 'success') {
        setNotifications(response.data.data.notifications);
        setUnreadCount(response.data.data.pagination.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  // Load notifications on initial render and when user changes
  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  // Add a new notification
  const addNotification = async (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    if (!user) return;

    try {
      const response = await axiosInstance.post<ApiResponse<Notification>>('/api/notifications', {
        ...notification,
        userId: user.id
      });

      if (response.data.status === 'success') {
        setNotifications(prev => [response.data.data, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to add notification:', error);
    }
  };

  // Mark a notification as read
  const markAsRead = async (id: string) => {
    if (!user) return;

    try {
      const response = await axiosInstance.patch<ApiResponse<Notification>>(`/api/notifications/${id}/read`);

      if (response.data.status === 'success') {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === id ? { ...notif, read: true } : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const response = await axiosInstance.patch<ApiResponse<Notification[]>>(`/api/notifications/${user.id}/read-all`);

      if (response.data.status === 'success') {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Clear a notification
  const clearNotification = async (id: string) => {
    if (!user) return;

    try {
      const response = await axiosInstance.delete<ApiResponse<void>>(`/api/notifications/${id}`);

      if (response.data.status === 'success') {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
        setUnreadCount(prev => 
          notifications.find(n => n.id === id)?.read ? prev : Math.max(0, prev - 1)
        );
      }
    } catch (error) {
      console.error('Failed to clear notification:', error);
    }
  };

  // Effect to handle real-time notification events
  useEffect(() => {
    console.log('NotificationContext: Setting up event listeners.');

    const handleFriendRequest = (event: Event) => {
      console.log('NotificationContext: Friend request event received.', event);
      if (event instanceof CustomEvent && event.detail) {
        console.log('NotificationContext: Friend request event detail:', event.detail);
        // Assuming the event detail contains the notification object
        addNotification(event.detail);
      }
    };

    const handlePostLike = (event: Event) => {
       console.log('NotificationContext: Post like event received.', event);
      if (event instanceof CustomEvent && event.detail) {
        console.log('NotificationContext: Post like event detail:', event.detail);
        addNotification(event.detail);
      }
    };

    const handlePostComment = (event: Event) => {
      console.log('NotificationContext: Post comment event received.', event);
      if (event instanceof CustomEvent && event.detail) {
        console.log('NotificationContext: Post comment event detail:', event.detail);
        addNotification(event.detail);
      }
    };
    
    // Using bound handlers for stable references
    const boundHandleFriendRequest = handleFriendRequest.bind(null);
    const boundHandlePostLike = handlePostLike.bind(null);
    const boundHandlePostComment = handlePostComment.bind(null);

    window.addEventListener('newFriendRequest', boundHandleFriendRequest as EventListener);
    window.addEventListener('newPostLike', boundHandlePostLike as EventListener);
    window.addEventListener('newPostComment', boundHandlePostComment as EventListener);
    
    console.log('NotificationContext: Event listeners added.');

    // Cleanup function
    return () => {
      console.log('NotificationContext: Cleaning up event listeners.');
      window.removeEventListener('newFriendRequest', boundHandleFriendRequest as EventListener);
      window.removeEventListener('newPostLike', boundHandlePostLike as EventListener);
      window.removeEventListener('newPostComment', boundHandlePostComment as EventListener);
      console.log('NotificationContext: Event listeners removed.');
    };
    
  }, [addNotification]); // Dependency array includes addNotification

  const value = {
    notifications,
    unreadCount,
    showNotificationPanel,
    setShowNotificationPanel,
    markAsRead,
    markAllAsRead,
    addNotification,
    clearNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
