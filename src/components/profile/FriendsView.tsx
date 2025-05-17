import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User } from '../../types';
import { Users, UserPlus, UserX, Search } from 'lucide-react';
import Button from '../ui/Button';
import { useFriends } from '../../contexts/FriendContext';

interface FriendsViewProps {
  _currentUser: User;
  displayUser: User;
  isCurrentUserProfile: boolean;
  onNavigateToProfile?: (userId: string) => void;
}

const FriendsView: React.FC<FriendsViewProps> = ({ 
  _currentUser, 
  displayUser, 
  isCurrentUserProfile,
  onNavigateToProfile
}) => {
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  // State for active tab within Friends view
  const [activeTab, setActiveTab] = useState<'all' | 'mutual' | 'suggestions'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get friends data from context
  const { 
    friends, 
    suggestedFriends, 
    sendFriendRequest, 
    removeFriend 
  } = useFriends();
  
  // Add mutual friend count to each friend (for display purposes)
  const friendsWithMutual = friends.map(friend => ({
    ...friend,
    mutual: Math.floor(Math.random() * 20) + 1 // Random number for demo purposes
  }));
  
  // Get mutual friends (friends with higher mutual count)
  const mutualFriends = friendsWithMutual.filter(f => f.mutual > 5);
  
  // Filter friends based on search query
  const filteredFriends = friendsWithMutual.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (friend.universityId && friend.universityId.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const filteredMutualFriends = mutualFriends.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (friend.universityId && friend.universityId.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const filteredSuggestions = suggestedFriends.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (friend.universityId && friend.universityId.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Handle friend actions
  const handleAddFriend = async (friendId: string) => {
    try {
      await sendFriendRequest(friendId);
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };
  
  const handleRemoveFriend = async (friendId: string) => {
    try {
      await removeFriend(friendId);
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  return (
    <div className="py-4 w-full max-w-full overflow-hidden px-2 sm:px-4">
      {/* Tabs for different friend views */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex overflow-x-auto scrollbar-hide">
          <button
            className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
              activeTab === 'all'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('all')}
          >
            All Friends
          </button>
          <button
            className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
              activeTab === 'mutual'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('mutual')}
          >
            Mutual Friends
          </button>
          <button
            className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
              activeTab === 'suggestions'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('suggestions')}
          >
            Suggestions
          </button>
        </div>
      </div>
      
      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search friends..."
            className="w-full px-4 py-2 pl-10 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>
      
      {/* Friends list */}
      {activeTab === 'all' && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4 w-full max-w-full overflow-hidden"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {isCurrentUserProfile ? 'Your Friends' : `${displayUser.name}'s Friends`}
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {friends.length} friends
            </span>
          </div>
          
          {filteredFriends.length > 0 ? (
            filteredFriends.map((friend) => (
              <motion.div
                key={friend.id}
                variants={item}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex items-center"
              >
                <img
                  src={friend.avatar}
                  alt={friend.name}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover cursor-pointer flex-shrink-0"
                  onClick={() => onNavigateToProfile && onNavigateToProfile(friend.id)}
                />
                <div className="ml-2 sm:ml-3 flex-1 min-w-0">
                  <h4 
                    className="font-medium text-gray-800 dark:text-gray-200 cursor-pointer hover:underline truncate"
                    onClick={() => onNavigateToProfile && onNavigateToProfile(friend.id)}
                  >
                    {friend.name}
                    {friend.role === 'faculty' && (
                      <span className="ml-2 text-xs font-medium px-2 py-0.5 bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 rounded-full">
                        Faculty
                      </span>
                    )}
                  </h4>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center truncate">
                    <span className="truncate">{friend.program}</span>
                    {friend.universityId && (
                      <>
                        <span className="mx-1 flex-shrink-0">•</span>
                        <span className="truncate">{friend.universityId}</span>
                      </>
                    )}
                  </div>
                </div>
                {isCurrentUserProfile && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-1 sm:ml-2 flex-shrink-0"
                    onClick={() => handleRemoveFriend(friend.id)}
                  >
                    <UserX size={16} className="sm:mr-1" />
                    <span className="hidden sm:inline">Unfriend</span>
                  </Button>
                )}
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {searchQuery ? 'No friends match your search' : 'No friends yet'}
            </div>
          )}
        </motion.div>
      )}
      
      {/* Mutual friends */}
      {activeTab === 'mutual' && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4 w-full max-w-full overflow-hidden"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Mutual Friends
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {mutualFriends.length} mutual friends
            </span>
          </div>
          
          {filteredMutualFriends.length > 0 ? (
            filteredMutualFriends.map((friend) => (
              <motion.div
                key={friend.id}
                variants={item}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex items-center"
              >
                <img
                  src={friend.avatar}
                  alt={friend.name}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover cursor-pointer flex-shrink-0"
                  onClick={() => onNavigateToProfile && onNavigateToProfile(friend.id)}
                />
                <div className="ml-2 sm:ml-3 flex-1 min-w-0">
                  <h4 
                    className="font-medium text-gray-800 dark:text-gray-200 cursor-pointer hover:underline truncate"
                    onClick={() => onNavigateToProfile && onNavigateToProfile(friend.id)}
                  >
                    {friend.name}
                    {friend.role === 'faculty' && (
                      <span className="ml-2 text-xs font-medium px-2 py-0.5 bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 rounded-full">
                        Faculty
                      </span>
                    )}
                  </h4>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center truncate">
                    <span className="truncate">{friend.program}</span>
                    {friend.universityId && (
                      <>
                        <span className="mx-1 flex-shrink-0">•</span>
                        <span className="truncate">{friend.universityId}</span>
                      </>
                    )}
                    <span className="mx-1 flex-shrink-0">•</span>
                    <span className="text-blue-500 dark:text-blue-400">{friend.mutual} mutual friends</span>
                  </div>
                </div>
                {isCurrentUserProfile && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-1 sm:ml-2 flex-shrink-0"
                    onClick={() => handleRemoveFriend(friend.id)}
                  >
                    <UserX size={16} className="sm:mr-1" />
                    <span className="hidden sm:inline">Unfriend</span>
                  </Button>
                )}
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {searchQuery ? 'No mutual friends match your search' : 'No mutual friends yet'}
            </div>
          )}
        </motion.div>
      )}
      
      {/* Friend suggestions */}
      {activeTab === 'suggestions' && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4 w-full max-w-full overflow-hidden"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Suggested Friends
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {suggestedFriends.length} suggestions
            </span>
          </div>
          
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((friend) => (
              <motion.div
                key={friend.id}
                variants={item}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex items-center"
              >
                <img
                  src={friend.avatar}
                  alt={friend.name}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover cursor-pointer flex-shrink-0"
                  onClick={() => onNavigateToProfile && onNavigateToProfile(friend.id)}
                />
                <div className="ml-2 sm:ml-3 flex-1 min-w-0">
                  <h4 
                    className="font-medium text-gray-800 dark:text-gray-200 cursor-pointer hover:underline truncate"
                    onClick={() => onNavigateToProfile && onNavigateToProfile(friend.id)}
                  >
                    {friend.name}
                    {friend.role === 'faculty' && (
                      <span className="ml-2 text-xs font-medium px-2 py-0.5 bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 rounded-full">
                        Faculty
                      </span>
                    )}
                  </h4>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center truncate">
                    <span className="truncate">{friend.program}</span>
                    {friend.universityId && (
                      <>
                        <span className="mx-1 flex-shrink-0">•</span>
                        <span className="truncate">{friend.universityId}</span>
                      </>
                    )}
                  </div>
                </div>
                {isCurrentUserProfile && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="ml-1 sm:ml-2 flex-shrink-0"
                    onClick={() => handleAddFriend(friend.id)}
                  >
                    <UserPlus size={16} className="sm:mr-1" />
                    <span className="hidden sm:inline">Connect</span>
                  </Button>
                )}
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {searchQuery ? 'No suggestions match your search' : 'No suggestions available'}
            </div>
          )}
        </motion.div>
      )}
      
      {/* Empty state if no friends and no suggestions */}
      {friends.length === 0 && suggestedFriends.length === 0 && (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">No Friends Yet</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Connect with other students and faculty members to build your network.
          </p>
        </div>
      )}
    </div>
  );
};

export default FriendsView;
