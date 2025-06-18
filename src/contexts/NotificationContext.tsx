import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { notificationsApi, Notification as ApiNotification } from '../services/notificationsApi';

export interface Notification {
  id: string;
  type: 'friend_request' | 'like' | 'comment' | 'system';
  message: string;
  timestamp: number;
  read: boolean;
  userId?: string; // ID of the user who triggered the notification
  postId?: string; // ID of the post related to the notification
  avatar?: string; // Avatar of the user who triggered the notification
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  showNotificationPanel: boolean;
  setShowNotificationPanel: (show: boolean) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  clearNotification: (id: string) => void;
  refreshNotifications: () => void;
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

  // Convert API notification to frontend notification format
  const convertApiNotification = (apiNotif: ApiNotification): Notification => {
    let message = '';
    let type: Notification['type'] = 'system';

    switch (apiNotif.type) {
      case 'friend_request':
        message = `${apiNotif.sender.name} sent you a friend request`;
        type = 'friend_request';
        break;
      case 'friend_accepted':
        message = `${apiNotif.sender.name} accepted your friend request`;
        type = 'friend_request';
        break;
      case 'like':
        message = `${apiNotif.sender.name} liked your post`;
        type = 'like';
        break;
      case 'comment':
        message = `${apiNotif.sender.name} commented on your post`;
        type = 'comment';
        break;
      default:
        message = 'You have a new notification';
        type = 'system';
    }

    return {
      id: apiNotif.id,
      type,
      message,
      timestamp: new Date(apiNotif.createdAt).getTime(),
      read: apiNotif.isRead,
      userId: apiNotif.sender.id,
      postId: apiNotif.post,
      avatar: apiNotif.sender.avatar
    };
  };

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      console.log('Fetching notifications from backend...');
      const apiNotifications = await notificationsApi.getNotifications();
      const convertedNotifications = apiNotifications.map(convertApiNotification);
      setNotifications(convertedNotifications);
      setUnreadCount(convertedNotifications.filter(notif => !notif.read).length);
      console.log('Fetched notifications:', convertedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Load notifications from backend on initial render and when user changes
  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  // Refresh notifications
  const refreshNotifications = () => {
    fetchNotifications();
  };

  // Mark a notification as read
  const markAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Add a new notification (for real-time updates)
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: Date.now(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  // Clear a notification
  const clearNotification = async (id: string) => {
    try {
      await notificationsApi.deleteNotification(id);
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Listen for friend requests to create real-time notifications
  useEffect(() => {
    const handleFriendRequest = (event: CustomEvent) => {
      const { fromUser, toUser, requestType, fromUserName, fromUserAvatar } = event.detail;
      if (user && ((requestType === 'new' && toUser === user.id) || (requestType === 'accepted' && toUser === user.id))) {
        const message = requestType === 'new'
          ? `${fromUserName || 'Someone'} sent you a friend request`
          : `${fromUserName || 'Someone'} accepted your friend request`;
        addNotification({
          type: 'friend_request',
          message,
          userId: fromUser,
          avatar: fromUserAvatar
        });
      }
    };
    window.addEventListener('friendRequest', handleFriendRequest as EventListener);
    return () => {
      window.removeEventListener('friendRequest', handleFriendRequest as EventListener);
    };
  }, [user]);

  // Listen for post likes to create real-time notifications
  useEffect(() => {
    const handlePostLike = (event: CustomEvent) => {
      const { fromUser, postId, postAuthorId, fromUserName, fromUserAvatar } = event.detail;
      if (user && postAuthorId === user.id && fromUser !== user.id) {
        addNotification({
          type: 'like',
          message: `${fromUserName || 'Someone'} liked your post`,
          userId: fromUser,
          postId,
          avatar: fromUserAvatar
        });
      }
    };
    window.addEventListener('postLike', handlePostLike as EventListener);
    return () => {
      window.removeEventListener('postLike', handlePostLike as EventListener);
    };
  }, [user]);

  // Listen for post comments to create real-time notifications
  useEffect(() => {
    const handlePostComment = (event: CustomEvent) => {
      const { fromUser, postId, postAuthorId, fromUserName, fromUserAvatar } = event.detail;
      if (user && postAuthorId === user.id && fromUser !== user.id) {
        addNotification({
          type: 'comment',
          message: `${fromUserName || 'Someone'} commented on your post`,
          userId: fromUser,
          postId,
          avatar: fromUserAvatar
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
    clearNotification,
    refreshNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
