import React, { useState, useEffect } from 'react';
import PullToRefresh from 'react-simple-pull-to-refresh';
import { motion } from 'framer-motion';
import PostForm from '../components/post/PostForm';
import PostCard from '../components/post/PostCard';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, Users, BookOpen, Bookmark, Settings, HelpCircle, Heart } from 'lucide-react';
import { User, Post } from '../types';
import axiosInstance from '../utils/axios';

interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
}

const Feed: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch posts
  const fetchPosts = async () => {
    if (!user) return;
    try {
      const response = await axiosInstance.get<ApiResponse<Post[]>>('/api/posts/feed');
      if (response.data.status === 'success') {
        setPosts(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      setError('Failed to load posts');
    }
  };

  // Fetch suggested users
  const fetchSuggestedUsers = async () => {
    if (!user) return;
    try {
      const response = await axiosInstance.get<ApiResponse<User[]>>('/api/users/suggestions');
      if (response.data.status === 'success') {
        setSuggestedUsers(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch suggested users:', error);
      setError('Failed to load suggested users');
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([
          fetchPosts(),
          fetchSuggestedUsers()
        ]);
      } catch (error) {
        console.error('Failed to load data:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user]);

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
      await Promise.all([
        fetchPosts(),
        fetchSuggestedUsers()
      ]);
    } catch (error) {
      console.error('Failed to refresh data:', error);
      setError('Failed to refresh data');
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="pt-20 pb-20 md:pb-10 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-20 pb-20 md:pb-10 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
                  onClick={() => {
                    localStorage.removeItem('viewProfileUserId');
                    localStorage.setItem('activeProfileTab', 'memories');
                    localStorage.setItem('currentPage', 'profile');
                    window.dispatchEvent(new CustomEvent('navigate', { 
                      detail: { 
                        page: 'profile',
                        timestamp: new Date().getTime() 
                      } 
                    }));
                  }}
                >
                  <BookOpen size={16} className="mr-2 text-blue-600 dark:text-blue-400" />
                  Memories
                </a>
                <a
                  href="#"
                  className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-700 dark:hover:text-blue-400 rounded-lg transition-colors"
                  onClick={() => {
                    localStorage.removeItem('viewProfileUserId');
                    localStorage.setItem('activeProfileTab', 'collections');
                    localStorage.setItem('currentPage', 'profile');
                    window.dispatchEvent(new CustomEvent('navigate', { 
                      detail: { 
                        page: 'profile',
                        timestamp: new Date().getTime() 
                      } 
                    }));
                  }}
                >
                  <Bookmark size={16} className="mr-2 text-blue-600 dark:text-blue-400" />
                  Collections
                </a>
                <a
                  href="#"
                  className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-700 dark:hover:text-blue-400 rounded-lg transition-colors"
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
            {/* Post Form */}
            <PostForm />
            
            {/* Refreshable Posts Section */}
            <PullToRefresh
              onRefresh={handleRefresh}
              pullingContent={<div className="text-center text-gray-500 dark:text-gray-400 py-2">Pull down to refresh</div>}
              refreshingContent={
                <div className="flex justify-center items-center py-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 dark:border-blue-400"></div>
                </div>
              }
              className="mt-6"
            >
              <div className="space-y-6">
                {posts.map((post) => (
                  <motion.div key={post.id} variants={item}>
                    <PostCard post={post} />
                  </motion.div>
                ))}
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
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sticky top-24 transition-colors duration-200 overflow-hidden">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                  <Users size={18} className="text-blue-600 dark:text-blue-400 mr-2" />
                  People You May Know
                </h3>
                <div className="space-y-2 -mx-4 px-4">
                  {suggestedUsers.map((suggestedUser) => (
                    <div 
                      key={suggestedUser.id} 
                      className="flex items-center p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors mx-0"
                    >
                      <img 
                        src={suggestedUser.avatar} 
                        alt={suggestedUser.name}
                        className="w-12 h-12 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.location.href = `/profile/${suggestedUser.id}`}
                      />
                      <div 
                        className="ml-3 cursor-pointer" 
                        onClick={() => window.location.href = `/profile/${suggestedUser.id}`}
                      >
                        <h3 className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          {suggestedUser.name}
                          {suggestedUser.relevance?.includes('Same Year') && (
                            <span className="ml-2 text-xs font-medium px-1.5 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                              Same Year
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {suggestedUser.role === 'faculty' ? 'Faculty' : suggestedUser.department}
                        </p>
                      </div>
                      <div className="ml-auto">
                        <button 
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium whitespace-nowrap"
                          onClick={() => window.location.href = `/friends?add=${suggestedUser.id}`}
                        >
                          Add Friend
                        </button>
                      </div>
                    </div>
                  ))}
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