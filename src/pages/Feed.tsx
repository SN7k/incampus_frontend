import React, { useState, useEffect, useCallback } from 'react';
import PullToRefresh from 'react-simple-pull-to-refresh';
import { motion } from 'framer-motion';
import PostForm from '../components/post/PostForm';
import PostCard from '../components/post/PostCard';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, Users, BookOpen, Bookmark, Settings, HelpCircle, Heart } from 'lucide-react';
import { User, Post } from '../types';
import { postsApi } from '../services/postsApi';
import { usersApi } from '../services/usersApi';
import { friendsApi } from '../services/friendsApi';
import { getAvatarUrl } from '../utils/avatarUtils';
import CreatePostModal from '../components/post/CreatePostModal';
import Button from '../components/ui/Button';

const Feed: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  
  // Animation variants for grid and items
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Load posts from API
  const loadPosts = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get feed posts from API
      const feedPosts = await postsApi.getFeedPosts();
      // Normalize posts: ensure each post has a 'user' field and 'createdAt' as Date
      const normalizedPosts = feedPosts.map(post => ({
        ...post,
        user: post.user || (post as any).author,
        createdAt: post.createdAt ? new Date(post.createdAt) : new Date()
      }));
      setPosts(normalizedPosts);
    } catch (error: unknown) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load friend suggestions from API
  const loadFriendSuggestions = useCallback(async () => {
    if (!user) return;
    
    try {
      const suggestions = await usersApi.getUserSuggestions();
      setSuggestedUsers(suggestions.slice(0, 3)); // Take top 3 suggestions
    } catch (error: unknown) {
      console.error('Error loading friend suggestions:', error);
      // Don't show error for suggestions as it's not critical
    }
  }, [user]);

  // Handle sending a friend request
  const handleAddFriend = async (userId: string) => {
    try {
      await friendsApi.sendFriendRequest(userId);
      setSentRequests(prev => [...prev, userId]);
      // Optionally, refresh suggestions or show a success message
    } catch (error) {
      console.error('Failed to send friend request:', error);
      // Handle error display to the user
    }
  };

  const navigateToUserProfile = (profileUserId: string) => {
    localStorage.setItem('viewProfileUserId', profileUserId);
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'profile' } }));
  };

  // Initial load
  useEffect(() => {
    loadPosts();
    loadFriendSuggestions();
  }, [loadPosts, loadFriendSuggestions]);

  // Listen for post deletion events
  useEffect(() => {
    const handlePostDeleted = (event: CustomEvent) => {
      const { postId } = event.detail;
      setPosts(currentPosts => currentPosts.filter(post => post.id !== postId));
    };
    
    window.addEventListener('postDeleted', handlePostDeleted as EventListener);
    return () => {
      window.removeEventListener('postDeleted', handlePostDeleted as EventListener);
    };
  }, []);
  
  // Listen for new post creation events
  useEffect(() => {
    const handlePostCreated = (event: CustomEvent) => {
      const { post } = event.detail;
      console.log('New post detected:', post);
      
      // Add the new post to the beginning of the feed
      setPosts(currentPosts => [{
        ...post,
        user: post.user || (post as any).author,
        createdAt: post.createdAt ? new Date(post.createdAt) : new Date()
      }, ...currentPosts]);
    };
    
    window.addEventListener('postCreated', handlePostCreated as EventListener);
    return () => {
      window.removeEventListener('postCreated', handlePostCreated as EventListener);
    };
  }, []);
  
  // Handle refresh function
  const handleRefresh = async () => {
    try {
      await loadPosts();
      await loadFriendSuggestions();
    } catch (error: unknown) {
      console.error('Error refreshing feed:', error);
    }
  };

  // Navigation handlers for quick links
  const navigateToMemories = () => {
    console.log('FEED: Navigating to memories');
    localStorage.removeItem('viewProfileUserId');
    localStorage.setItem('activeProfileTab', 'memories');
    localStorage.setItem('currentPage', 'profile');
    // Dispatch a custom event to notify Profile component
    window.dispatchEvent(new CustomEvent('profileNavigation', { 
      detail: { action: 'viewOwnProfile' } 
    }));
    // Navigate to profile page
    window.dispatchEvent(new CustomEvent('navigate', { 
      detail: { page: 'profile', timestamp: new Date().getTime() } 
    }));
  };

  const navigateToCollections = () => {
    console.log('FEED: Navigating to collections');
    localStorage.removeItem('viewProfileUserId');
    localStorage.setItem('activeProfileTab', 'collections');
    localStorage.setItem('currentPage', 'profile');
    // Dispatch a custom event to notify Profile component
    window.dispatchEvent(new CustomEvent('profileNavigation', { 
      detail: { action: 'viewOwnProfile' } 
    }));
    // Navigate to profile page
    window.dispatchEvent(new CustomEvent('navigate', { 
      detail: { page: 'profile', timestamp: new Date().getTime() } 
    }));
  };

  const navigateToSettings = () => {
    console.log('FEED: Navigating to settings');
    localStorage.setItem('currentPage', 'settings');
    window.dispatchEvent(new CustomEvent('navigate', { 
      detail: { page: 'settings' } 
    }));
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 pb-20">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="ml-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-20 md:pb-10 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
          {/* Left Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sticky top-24 transition-colors duration-200"
            >
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                <Sparkles size={18} className="text-blue-600 dark:text-blue-400 mr-2" />
                Quick Links
              </h3>
              <nav className="space-y-2">
                <a
                  href="#"
                  className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-700 dark:hover:text-blue-400 rounded-lg transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToMemories();
                  }}
                >
                  <BookOpen size={16} className="mr-2 text-blue-600 dark:text-blue-400" />
                  Memories
                </a>
                <a
                  href="#"
                  className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-700 dark:hover:text-blue-400 rounded-lg transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToCollections();
                  }}
                >
                  <Bookmark size={16} className="mr-2 text-blue-600 dark:text-blue-400" />
                  Collections
                </a>
                <a
                  href="#"
                  className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-700 dark:hover:text-blue-400 rounded-lg transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToSettings();
                  }}
                >
                  <Settings size={16} className="mr-2 text-blue-600 dark:text-blue-400" />
                  Settings
                </a>
                <a
                  href="mailto:connect.incampus@gmail.com?subject=InCampus%20Support%20Request&body=Hello%20InCampus%20Support%20Team,%0A%0AI%20need%20assistance%20with%20the%20following%20issue:%0A%0A[Please%20describe%20your%20issue%20here]%0A%0AThank%20you,%0A[Your%20Name]"
                  className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-700 dark:hover:text-blue-400 rounded-lg transition-colors"
                >
                  <HelpCircle size={16} className="mr-2 text-blue-600 dark:text-blue-400" />
                  Help
                </a>
                <a
                  href="#"
                  className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-700 dark:hover:text-blue-400 rounded-lg transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                >
                  <Heart size={16} className="mr-2 text-blue-600 dark:text-blue-400" />
                  Contribute
                </a>
              </nav>
            </motion.div>
          </div>
          {/* Main Content */}
          <motion.div 
            className="col-span-1 lg:col-span-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {/* Post Form - Fixed at the top */}
            <PostForm />
            {/* Refreshable Posts Section */}
            <PullToRefresh
              onRefresh={handleRefresh}
              pullingContent={
                <div className="flex justify-center items-center py-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 dark:border-blue-400"></div>
                </div>
              }
              refreshingContent={
                <div className="flex justify-center items-center py-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 dark:border-blue-400"></div>
                </div>
              }
              className="mt-6"
            >
              <div className="space-y-6">
                {posts.length === 0 && !loading ? (
                  <div className="text-center py-12">
                    <div className="text-gray-500 dark:text-gray-400 mb-4">
                      <Sparkles className="h-12 w-12 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Welcome to InCampus!</h3>
                      <p className="text-sm">Start by creating your first post or connecting with friends.</p>
                    </div>
                    <div className="flex justify-center space-x-4">
                      <Button
                        variant="primary"
                        onClick={() => setIsCreatePostModalOpen(true)}
                      >
                        Create Post
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          localStorage.setItem('friendsActiveTab', 'suggestions');
                          window.dispatchEvent(new CustomEvent('navigate', { 
                            detail: { page: 'friends' } 
                          }));
                        }}
                      >
                        Find Friends
                      </Button>
                    </div>
                  </div>
                ) :
                  posts.map((post) => (
                    <motion.div key={post.id} variants={item}>
                      <PostCard post={post} />
                    </motion.div>
                  ))
                }
              </div>
            </PullToRefresh>
          </motion.div>
          {/* Right Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Suggested Connections */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sticky top-24 transition-colors duration-200">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                  <Users size={18} className="text-green-600 dark:text-green-400 mr-2" />
                  People You May Know
                </h3>
                <div className="space-y-3">
                  {suggestedUsers.map((suggestedUser) => {
                    return (
                      <div key={suggestedUser.id} className="flex items-center">
                        <img
                          src={getAvatarUrl(suggestedUser.avatar, suggestedUser.name || 'User')}
                          alt={suggestedUser.name || 'User'}
                          className="w-10 h-10 rounded-full object-cover cursor-pointer"
                          onClick={() => navigateToUserProfile(suggestedUser.id)}
                        />
                        <div className="ml-3 flex-1 min-w-0">
                          <p 
                            className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate cursor-pointer"
                            onClick={() => navigateToUserProfile(suggestedUser.id)}
                          >
                            {suggestedUser.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{suggestedUser.universityId || ''}</p>
                        </div>
                        <div className="ml-auto">
                          <Button
                            size="sm"
                            variant={sentRequests.includes(suggestedUser.id) ? "secondary" : "primary"}
                            onClick={() => handleAddFriend(suggestedUser.id)}
                            disabled={sentRequests.includes(suggestedUser.id)}
                          >
                            {sentRequests.includes(suggestedUser.id) ? 'Sent' : 'Add Friend'}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        <CreatePostModal
          isOpen={isCreatePostModalOpen}
          onClose={() => setIsCreatePostModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default Feed;