import React from 'react';
import { motion } from 'framer-motion';
import { Bell, UserPlus, Heart, MessageSquare, Check, X } from 'lucide-react';
import Button from '../ui/Button';

export interface Notification {
  id: string;
  type: 'friendRequest' | 'like' | 'comment' | 'accepted';
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: Date;
  read: boolean;
  postId?: string;
}

interface NotificationsPanelProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onAcceptFriendRequest: (id: string) => void;
  onRejectFriendRequest: (id: string) => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  notifications,
  onClose,
  onMarkAsRead,
  onAcceptFriendRequest,
  onRejectFriendRequest
}) => {
  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'friendRequest':
        return <UserPlus size={16} className="text-blue-600" />;
      case 'like':
        return <Heart size={16} className="text-red-500" />;
      case 'comment':
        return <MessageSquare size={16} className="text-green-500" />;
      case 'accepted':
        return <Check size={16} className="text-green-500" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-medium text-gray-800 dark:text-gray-200">Notifications</h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
          <X size={16} />
        </Button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                !notification.read ? 'bg-blue-50 dark:bg-blue-900/30' : ''
              }`}
              onClick={() => onMarkAsRead(notification.id)}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <img
                    src={notification.userAvatar}
                    alt={notification.userName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-1">
                    <span className="mr-1">{getIcon(notification.type)}</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {notification.userName}
                    </p>
                    <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                      {new Date(notification.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{notification.content}</p>
                  
                  {notification.type === 'friendRequest' && (
                    <div className="flex space-x-2 mt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAcceptFriendRequest(notification.id);
                        }}
                        className="flex-1 py-1 text-xs"
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRejectFriendRequest(notification.id);
                        }}
                        className="flex-1 py-1 text-xs"
                      >
                        Decline
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center">
            <p className="text-gray-500 dark:text-gray-400">No notifications</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default NotificationsPanel;
