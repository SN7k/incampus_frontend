import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users } from 'lucide-react';
import { User } from '../../types';
import { getAvatarUrl } from '../../utils/avatarUtils';

interface FriendRequest {
  id: string;
  status?: string;
}

interface FriendSearchPopupProps {
  isVisible: boolean;
  searchQuery: string;
  currentUserId: string;
  friends: User[];
  friendRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  users: User[];
  onUserClick: (userId: number) => void;
}

const FriendSearchPopup: React.FC<FriendSearchPopupProps> = ({
  isVisible,
  searchQuery,
  currentUserId,
  friends,
  friendRequests,
  sentRequests,
  users,
  onUserClick
}) => {
  // Don't show popup if search query is empty
  if (!isVisible || !searchQuery) {
    return null;
  }
  
  // Filter users based on search query only (not by active tab)
  const filteredUsers = users
    .filter(user => user.id !== currentUserId) // Exclude current user
    .filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
  // If no results found, return null
  if (filteredUsers.length === 0) {
    return null;
  }
  
  // Determine user type for each filtered user
  const getUserType = (userId: string) => {
    if (friends.some(friend => friend.id === userId)) {
      return 'friend';
    } else if (friendRequests.some(req => req.id === userId)) {
      return 'request';
    } else if (sentRequests.some(req => req.id === userId && req.status === 'pending')) {
      return 'sent';
    } else {
      return 'other';
    }
  };

  return (
    <AnimatePresence>
      {/* Background overlay */}
      <motion.div
        key="search-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 dark:bg-black/40 z-10"
        style={{ pointerEvents: 'none' }}
      />
      
      {/* Search results popup */}
      <motion.div
        key="search-results"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 max-h-80 overflow-y-auto"
      >
        <div className="p-3">
          <div className="flex items-center mb-2">
            <Users size={16} className="text-blue-500 dark:text-blue-400 mr-2" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">All Users</h3>
          </div>
          <div className="space-y-2">
            {filteredUsers.map(user => {
              const userType = getUserType(user?.id || '');
              let statusBadge = null;
              
              // Determine badge based on user type
              if (userType === 'friend') {
                statusBadge = (
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full">
                    Friend
                  </span>
                );
              } else if (userType === 'request') {
                statusBadge = (
                  <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-0.5 rounded-full">
                    Request
                  </span>
                );
              } else if (userType === 'sent') {
                statusBadge = (
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-full">
                    Sent
                  </span>
                );
              }
              
              return (
                <div 
                  key={user?.id || 'unknown'}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors"
                  onClick={() => user?.id && onUserClick(parseInt(user.id))}
                >
                  <div className="flex items-center">
                    <img src={getAvatarUrl(user?.avatar, user?.name || 'User')} alt={user?.name || 'User'} className="w-8 h-8 rounded-full object-cover" />
                    <div className="ml-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'User'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role === 'faculty' ? 'Faculty' : 'Computer Science'}</p>
                    </div>
                  </div>
                  {statusBadge}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FriendSearchPopup;
