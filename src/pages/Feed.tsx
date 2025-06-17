import React, { useState, useEffect, useCallback } from 'react';
import PullToRefresh from 'react-simple-pull-to-refresh';
import { motion } from 'framer-motion';
import PostForm from '../components/post/PostForm';
import PostCard from '../components/post/PostCard';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles } from 'lucide-react';
import { User, Post } from '../types';
import { postsApi } from '../services/postsApi';
import { usersApi } from '../services/usersApi';

const Feed: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load posts from API
  const loadPosts = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Get feed posts from API
      const feedPosts = await postsApi.getFeedPosts();
      setPosts(feedPosts);
    } catch (error: unknown) {
      console.error('Error loading posts:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load posts';
      setError(errorMessage);
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
      setPosts(currentPosts => [post, ...currentPosts]);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 pb-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <PullToRefresh onRefresh={handleRefresh}>
          <div className="space-y-6">
            {/* Post Creation */}
            <PostForm />
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                {error}
                <button 
                  onClick={loadPosts}
                  className="ml-2 underline hover:no-underline"
                >
                  Try again
                </button>
              </div>
            )}
            
            {/* Posts Feed */}
            {posts.length === 0 && !loading ? (
              <div className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400 mb-4">
                  <Sparkles className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Welcome to InCampus!</h3>
                  <p className="text-sm">Start by creating your first post or connecting with friends.</p>
                </div>
                <div className="flex justify-center space-x-4">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Create Post
                  </button>
                  <button className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                    Find Friends
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PostCard post={post} />
                  </motion.div>
                ))}
              </div>
            )}
            
            {/* Friend Suggestions */}
            {suggestedUsers.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    People You May Know
                  </h3>
                  <button className="text-blue-600 dark:text-blue-400 text-sm hover:underline">
                    See All
                  </button>
                </div>
                
                <div className="space-y-3">
                  {suggestedUsers.map((suggestedUser) => (
                    <div key={suggestedUser.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={suggestedUser.avatar}
                          alt={suggestedUser.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {suggestedUser.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {suggestedUser.universityId}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          // Navigate to user profile
                          localStorage.setItem('viewProfileUserId', suggestedUser.id);
                          window.dispatchEvent(new CustomEvent('navigate', { 
                            detail: { page: 'profile', userId: suggestedUser.id } 
                          }));
                        }}
                        className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                      >
                        View Profile
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </PullToRefresh>
      </div>
    </div>
  );
};

export default Feed;