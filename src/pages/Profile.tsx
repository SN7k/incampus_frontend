import React, { useState, useEffect } from 'react';
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
  useEffect(() => {
    if (viewingUserId) {
      console.log('PROFILE DATA: Loading profile for user ID:', viewingUserId);
      setIsLoadingProfile(true);
      setProfileError(null);
      
      const loadProfileData = async () => {
        try {
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
          setIsLoadingProfile(false);
        }
      };
      
      loadProfileData();
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
      {isLoadingProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <p className="text-gray-700 dark:text-gray-300">Loading profile...</p>
          </div>
        </div>
      )}
      
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
                    <input
                      type="text"
                      placeholder="Search friends..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
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
    </div>
  );
};

export default Profile;
