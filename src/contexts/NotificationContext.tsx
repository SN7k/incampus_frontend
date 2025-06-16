import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
<<<<<<< HEAD
import { mockUsers } from '../data/mockData';
=======
>>>>>>> a80153d (Update frontend)
import { useAuth } from './AuthContext';

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

  // Load notifications from localStorage on initial render
  useEffect(() => {
    if (user) {
      const storedNotifications = localStorage.getItem(`notifications_${user.id}`);
      if (storedNotifications) {
        const parsedNotifications = JSON.parse(storedNotifications);
        setNotifications(parsedNotifications);
        setUnreadCount(parsedNotifications.filter((notif: Notification) => !notif.read).length);
      } else {
        // Generate some initial notifications if none exist
        const initialNotifications: Notification[] = [
          {
            id: '1',
            type: 'system',
            message: 'Welcome to InCampus! Start connecting with your classmates.',
            timestamp: Date.now() - 3600000, // 1 hour ago
            read: false
          }
        ];
        setNotifications(initialNotifications);
        setUnreadCount(1);
        localStorage.setItem(`notifications_${user.id}`, JSON.stringify(initialNotifications));
      }
    }
  }, [user]);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (user && notifications.length > 0) {
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifications));
      setUnreadCount(notifications.filter(notif => !notif.read).length);
    }
  }, [notifications, user]);

  // Add a new notification
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: Date.now(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);
  };

  // Mark a notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  // Clear a notification
  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  // Listen for friend requests to create notifications
  useEffect(() => {
    const handleFriendRequest = (event: CustomEvent) => {
      const { fromUser, toUser, requestType } = event.detail;
      
      console.log('Friend request event received:', { fromUser, toUser, requestType });
      console.log('Current user:', user?.id);
      
      // Only create notification if the current user is the recipient
      if (user && ((requestType === 'new' && toUser === user.id) || 
                   (requestType === 'accepted' && toUser === user.id))) {
        
        console.log('Creating notification for user:', user.id);
        
        const sender = mockUsers.find(u => u.id === fromUser);
        console.log('Sender found:', sender?.name);
        
        if (sender) {
          const message = requestType === 'new' 
            ? `${sender.name} sent you a friend request` 
            : `${sender.name} accepted your friend request`;
          
          console.log('Adding notification with message:', message);
            
          addNotification({
            type: 'friend_request',
            message,
            userId: sender.id,
            avatar: sender.avatar
          });
        }
      } else {
        console.log('Notification criteria not met:', {
          userExists: !!user,
          isNewRequest: requestType === 'new',
          isToCurrentUser: user ? toUser === user.id : false
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
      
      // Only create notification if the current user is the post author
      if (user && postAuthorId === user.id && fromUser !== user.id) {
        const liker = mockUsers.find(u => u.id === fromUser);
        if (liker) {
          addNotification({
            type: 'like',
            message: `${liker.name} liked your post`,
            userId: liker.id,
            postId,
            avatar: liker.avatar
          });
        }
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
      
      // Only create notification if the current user is the post author
      if (user && postAuthorId === user.id && fromUser !== user.id) {
        const commenter = mockUsers.find(u => u.id === fromUser);
        if (commenter) {
          addNotification({
            type: 'comment',
            message: `${commenter.name} commented on your post`,
            userId: commenter.id,
            postId,
            avatar: commenter.avatar
          });
        }
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
