import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User } from '../../types';
import { Users, UserPlus, UserX, Search } from 'lucide-react';
import Button from '../ui/Button';

interface FriendsViewProps {
  _currentUser: User;
  displayUser: User;
  isCurrentUserProfile: boolean;
  onNavigateToProfile?: (userId: string) => void;
}

const FriendsView: React.FC<FriendsViewProps> = ({ 
  // currentUser is passed for future implementation when we need to show mutual friends
  // or handle friend requests between the current user and others
  _currentUser, 
  displayUser, 
  isCurrentUserProfile,
  onNavigateToProfile
}) => {
  // This is a TypeScript trick to acknowledge the variable without using it
  void _currentUser;
  // State for active tab within Friends view
  const [activeTab, setActiveTab] = useState<'all' | 'mutual' | 'suggestions'>('all');
  
  // Mock data for friends
  const mockFriends = [
    {
      id: '101',
      name: 'Alex Johnson',
      universityId: 'BWU/CSE/2022/101',
      role: 'student',
      program: 'Computer Science',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
      mutual: 12
    },
    {
      id: '102',
      name: 'Priya Sharma',
      universityId: 'BWU/CSE/2022/102',
      role: 'student',
      program: 'Computer Science',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
      mutual: 8
    },
    {
      id: '103',
      name: 'Dr. Emily Chen',
      universityId: 'BWU/FAC/CS/103',
      role: 'faculty',
      program: 'Computer Science',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
      mutual: 5
    },
    {
      id: '104',
      name: 'Michael Rodriguez',
      universityId: 'BWU/CSE/2023/104',
      role: 'student',
      program: 'Computer Science',
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150',
      mutual: 15
    },
    {
      id: '105',
      name: 'Sarah Williams',
      universityId: 'BWU/ECE/2022/105',
      role: 'student',
      program: 'Electronics Engineering',
      avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150',
      mutual: 3
    }
  ];
  
  // Mock data for friend suggestions
  const mockSuggestions = [
    {
      id: '201',
      name: 'David Lee',
      universityId: 'BWU/CSE/2023/201',
      role: 'student',
      program: 'Computer Science',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
      mutual: 7
    },
    {
      id: '202',
      name: 'Ananya Patel',
      universityId: 'BWU/CSE/2022/202',
      role: 'student',
      program: 'Computer Science',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
      mutual: 4
    },
    {
      id: '203',
      name: 'Prof. Robert Williams',
      universityId: 'BWU/FAC/CS/203',
      role: 'faculty',
      program: 'Computer Science',
      avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150',
      mutual: 2
    }
  ];
  
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
  
  // Handle friend request
  const handleFriendRequest = (userId: string) => {
    console.log(`Friend request sent to ${userId}`);
    // In a real app, this would call an API
  };
  
  // These functions would be used in a real app for handling friend requests
  // Currently not used in the demo UI but would be implemented in a full version
  /*
  const handleAcceptRequest = (userId: string) => {
    console.log(`Friend request accepted for ${userId}`);
    // In a real app, this would call an API
  };
  
  const handleRejectRequest = (userId: string) => {
    console.log(`Friend request rejected for ${userId}`);
    // In a real app, this would call an API
  };
  */
  
  // Handle unfriend
  const handleUnfriend = (userId: string) => {
    console.log(`Unfriended ${userId}`);
    // In a real app, this would call an API
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
              {mockFriends.length} friends
            </span>
          </div>
          
          {mockFriends.map((friend) => (
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
                  <span className="mx-1 flex-shrink-0">•</span>
                  <span className="truncate">{friend.universityId}</span>
                </div>
              </div>
              {isCurrentUserProfile && (
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-1 sm:ml-2 flex-shrink-0"
                  onClick={() => handleUnfriend(friend.id)}
                >
                  <UserX size={16} className="sm:mr-1" />
                  <span className="hidden sm:inline">Unfriend</span>
                </Button>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
      
      {/* Mutual friends */}
      {activeTab === 'mutual' && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Mutual Friends
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {mockFriends.filter(f => f.mutual > 0).length} mutual friends
            </span>
          </div>
          
          {mockFriends.filter(f => f.mutual > 0).map((friend) => (
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
                  <span className="truncate">{friend.mutual} mutual friends</span>
                </div>
              </div>
              {isCurrentUserProfile && (
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-1 sm:ml-2 flex-shrink-0"
                  onClick={() => handleUnfriend(friend.id)}
                >
                  <UserX size={16} className="sm:mr-1" />
                  <span className="hidden sm:inline">Unfriend</span>
                </Button>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
      
      {/* Friend suggestions */}
      {activeTab === 'suggestions' && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              People You May Know
            </h3>
          </div>
          
          {mockSuggestions.map((friend) => (
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
                  <span className="truncate">{friend.mutual} mutual friends</span>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                className="ml-1 sm:ml-2 flex-shrink-0"
                onClick={() => handleFriendRequest(friend.id)}
              >
                <UserPlus size={16} className="sm:mr-1" />
                <span className="hidden sm:inline">Connect</span>
              </Button>
            </motion.div>
          ))}
        </motion.div>
      )}
      
      {/* Empty state */}
      {activeTab === 'all' && mockFriends.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">No friends yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Connect with other students and faculty to build your network
          </p>
          <Button variant="primary" size="lg" onClick={() => setActiveTab('suggestions')}>
            Find Friends
          </Button>
        </div>
      )}
    </div>
  );
};

export default FriendsView;
