import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCheck, Trash2, UserPlus, Heart, MessageCircle } from 'lucide-react';
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

  // Close panel on outside click or Esc
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showNotificationPanel &&
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setShowNotificationPanel(false);
      }
    };
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowNotificationPanel(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
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
    } else if ((notification.type === 'like' || notification.type === 'comment') && notification.postId) {
      window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'feed' } }));
    }
    setShowNotificationPanel(false);
  };

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'friend_request': return <UserPlus size={18} className="text-blue-500" />;
      case 'like': return <Heart size={18} className="text-red-500" />;
      case 'comment': return <MessageCircle size={18} className="text-green-500" />;
      default: return <Bell size={18} className="text-gray-500" />;
    }
  };

  // Animation variants
  const panelVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 40 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 40 }
  };

  return (
    <AnimatePresence>
      {showNotificationPanel && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-[99] bg-black/40 backdrop-blur-sm"
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
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-1/2 top-1/2 z-[100] w-full max-w-md sm:max-w-lg md:max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg"
            style={{ maxHeight: '80vh' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/60 rounded-t-2xl">
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
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X size={24} />
                </Button>
              </div>
            </div>

            {/* Notification list */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 80px)' }}>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start p-5 border-b border-gray-100 dark:border-gray-700 hover:bg-white/40 dark:hover:bg-gray-900/40 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50/60 dark:bg-blue-900/30' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex-shrink-0 mr-4">
                      {notification.avatar ? (
                        <img
                          src={getAvatarUrl(notification.avatar, 'User')}
                          alt="User"
                          className="w-12 h-12 rounded-full object-cover shadow"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shadow">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base text-gray-800 dark:text-gray-200">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        clearNotification(notification.id);
                      }}
                      className="ml-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center">
                  <div className="flex justify-center mb-4">
                    <Bell size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    We'll notify you when something happens
                  </p>
                </div>
              )}
            </div>
            {/* Large close button for mobile */}
            <div className="block sm:hidden p-6 border-t border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/60 rounded-b-2xl">
              <Button
                variant="secondary"
                className="w-full py-3 text-base font-semibold"
                onClick={() => setShowNotificationPanel(false)}
              >
                Close
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;
