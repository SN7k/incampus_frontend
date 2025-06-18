import React, { useState, useEffect } from 'react';
import { profileApi } from '../services/profileApi';
import { motion, AnimatePresence } from 'framer-motion';
import PullToRefresh from 'react-simple-pull-to-refresh';
import PostCard from '../components/post/PostCard';
import { useAuth } from '../contexts/AuthContext';
import { School, MapPin, Edit, Camera, BookOpen, Users, X, Save } from 'lucide-react';
import Button from '../components/ui/Button';
import { Post, ProfileData as OriginalProfileData, User } from '../types/profile';
import CreatePostModal from '../components/post/CreatePostModal';
import { postsApi } from '../services/postsApi';
import { friendsApi } from '../services/friendsApi';
import { getAvatarUrl } from '../utils/avatarUtils';

type ProfileData = OriginalProfileData & { role?: string };

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [friendsList, setFriendsList] = useState<User[]>([]);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [editFormData, setEditFormData] = useState<Partial<ProfileData>>({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [isFriend, setIsFriend] = useState(false);

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
          const hasSentRequest = sentRequests.some((request: { receiver?: { id: string } }) => request.receiver && request.receiver.id === viewingUserId);
          
          if (hasSentRequest) {
            setRequestSent(true);
          } else {
            setRequestSent(false);
          }
        } else {
          setRequestSent(false);
        }
      } catch (error) {
        console.error('Profile component - Error checking friend request status:', error);
        setRequestSent(false);
      }
    };
    
    checkFriendRequestStatus();
  }, [viewingUserId, user]);

  // Check if the viewed user is a friend
  useEffect(() => {
    const checkFriendshipStatus = async () => {
      if (!viewingUserId || !user) return;
      
      try {
        const isUserFriend = await friendsApi.isFriend(viewingUserId);
        setIsFriend(isUserFriend);
        
        // If user is a friend, they can't have a pending request
        if (isUserFriend) {
          setRequestSent(false);
        }
      } catch (error) {
        console.error('Profile component - Error checking friendship status:', error);
        setIsFriend(false);
      }
    };
    
    checkFriendshipStatus();
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

  const handleConnect = async () => {
    if (!viewingUserId) return;
    
    console.log('Profile: handleConnect called for user:', viewingUserId);
    
    // If user is already a friend, unfriend them
    if (isFriend) {
      console.log('Profile: User is already a friend, unfriending...');
      try {
        await friendsApi.unfriend(viewingUserId);
        setIsFriend(false);
        setRequestSent(false);
        
        // Update friends list
        const updatedFriends = await friendsApi.getFriendsList();
        setFriendsList(updatedFriends);
      } catch (error) {
        console.error('Error removing friend:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to remove friend';
        alert(errorMessage);
      }
      return;
    }
    
    // If request is already sent, don't do anything
    if (requestSent) {
      console.log('Profile: Friend request already sent');
      return;
    }
    
    // Send friend request
    console.log('Profile: Sending friend request...');
    try {
      const result = await friendsApi.sendFriendRequest(viewingUserId);
      console.log('Profile: Friend request sent successfully:', result);
      setRequestSent(true);
      
      // Dispatch event to update friend requests count
      window.dispatchEvent(new CustomEvent('friendRequestsChange', { 
        detail: { hasRequests: true } 
      }));
    } catch (error) {
      console.error('Error sending friend request:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send friend request';
      alert(errorMessage);
    }
  };

  // Handle refresh function for pull-to-refresh
  const handleRefresh = async () => {
    try {
      // Check if we're viewing someone else's profile
      const storedViewProfileUserId = localStorage.getItem('viewProfileUserId');
      
      let targetProfileId = '';
      
      if (storedViewProfileUserId && storedViewProfileUserId !== user?.id) {
        targetProfileId = storedViewProfileUserId;
      } else {
        targetProfileId = user?.id || '';
      }
      
      if (!targetProfileId) return;
      
      setIsLoadingProfile(true);
      
      // Fetch profile data
      const profileResponse = await profileApi.getUserProfile(targetProfileId);
      setProfileData(profileResponse);
      
      // Fetch user posts
      try {
        const postsResponse = await postsApi.getUserPosts(targetProfileId);
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
    } catch (error) {
      console.error('PROFILE: Error refreshing data:', error);
      setIsLoadingProfile(false);
    }
  };

  // Handle back to my profile navigation
  const handleBackToMyProfile = () => {
    localStorage.removeItem('viewProfileUserId');
    localStorage.setItem('currentPage', 'profile');
    window.location.href = '/profile';
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg mb-6 overflow-hidden">
            <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
              {/* Cover Photo Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera className="h-12 w-12 text-white opacity-50" />
              </div>
            </div>
            
            <div className="relative px-6 pb-6">
              {/* Profile Picture */}
              <div className="absolute -top-16 left-6">
                <div className="relative">
                  <img
                    src={getAvatarUrl(profileData?.avatar, profileData?.name || '')}
                    alt="Profile"
                    className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover"
                  />
                  {viewingUserId === user?.id && (
                    <button
                      onClick={handleEditProfile}
                      className="absolute bottom-2 right-2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Profile Info */}
              <div className="ml-40 pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {profileData?.name || 'Loading...'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      @{profileData?.name?.toLowerCase().replace(/\s+/g, '') || 'loading'}
                    </p>
                  </div>
                  
                  {/* Connect Button for other profiles */}
                  {viewingUserId && viewingUserId !== user?.id && (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleConnect}
                        variant={isFriend ? "outline" : "primary"}
                        className={`${
                          isFriend 
                            ? "bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50" 
                            : ""
                        }`}
                      >
                        {isFriend ? 'Connected' : 'Connect'}
                      </Button>
                    </div>
                  )}
                  
                  {/* Back to My Profile Button */}
                  {viewingUserId && viewingUserId !== user?.id && (
                    <Button
                      onClick={handleBackToMyProfile}
                      variant="outline"
                      className="ml-2"
                    >
                      Back to My Profile
                    </Button>
                  )}
                </div>
                
                {/* Bio */}
                {profileData?.bio && (
                  <p className="mt-3 text-gray-700 dark:text-gray-300">
                    {profileData.bio}
                  </p>
                )}
                
                {/* Profile Stats */}
                <div className="mt-4 flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{friendsList.length} friends</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{userPosts.length} posts</span>
                  </div>
                </div>
                
                {/* Location and School */}
                <div className="mt-3 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  {profileData?.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{profileData.location}</span>
                    </div>
                  )}
                  {profileData?.universityId && (
                    <div className="flex items-center gap-1">
                      <School className="h-4 w-4" />
                      <span>{profileData.universityId}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Create Post Section */}
          {viewingUserId === user?.id && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6 p-4">
              <div className="flex items-center gap-3">
                <img
                  src={getAvatarUrl(user?.avatar, user?.name || '')}
                  alt="Your avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <button
                  onClick={() => setIsCreatePostModalOpen(true)}
                  className="flex-1 text-left text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  What's on your mind?
                </button>
              </div>
            </div>
          )}

          {/* Posts Section */}
          <div className="space-y-6">
            <AnimatePresence>
              {userPosts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <PostCard
                    post={post}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
            
            {userPosts.length === 0 && !isLoadingProfile && (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {viewingUserId === user?.id ? "You haven't posted anything yet." : "No posts yet."}
                </p>
              </div>
            )}
          </div>
        </div>
      </PullToRefresh>

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

      {/* Create Post Modal */}
      <AnimatePresence>
        {isCreatePostModalOpen && (
          <CreatePostModal
            isOpen={isCreatePostModalOpen}
            onClose={() => setIsCreatePostModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;