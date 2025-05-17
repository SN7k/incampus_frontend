import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Notification } from '../components/notifications/NotificationsPanel';
import { mockUsers } from '../data/mockData';
import { useAuth } from './AuthContext';

// Mock notifications data
const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'friendRequest',
    userId: '1',
    userName: 'John Doe',
    userAvatar: mockUsers[0].avatar,
    content: 'sent you a friend request',
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    read: false
  },
  {
    id: '2',
    type: 'like',
    userId: '2',
    userName: 'Jane Smith',
    userAvatar: mockUsers[1].avatar,
    content: 'liked your post about campus life',
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
    read: false,
    postId: '1'
  },
  {
    id: '3',
    type: 'comment',
    userId: '3',
    userName: 'Prof. Robert Williams',
    userAvatar: mockUsers[2].avatar,
    content: 'commented on your project post',
    timestamp: new Date(Date.now() - 86400000), // 1 day ago
    read: true,
    postId: '1'
  }
];

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  showNotifications: boolean;
  toggleNotifications: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  acceptFriendRequest: (id: string) => void;
  rejectFriendRequest: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
}

const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  unreadCount: 0,
  showNotifications: false,
  toggleNotifications: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  acceptFriendRequest: () => {},
  rejectFriendRequest: () => {},
  addNotification: () => {}
});

export const useNotifications = () => useContext(NotificationsContext);

export const NotificationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user } = useAuth();

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Toggle notifications panel
  const toggleNotifications = () => {
    setShowNotifications(prev => !prev);
  };

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Accept friend request
  const acceptFriendRequest = (id: string) => {
    setNotifications(prev => {
      const updatedNotifications = prev.filter(n => n.id !== id);
      
      // Add a new notification for accepted request
      const requestNotification = prev.find(n => n.id === id);
      
      if (requestNotification && user) {
        const acceptedNotification: Notification = {
          id: Date.now().toString(),
          type: 'accepted',
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar,
          content: `You accepted ${requestNotification.userName}'s friend request`,
          timestamp: new Date(),
          read: false
        };
        
        return [...updatedNotifications, acceptedNotification];
      }
      
      return updatedNotifications;
    });
  };

  // Reject friend request
  const rejectFriendRequest = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Add a new notification
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        showNotifications,
        toggleNotifications,
        markAsRead,
        markAllAsRead,
        acceptFriendRequest,
        rejectFriendRequest,
        addNotification
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
