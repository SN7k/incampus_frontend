import React, { useState, useEffect } from 'react';
import PullToRefresh from 'react-simple-pull-to-refresh';
import { motion } from 'framer-motion';
import PostForm from '../components/post/PostForm';
import PostCard from '../components/post/PostCard';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, Users, BookOpen, Bookmark, Settings, HelpCircle, Heart } from 'lucide-react';
import { User } from '../types';
import { Post } from '../types/post';
import axiosInstance from '../utils/axios';
import { hasRegistrationFlags, clearRegistrationFlags } from '../utils/authFlowHelpers';
// We're directly handling auth state in this component now

interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
}

interface SuggestedUser extends User {
  relevance?: string[];
}

const Feed: React.FC = () => {
  // Add safety check for authentication issues
  useEffect(() => {
    // Check for the specific error that's causing problems
    const handleError = (event: ErrorEvent) => {
      // Check if we're coming from friend suggestions or registration
      const isFromRegistrationFlow = 
        localStorage.getItem('completedFriendSuggestions') === 'true' ||
        localStorage.getItem('justCompletedRegistration') === 'true' ||
        sessionStorage.getItem('redirectAfterRegistration') === 'true';
      
      // If we're coming from registration, don't force logout on error
      if (isFromRegistrationFlow) {
        console.log('Error detected but coming from registration, preserving auth state');
        
        // Force token into axios headers
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          console.log('Forced token into axios headers after error');
        }
        
        // Prevent the error from propagating
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      
      // Only force logout for specific errors and when not in registration flow
      // Prevent redirect loops by checking if we're already in a logout loop
      const inLogoutLoop = window.location.search.includes('forceLogout') || 
                         localStorage.getItem('inLogoutLoop') === 'true';
      
      if (event.error && event.error.toString().includes('is not a function') && !inLogoutLoop) {
        console.error('Critical error detected in Feed component, forcing logout');
        localStorage.setItem('authError', 'true');
        localStorage.setItem('inLogoutLoop', 'true');
        // Set a timeout to clear the logout loop flag
        setTimeout(() => {
          localStorage.removeItem('inLogoutLoop');
        }, 5000);
        window.location.href = '/';
      }
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  // Handle special case when coming from friend suggestions or direct login
  useEffect(() => {
    console.log('Feed component mounted, checking authentication state');
    
    // Check if we have a direct login success flag
    const directLoginSuccess = localStorage.getItem('directLoginSuccess') === 'true';
    if (directLoginSuccess) {
      console.log('Direct login detected, ensuring auth state is properly set');
    }
    
    // Check for token in multiple places with more robust extraction
    let token = localStorage.getItem('token');
    
    if (!token) {
      token = sessionStorage.getItem('token');
    }
    
    if (!token) {
      // Try to extract from cookies with better error handling
      try {
        const cookies = document.cookie.split(';');
        const authCookie = cookies.find(c => c.trim().startsWith('authToken='));
        if (authCookie) {
          token = authCookie.split('=')[1];
          console.log('Feed: Recovered token from cookies');
        }
      } catch (e) {
        console.error('Error extracting token from cookies:', e);
      }
    }
    
    // If we have a token and direct login success, force authentication state
    if (token && directLoginSuccess) {
      console.log('Setting axios auth header from direct login token');
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Clear the direct login flag after handling it
      localStorage.removeItem('directLoginSuccess');
    }
    
    // If we still don't have a token, try to get user data and extract token from there
    if (!token) {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          if (user && user.token) {
            token = user.token;
            console.log('Feed: Recovered token from user data');
            // Save the token to localStorage for future use (with null check)
            if (token) {
              localStorage.setItem('token', token);
            }
          }
        }
      } catch (e) {
        console.error('Error extracting token from user data:', e);
      }
    }
    
    // Check for registration flags
    const isFromRegistrationFlow = 
      localStorage.getItem('completedFriendSuggestions') === 'true' ||
      localStorage.getItem('justCompletedRegistration') === 'true' ||
      sessionStorage.getItem('redirectAfterRegistration') === 'true' ||
      localStorage.getItem('inRegistrationFlow') === 'true' ||
      localStorage.getItem('forceAuthenticated') === 'true';
    
    // If we're coming from registration, force authentication state
    if (isFromRegistrationFlow) {
      console.log('Feed: Coming from registration flow, forcing authentication state');
      
      // Set timestamp to allow bypassing auth checks temporarily
      localStorage.setItem('authBypassTimestamp', Date.now().toString());
      
      // Force token into axios headers
      if (token) {
        // Ensure the token is properly formatted (with null check)
        const formattedToken = token && token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        
        // Set token in axios headers
        axiosInstance.defaults.headers.common['Authorization'] = formattedToken;
        console.log('Feed: Forced token into axios headers:', formattedToken);
        
        // Also save token to all storage mechanisms for redundancy
        localStorage.setItem('token', token);
        sessionStorage.setItem('token', token);
        document.cookie = `authToken=${token}; path=/; max-age=86400`; // 24 hours
        
        // Force a reload of the user data from API
        setTimeout(() => {
          try {
            // Make a direct request to get user data
            axiosInstance.get('/api/user/me')
              .then(response => {
                // Type assertion to handle the response data properly
                const responseData = response.data as { status: string; data: any };
                if (responseData && responseData.data) {
                  const userData = responseData.data;
                  console.log('Feed: Successfully retrieved user data:', userData);
                  localStorage.setItem('user', JSON.stringify(userData));
                  sessionStorage.setItem('user', JSON.stringify(userData));
                }
              })
              .catch(err => {
                console.error('Error fetching user data:', err);
              });
          } catch (e) {
            console.error('Error making user data request:', e);
          }
        }, 1000);
      } else {
        console.error('Feed: No token available despite registration flags');
      }
    } else if (token) {
      console.log('Feed: Found authentication token, ensuring it is set in axios headers');
      // Ensure the token is properly formatted (with null check)
      const formattedToken = token && token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      axiosInstance.defaults.headers.common['Authorization'] = formattedToken;
    } else {
      console.log('Feed: No authentication token found, this could cause issues');
    }
    
    // Check for special parameters that indicate we're coming from registration
    const urlParams = new URLSearchParams(window.location.search);
    const fromRegistration = urlParams.get('fromRegistration') === 'true';
    const preserveAuth = urlParams.get('preserveAuth') === 'true';
    
    // Check for registration flags
    const justCompletedRegistration = localStorage.getItem('justCompletedRegistration') === 'true';
    const redirectAfterRegistration = sessionStorage.getItem('redirectAfterRegistration') === 'true';
    const completedFriendSuggestions = localStorage.getItem('completedFriendSuggestions') === 'true';
    
    if (fromRegistration || preserveAuth || justCompletedRegistration || 
        redirectAfterRegistration || completedFriendSuggestions) {
      console.log('Feed: Coming from registration flow, special handling applied');
      
      // Clean up URL parameters without triggering a page reload
      if (fromRegistration || preserveAuth) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      // Don't clear flags immediately to ensure they're used by any pending requests
      // Increase the timeout to 30 seconds to ensure all components are fully loaded
      const clearFlagsTimeout = setTimeout(() => {
        console.log('Feed: Delayed clearing of registration flags');
        // DON'T clear registration flags immediately after login - this causes the blinking
        // Instead, just clear non-critical flags
        localStorage.removeItem('skipAuthCheck');
        
        // Set a flag to indicate we've successfully loaded the feed
        localStorage.setItem('feedLoaded', 'true');
        
        // After feed is fully loaded, wait another 30 seconds before clearing all flags
        setTimeout(() => {
          console.log('Feed fully loaded, now clearing all registration flags');
          // Clear registration flags but keep the authentication state
          clearRegistrationFlags();
          // Also clear the special flags we set for this transition
          localStorage.removeItem('completedFriendSuggestions');
          localStorage.removeItem('forceAuthenticated');
          localStorage.removeItem('authBypassTimestamp');
        }, 30000);
      }, 30000); // 30 second delay to ensure all requests complete
      
      return () => clearTimeout(clearFlagsTimeout);
    } else if (hasRegistrationFlags()) {
      // Handle the case where we have registration flags but no special parameters
      console.log('Registration flags detected in Feed component, user has completed registration');
      
      // Use a timeout to ensure all components have loaded and used the flags if needed
      const regularFlagsTimeout = setTimeout(() => {
        console.log('Clearing registration flags after successful navigation to feed');
        clearRegistrationFlags();
        
        // Log the successful completion of the registration flow
        console.log('Registration flow completed successfully');
      }, 5000); // 5 second delay to ensure all components have loaded
      
      // Clean up the timeout when component unmounts
      return () => clearTimeout(regularFlagsTimeout);
    }
  }, []);
  
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch posts
  const fetchPosts = async () => {
    if (!user) return;
    try {
      // Ensure the token is set in axios headers
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        console.log('Setting token in axios headers for post fetch');
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        console.error('No token available when fetching posts');
      }
      
      console.log('Fetching posts for user:', user._id);
      const response = await axiosInstance.get<ApiResponse<Post[]>>('/api/posts/feed');
      
      if (response.data.status === 'success') {
        console.log(`Successfully fetched ${response.data.data.length} posts`);
        setPosts(response.data.data);
      } else {
        console.error('Failed to fetch posts:', response.data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to fetch posts');
    }
  };

  // Fetch suggested users
  const fetchSuggestedUsers = async () => {
    if (!user) return;
    try {
      const response = await axiosInstance.get<ApiResponse<User[]>>('/api/users/suggestions');
      if (response.data.status === 'success') {
        setSuggestedUsers(response.data.data.map(user => ({
          ...user,
          relevance: []
        }) as SuggestedUser));
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
        // Check if we just completed registration
        const completingOnboarding = localStorage.getItem('completingOnboarding') === 'true';
        if (completingOnboarding) {
          console.log('Just completed onboarding, ensuring auth token is set');
          // Clear the flag
          localStorage.removeItem('completingOnboarding');
          
          // Ensure token is set in axios headers
          const token = localStorage.getItem('token') || sessionStorage.getItem('token');
          if (token) {
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            console.log('Auth token set in axios headers');
          }
        }
        
        // Ensure we have valid user data
        const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (userStr) {
          try {
            const userData = JSON.parse(userStr);
            console.log('User data available in Feed component:', userData);
          } catch (e) {
            console.error('Error parsing user data in Feed component:', e);
          }
        } else {
          console.error('No user data found in storage');
        }
        
        console.log('Fetching posts and suggested users...');
        await Promise.all([
          fetchPosts(),
          fetchSuggestedUsers()
        ]);
        console.log('Successfully fetched posts and suggested users');
      } catch (error) {
        console.error('Failed to load data:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      console.log('User authenticated, loading data...');
      loadData();
    } else {
      console.error('No user object available in Feed component');
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
                      key={suggestedUser._id} 
                      className="flex items-center p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors mx-0"
                    >
                      <img 
                        src={suggestedUser.avatar || '/default-avatar.png'} 
                        alt={suggestedUser.name}
                        className="w-12 h-12 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.location.href = `/profile/${suggestedUser._id}`}
                      />
                      <div 
                        className="ml-3 cursor-pointer" 
                        onClick={() => window.location.href = `/profile/${suggestedUser._id}`}
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
                          {suggestedUser.role === 'faculty' ? 'Faculty' : suggestedUser.department || suggestedUser.program || ''}
                        </p>
                      </div>
                      <div className="ml-auto">
                        <button 
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium whitespace-nowrap"
                          onClick={() => window.location.href = `/friends?add=${suggestedUser._id}`}
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