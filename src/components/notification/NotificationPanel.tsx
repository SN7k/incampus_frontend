import React, { useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCheck, Trash2, UserPlus, Heart } from 'lucide-react';
import { useNotifications, Notification } from '../../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import Button from '../ui/Button';
import { getAvatarUrl } from '../../utils/avatarUtils';

const NotificationPanel: React.FC = () => {
  const {
    notifications,
    unreadCount,
    showNotificationPanel,
    setShowNotificationPanel,
    markAsRead,
    markAllAsRead,
    clearNotification
  } = useNotifications();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel on outside click (only if clicking overlay) or Esc key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click is on the modal content itself
      if (panelRef.current && panelRef.current.contains(event.target as Node)) {
        return;
      }
      // If the click is outside the modal content, close it.
      // This relies on the overlay capturing the click.
      setShowNotificationPanel(false);
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowNotificationPanel(false);
      }
    };

    if (showNotificationPanel) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [showNotificationPanel, setShowNotificationPanel]);
  
  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.type === 'friend_request' && notification.userId) {
      window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'friends', tab: 'requests' } }));
    } else if (notification.type === 'like' && notification.postId) {
      window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'feed' } }));
    }
    setShowNotificationPanel(false);
  };

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'friend_request': return <UserPlus size={18} className="text-blue-500" />;
      case 'like': return <Heart size={18} className="text-red-500" />;
      default: return <Bell size={18} className="text-gray-500" />;
    }
  };

  // Animation variants
  const panelVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 30 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } },
    exit: { opacity: 0, scale: 0.9, y: 30, transition: { duration: 0.2 } }
  };
  
  const modalContent = (
    <AnimatePresence>
      {showNotificationPanel && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 sm:pt-32">
          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowNotificationPanel(false)}
          />
          {/* Modal */}
          <motion.div
            ref={panelRef}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-10 w-full max-w-md sm:max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl"
            style={{ maxHeight: '85vh' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    <CheckCheck size={16} className="mr-1" />
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotificationPanel(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full"
                >
                  <X size={22} />
                </Button>
              </div>
            </div>

            {/* Notification list */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(85vh - 74px)' }}>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-white/50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-500/10 dark:bg-blue-500/10' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex-shrink-0 mx-3 mt-1">
                      {notification.avatar ? (
                        <img
                          src={getAvatarUrl(notification.avatar, 'User')}
                          alt="User"
                          className="w-11 h-11 rounded-full object-cover shadow-sm"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shadow-sm">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm md:text-base text-gray-800 dark:text-gray-200 leading-tight">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                        {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        clearNotification(notification.id);
                      }}
                      className="ml-3 mr-3 p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center">
                  <div className="flex justify-center mb-4">
                    <Bell size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No new notifications</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    We'll let you know when something new happens.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // Find the portal root, but only on the client side
  const portalRoot = typeof document !== 'undefined' ? document.getElementById('notification-portal') : null;

  if (!portalRoot) {
    // Return null or some fallback if the portal root doesn't exist,
    // or if we're on the server side (SSR)
    return null;
  }
  
  return ReactDOM.createPortal(modalContent, portalRoot);
};

export default NotificationPanel;
