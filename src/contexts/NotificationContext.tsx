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
    if (!user) return;

    try {
      const response = await axiosInstance.get<ApiResponse<Notification[]>>(`/api/notifications/${user.id}`);
      
      if (response.data.status === 'success') {
        setNotifications(response.data.data);
        setUnreadCount(response.data.data.filter(notif => !notif.read).length);
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

  // Listen for friend requests to create notifications
  useEffect(() => {
    const handleFriendRequest = (event: CustomEvent) => {
      const { fromUser, toUser, requestType } = event.detail;
      
      if (user && ((requestType === 'new' && toUser === user.id) || 
                   (requestType === 'accepted' && toUser === user.id))) {
        addNotification({
          type: 'friend_request',
          message: requestType === 'new' 
            ? 'You have a new friend request' 
            : 'Your friend request was accepted',
          userId: fromUser
        });
      }
    };

    window.addEventListener('friendRequest', handleFriendRequest as EventListener);
    return () => {
      window.removeEventListener('friendRequest', handleFriendRequest as EventListener);
    };
  }, [user]);

  // Listen for post likes to create notifications
  useEffect(() => {
    const handlePostLike = (event: CustomEvent) => {
      const { fromUser, postId, postAuthorId } = event.detail;
      
      if (user && postAuthorId === user.id && fromUser !== user.id) {
        addNotification({
          type: 'like',
          message: 'Someone liked your post',
          userId: fromUser,
          postId
        });
      }
    };

    window.addEventListener('postLike', handlePostLike as EventListener);
    return () => {
      window.removeEventListener('postLike', handlePostLike as EventListener);
    };
  }, [user]);

  // Listen for post comments to create notifications
  useEffect(() => {
    const handlePostComment = (event: CustomEvent) => {
      const { fromUser, postId, postAuthorId } = event.detail;
      
      if (user && postAuthorId === user.id && fromUser !== user.id) {
        addNotification({
          type: 'comment',
          message: 'Someone commented on your post',
          userId: fromUser,
          postId
        });
      }
    };

    window.addEventListener('postComment', handlePostComment as EventListener);
    return () => {
      window.removeEventListener('postComment', handlePostComment as EventListener);
    };
  }, [user]);

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
