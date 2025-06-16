import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { profileApi } from '../services/profileApi';
import { ProfileData } from '../types/profile';
import { mockPosts } from '../data/mockData';
import PostCard from '../components/post/PostCard';
import Button from '../components/ui/Button';
import EditProfileModal from '../components/profile/EditProfileModal';
import CreatePostModal from '../components/post/CreatePostModal';
import { Post } from '../types';
import { X, Edit, Heart, Users, School, MapPin, BookOpen, Bookmark, Award, UserMinus } from 'lucide-react';
import { USE_MOCK_DATA, getMockProfileData } from '../utils/mockDataTransition';

interface Friend {
  id: string;
  name: string;
  avatar: string;
  department: string;
}

const Profile: React.FC = () => {
  const { userId: viewingUserId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State variables - declare these only once
  const [friendsList, setFriendsList] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [viewingUserData, setViewingUserData] = useState<ProfileData | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'memories' | 'collections' | 'friends' | 'about'>('memories');
  const [hasLiked, setHasLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Function to get profile likes from localStorage
=======
import { profileApi, postApi, friendApi } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import PostCard from '../components/post/PostCard';
import { useAuth } from '../contexts/AuthContext';
import { School, MapPin, Edit, Link, Camera, BookOpen, Users, Award, Bookmark, Heart, X, Save, UserMinus } from 'lucide-react';
import Button from '../components/ui/Button';
import { Post, User } from '../types';
import CreatePostModal from '../components/post/CreatePostModal';
import { ProfileData as ApiProfileData } from '../types/profile';

interface ProfileData extends ApiProfileData {}

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'memories' | 'collections' | 'friends' | 'about'>('memories');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [viewingUserData, setViewingUserData] = useState<ProfileData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [friendsList, setFriendsList] = useState<User[]>([]);
  
>>>>>>> a80153d (Update frontend)
  const getProfileLikes = (profileId: string) => {
    try {
      const profileLikesStr = localStorage.getItem('profileLikes');
      if (profileLikesStr) {
        const profileLikes = JSON.parse(profileLikesStr);
        return profileLikes[profileId] || 0;
      }
      return 0;
    } catch (error) {
      console.error('Error getting profile likes:', error);
      return 0;
    }
  };
  
<<<<<<< HEAD
  // Function to check if the current user has liked a profile
=======
>>>>>>> a80153d (Update frontend)
  const hasUserLikedProfile = (profileId: string) => {
    try {
      const userLikesStr = localStorage.getItem('userProfileLikes');
      if (userLikesStr && user) {
        const userLikes = JSON.parse(userLikesStr);
        return userLikes[`${user.id}_${profileId}`] || false;
      }
      return false;
    } catch (error) {
      console.error('Error checking if user liked profile:', error);
      return false;
    }
  };
  
<<<<<<< HEAD
  // Function to update profile likes in localStorage
  const updateProfileLikes = (profileId: string, newCount: number, hasLiked: boolean) => {
    try {
      // Update profile likes count
=======
  const updateProfileLikes = (profileId: string, newCount: number, hasLiked: boolean) => {
    try {
>>>>>>> a80153d (Update frontend)
      const profileLikesStr = localStorage.getItem('profileLikes');
      const profileLikes = profileLikesStr ? JSON.parse(profileLikesStr) : {};
      profileLikes[profileId] = newCount;
      localStorage.setItem('profileLikes', JSON.stringify(profileLikes));
      
<<<<<<< HEAD
      // Update user's like status for this profile
=======
>>>>>>> a80153d (Update frontend)
      if (user) {
        const userLikesStr = localStorage.getItem('userProfileLikes');
        const userLikes = userLikesStr ? JSON.parse(userLikesStr) : {};
        userLikes[`${user.id}_${profileId}`] = hasLiked;
        localStorage.setItem('userProfileLikes', JSON.stringify(userLikes));
      }
    } catch (error) {
      console.error('Error updating profile likes:', error);
    }
  };
  
<<<<<<< HEAD
  // Function to track if we're viewing another user's profile
  const setViewingUserId = (id: string | null) => {
    // This function is kept for compatibility but we use the URL param instead
    console.log('Setting viewing user ID:', id);
  };
  
  // Function to handle edit profile button click
  const handleEditProfileClick = () => {
    setIsEditProfileModalOpen(true);
  };
  
  // Function to handle edit profile modal close
  const handleEditProfileModalClose = () => {
    setIsEditProfileModalOpen(false);
  };

  // Function to handle profile like
  const handleProfileLike = async () => {
    // Toggle like status
    const newHasLiked = !hasLiked;
    const newLikeCount = newHasLiked ? likeCount + 1 : likeCount - 1;
    
    // Update state optimistically
    setHasLiked(newHasLiked);
    setLikeCount(newLikeCount);
    
    try {
      if (USE_MOCK_DATA) {
        // Update localStorage for mock data
        if (viewingUserId) {
          updateProfileLikes(viewingUserId, newLikeCount, newHasLiked);
        } else if (user) {
          updateProfileLikes(user.id, newLikeCount, newHasLiked);
        }
      } else {
        // Call the API to like/unlike profile
        const profileId = viewingUserId || (user ? user.id : '');
        if (profileId) {
          try {
            if (newHasLiked) {
              // This is a placeholder - we need to implement this API endpoint
              // await profileApi.likeProfile(profileId);
              console.log('API call to like profile:', profileId);
            } else {
              // This is a placeholder - we need to implement this API endpoint
              // await profileApi.unlikeProfile(profileId);
              console.log('API call to unlike profile:', profileId);
            }
          } catch (error) {
            console.error('API for profile likes not implemented yet:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error updating profile like:', error);
      // Revert state on error
      setHasLiked(!newHasLiked);
      setLikeCount(newHasLiked ? newLikeCount - 1 : newLikeCount + 1);
      setError('Failed to update like. Please try again.');
      
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    }
  };
  
  // Check if we're viewing another user's profile
  useEffect(() => {
    // Get the target user ID from localStorage
    const targetUserId = localStorage.getItem('viewProfileUserId');
    console.log('PROFILE: Loading profile with ID:', targetUserId);
    
    // Set the viewing user ID
    setViewingUserId(targetUserId);
    
    // Load profile likes when viewing a profile
    const targetProfileId = targetUserId || (user ? user.id : '');
    if (targetProfileId) {
      const likes = getProfileLikes(targetProfileId);
      const userHasLiked = hasUserLikedProfile(targetProfileId);
      setLikeCount(likes);
      setHasLiked(userHasLiked);
    }
  }, [user]);
  
  // Fetch the target user's profile if we're viewing someone else
=======
  useEffect(() => {
    const targetUserId = localStorage.getItem('viewProfileUserId');
    console.log('PROFILE: Loading profile with ID:', targetUserId);
    
    setViewingUserId(targetUserId);
    
    const handleNavigation = (event: CustomEvent) => {
      if (event.detail?.page === 'profile') {
        console.log('PROFILE: Navigation event received with detail:', event.detail);
        
        if (event.detail.scrollToTop) {
          console.log('PROFILE: Scrolling to top of page');
          window.scrollTo(0, 0);
        }
        
        if (event.detail.userId) {
          const newUserId = event.detail.userId.toString();
          console.log('PROFILE: Setting profile to user ID from event:', newUserId);
          setViewingUserId(newUserId);
        } else {
          const storedId = localStorage.getItem('viewProfileUserId');
          console.log('PROFILE: Checking localStorage, found ID:', storedId);
          
          if (storedId) {
            setViewingUserId(storedId);
          } else {
            console.log('PROFILE: Resetting to own profile');
            setViewingUserId(null);
            setViewingUserData(null);
          }
        }
      }
    };
    
    window.addEventListener('navigate', handleNavigation as EventListener);
    
    return () => {
      window.removeEventListener('navigate', handleNavigation as EventListener);
    };
  }, []);
  
  useEffect(() => {
    const checkProfileTarget = () => {
      const targetUserId = localStorage.getItem('viewProfileUserId');
      setViewingUserId(targetUserId);
      if (!targetUserId) {
        setViewingUserData(null);
      }
      
      const activeTabFromStorage = localStorage.getItem('activeProfileTab');
      if (activeTabFromStorage) {
        setActiveTab(activeTabFromStorage as 'memories' | 'collections' | 'friends' | 'about');
        localStorage.removeItem('activeProfileTab');
      }
      
      const targetProfileId = viewingUserId || (user ? user.id : '');
      if (targetProfileId) {
        const likes = getProfileLikes(targetProfileId);
        const userHasLiked = hasUserLikedProfile(targetProfileId);
        setLikeCount(likes);
        setHasLiked(userHasLiked);
      }
    };
    
    checkProfileTarget();
    
    const intervalId = setInterval(checkProfileTarget, 300);
    
    return () => clearInterval(intervalId);
  }, []);
  
>>>>>>> a80153d (Update frontend)
  useEffect(() => {
    if (viewingUserId) {
      console.log('PROFILE DATA: Loading profile for user ID:', viewingUserId);
      setIsLoadingProfile(true);
      setProfileError(null);
      
      const loadProfileData = async () => {
        try {
<<<<<<< HEAD
          // Check if we should use mock data or real API
          if (USE_MOCK_DATA) {
            // Simulate API call with a timeout
            setTimeout(() => {
              try {
                // Get mock profile data
                const mockUserData = getMockProfileData(viewingUserId);
                
                // Set the profile data
                setViewingUserData(mockUserData);
                setIsLoadingProfile(false);
              } catch (error) {
                console.error('Error loading mock profile data:', error);
                setProfileError('Failed to load profile data. Please try again.');
                setIsLoadingProfile(false);
              }
            }, 500);
          } else {
            try {
              // Fetch profile data from API using our profileApi service
              const profileData = await profileApi.getUserProfile(viewingUserId);
              console.log('Profile data loaded from API:', profileData);
              
              // Set the profile data
              setViewingUserData(profileData);
              setIsLoadingProfile(false);
            } catch (error) {
              console.error('Error fetching profile from API:', error);
              setProfileError('Failed to load profile data. Please try again.');
              setIsLoadingProfile(false);
            }
          }
        } catch (error) {
          console.error('Error in loadProfileData:', error);
          setProfileError('An unexpected error occurred. Please try again.');
=======
          const profileData = await profileApi.getProfile(viewingUserId);
          setViewingUserData(profileData);
          setIsLoadingProfile(false);
        } catch (error) {
          console.error('Error fetching profile from API:', error);
          setProfileError('Failed to load profile data. Please try again.');
>>>>>>> a80153d (Update frontend)
          setIsLoadingProfile(false);
        }
      };
      
      loadProfileData();
<<<<<<< HEAD
    } else if (user) {
      // If we're viewing our own profile, load our own profile data
      setIsLoadingProfile(true);
      setProfileError(null);
      
      const loadMyProfileData = async () => {
        try {
          if (USE_MOCK_DATA) {
            // Use mock data for own profile
            setTimeout(() => {
              try {
                // Get mock data but we don't need to set it since we're viewing our own profile
                getMockProfileData(user.id);
                setViewingUserData(null); // Clear viewing user data
                setIsLoadingProfile(false);
              } catch (error) {
                console.error('Error loading mock profile data:', error);
                setProfileError('Failed to load profile data. Please try again.');
                setIsLoadingProfile(false);
              }
            }, 500);
          } else {
            try {
              // Fetch own profile data from API
              const profileData = await profileApi.getMyProfile();
              console.log('My profile data loaded from API:', profileData);
              
              // We don't need to set viewing user data since we're viewing our own profile
              setViewingUserData(null);
              setIsLoadingProfile(false);
            } catch (error) {
              console.error('Error fetching own profile from API:', error);
              setProfileError('Failed to load profile data. Please try again.');
              setIsLoadingProfile(false);
            }
          }
        } catch (error) {
          console.error('Error in loadMyProfileData:', error);
          setProfileError('An unexpected error occurred. Please try again.');
          setIsLoadingProfile(false);
        }
      };
      
      loadMyProfileData();
    }
  }, [viewingUserId, user]);
  
  // Load posts for the current profile
  useEffect(() => {
    const loadProfilePosts = async () => {
      try {
        let posts: Post[] = [];
        
        if (USE_MOCK_DATA) {
          // Use mock data
          posts = mockPosts.filter(post => {
            if (viewingUserId) {
              return post.user.id === viewingUserId;
            } else if (user) {
              return post.user.id === user.id;
            }
            return false;
          });
        } else {
          // Use real API
          const profileId = viewingUserId || (user ? user.id : '');
          if (profileId) {
            try {
              // This would be the real API call to get posts for a profile
              // const profilePosts = await postsApi.getUserPosts(profileId);
              // posts = profilePosts;
              
              // For now, we'll use mock data
              posts = mockPosts.filter(post => post.user.id === profileId);
            } catch (error) {
              console.error('Error fetching profile posts:', error);
              setError('Failed to load posts. Please try again.');
            }
          }
        }
        
        setUserPosts(posts);
      } catch (error) {
        console.error('Error loading profile posts:', error);
        setError('Failed to load posts. Please try again.');
      }
    };
    
    loadProfilePosts();
  }, [viewingUserId, user]);
  
  // Basic UI rendering for now
  return (
    <div className="pt-16 pb-20 md:pb-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen transition-colors duration-200">
      {/* Loading indicator */}
=======
    }
  }, [viewingUserId]);
  
  const getProfilePosts = async (userId: string | null) => {
    try {
      if (userId) {
        const posts = await postApi.getUserPosts(userId);
        return posts;
      } else if (user) {
        const posts = await postApi.getUserPosts(user.id);
        return posts;
      }
      return [];
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  };

  const displayProfile = () => {
    if (viewingUserId && viewingUserData) {
      return viewingUserData;
    }
    return profileData;
  };
  
  const [profileData, setProfileData] = useState<ProfileData>(() => {
    return {
      id: user?.id || '0',
      name: user?.name || 'John Doe',
      avatar: user?.avatar || 'https://randomuser.me/api/portraits/men/1.jpg',
      bio: user?.bio || '',
      coverPhoto: '',
      education: {
        degree: '',
        institution: '',
        years: ''
      },
      location: '',
      skills: [],
      achievements: [],
      interests: [],
      posts: [],
      universityId: user?.universityId || ''
    };
  });
  
  const [editFormData, setEditFormData] = useState<ProfileData>(profileData);
  
  useEffect(() => {
    setEditFormData(profileData);
  }, [profileData]);
  
  const handleOpenEditModal = () => {
    setEditFormData(profileData);
    setIsEditProfileModalOpen(true);
  };
  
  const handleSaveChanges = () => {
    setProfileData(editFormData);
    
    if (user) {
      updateProfile({
        name: editFormData.name,
        avatar: editFormData.avatar,
        bio: editFormData.bio
      });
    }
    
    setIsEditProfileModalOpen(false);
  };
  
  const handleInputChange = (section: keyof ProfileData, field: string, value: any, index?: number) => {
    setEditFormData(prev => {
      const updated = {...prev};
      
      if (section === 'name') {
        updated.name = value;
      } else if (section === 'avatar') {
        updated.avatar = value;
      } else if (section === 'bio') {
        updated.bio = value;
      } else if (section === 'education') {
        updated.education = {
          ...updated.education,
          [field]: value
        };
      } else if (section === 'location') {
        updated.location = value;
      } else if (section === 'skills' && typeof index === 'number') {
        const updatedSkills = [...updated.skills];
        if (field === 'name') {
          updatedSkills[index] = {
            ...updatedSkills[index],
            name: value
          };
        } else if (field === 'proficiency') {
          updatedSkills[index] = {
            ...updatedSkills[index],
            proficiency: parseInt(value, 10) || 0
          };
        }
        updated.skills = updatedSkills;
      } else if (section === 'achievements' && typeof index === 'number') {
        const updatedAchievements = [...updated.achievements];
        updatedAchievements[index] = {
          ...updatedAchievements[index],
          [field]: value
        };
        updated.achievements = updatedAchievements;
      } else if (section === 'interests') {
        updated.interests = value;
      }
      
      return updated;
    });
  };
  
  const addSkill = () => {
    setEditFormData(prev => ({
      ...prev,
      skills: [{ name: '', proficiency: 50 }, ...prev.skills]
    }));
  };
  
  const removeSkill = (index: number) => {
    setEditFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };
  
  const addAchievement = () => {
    setEditFormData(prev => ({
      ...prev,
      achievements: [{ title: '', description: '', year: '' }, ...prev.achievements]
    }));
  };
  
  const removeAchievement = (index: number) => {
    setEditFormData(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
  };
  
  const handleInterestsChange = (value: string) => {
    const interestsArray = value.split(',').map(item => item.trim()).filter(item => item !== '');
    setEditFormData(prev => ({
      ...prev,
      interests: interestsArray
    }));
  };

  if (!user) return null;
  
  if (profileError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-lg max-w-md">
          <h3 className="text-lg font-medium mb-2">Error</h3>
          <p>{profileError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100 rounded-md hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const loadPosts = async () => {
      const posts = await getProfilePosts(viewingUserId);
      setUserPosts(posts);
    };
    loadPosts();
  }, [viewingUserId, user]);

  useEffect(() => {
    const handlePostDeleted = (event: CustomEvent) => {
      const deletedPostId = event.detail?.postId;
      if (deletedPostId) {
        setUserPosts(prevPosts => prevPosts.filter(post => post.id !== deletedPostId));
      }
    };
    window.addEventListener('postDeleted', handlePostDeleted as EventListener);
    return () => {
      window.removeEventListener('postDeleted', handlePostDeleted as EventListener);
    };
  }, []);
  
  useEffect(() => {
    const loadFriends = async () => {
      try {
        if (user) {
          const friends = await friendApi.getFriends();
          setFriendsList(friends);
        }
      } catch (error) {
        console.error('Error loading friends:', error);
        setFriendsList([]);
      }
    };
    loadFriends();
  }, [user]);
  
  useEffect(() => {
    const handleFriendSystemChange = async () => {
      try {
        if (user) {
          const friends = await friendApi.getFriends();
          setFriendsList(friends);
        }
      } catch (error) {
        console.error('Error reloading friends:', error);
      }
    };
    window.addEventListener('friendSystemChange', handleFriendSystemChange);
    return () => {
      window.removeEventListener('friendSystemChange', handleFriendSystemChange);
    };
  }, [user]);
  
  const filteredFriends = friendsList.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    friend.universityId.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <div className="pt-16 pb-20 md:pb-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen transition-colors duration-200">
>>>>>>> a80153d (Update frontend)
      {isLoadingProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <p className="text-gray-700 dark:text-gray-300">Loading profile...</p>
          </div>
        </div>
      )}
<<<<<<< HEAD
      
      {/* Error message */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-700 hover:text-red-900"
          >
            <X size={16} />
          </button>
        </div>
      )}
      
      {/* Success message */}
      {success && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50">
          {success}
          <button
            onClick={() => setSuccess(null)}
            className="ml-2 text-green-700 hover:text-green-900"
          >
            <X size={16} />
          </button>
        </div>
      )}
      
      {/* Edit Profile Modal */}
      {isEditProfileModalOpen && (
        <EditProfileModal
          isOpen={isEditProfileModalOpen}
          onClose={handleEditProfileModalClose}
          profileData={viewingUserData || user}
        />
      )}
      
      {/* Profile Header Section */}
      <div className="container mx-auto px-4">
        {/* Cover photo and profile section */}
        <div className="relative">
          <div className="h-48 sm:h-56 md:h-64 w-full bg-gradient-to-r from-blue-800 to-blue-600 overflow-hidden relative">
            {viewingUserData?.coverPhoto || user?.coverPhoto ? (
              <img 
                src={viewingUserData?.coverPhoto || user?.coverPhoto} 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
            ) : null}
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          </div>
          
          <div className="container mx-auto px-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg -mt-16 sm:-mt-20 relative z-10 p-4 sm:p-6 transition-colors duration-200">
              <div className="flex flex-col md:flex-row">
                {/* Profile picture */}
                <div className="flex-shrink-0 -mt-14 sm:-mt-16 md:-mt-20 mb-4 md:mb-0 md:mr-6">
                  <div className="relative">
                    <img 
                      src={viewingUserData?.avatar || user?.avatar || 'https://via.placeholder.com/150'} 
                      alt={viewingUserData?.name || user?.name || 'Profile'} 
                      className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-4 border-white dark:border-gray-700 object-cover shadow-lg"
                    />
                  </div>
                </div>
                
                {/* Profile info */}
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-start lg:items-center justify-between mb-4 sm:mb-5">
                    <div>
                      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center flex-wrap">
                        {viewingUserData?.name || user?.name || 'User Name'}
                        {viewingUserId ? (
                          <span className="ml-2 text-xs font-medium px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                            Student
                          </span>
                        ) : (
                          user?.role === 'faculty' && (
                            <span className="ml-2 text-xs font-medium px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                              Faculty
                            </span>
                          )
                        )}
                      </h1>
                      <div className="text-gray-600 dark:text-gray-300 flex flex-wrap items-center mt-2 sm:mt-3 gap-2 sm:gap-3">
                        <span className="flex items-center text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 px-2 sm:px-3 py-1 rounded-full">
                          <School size={16} className="mr-1.5 text-blue-800" />
                          <span className="truncate max-w-[120px] sm:max-w-none">{viewingUserData?.universityId || user?.universityId || 'University ID'}</span>
                        </span>
                        <span className="flex items-center text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 px-2 sm:px-3 py-1 rounded-full">
                          <MapPin size={16} className="mr-1.5 text-blue-800" />
                          <span className="truncate max-w-[140px] sm:max-w-none">{viewingUserData?.location || 'Location not specified'}</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0">
                      {!viewingUserId ? (
                        <Button 
                          variant="primary" 
                          size="sm"
                          className="flex items-center px-4 py-2"
                          onClick={handleEditProfileClick}
                        >
                          <Edit size={16} className="mr-2" />
                          Edit Profile
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center px-4 py-2"
                        >
                          <Users size={16} className="mr-2" />
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {(viewingUserData?.bio || user?.bio) && (
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {viewingUserData?.bio || user?.bio}
                    </p>
                  )}
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div 
                      className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-800/40 dark:to-blue-700/30 px-3 sm:px-4 py-3 rounded-xl transition-colors duration-200 cursor-pointer hover:shadow-md"
                      onClick={() => setActiveTab('memories')}
                    >
                      <div className="flex items-center text-blue-600 dark:text-blue-200 mb-2">
                        <BookOpen size={16} className="mr-2" />
                        <span className="text-xs sm:text-sm font-medium">Memories</span>
                      </div>
                      <div className="text-lg sm:text-2xl font-bold text-blue-700 dark:text-blue-100">{userPosts.length}</div>
                    </div>
                    <div 
                      className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-800/70 dark:to-purple-700/60 px-3 sm:px-4 py-3 rounded-xl transition-colors duration-200 cursor-pointer hover:shadow-md"
                      onClick={() => setActiveTab('friends')}
                    >
                      <div className="flex items-center text-blue-600 dark:text-blue-200 mb-2">
                        <Users size={16} className="mr-2" />
                        <span className="text-xs sm:text-sm font-medium">Friends</span>
                      </div>
                      <div className="text-lg sm:text-2xl font-bold text-blue-700 dark:text-blue-100">{friendsList.length}</div>
                    </div>
                    <div 
                      className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-800/70 dark:to-amber-700/60 px-3 sm:px-4 py-3 rounded-xl transition-colors duration-200 cursor-pointer hover:shadow-md"
                      onClick={() => setActiveTab('about')}
                    >
                      <div className="flex items-center text-amber-600 dark:text-amber-200 mb-2">
                        <Award size={16} className="mr-2" />
                        <span className="text-xs sm:text-sm font-medium">About</span>
                      </div>
                      <div className="text-lg sm:text-2xl font-bold text-amber-700 dark:text-amber-100">
                        {viewingUserData?.education?.degree || user?.role || 'Student'}
                      </div>
                    </div>
                    <div 
                      className={`px-3 sm:px-4 py-3 rounded-xl transition-colors duration-200 cursor-pointer hover:shadow-md ${hasLiked ? 'bg-gradient-to-br from-emerald-200 to-emerald-300 dark:from-emerald-600 dark:to-emerald-500' : 'bg-gradient-to-br from-emerald-50/80 to-emerald-100/70 dark:from-emerald-800/40 dark:to-emerald-700/30'}`}
                      onClick={handleProfileLike}
                    >
                      <div className="flex items-center text-emerald-600 dark:text-emerald-200 mb-2">
                        <Heart size={16} className={`mr-2 ${hasLiked ? 'fill-emerald-600 dark:fill-emerald-200' : ''}`} />
                        <span className="text-xs sm:text-sm font-medium">Appreciation</span>
                      </div>
                      <div className="text-lg sm:text-2xl font-bold text-emerald-700 dark:text-emerald-100">{likeCount}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 mt-6 rounded-xl shadow-md overflow-hidden transition-colors duration-200">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('memories')}
                className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${activeTab === 'memories' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}
              >
                Memories
              </button>
              <button
                onClick={() => setActiveTab('collections')}
                className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${activeTab === 'collections' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}
              >
                Collections
              </button>
              <button
                onClick={() => setActiveTab('friends')}
                className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${activeTab === 'friends' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}
              >
                Friends
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${activeTab === 'about' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}
              >
                About
              </button>
            </nav>
          </div>
          
          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {/* Memories Tab */}
            {activeTab === 'memories' && (
              <div className="space-y-6">
                {userPosts.length > 0 ? (
                  userPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center transition-colors duration-200">
                    <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">No Memories Yet</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      {viewingUserId ? 'This user hasn\'t shared any posts yet.' : 'You haven\'t created any posts yet.'}
                    </p>
                    {!viewingUserId && (
                      <Button
                        variant="primary"
                        onClick={() => setIsCreatePostModalOpen(true)}
                      >
                        Create Your First Post
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Collections Tab */}
            {activeTab === 'collections' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center transition-colors duration-200">
                <Bookmark size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Collections Coming Soon</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  We're working on a way for you to organize your favorite posts into collections.
                </p>
              </div>
            )}
            
            {/* Friends Tab */}
            {activeTab === 'friends' && (
              <div>
                <div className="mb-4">
                  <div className="relative">
=======
      <AnimatePresence>
        {isEditProfileModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-xl w-full max-w-[95%] sm:max-w-lg md:max-w-2xl lg:max-w-3xl max-h-[95vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            >
              <div className="sticky top-0 bg-white dark:bg-gray-800 p-3 sm:p-4 border-b dark:border-gray-700 flex justify-between items-center z-10">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100">Edit Profile</h2>
                <button 
                  onClick={() => setIsEditProfileModalOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <X size={20} className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              
              <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
                <div className="flex flex-col items-center">
                  <h3 className="text-base sm:text-lg font-medium text-gray-700 dark:text-gray-300 mb-3 sm:mb-4">Profile Picture</h3>
                  <div className="relative mb-4 sm:mb-6">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mx-auto">
                      <label htmlFor="profile-picture-upload" className="cursor-pointer block relative">
                        <img 
                          src={viewingUserId ? viewingUserData?.avatar : editFormData.avatar} 
                          alt="Profile" 
                          className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg hover:opacity-90 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-20 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <span className="text-white text-xs font-medium">Change Photo</span>
                        </div>
                      </label>
                    </div>
                    <input 
                      id="profile-picture-upload"
                      type="file" 
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              handleInputChange('avatar', '', event.target.result as string);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">Click on the profile picture to upload a new photo</p>
                </div>
                
                <div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">Name</h3>
                  <input 
                    type="text" 
                    value={viewingUserId ? viewingUserData?.name : editFormData.name}
                    onChange={(e) => handleInputChange('name', '', e.target.value)}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                
                <div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">Bio</h3>
                  <textarea 
                    value={viewingUserId ? viewingUserData?.bio : editFormData.bio}
                    onChange={(e) => handleInputChange('bio', '', e.target.value)}
                    rows={3}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Tell others about yourself"
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Education</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Degree</label>
                      <input 
                        type="text" 
                        value={viewingUserId ? viewingUserData?.education.degree : editFormData.education.degree}
                        onChange={(e) => handleInputChange('education', 'degree', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Institution</label>
                      <input 
                        type="text" 
                        value={viewingUserId ? viewingUserData?.education.institution : editFormData.education.institution}
                        onChange={(e) => handleInputChange('education', 'institution', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Years</label>
                      <input 
                        type="text" 
                        value={viewingUserId ? viewingUserData?.education.years : editFormData.education.years}
                        onChange={(e) => handleInputChange('education', 'years', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Location</h3>
                  <input 
                    type="text" 
                    value={viewingUserId ? viewingUserData?.location : editFormData.location}
                    onChange={(e) => handleInputChange('location', 'value', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Skills</h3>
                    <button 
                      onClick={addSkill}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                    >
                      + Add Skill
                    </button>
                  </div>
                  <div className="space-y-4">
                    {(viewingUserId && viewingUserData ? viewingUserData.skills : editFormData.skills).map((skill, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="flex-1">
                          <input 
                            type="text" 
                            value={skill.name}
                            onChange={(e) => handleInputChange('skills', 'name', e.target.value, index)}
                            placeholder="Skill name"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div className="flex-1">
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={skill.proficiency}
                            onChange={(e) => handleInputChange('skills', 'proficiency', e.target.value, index)}
                            className="w-full"
                          />
                          <div className="text-xs text-gray-500 dark:text-gray-400 text-right">{skill.proficiency}%</div>
                        </div>
                        <button 
                          onClick={() => removeSkill(index)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Achievements & Awards</h3>
                    <button 
                      onClick={addAchievement}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                    >
                      + Add Achievement
                    </button>
                  </div>
                  <div className="space-y-4">
                    {(viewingUserId && viewingUserData ? viewingUserData.achievements : editFormData.achievements).map((achievement, index) => (
                      <div key={index} className="space-y-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex justify-between">
                          <h4 className="font-medium">Achievement #{(viewingUserId && viewingUserData ? viewingUserData.achievements : editFormData.achievements).length - index}</h4>
                          <button 
                            onClick={() => removeAchievement(index)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                          <input 
                            type="text" 
                            value={achievement.title}
                            onChange={(e) => handleInputChange('achievements', 'title', e.target.value, index)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                          <input 
                            type="text" 
                            value={achievement.description}
                            onChange={(e) => handleInputChange('achievements', 'description', e.target.value, index)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
                          <input 
                            type="text" 
                            value={achievement.year}
                            onChange={(e) => handleInputChange('achievements', 'year', e.target.value, index)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">Hobbies & Interests</h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1 sm:mb-2">Separate interests with commas</p>
                  <textarea 
                    value={(viewingUserId && viewingUserData ? viewingUserData.interests : editFormData.interests).join(', ')}
                    onChange={(e) => handleInterestsChange(e.target.value)}
                    rows={3}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
              
              <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 border-t dark:border-gray-700 flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs sm:text-sm py-1.5 sm:py-2"
                  onClick={() => setIsEditProfileModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  className="text-xs sm:text-sm py-1.5 sm:py-2 flex items-center justify-center"
                  onClick={handleSaveChanges}
                >
                  <Save size={14} className="mr-1 sm:mr-2" />
                  Save Changes
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <motion.div 
        className="relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="h-48 sm:h-56 md:h-72 w-full bg-gradient-to-r from-blue-800 to-blue-600 overflow-hidden relative">
          {viewingUserId ? (
            <img 
              src={viewingUserData?.coverPhoto || "https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          ) : (
            (user?.coverPhoto || profileData.coverPhoto) && (
              <img 
                src={user?.coverPhoto || profileData.coverPhoto} 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
            )
          )}
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <label htmlFor="cover-photo-upload" className="absolute top-4 right-4 bg-black bg-opacity-40 text-white p-2 rounded-full hover:bg-opacity-60 transition-all cursor-pointer">
            <Camera size={18} />
          </label>
          <input 
            id="cover-photo-upload"
            type="file" 
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  if (event.target?.result && user) {
                    updateProfile({
                      coverPhoto: event.target.result as string
                    });
                  }
                };
                reader.readAsDataURL(file);
              }
            }}
          />
        </div>
        
        <div className="container mx-auto px-4">
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg -mt-16 sm:-mt-20 relative z-10 p-4 sm:p-6 transition-colors duration-200"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex flex-col md:flex-row">
              <div className="flex-shrink-0 -mt-14 sm:-mt-16 md:-mt-20 mb-4 md:mb-0 md:mr-6">
                <div className="relative">
                  <motion.img 
                    src={viewingUserId ? viewingUserData?.avatar : displayProfile().avatar}
                    alt={viewingUserId ? viewingUserData?.name : displayProfile().name} 
                    className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-full border-4 border-white dark:border-gray-700 object-cover shadow-lg"
                    whileHover={{ scale: 1.05 }}
                  />
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start lg:items-center justify-between mb-4 sm:mb-5">
                  <div className="max-w-full md:max-w-[70%]">
                    <motion.h1 
                      className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center flex-wrap"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {viewingUserId ? viewingUserData?.name : displayProfile().name}
                      {viewingUserId ? (
                        <span className="ml-2 text-xs font-medium px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                          Student
                        </span>
                      ) : (
                        user?.role === 'faculty' && (
                          <span className="ml-2 text-xs font-medium px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                            Faculty
                          </span>
                        )
                      )}
                    </motion.h1>
                    <div className="text-gray-600 dark:text-gray-300 flex flex-wrap items-center mt-2 sm:mt-3 gap-2 sm:gap-3">
                      <span className="flex items-center text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 px-2 sm:px-3 py-1 rounded-full">
                        <School size={16} className="mr-1.5 text-blue-800" />
                        <span className="truncate max-w-[120px] sm:max-w-none">{viewingUserId && viewingUserData?.universityId ? viewingUserData.universityId : user.universityId}</span>
                      </span>
                      <span className="flex items-center text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 px-2 sm:px-3 py-1 rounded-full">
                        <MapPin size={16} className="mr-1.5 text-blue-800" />
                        <span className="truncate max-w-[140px] sm:max-w-none">{viewingUserId && viewingUserData ? viewingUserData.location : (user?.role === 'faculty' ? 'Faculty of Computer Science' : 'BCA Program')}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-1 lg:mt-0 flex justify-start md:justify-end">
                    {!viewingUserId && (
                      <Button 
                        variant="primary" 
                        size="sm"
                        className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                        onClick={handleOpenEditModal}
                      >
                        <Edit size={16} />
                        <span>Edit Profile</span>
                      </Button>
                    )}
                    
                    {viewingUserId && (
                      <button 
                        className="flex items-center space-x-1 px-4 py-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <Users size={16} />
                        <span>Connect</span>
                      </button>
                    )}
                  </div>
                </div>
                
                {(viewingUserId ? viewingUserData?.bio : user.bio) && (
                  <motion.p 
                    className="text-gray-700 dark:text-gray-300 mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {viewingUserId ? viewingUserData?.bio : user.bio}
                  </motion.p>
                )}
                
                <motion.div 
                  className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 mb-6 sm:mb-8 md:mb-0"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  <motion.div 
                    variants={item} 
                    className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-800/40 dark:to-blue-700/30 px-3 sm:px-4 py-3 rounded-xl transition-colors duration-200 cursor-pointer hover:shadow-md"
                    onClick={() => setActiveTab('memories')}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center text-blue-600 dark:text-blue-200 mb-2">
                      <BookOpen size={16} className="mr-2" />
                      <span className="text-xs sm:text-sm font-medium">Memories</span>
                    </div>
                    <div className="text-lg sm:text-2xl font-bold text-blue-700 dark:text-blue-100">{userPosts.length}</div>
                  </motion.div>
                  <motion.div 
                    variants={item} 
                    className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-800/70 dark:to-purple-700/60 px-3 sm:px-4 py-3 rounded-xl transition-colors duration-200 cursor-pointer hover:shadow-md"
                    onClick={() => setActiveTab('friends')}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center text-blue-600 dark:text-blue-200 mb-2">
                      <Users size={16} className="mr-2" />
                      <span className="text-xs sm:text-sm font-medium">Friends</span>
                    </div>
                    <div className="text-lg sm:text-2xl font-bold text-blue-700 dark:text-blue-100">{friendsList.length}</div>
                  </motion.div>
                  <motion.div 
                    variants={item} 
                    className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-800/70 dark:to-amber-700/60 px-3 sm:px-4 py-3 rounded-xl transition-colors duration-200 cursor-pointer hover:shadow-md"
                    onClick={() => setActiveTab('about')}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center text-amber-600 dark:text-amber-200 mb-2">
                      <Award size={16} className="mr-2" />
                      <span className="text-xs sm:text-sm font-medium">Year</span>
                    </div>
                    <div className="text-lg sm:text-2xl font-bold text-amber-700 dark:text-amber-100">
                      {(() => {
                        const extractYear = (universityId: string): string => {
                          const parts = universityId.split('/');
                          return parts.length >= 3 ? `20${parts[2]}` : '2024';
                        };
                        
                        const universityId = viewingUserId && viewingUserData?.universityId 
                          ? viewingUserData.universityId 
                          : (user ? user.universityId : 'BWU/BCA/20/001');
                        
                        return extractYear(universityId);
                      })()} 
                    </div>
                  </motion.div>
                  <motion.div 
                    variants={item} 
                    className={`px-3 sm:px-4 py-3 rounded-xl transition-colors duration-200 cursor-pointer hover:shadow-md ${hasLiked ? 'bg-gradient-to-br from-emerald-200 to-emerald-300 dark:from-emerald-600 dark:to-emerald-500' : 'bg-gradient-to-br from-emerald-50/80 to-emerald-100/70 dark:from-emerald-800/40 dark:to-emerald-700/30'}`}
                    onClick={() => {
                      const targetProfileId = viewingUserId || (user ? user.id : '');
                      if (!targetProfileId || !user) return;
                      
                      if (hasLiked) {
                        const newCount = likeCount - 1;
                        setLikeCount(newCount);
                        setHasLiked(false);
                        updateProfileLikes(targetProfileId, newCount, false);
                      } else {
                        const newCount = likeCount + 1;
                        setLikeCount(newCount);
                        setHasLiked(true);
                        updateProfileLikes(targetProfileId, newCount, true);
                      }
                    }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={`flex items-center mb-2 ${hasLiked ? 'text-emerald-700 dark:text-emerald-100' : 'text-emerald-600/90 dark:text-emerald-200/90'}`}>
                      <Heart 
                        size={16} 
                        className={`mr-2 ${hasLiked ? 'fill-red-500 text-red-500' : ''}`} 
                      />
                      <span className="text-xs sm:text-sm font-medium">Likes</span>
                    </div>
                    <div className={`text-lg sm:text-2xl font-bold ${hasLiked ? 'text-emerald-800 dark:text-white' : 'text-emerald-700/90 dark:text-emerald-100/90'}`}>{likeCount}</div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
      
      <div className="container mx-auto px-2 sm:px-4 mt-4 sm:mt-6">
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm sm:shadow-md mb-4 sm:mb-6 overflow-hidden transition-colors duration-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex flex-wrap justify-center sm:justify-start border-b dark:border-gray-700">
            <button 
              onClick={() => setActiveTab('memories')}
              className={`relative flex-1 sm:flex-none min-w-0 px-4 sm:px-6 py-3 sm:py-4 ${activeTab === 'memories' ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'} flex items-center justify-center text-sm sm:text-sm md:text-base transition-all duration-200`}
            >
              <BookOpen size={16} className="hidden sm:inline mr-1.5 sm:mr-2" />
              Memories
              {activeTab === 'memories' && (
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                  layoutId="activeTabIndicator"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </button>
            <button 
              onClick={() => setActiveTab('collections')}
              className={`relative flex-1 sm:flex-none min-w-0 px-4 sm:px-6 py-3 sm:py-4 ${activeTab === 'collections' ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'} flex items-center justify-center text-sm sm:text-sm md:text-base transition-all duration-200`}
            >
              <Bookmark size={16} className="hidden sm:inline mr-1.5 sm:mr-2" />
              Collections
              {activeTab === 'collections' && (
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                  layoutId="activeTabIndicator"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </button>
            <button 
              onClick={() => setActiveTab('friends')}
              className={`relative flex-1 sm:flex-none min-w-0 px-4 sm:px-6 py-3 sm:py-4 ${activeTab === 'friends' ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'} flex items-center justify-center text-sm sm:text-sm md:text-base transition-all duration-200`}
            >
              <Users size={16} className="hidden sm:inline mr-1.5 sm:mr-2" />
              Friends
              {activeTab === 'friends' && (
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                  layoutId="activeTabIndicator"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </button>
            <button 
              onClick={() => setActiveTab('about')}
              className={`relative flex-1 sm:flex-none min-w-0 px-4 sm:px-6 py-3 sm:py-4 ${activeTab === 'about' ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'} flex items-center justify-center text-sm sm:text-sm md:text-base transition-all duration-200`}
            >
              <Link size={16} className="hidden sm:inline mr-1.5 sm:mr-2" />
              About
              {activeTab === 'about' && (
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                  layoutId="activeTabIndicator"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </button>
          </div>
        </motion.div>
        
        <motion.div 
          className="max-w-2xl mx-auto"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {activeTab === 'memories' && (
            <>
              {userPosts.length > 0 ? (
                <div className="space-y-6">
                  {userPosts.map((post) => (
                    <motion.div key={post.id} variants={item}>
                      <PostCard post={post} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div 
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center transition-colors duration-200"
                  variants={item}
                >
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-200">
                    <BookOpen size={24} className="text-blue-800 dark:text-blue-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">No memories shared yet</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">Start sharing your university moments with friends!</p>
                  <div className="flex justify-center w-full">
                    <Button variant="primary" size="lg">
                      Share Your First Memory
                    </Button>
                  </div>
                </motion.div>
              )}
            </>
          )}

          {activeTab === 'collections' && (
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors duration-200"
              variants={item}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Photo Gallery</h3>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsCreatePostModalOpen(true)}
                  >
                    <Camera size={16} className="mr-2" />
                    Add Photo
                  </Button>
                </div>
              </div>
              
              {(() => {
                const allMedia = userPosts
                  .filter(post => post.media && post.media.length > 0)
                  .flatMap(post => post.media || [])
                  .filter(media => media.type === 'image');
                
                if (allMedia.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-200">
                        <Bookmark size={24} className="text-blue-800 dark:text-blue-300" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">No Photos Yet</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">Share posts with photos to see them in your gallery</p>
                      <div className="flex justify-center w-full">
                        <Button 
                          variant="primary" 
                          size="sm" 
                          className="sm:text-base sm:px-4 sm:py-2"
                          onClick={() => setIsCreatePostModalOpen(true)}
                        >
                          Share Your First Photo
                        </Button>
                      </div>
                    </div>
                  );
                }
                
                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                    {allMedia.map((media, index) => (
                      <motion.div 
                        key={media.id || index}
                        className="relative aspect-square overflow-hidden rounded-lg cursor-pointer"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          const post = userPosts.find(p => 
                            p.media && p.media.some(m => m.id === media.id)
                          );
                          
                          if (post) {
                            alert(`Viewing image from post: ${post.content.substring(0, 30)}...`);
                          }
                        }}
                      >
                        <img 
                          src={media.url} 
                          alt="Gallery image" 
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </motion.div>
                    ))}
                  </div>
                );
              })()} 
            </motion.div>
          )}

          {activeTab === 'friends' && (
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors duration-200"
              variants={item}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3 sm:mb-0">
                  {viewingUserId ? 'Friends' : 'Your Friends'}
                  {filteredFriends.length > 0 && (
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({filteredFriends.length})</span>
                  )}
                </h3>
                <div className="w-full sm:w-auto relative">
                  <div className="relative w-full sm:w-64">
>>>>>>> a80153d (Update frontend)
                    <input
                      type="text"
                      placeholder="Search friends..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
<<<<<<< HEAD
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <Users size={18} className="text-gray-400" />
                    </div>
                  </div>
                </div>
                
                {friendsList.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {friendsList
                      .filter(friend => 
                        friend.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        friend.department.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((friend) => (
                        <div key={friend.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center transition-colors duration-200">
                          <img 
                            src={friend.avatar} 
                            alt={friend.name} 
                            className="w-12 h-12 rounded-full object-cover mr-4"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-white">{friend.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{friend.department}</p>
                          </div>
                          <button className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                            <UserMinus size={18} />
                          </button>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center transition-colors duration-200">
                    <Users size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">No Friends Yet</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      {viewingUserId ? 'This user hasn\'t connected with anyone yet.' : 'You haven\'t connected with anyone yet.'}
                    </p>
                    {!viewingUserId && (
                      <Button
                        variant="primary"
                        onClick={() => {
                          // Navigate to friends page
                          window.location.href = '/friends';
                        }}
                      >
                        Find Friends
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="space-y-8">
                {/* Education Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                    <School size={20} className="mr-2 text-blue-600" />
                    Education
                  </h3>
                  {viewingUserData?.education?.institution || user?.role ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {viewingUserData?.education?.degree || (user?.role === 'faculty' ? 'Faculty' : 'Student')}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {viewingUserData?.education?.institution || 'University'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        {viewingUserData?.education?.years || ''}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">No education information available.</p>
                  )}
                </div>
                
                {/* Skills Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                    <Award size={20} className="mr-2 text-blue-600" />
                    Skills
                  </h3>
                  {viewingUserData?.skills && viewingUserData.skills.length > 0 ? (
                    <div className="space-y-4">
                      {viewingUserData.skills.map((skill, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">{skill.name}</h4>
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{skill.proficiency}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div 
                              className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full" 
                              style={{ width: `${skill.proficiency}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">No skills information available.</p>
                  )}
                </div>
                
                {/* Interests Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                    <Bookmark size={20} className="mr-2 text-blue-600" />
                    Interests
                  </h3>
                  {viewingUserData?.interests && viewingUserData.interests.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {viewingUserData.interests.map((interest, index) => (
                        <span 
                          key={index} 
                          className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">No interests information available.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Create Post Modal */}
      {isCreatePostModalOpen && (
        <CreatePostModal
          isOpen={isCreatePostModalOpen}
          onClose={() => setIsCreatePostModalOpen(false)}
          userAvatar={user?.avatar || ''}
          userName={user?.name || ''}
        />
      )}
=======
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              {filteredFriends.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-3 sm:mb-4 md:mb-6">
                    {filteredFriends.map((friend) => (
                      <motion.div 
                        key={friend.id}
                        className="flex items-center p-2 sm:p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                        whileHover={{ scale: 1.02 }}
                      >
                        <img 
                          src={friend.avatar}
                          alt={friend.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mr-2 sm:mr-3 object-cover"
                        />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">{friend.name}</h4>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{friend.universityId}</p>
                        </div>
                        <div className="ml-auto flex items-center space-x-2">
                          <button 
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs sm:text-sm px-2 py-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                            onClick={() => {
                              localStorage.setItem('currentPage', 'profile');
                              localStorage.setItem('viewProfileUserId', friend.id.toString());
                              
                              window.dispatchEvent(new CustomEvent('navigate', {
                                detail: { 
                                  page: 'profile',
                                  userId: friend.id.toString(),
                                  scrollToTop: true,
                                  timestamp: new Date().getTime()
                                }
                              }));
                            }}
                          >
                            View Profile
                          </button>
                          
                          {!viewingUserId && (
                            <button 
                              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to remove ${friend.name} from your friends?`)) {
                                  const updatedFriends = friendsList.filter(f => f.id !== friend.id);
                                  setFriendsList(updatedFriends);
                                  
                                  localStorage.setItem('userFriends', JSON.stringify(updatedFriends));
                                  
                                  window.dispatchEvent(new CustomEvent('friendSystemChange'));
                                }
                              }}
                            >
                              <UserMinus size={16} />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users size={24} className="text-gray-500 dark:text-gray-400" />
                  </div>
                  {searchQuery ? (
                    <>
                      <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">No results found</h4>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">Try a different search term</p>
                    </>
                  ) : (
                    <>
                      <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                        {viewingUserId ? 'No friends yet' : 'You have no friends yet'}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {viewingUserId ? 
                          'This user hasn\'t connected with anyone yet' : 
                          'Connect with other students to see them here'}
                      </p>
                    </>
                  )}
                </div>
              )}
              
              {!viewingUserId && (
                <div className="mt-6 flex justify-center w-full">
                  <Button 
                    variant="primary" 
                    size="md"
                    onClick={() => {
                      localStorage.setItem('currentPage', 'friends');
                      localStorage.setItem('friendsActiveTab', 'suggestions');
                      
                      const event = new CustomEvent('navigate', {
                        detail: { page: 'friends' }
                      });
                      window.dispatchEvent(event);
                    }}
                  >
                    Find More Friends
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'about' && (
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors duration-200"
              variants={item}
            >
              <div className="space-y-6">
                
                <div>
                  <h4 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Education</h4>
                  <div className="flex items-start">
                    <School size={18} className="text-gray-500 dark:text-gray-400 mt-0.5 mr-2" />
                    <div>
                      <p className="text-gray-800 dark:text-gray-200 font-medium">{viewingUserId ? viewingUserData?.education.degree : displayProfile().education.degree}</p>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">{viewingUserId ? viewingUserData?.education.institution : displayProfile().education.institution}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">{viewingUserId ? viewingUserData?.education.years : displayProfile().education.years}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Location</h4>
                  <div className="flex items-center">
                    <MapPin size={18} className="text-gray-500 dark:text-gray-400 mr-2" />
                    <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">{viewingUserId ? viewingUserData?.location : displayProfile().location}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Skills</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {displayProfile().skills.map((skill, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                        <p className="text-gray-800 dark:text-gray-200 font-medium">{skill.name}</p>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 mt-1 rounded-full">
                          <div 
                            className="bg-blue-600 dark:bg-blue-500 h-1.5 rounded-full" 
                            style={{ width: `${skill.proficiency}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Achievements & Awards</h4>
                  <div className="space-y-2">
                    {displayProfile().achievements.map((achievement, index) => (
                      <div key={index} className="flex items-start">
                        <Award size={18} className="text-blue-500 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <p className="text-gray-800 dark:text-gray-200 font-medium">{achievement.title}</p>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">{achievement.description} ({achievement.year})</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Hobbies & Interests</h4>
                  <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 mt-2">
                    {displayProfile().interests.map((interest, index) => (
                      <span 
                        key={index}
                        className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
      <CreatePostModal 
        isOpen={isCreatePostModalOpen} 
        onClose={() => setIsCreatePostModalOpen(false)}
        userAvatar={user?.avatar || "https://randomuser.me/api/portraits/men/1.jpg"}
        userName={user?.name || "User"}
      />
>>>>>>> a80153d (Update frontend)
    </div>
  );
};

<<<<<<< HEAD
export default Profile;
=======
export default Profile;
>>>>>>> a80153d (Update frontend)
