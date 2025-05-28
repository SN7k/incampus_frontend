import React, { useState, useEffect } from 'react';
import PullToRefresh from 'react-simple-pull-to-refresh';
import { motion } from 'framer-motion';
import PostForm from '../components/post/PostForm';
import PostCard from '../components/post/PostCard';
import { mockPosts, mockUsers } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, Users, BookOpen, Bookmark, Settings, HelpCircle, Heart } from 'lucide-react';
import { User, Post } from '../types';

const Feed: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  
  // Initialize mock friends data
  const [friends] = useState<string[]>(() => {
    // For demo purposes, we'll consider the first 2 users as friends
    return mockUsers
      .filter(mockUser => user && mockUser.id !== user.id)
      .slice(0, 2)
      .map(mockUser => mockUser.id);
  });

  // Helper function to extract year from university ID (e.g., 'BWU/BCA/20/001' -> '20')
  const extractYear = (universityId: string): string => {
    const parts = universityId.split('/');
    return parts.length >= 3 ? parts[2] : '';
  };
  
  // Helper function to extract department from university ID (e.g., 'BWU/BCA/20/001' -> 'BCA')
  const extractDepartment = (universityId: string): string => {
    const parts = universityId.split('/');
    return parts.length >= 2 ? parts[1] : '';
  };

  // Generate personalized friend suggestions based on matching attributes
  useEffect(() => {
    if (!user) return;

    // Get current user's year and department
    const currentUserYear = extractYear(user.universityId);
    const currentUserDept = extractDepartment(user.universityId);

    // Filter out the current user and find users with matching attributes
    const filteredUsers = mockUsers.filter(mockUser => {
      // Skip current user
      if (mockUser.id === user.id) return false;
      
      // Get potential match's year and department
      const year = extractYear(mockUser.universityId);
      const dept = extractDepartment(mockUser.universityId);
      
      // Calculate relevance score based on matching attributes
      let relevanceScore = 0;
      
      // Same year is highly relevant
      if (year === currentUserYear) relevanceScore += 3;
      
      // Same department is relevant
      if (dept === currentUserDept) relevanceScore += 2;
      
      // Faculty members are always somewhat relevant
      if (mockUser.role === 'faculty') relevanceScore += 1;
      
      // Only include users with some relevance
      return relevanceScore > 0;
    });

    // Sort by relevance (most relevant first)
    const sortedUsers = [...filteredUsers].sort((a, b) => {
      const aYear = extractYear(a.universityId);
      const aDept = extractDepartment(a.universityId);
      const bYear = extractYear(b.universityId);
      const bDept = extractDepartment(b.universityId);
      
      let aScore = 0;
      let bScore = 0;
      
      // Calculate scores
      if (aYear === currentUserYear) aScore += 3;
      if (aDept === currentUserDept) aScore += 2;
      if (a.role === 'faculty') aScore += 1;
      
      if (bYear === currentUserYear) bScore += 3;
      if (bDept === currentUserDept) bScore += 2;
      if (b.role === 'faculty') bScore += 1;
      
      // Sort by score (descending)
      return bScore - aScore;
    });

    // Take the top 3 most relevant users
    setSuggestedUsers(sortedUsers.slice(0, 3));
  }, [user]);

  if (!user) return null;
  
  // Function to filter out deleted posts
  const filterDeletedPosts = (postsToFilter: Post[]) => {
    try {
      const deletedPostsStr = localStorage.getItem('deletedPosts') || '[]';
      const deletedPosts = JSON.parse(deletedPostsStr);
      return postsToFilter.filter(post => !deletedPosts.includes(post.id));
    } catch (error) {
      console.error('Error filtering deleted posts:', error);
      return postsToFilter;
    }
  };
  
  // Load posts from localStorage and mock data
  useEffect(() => {
    if (!user) return;
    
    // Get user-created posts from localStorage
    const userCreatedPosts = JSON.parse(localStorage.getItem('userPosts') || '[]');
    console.log('User created posts loaded:', userCreatedPosts.length);
    
    // Get posts from friends
    const friendPosts = mockPosts.filter(post => friends.includes(post.userId));
    
    // Sort friend posts by date (newest first)
    const sortedFriendPosts = [...friendPosts].sort((a, b) => {
      const dateA = new Date(b.createdAt);
      const dateB = new Date(a.createdAt);
      return dateA.getTime() - dateB.getTime();
    });
    
    // Get some random posts from non-friends (for discovery)
    const nonFriendPosts = mockPosts.filter(post => 
      post.userId !== user.id && !friends.includes(post.userId)
    );
    
    // Randomly select some non-friend posts (up to 5)
    const randomNonFriendPosts = nonFriendPosts
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);
    
    // Sort non-friend posts by date (newest first)
    const sortedNonFriendPosts = [...randomNonFriendPosts].sort((a, b) => {
      const dateA = new Date(b.createdAt);
      const dateB = new Date(a.createdAt);
      return dateA.getTime() - dateB.getTime();
    });
    
    // Combine all posts with user-created posts first, then friend posts, then others
    const combinedPosts = [...userCreatedPosts, ...sortedFriendPosts, ...sortedNonFriendPosts];
    
    // Filter out deleted posts
    const filteredPosts = filterDeletedPosts(combinedPosts);
    
    setPosts(filteredPosts);
  }, [user, friends]);
  
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
  const handleRefresh = () => {
    return new Promise<void>((resolve) => {
      // Simulate API call to refresh posts
      setTimeout(() => {
        // In a real app, you would fetch new posts from an API
        // For now, we'll just re-run the post selection logic with some randomness
        if (!user) {
          resolve();
          return;
        }
        
        // Get posts from friends
        const friendPosts = mockPosts.filter(post => friends.includes(post.userId));
        
        // Sort friend posts by date (newest first)
        const sortedFriendPosts = [...friendPosts].sort((a, b) => 
          b.createdAt.getTime() - a.createdAt.getTime()
        );
        
        // Get some random posts from non-friends (for discovery)
        const nonFriendPosts = mockPosts.filter(post => 
          post.userId !== user.id && !friends.includes(post.userId)
        );
        
        // Randomly select some non-friend posts (up to 5)
        const randomNonFriendPosts = nonFriendPosts
          .sort(() => Math.random() - 0.5)
          .slice(0, 5);
        
        // Sort non-friend posts by date (newest first)
        const sortedNonFriendPosts = [...randomNonFriendPosts].sort((a, b) => 
          b.createdAt.getTime() - a.createdAt.getTime()
        );
        
        // Prioritize friend posts by placing them first in the feed
        const feedPosts = [...sortedFriendPosts, ...sortedNonFriendPosts];
        
        setPosts(feedPosts);
        resolve();
      }, 1000);
    });
  };

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
                    // Clear any stored profile ID to ensure we show the user's own profile
                    localStorage.removeItem('viewProfileUserId');
                    
                    // Navigate to Profile page and set memories tab as active
                    localStorage.setItem('activeProfileTab', 'memories');
                    localStorage.setItem('currentPage', 'profile');
                    
                    // Add timestamp to make the event unique
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
                    // Clear any stored profile ID to ensure we show the user's own profile
                    localStorage.removeItem('viewProfileUserId');
                    
                    // Navigate to Profile page and set collections tab as active
                    localStorage.setItem('activeProfileTab', 'collections');
                    localStorage.setItem('currentPage', 'profile');
                    
                    // Add timestamp to make the event unique
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
                  onClick={() => {
                    // Navigate to Settings page (or keep in Feed for now)
                    // For now, this stays in the Feed page
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
                  onClick={() => {
                    // Navigate to Contribute page (or keep in Feed for now)
                    // For now, this stays in the Feed page
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
                  {suggestedUsers.map((suggestedUser) => {
                    // Get matching attributes for this user
                    const userYear = extractYear(suggestedUser.universityId);
                    const userDept = extractDepartment(suggestedUser.universityId);
                    const currentUserYear = user ? extractYear(user.universityId) : '';
                    const currentUserDept = user ? extractDepartment(user.universityId) : '';
                    
                    // Determine matching attributes for relevance
                    const hasMatchingYear = userYear === currentUserYear;
                    const hasMatchingDept = userDept === currentUserDept;
                    const isFaculty = suggestedUser.role === 'faculty';
                    
                    // Department to display
                    const displayDepartment = isFaculty ? 'Faculty' : 
                      (hasMatchingDept ? `${extractDepartment(suggestedUser.universityId)} (Same Dept)` : 
                      extractDepartment(suggestedUser.universityId));
                    
                    // Create a function for profile navigation
                    const navigateToUserProfile = () => {
                      localStorage.setItem('currentPage', 'profile');
                      localStorage.setItem('viewProfileUserId', suggestedUser.id);
                      window.dispatchEvent(new CustomEvent('navigate', { 
                        detail: { 
                          page: 'profile',
                          scrollToTop: true,
                          timestamp: new Date().getTime() 
                        } 
                      }));
                      window.scrollTo(0, 0);
                    };
                    
                    return (
                      <div 
                        key={suggestedUser.id} 
                        className="flex items-center p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors mx-0"
                      >
                        <img 
                          src={suggestedUser.avatar} 
                          alt={suggestedUser.name}
                          className="w-12 h-12 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={navigateToUserProfile}
                          data-profile-id={suggestedUser.id}
                        />
                        <div 
                          className="ml-3 cursor-pointer" 
                          onClick={navigateToUserProfile}
                          data-profile-id={suggestedUser.id}
                        >
                          <h3 className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            {suggestedUser.name}
                            {hasMatchingYear && (
                              <span className="ml-2 text-xs font-medium px-1.5 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                                Same Year
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{displayDepartment}</p>
                        </div>
                        <div className="ml-auto">
                          <button 
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium whitespace-nowrap"
                            onClick={(e) => {
                              // Silently send friend request without showing an alert
                              // Get existing friend requests from localStorage
                              const friendRequestsStr = localStorage.getItem('friendRequests') || '[]';
                              const friendRequests: Array<{id: string; name: string; avatar: string; department: string; timestamp: string}> = JSON.parse(friendRequestsStr);
                              
                              // Add new friend request if not already sent
                              if (!friendRequests.some((req) => req.id === suggestedUser.id)) {
                                friendRequests.push({
                                  id: suggestedUser.id,
                                  name: suggestedUser.name,
                                  avatar: suggestedUser.avatar,
                                  department: displayDepartment,
                                  timestamp: new Date().toISOString()
                                });
                                
                                // Save updated friend requests
                                localStorage.setItem('friendRequests', JSON.stringify(friendRequests));
                                
                                // Update UI to show "Request Sent" instead of "Add Friend"
                                const button = e.currentTarget as HTMLButtonElement;
                                button.textContent = 'Request Sent';
                                button.classList.add('text-gray-500');
                                button.classList.remove('text-blue-600', 'dark:text-blue-400', 'hover:text-blue-800', 'dark:hover:text-blue-300');
                                button.disabled = true;
                                
                                // Dispatch event to notify other components about the friend request
                                window.dispatchEvent(new CustomEvent('friendRequestsChange', { 
                                  detail: { hasRequests: true } 
                                }));
                              }
                            }}
                          >
                            Add Friend
                          </button>
                        </div>
                      </div>
                    );
                  })}
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