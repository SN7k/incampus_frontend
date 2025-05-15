import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import PostForm from '../components/post/PostForm';
import PostCard from '../components/post/PostCard';
import { useAuth } from '../contexts/AuthContext';
import { usePosts } from '../contexts/PostContext';
import { useFriends } from '../contexts/FriendContext';
import { Sparkles, TrendingUp, Users } from 'lucide-react';

interface FeedProps {
  onNavigate?: (page: string, userId?: string) => void;
}

const Feed: React.FC<FeedProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { feedPosts, refreshFeed, loading } = usePosts();
  const { suggestedFriends, sendFriendRequest } = useFriends();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullStartY, setPullStartY] = useState(0);
  const [pullMoveY, setPullMoveY] = useState(0);
  const feedRef = useRef<HTMLDivElement>(null);
  
  // Refresh feed when component mounts
  useEffect(() => {
    refreshFeed();
  }, []);
  
  // Handle pull-to-refresh
  const handleTouchStart = (e: React.TouchEvent) => {
    // Only enable pull-to-refresh when scrolled to the top
    if (window.scrollY === 0) {
      setPullStartY(e.touches[0].clientY);
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (pullStartY > 0 && window.scrollY === 0) {
      setPullMoveY(e.touches[0].clientY);
    }
  };
  
  const handleTouchEnd = () => {
    // If pulled down at least 60px and we're at the top of the page
    if (pullMoveY - pullStartY > 60 && window.scrollY === 0) {
      handleRefresh();
    }
    
    // Reset values
    setPullStartY(0);
    setPullMoveY(0);
  };
  
  const handleRefresh = async () => {
    if (loading || isRefreshing) return;
    
    setIsRefreshing(true);
    refreshFeed();
    
    // Simulate network delay for visual feedback
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  if (!user) return null;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="pb-10 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="hidden md:block md:col-span-3">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sticky top-24"
            >
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                <Sparkles size={18} className="text-blue-600 dark:text-blue-500 mr-2" />
                Quick Links
              </h3>
              <nav className="space-y-2">
                {['My Classes', 'Study Groups', 'Events', 'Library', 'Campus Map'].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400 rounded-lg transition-colors"
                  >
                    {item}
                  </a>
                ))}
              </nav>
            </motion.div>
          </div>

          {/* Main Content */}
          <motion.div 
            className="md:col-span-6"
            variants={container}
            initial="hidden"
            animate="show"
            ref={feedRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <PostForm />
            
            {/* Pull-to-refresh indicator */}
            {isRefreshing && (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400"></div>
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Refreshing...</span>
              </div>
            )}
            
            <div className="space-y-6">
              {feedPosts.length > 0 ? (
                feedPosts.map((post) => (
                  <motion.div key={post.id} variants={item}>
                    <PostCard 
                      post={post} 
                      onNavigateToProfile={(userId) => {
                        // Store the user ID in localStorage for the profile page to use
                        localStorage.setItem('viewProfileUserId', userId);
                        // Navigate to the profile page
                        onNavigate && onNavigate('profile', userId);
                      }} 
                    />
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  variants={item}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center"
                >
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Your feed is empty</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Connect with friends to see their posts in your feed, or create your first post above!
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Right Sidebar */}
          <div className="hidden md:block md:col-span-3">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Trending Topics */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                  <TrendingUp size={18} className="text-blue-600 dark:text-blue-500 mr-2" />
                  Trending Topics
                </h3>
                <div className="space-y-3">
                  {['#CampusLife', '#Finals2024', '#UniversitySpirit', '#StudentSuccess', '#CampusEvents'].map((tag) => (
                    <div key={tag} className="flex items-center justify-between">
                      <span className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer">{tag}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">23 posts</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Connections */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                  <Users size={18} className="text-blue-600 dark:text-blue-500 mr-2" />
                  People You May Know
                </h3>
                <div className="space-y-4">
                  {suggestedFriends.slice(0, 3).map((suggestion) => (
                    <div key={suggestion.id} className="flex items-center space-x-3">
                      <img 
                        src={suggestion.avatar} 
                        alt={suggestion.name}
                        className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => {
                          // Store the user ID in localStorage for the profile page to use
                          localStorage.setItem('viewProfileUserId', suggestion.id);
                          // Navigate to the profile page
                          onNavigate && onNavigate('profile', suggestion.id);
                        }}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-800 dark:text-gray-200">{suggestion.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{suggestion.program || suggestion.role}</p>
                      </div>
                      <button 
                        onClick={() => sendFriendRequest(suggestion.id)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                      >
                        Connect
                      </button>
                    </div>
                  ))}
                  {suggestedFriends.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                      No suggestions available right now
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;