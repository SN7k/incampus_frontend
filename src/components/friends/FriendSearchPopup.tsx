import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users } from 'lucide-react';
import { User } from '../../types';
import { friendService } from '../../services/friendService';

interface FriendSearchPopupProps {
  isVisible: boolean;
  searchQuery: string;
  currentUserId: string;
  friends: User[];
  friendRequests: User[];
  sentRequests: User[];
  onUserClick: (userId: string) => void;
}

const FriendSearchPopup: React.FC<FriendSearchPopupProps> = ({
  isVisible,
  searchQuery,
  currentUserId,
  friends,
  friendRequests,
  sentRequests,
  onUserClick
}) => {
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchUsers = async () => {
      if (!isVisible || !searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const results = await friendService.searchUsers(searchQuery);
        setSearchResults(results);
      } catch (err) {
        setError('Failed to search users');
        console.error('Error searching users:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, isVisible]);
  
  // Don't show popup if search query is empty
  if (!isVisible || !searchQuery) {
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

          {loading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg mb-2">
              {error}
            </div>
          )}

          {!loading && !error && searchResults.length === 0 && (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              No users found
            </div>
          )}

          <div className="space-y-2">
            {searchResults.map(user => {
              const userType = getUserType(user.id);
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
                  key={user.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors"
                  onClick={() => onUserClick(user.id)}
                >
                  <div className="flex items-center">
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                    <div className="ml-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.role === 'faculty' ? 'Faculty' : 'Computer Science'}</p>
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
