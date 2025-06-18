import React, { useState, useEffect, useCallback } from 'react';
import { profileApi } from '../services/profileApi';
import { motion, AnimatePresence } from 'framer-motion';
import PostCard from '../components/post/PostCard';
import { useAuth } from '../contexts/AuthContext';
import { School, MapPin, Edit, Camera, BookOpen, Users, Award, Bookmark, Link, Heart, X, Save } from 'lucide-react';
import Button from '../components/ui/Button';
import { Post, ProfileData as OriginalProfileData, User } from '../types/profile';
import CreatePostModal from '../components/post/CreatePostModal';
import { postsApi } from '../services/postsApi';
import { friendsApi } from '../services/friendsApi';
import { getAvatarUrl } from '../utils/avatarUtils';

type ProfileData = OriginalProfileData & { role?: string };

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'memories' | 'collections' | 'friends' | 'about'>('memories');
  const [searchQuery, setSearchQuery] = useState('');
  const [friendsList, setFriendsList] = useState<User[]>([]);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [editFormData, setEditFormData] = useState<Partial<ProfileData>>({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  // Animation variants
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
  
  // Function to get profile likes from localStorage
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
  
  // Function to check if the current user has liked a profile
  const hasUserLikedProfile = useCallback((profileId: string) => {
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
  }, [user]);
  
  // Function to update profile likes in localStorage
  const updateProfileLikes = (profileId: string, newCount: number, hasLiked: boolean) => {
    try {
      // Update profile likes count
      const profileLikesStr = localStorage.getItem('profileLikes');
      const profileLikes = profileLikesStr ? JSON.parse(profileLikesStr) : {};
      profileLikes[profileId] = newCount;
      localStorage.setItem('profileLikes', JSON.stringify(profileLikes));
      
      // Update user's like status for this profile
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
      
      // Load profile likes when viewing a profile
  useEffect(() => {
      const targetProfileId = viewingUserId || (user ? user.id : '');
      if (targetProfileId) {
        const likes = getProfileLikes(targetProfileId);
        const userHasLiked = hasUserLikedProfile(targetProfileId);
        setLikeCount(likes);
        setHasLiked(userHasLiked);
      }
  }, [viewingUserId, user, hasUserLikedProfile]);

  // Initialize viewingUserId from localStorage on mount
  useEffect(() => {
    const targetUserId = localStorage.getItem('viewProfileUserId');
    setViewingUserId(targetUserId);
  }, []); // Only run on mount

  // Initialize profile data
  useEffect(() => {
    const fetchData = async () => {
      // Check if we're viewing someone else's profile
      const storedViewProfileUserId = localStorage.getItem('viewProfileUserId');
      
      let targetProfileId = '';
      
      if (storedViewProfileUserId && storedViewProfileUserId !== user?.id) {
        setViewingUserId(storedViewProfileUserId);
        targetProfileId = storedViewProfileUserId;
      } else {
        setViewingUserId(null);
        targetProfileId = user?.id || '';
      }
      
      // Only proceed if we have a valid profile ID
      if (!targetProfileId) {
        setIsLoadingProfile(false);
        return;
      }
      
      try {
        // Fetch profile data
        const profileResponse = await profileApi.getUserProfile(targetProfileId);
        setProfileData(profileResponse);
        
        // Fetch user posts
        try {
          const postsResponse = await postsApi.getUserPosts(targetProfileId);
          setUserPosts(postsResponse);
        } catch (error) {
          console.error('PROFILE: Error fetching posts:', error);
          setUserPosts([]); // Set empty array on error
        }
        
        // Fetch friends list
        try {
          const friendsResponse = await friendsApi.getFriendsList();
          setFriendsList(friendsResponse);
        } catch (error) {
          console.error('PROFILE: Error fetching friends:', error);
          setFriendsList([]); // Set empty array on error
        }
        
        setIsLoadingProfile(false);
      } catch (error) {
        console.error('PROFILE: Error fetching data:', error);
        setIsLoadingProfile(false);
      }
    };

    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  // Listen for navigation events to view own profile
  useEffect(() => {
    const handleProfileNavigation = (event: CustomEvent) => {
      console.log('PROFILE: Received profileNavigation event:', event.detail);
      if (event.detail?.action === 'viewOwnProfile') {
        console.log('PROFILE: Clearing viewingUserId and loading current user profile');
        // Clear viewingUserId to show current user's profile
        setViewingUserId(null);
        // Reload profile data for current user
        if (user?.id) {
          const fetchCurrentUserProfile = async () => {
            try {
              setIsLoadingProfile(true);
              const profileResponse = await profileApi.getUserProfile(user.id);
              setProfileData(profileResponse);
              
              // Fetch user posts
              try {
                const postsResponse = await postsApi.getUserPosts(user.id);
                setUserPosts(postsResponse);
              } catch (error) {
                console.error('PROFILE: Error fetching posts:', error);
                setUserPosts([]);
              }
              
              // Fetch friends list
              try {
                const friendsResponse = await friendsApi.getFriendsList();
                setFriendsList(friendsResponse);
              } catch (error) {
                console.error('PROFILE: Error fetching friends:', error);
                setFriendsList([]);
              }
              
              setIsLoadingProfile(false);
              console.log('PROFILE: Successfully loaded current user profile');
            } catch (error) {
              console.error('PROFILE: Error fetching current user profile:', error);
              setIsLoadingProfile(false);
            }
          };
          fetchCurrentUserProfile();
        }
      }
    };

    window.addEventListener('profileNavigation', handleProfileNavigation as EventListener);
    
    return () => {
      window.removeEventListener('profileNavigation', handleProfileNavigation as EventListener);
    };
  }, [user?.id]);

  // Check if friend request has already been sent when viewing another user's profile
  useEffect(() => {
    const checkFriendRequestStatus = async () => {
      if (!viewingUserId || !user) return;
      
      try {
        // Check sent requests to see if we already sent a request to this user
        const sentRequests = await friendsApi.getPendingRequests();
        if (sentRequests && Array.isArray(sentRequests)) {
          const hasSentRequest = sentRequests.some((request: any) => request.receiver && request.receiver.id === viewingUserId);
          
          if (hasSentRequest) {
            setRequestSent(true);
          }
        }
      } catch (error) {
        console.error('Profile component - Error checking friend request status:', error);
        // Don't throw error, just log it
      }
    };
    
    checkFriendRequestStatus();
  }, [viewingUserId, user]);

  // Listen for post deletion events
  useEffect(() => {
    const handlePostDeleted = (event: CustomEvent) => {
      const { postId } = event.detail;
      setUserPosts(currentPosts => currentPosts.filter(post => post.id !== postId));
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
      setUserPosts(currentPosts => [post, ...currentPosts]);
    };
    
    window.addEventListener('postCreated', handlePostCreated as EventListener);
    return () => {
      window.removeEventListener('postCreated', handlePostCreated as EventListener);
    };
  }, []);
  
  // When opening modal, initialize form data
  useEffect(() => {
    if (isEditProfileModalOpen && profileData) {
    setEditFormData(profileData);
    }
  }, [isEditProfileModalOpen, profileData]);

  const handleEditInputChange = (field: keyof ProfileData, value: string | number | string[] | { name: string; proficiency: number }[] | { title: string; description: string; year: string }[] | { degree: string; institution: string; years: string } | undefined) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEducationChange = (field: string, value: string) => {
    setEditFormData((prev) => ({
      ...prev,
      education: {
        degree: prev.education?.degree || '',
        institution: prev.education?.institution || '',
        years: prev.education?.years || '',
          [field]: value
      }
    }));
  };

  const handleSkillChange = (index: number, field: 'name' | 'proficiency', value: string | number) => {
    setEditFormData((prev) => {
      const updatedSkills = [...(prev.skills || [])];
          updatedSkills[index] = {
            ...updatedSkills[index],
        [field]: field === 'proficiency' ? Number(value) : value
      };
      return { ...prev, skills: updatedSkills };
    });
  };
  
  const addSkill = () => {
    setEditFormData((prev) => ({
      ...prev,
      skills: [...(prev.skills || []), { name: '', proficiency: 50 }]
    }));
  };
  
  const removeSkill = (index: number) => {
    setEditFormData((prev) => ({
      ...prev,
      skills: (prev.skills || []).filter((_, i) => i !== index)
    }));
  };
  
  const handleAchievementChange = (index: number, field: string, value: string) => {
    setEditFormData((prev) => {
      const updatedAchievements = [...(prev.achievements || [])];
      updatedAchievements[index] = {
        ...updatedAchievements[index],
        [field]: value
      };
      return { ...prev, achievements: updatedAchievements };
    });
  };

  const addAchievement = () => {
    setEditFormData((prev) => ({
      ...prev,
      achievements: [...(prev.achievements || []), { title: '', description: '', year: '' }]
    }));
  };
  
  const removeAchievement = (index: number) => {
    setEditFormData((prev) => ({
      ...prev,
      achievements: (prev.achievements || []).filter((_, i) => i !== index)
    }));
  };
  
  const handleInterestsChange = (value: string) => {
    const interestsArray = value.split(',').map(item => item.trim()).filter(item => item !== '');
    setEditFormData((prev) => ({ ...prev, interests: interestsArray }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsSavingProfile(true);
      try {
        const avatarResult = await profileApi.uploadProfilePicture(file);
        setEditFormData((prev) => ({ ...prev, avatar: avatarResult.avatar }));
        // Update the AuthContext with the new avatar object
        updateProfile({ avatar: avatarResult.avatar }); 
      } catch (err) {
        console.error('Failed to upload avatar:', err);
        alert('Failed to upload avatar.');
      } finally {
        setIsSavingProfile(false);
      }
    }
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const updated = await profileApi.updateProfile(editFormData);
      setProfileData(updated);
      setIsEditProfileModalOpen(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleEditProfile = () => {
    if (profileData) {
      setIsEditProfileModalOpen(true);
    }
  };

  const handleCoverPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Upload cover photo to backend
        const { coverPhotoUrl } = await profileApi.uploadCoverPhoto(file);
        
        // Update local profile data
        setProfileData(prev => prev ? { ...prev, coverPhoto: { url: coverPhotoUrl } } : null);
        
        // Update auth context
        updateProfile({
          coverPhoto: { url: coverPhotoUrl }
        });
      } catch (error) {
        console.error('Failed to upload cover photo:', error);
        alert('Failed to upload cover photo. Please try again.');
      }
    }
  };

  const handleConnect = async () => {
    if (!viewingUserId) return;
    
    setIsSendingRequest(true);
    try {
      await friendsApi.sendFriendRequest(viewingUserId);
      setRequestSent(true);
      
      // Show success message
      alert('Friend request sent successfully!');
      
      // Dispatch event to update friend requests count
      window.dispatchEvent(new CustomEvent('friendRequestsChange', { 
        detail: { hasRequests: true } 
      }));
    } catch (error) {
      console.error('Error sending friend request:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send friend request';
      alert(errorMessage);
    } finally {
      setIsSendingRequest(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <p className="text-gray-700 dark:text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Only show "Profile not found" if we're not loading and have no data
  if (!isLoadingProfile && !profileData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-gray-500 mb-4">Profile not found</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 pb-20">
      {/* Cover photo and profile section */}
      <motion.div 
        className="relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="h-48 sm:h-56 md:h-72 w-full bg-gradient-to-r from-blue-800 to-blue-600 overflow-hidden relative">
          {profileData?.coverPhoto?.url && (
            <img 
              src={profileData.coverPhoto.url} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          {!viewingUserId && (
          <label htmlFor="cover-photo-upload" className="absolute top-4 right-4 bg-black bg-opacity-40 text-white p-2 rounded-full hover:bg-opacity-60 transition-all cursor-pointer">
            <Camera size={18} />
          </label>
          )}
          <input 
            id="cover-photo-upload"
            type="file" 
            accept="image/*"
            className="hidden"
            onChange={handleCoverPhotoChange}
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
              {/* Profile picture */}
              <div className="flex-shrink-0 -mt-14 sm:-mt-16 md:-mt-20 mb-4 md:mb-0 md:mr-6">
                <div className="relative">
                  <motion.img 
                    src={getAvatarUrl(profileData?.avatar, profileData?.name || '')}
                    alt={profileData?.name} 
                    className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-full border-4 border-white dark:border-gray-700 object-cover shadow-lg"
                    whileHover={{ scale: 1.05 }}
                  />
                </div>
              </div>
              
              {/* Profile info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start lg:items-center justify-between mb-4 sm:mb-5">
                  <div className="max-w-full md:max-w-[70%]">
                    <motion.h1 
                      className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center flex-wrap"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {profileData?.name}
                      {profileData?.role && (
                        <span className="ml-2 text-xs font-medium px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                          {profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1)}
                        </span>
                      )}
                    </motion.h1>
                    <div className="text-gray-600 dark:text-gray-300 flex flex-wrap items-center mt-2 sm:mt-3 gap-2 sm:gap-3">
                      <span className="flex items-center text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 px-2 sm:px-3 py-1 rounded-full">
                        <School size={16} className="mr-1.5 text-blue-800" />
                        <span className="truncate max-w-[120px] sm:max-w-none">{profileData?.universityId}</span>
                      </span>
                      {profileData?.location && (
                      <span className="flex items-center text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 px-2 sm:px-3 py-1 rounded-full">
                        <MapPin size={16} className="mr-1.5 text-blue-800" />
                          <span className="truncate max-w-[140px] sm:max-w-none">{profileData.location}</span>
                      </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-1 lg:mt-0 flex justify-start md:justify-end">
                    {/* Edit Profile Button - Only show for own profile */}
                    {!viewingUserId && (
                      <Button 
                        variant="primary" 
                        size="sm"
                        className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                        onClick={handleEditProfile}
                      >
                        <Edit size={16} />
                        <span>Edit Profile</span>
                      </Button>
                    )}
                    
                    {/* Connect Button - Only show for other profiles */}
                    {viewingUserId && (
                      <button 
                        onClick={handleConnect}
                        disabled={isSendingRequest || requestSent}
                        className={`flex items-center space-x-1 px-4 py-2 border-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ${
                          requestSent 
                            ? 'border-green-600 text-green-600 bg-green-50 dark:bg-green-900/20' 
                            : isSendingRequest
                            ? 'border-gray-400 text-gray-400 cursor-not-allowed'
                            : 'border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                        }`}
                      >
                        {isSendingRequest ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            <span>Sending...</span>
                          </>
                        ) : requestSent ? (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span>Request Sent</span>
                          </>
                        ) : (
                          <>
                            <Users size={16} />
                            <span>Connect</span>
                          </>
                        )}
                      </button>
                    )}
                    
                  </div>
                </div>
                
                {profileData?.bio && (
                  <motion.p 
                    className="text-gray-700 dark:text-gray-300 mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {profileData.bio}
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
                        // Extract year from university ID (e.g., 'BWU/BCA/20/001' -> '20')
                        const extractYear = (universityId: string): string => {
                          const parts = universityId.split('/');
                          return parts.length >= 3 ? `20${parts[2]}` : '2024';
                        };
                        
                        return extractYear(profileData?.universityId || 'BWU/BCA/20/001');
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
      
      {/* Tabs and content */}
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
        
        {/* Content section */}
        <motion.div 
          className="max-w-2xl mx-auto"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence mode="wait">
          {activeTab === 'memories' && (
              <motion.div 
                key="memories"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
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
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                      {!viewingUserId ? 'No memories shared yet' : 'No memories shared yet'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {!viewingUserId ? 'Start sharing your university moments with friends!' : 'This user hasn\'t shared any memories yet.'}
                    </p>
                  <div className="flex justify-center w-full">
                      {!viewingUserId && (
                        <Button 
                          variant="primary" 
                          size="lg"
                          onClick={() => setIsCreatePostModalOpen(true)}
                        >
                      Share Your First Memory
                    </Button>
                      )}
                  </div>
                </motion.div>
              )}
              </motion.div>
          )}

          {activeTab === 'collections' && (
            <motion.div 
                key="collections"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Photo Gallery</h3>
                    {!viewingUserId && (
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
                    )}
              </div>
              {/* Extract all images from user posts */}
              {(() => {
                // Get all media from user posts
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
                          <p className="text-gray-600 dark:text-gray-300 mb-4">
                            {!viewingUserId ? 'Share posts with photos to see them in your gallery' : 'This user hasn\'t shared any photos yet.'}
                          </p>
                      <div className="flex justify-center w-full">
                            {!viewingUserId && (
                        <Button 
                          variant="primary" 
                          size="sm" 
                          className="sm:text-base sm:px-4 sm:py-2"
                          onClick={() => setIsCreatePostModalOpen(true)}
                        >
                          Share Your First Photo
                        </Button>
                            )}
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
                </div>
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
                    {friendsList.length > 0 && (
                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({friendsList.length})</span>
                  )}
                </h3>
                <div className="w-full sm:w-auto relative">
                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      placeholder="Search friends..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
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
              
                {(() => {
                  const filteredFriends = friendsList.filter(friend => 
                    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    friend.universityId?.toLowerCase().includes(searchQuery.toLowerCase())
                  );
                  
                  if (filteredFriends.length > 0) {
                    return (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-3 sm:mb-4 md:mb-6">
                    {filteredFriends.map((friend) => (
                      <motion.div 
                        key={friend.id}
                        className="flex items-center p-2 sm:p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                        whileHover={{ scale: 1.02 }}
                      >
                        <img 
                                src={getAvatarUrl(friend.avatar, friend.name)}
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
                              // Navigate to friend's profile
                                    localStorage.setItem('viewProfileUserId', friend.id);
                                    window.location.reload();
                            }}
                          >
                            View Profile
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
                    );
                  } else {
                    return (
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
                    );
                  }
                })()}
              
              {!viewingUserId && (
                <div className="mt-6 flex justify-center w-full">
                  <Button 
                    variant="primary" 
                    size="md"
                    onClick={() => {
                        // Navigate to Friends page
                      localStorage.setItem('currentPage', 'friends');
                        window.location.href = '/friends';
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
                key="about"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
            >
              <div className="space-y-6">
                  {/* Education */}
                  {profileData?.education && (
                <div>
                  <h4 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Education</h4>
                  <div className="flex items-start">
                    <School size={18} className="text-gray-500 dark:text-gray-400 mt-0.5 mr-2" />
                    <div>
                          <p className="text-gray-800 dark:text-gray-200 font-medium">{profileData.education.degree}</p>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">{profileData.education.institution}</p>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">{profileData.education.years}</p>
                    </div>
                  </div>
                </div>
                  )}
                
                  {/* Location */}
                  {profileData?.location && (
                <div>
                  <h4 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Location</h4>
                  <div className="flex items-center">
                    <MapPin size={18} className="text-gray-500 dark:text-gray-400 mr-2" />
                        <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">{profileData.location}</p>
                  </div>
                </div>
                  )}
                
                  {/* Skills */}
                  {profileData?.skills && profileData.skills.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Skills</h4>
                  <div className="grid grid-cols-2 gap-2">
                        {profileData.skills.map((skill, index) => (
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
                  )}
                
                  {/* Achievements */}
                  {profileData?.achievements && profileData.achievements.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Achievements & Awards</h4>
                  <div className="space-y-2">
                        {profileData.achievements.map((achievement, index) => (
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
                  )}
                
                  {/* Interests */}
                  {profileData?.interests && profileData.interests.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Hobbies & Interests</h4>
                  <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 mt-2">
                        {profileData.interests.map((interest, index) => (
                      <span 
                        key={index}
                        className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
                  )}
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </motion.div>
      </div>
                
      {/* Create Post Modal */}
      <CreatePostModal 
        isOpen={isCreatePostModalOpen} 
        onClose={() => setIsCreatePostModalOpen(false)}
      />

      {/* Edit Profile Modal */}
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
                {/* Avatar upload */}
                <div className="flex flex-col items-center">
                  <label htmlFor="edit-avatar-upload" className="cursor-pointer block relative">
                    <img 
                      src={getAvatarUrl(editFormData.avatar, editFormData.name || '')} 
                      alt="Profile" 
                      className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg hover:opacity-90 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-medium">Change Photo</span>
                    </div>
                  </label>
                  <input 
                    id="edit-avatar-upload"
                    type="file" 
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </div>
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input 
                    type="text" 
                    value={editFormData.name || ''}
                    onChange={e => handleEditInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                  <textarea 
                    value={editFormData.bio || ''}
                    onChange={e => handleEditInputChange('bio', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Tell others about yourself"
                  />
                </div>

                {/* Education */}
                <div>
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Education</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Degree</label>
                      <input 
                        type="text" 
                        value={editFormData.education?.degree || ''}
                        onChange={(e) => handleEducationChange('degree', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Institution</label>
                      <input 
                        type="text" 
                        value={editFormData.education?.institution || ''}
                        onChange={(e) => handleEducationChange('institution', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Years</label>
                      <input 
                        type="text" 
                        value={editFormData.education?.years || ''}
                        onChange={(e) => handleEducationChange('years', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Location</h3>
                  <input 
                    type="text" 
                    value={editFormData.location || ''}
                    onChange={(e) => handleEditInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                {/* Skills */}
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
                    {(editFormData.skills || []).map((skill, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="flex-1">
                          <input 
                            type="text" 
                            value={skill.name}
                            onChange={(e) => handleSkillChange(index, 'name', e.target.value)}
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
                            onChange={(e) => handleSkillChange(index, 'proficiency', e.target.value)}
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

                {/* Achievements */}
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
                    {(editFormData.achievements || []).map((achievement, index) => (
                      <div key={index} className="space-y-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex justify-between">
                          <h4 className="font-medium">Achievement {(editFormData.achievements || []).length - index}</h4>
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
                            onChange={(e) => handleAchievementChange(index, 'title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                          <input 
                            type="text" 
                            value={achievement.description}
                            onChange={(e) => handleAchievementChange(index, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
                          <input 
                            type="text" 
                            value={achievement.year}
                            onChange={(e) => handleAchievementChange(index, 'year', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Hobbies & Interests</h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1 sm:mb-2">Separate interests with commas</p>
                  <textarea 
                    value={(editFormData.interests || []).join(', ')}
                    onChange={(e) => handleInterestsChange(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
              <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 border-t dark:border-gray-700 flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs sm:text-sm py-1.5 sm:py-2"
                  onClick={() => setIsEditProfileModalOpen(false)}
                  disabled={isSavingProfile}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  className="text-xs sm:text-sm py-1.5 sm:py-2 flex items-center justify-center"
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                >
                  <Save size={14} className="mr-1 sm:mr-2" />
                  {isSavingProfile ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;