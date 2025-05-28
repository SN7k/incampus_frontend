import React, { useState, useEffect } from 'react';
import PullToRefresh from 'react-simple-pull-to-refresh';
import { motion } from 'framer-motion';
import PostForm from '../components/post/PostForm';
import PostCard from '../components/post/PostCard';
import { mockPosts, mockUsers } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, Users, BookOpen, Bookmark, Settings, HelpCircle, Loader } from 'lucide-react';
import { User, Post } from '../types';
import { postsApi } from '../services/postsApi';
import { USE_MOCK_DATA } from '../utils/mockDataTransition';

const Feed: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
  const filterDeletedPosts = (postsToFilter: Post[]): Post[] => {
    try {
      const deletedPostsStr = localStorage.getItem('deletedPosts') || '[]';
      const deletedPosts = JSON.parse(deletedPostsStr);
      return postsToFilter.filter(post => !deletedPosts.includes(post.id));
    } catch (error) {
      console.error('Error filtering deleted posts:', error);
      return postsToFilter;
    }
  };
  
  // Function to navigate to different pages
  const navigateTo = (page: string) => {
    localStorage.setItem('currentPage', page);
    
    // Add timestamp to make the event unique
    const timestamp = new Date().getTime();
    
    // Trigger a navigation event
    window.dispatchEvent(new CustomEvent('navigate', { 
      detail: { 
        page: page,
        scrollToTop: true,
        timestamp: timestamp
      } 
    }));
    
    // Ensure the page scrolls to the top
    window.scrollTo(0, 0);
  };
  
  // Function to view a user's profile
  const viewUserProfile = (userId: string) => {
    localStorage.setItem('viewProfileUserId', userId);
    navigateTo('profile');
  };
  
  // Function to add a friend
  const addFriend = (userId: string) => {
    // This would normally call the friendsApi.sendFriendRequest
    // For now, just show a demo message
    alert(`Friend request sent to user ${userId}`);
  };
  
  // Load posts from API or mock data
  useEffect(() => {
    if (!user) return;
    
    const loadPosts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (USE_MOCK_DATA) {
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
        } else {
          // Use real API
          console.log('Fetching posts from API');
          const feedPosts = await postsApi.getFeedPosts();
          console.log('Posts loaded from API:', feedPosts.length);
          
          // Filter out deleted posts (we still maintain this for consistency)
          const filteredPosts = filterDeletedPosts(feedPosts);
          
          setPosts(filteredPosts);
        }
      } catch (error) {
        console.error('Error loading posts:', error);
        setError('Failed to load posts. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPosts();
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
      if (!user) {
        resolve();
        return;
      }
      
      const refreshPosts = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
          if (USE_MOCK_DATA) {
            // Simulate API call to refresh posts
            setTimeout(() => {
              // Get user-created posts from localStorage
              const userCreatedPosts = JSON.parse(localStorage.getItem('userPosts') || '[]');
              
              // Get posts from friends with some randomness
              const friendPosts = mockPosts
                .filter(post => friends.includes(post.userId))
                .sort(() => Math.random() - 0.3); // Add some randomness to the order
              
              // Get some random posts from non-friends (for discovery)
              const nonFriendPosts = mockPosts
                .filter(post => post.userId !== user.id && !friends.includes(post.userId))
                .sort(() => Math.random() - 0.5) // Completely random order
                .slice(0, 5);
              
              // Combine all posts
              const combinedPosts = [...userCreatedPosts, ...friendPosts, ...nonFriendPosts];
              
              // Filter out deleted posts
              const filteredPosts = filterDeletedPosts(combinedPosts);
              
              setPosts(filteredPosts);
              setIsLoading(false);
              resolve();
            }, 1000); // Simulate network delay
          } else {
            // Use real API
            console.log('Refreshing posts from API');
            const feedPosts = await postsApi.getFeedPosts();
            console.log('Posts refreshed from API:', feedPosts.length);
            
            // Filter out deleted posts
            const filteredPosts = filterDeletedPosts(feedPosts);
            
            setPosts(filteredPosts);
            setIsLoading(false);
            resolve();
          }
        } catch (error) {
          console.error('Error refreshing posts:', error);
          setError('Failed to refresh posts. Please try again.');
          setIsLoading(false);
          resolve(); // Still resolve the promise to complete the pull-to-refresh action
        }
      };
      
      refreshPosts();
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
    <div className="feed-container">
      {/* Loading and Error States */}
      {isLoading && (
        <div className="loading-overlay">
          <Loader className="spinner" />
          <p>Loading...</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}
      
      <div className="feed-layout">
        {/* Left sidebar */}
        <div className="left-sidebar">
          <div className="sidebar-section">
            <h3>Quick Links</h3>
            <ul>
              <li onClick={() => navigateTo('profile')}>
                <img src={user.avatar} alt={user.name} className="avatar" />
                <span>{user.name}</span>
              </li>
              <li onClick={() => navigateTo('friends')}>
                <Users size={20} />
                <span>Friends</span>
              </li>
              <li onClick={() => navigateTo('courses')}>
                <BookOpen size={20} />
                <span>Courses</span>
              </li>
              <li onClick={() => navigateTo('saved')}>
                <Bookmark size={20} />
                <span>Saved</span>
              </li>
            </ul>
          </div>
          
          <div className="sidebar-section">
            <h3>Support</h3>
            <ul>
              <li onClick={() => navigateTo('settings')}>
                <Settings size={20} />
                <span>Settings</span>
              </li>
              <li onClick={() => navigateTo('help')}>
                <HelpCircle size={20} />
                <span>Help Center</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Main content */}
        <div className="main-content">
          <PullToRefresh onRefresh={handleRefresh} pullingContent="" refreshingContent="">
            <div className="posts-container">
              {/* Post creation form */}
              <PostForm />
              
              {/* Posts feed */}
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
              >
                {posts.map(post => (
                  <motion.div key={post.id} variants={item}>
                    <PostCard 
                      post={post} 
                      onPostDeleted={(postId) => {
                        setPosts(currentPosts => currentPosts.filter(p => p.id !== postId));
                      }}
                    />
                  </motion.div>
                ))}
              </motion.div>
              
              {posts.length === 0 && !isLoading && (
                <div className="empty-feed">
                  <p>No posts to show. Follow more people or create your first post!</p>
                </div>
              )}
            </div>
          </PullToRefresh>
        </div>
        
        {/* Right sidebar */}
        <div className="right-sidebar">
          <div className="sidebar-section">
            <h3>People You May Know</h3>
            <ul className="suggested-users">
              {suggestedUsers.map(suggestedUser => (
                <li key={suggestedUser.id} className="suggested-user">
                  <div className="user-info" onClick={() => viewUserProfile(suggestedUser.id)}>
                    <img src={suggestedUser.avatar} alt={suggestedUser.name} className="avatar" />
                    <div>
                      <span className="name">{suggestedUser.name}</span>
                      <span className="role">{suggestedUser.role === 'faculty' ? 'Faculty' : 'Student'}</span>
                    </div>
                  </div>
                  <button className="add-friend" onClick={() => addFriend(suggestedUser.id)}>
                    <Users size={16} />
                  </button>
                </li>
              ))}
              {suggestedUsers.length === 0 && (
                <p className="no-suggestions">No suggestions available</p>
              )}
            </ul>
          </div>
          
          <div className="sidebar-section trending">
            <h3>Trending</h3>
            <ul className="trending-topics">
              <li>
                <Sparkles size={16} />
                <span>Final Exams Preparation</span>
              </li>
              <li>
                <Sparkles size={16} />
                <span>Campus Fest 2023</span>
              </li>
              <li>
                <Sparkles size={16} />
                <span>New Library Resources</span>
              </li>
              <li>
                <Sparkles size={16} />
                <span>Internship Opportunities</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* CSS for loading and error states */}
      <style>
        {`
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          color: white;
        }
        
        .spinner {
          animation: spin 1s linear infinite;
          font-size: 2rem;
          margin-bottom: 1rem;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .error-message {
          position: fixed;
          top: 20px;
          right: 20px;
          background-color: #f8d7da;
          color: #721c24;
          padding: 1rem;
          border-radius: 4px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        
        .error-message button {
          margin-top: 0.5rem;
          padding: 0.25rem 0.5rem;
          background-color: #721c24;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        `}
      </style>
    </div>
  );
};

export default Feed;
