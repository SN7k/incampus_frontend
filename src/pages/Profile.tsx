import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PostCard from '../components/post/PostCard';
import { mockPosts, mockUsers } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';
import { School, Edit, Link, BookOpen, Users, Award, Bookmark, Heart, Camera, X, ImagePlus, GraduationCap, UserCog } from 'lucide-react';
import Button from '../components/ui/Button';
import EditProfileModal from '../components/profile/EditProfileModal';
import CollectionsView from '../components/profile/CollectionsView';
import FriendsView from '../components/profile/FriendsView';
import AboutView from '../components/profile/AboutView';

interface ProfileProps {
  onNavigate?: (page: string, userId?: string) => void;
  viewUserId?: string | null;
}

const Profile: React.FC<ProfileProps> = ({ onNavigate, viewUserId }) => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('memories');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBannerOptions, setShowBannerOptions] = useState(false);
  const [prevTab, setPrevTab] = useState<string>('memories');
  
  // Find the user to display based on viewUserId or fall back to current user
  const [displayUser, setDisplayUser] = useState<User | null>(null);
  
  // Effect to determine which user's profile to show
  useEffect(() => {
    if (viewUserId) {
      // Find the user in mockUsers by ID
      const userToShow = mockUsers.find(u => u.id === viewUserId);
      if (userToShow) {
        setDisplayUser(userToShow);
      } else {
        // If user not found, default to current user
        setDisplayUser(currentUser);
      }
    } else {
      // Default to current user if no viewUserId provided
      setDisplayUser(currentUser);
    }
  }, [viewUserId, currentUser]);
  
  // Effect to set the active tab when the component mounts
  useEffect(() => {
    // This ensures the tab is set even if navigating directly to the profile page
    // and then clicking Connect
    sessionStorage.setItem('friendsActiveTab', 'suggestions');
  }, []);

  if (!currentUser || !displayUser) return null;
  
  // Determine if this is the current user's profile
  const isCurrentUserProfile = !viewUserId || viewUserId === currentUser.id;

  // Get posts for the displayed user
  const userPosts = mockPosts.filter(post => post.userId === displayUser.id);
  
  // Function to determine slide direction based on Facebook's actual behavior
  const getSlideDirection = (): 'rightToLeft' | 'leftToRight' => {
    const tabOrder = ['memories', 'collections', 'friends', 'about'];
    const prevIndex = tabOrder.indexOf(prevTab);
    const currentIndex = tabOrder.indexOf(activeTab);
    
    // In Facebook:
    // 1. When moving from left tab to right tab (e.g., Memories → About), content slides right-to-left
    // 2. When moving from right tab to left tab (e.g., About → Memories), content slides left-to-right
    if (currentIndex > prevIndex) {
      return 'rightToLeft'; // Moving toward right tabs (About)
    } else {
      return 'leftToRight'; // Moving toward left tabs (Memories)
    }
  };
  
  // Animation for right-to-left motion (when moving toward About)
  const rightToLeftVariants = {
    hidden: { opacity: 0, x: 15, scale: 1 },  // Content enters from right
    show: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      transition: {
        type: "tween",
        ease: "easeOut",
        duration: 0.15
      }
    },
    exit: { 
      opacity: 0, 
      x: -10,  // Previous content exits to left
      transition: {
        type: "tween",
        ease: "easeIn",
        duration: 0.1
      }
    }
  };
  
  // Animation for left-to-right motion (when moving toward Memories)
  const leftToRightVariants = {
    hidden: { opacity: 0, x: -15, scale: 1 },  // Content enters from left
    show: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      transition: {
        type: "tween",
        ease: "easeOut",
        duration: 0.15
      }
    },
    exit: { 
      opacity: 0, 
      x: 10,  // Previous content exits to right
      transition: {
        type: "tween",
        ease: "easeIn",
        duration: 0.1
      }
    }
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
    hidden: { opacity: 0, y: 10 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "tween",
        ease: "easeOut",
        duration: 0.2
      }
    }
  };

  // Function to handle navigation to Friends Suggestions tab
  const handleNavigateToFriends = () => {
    // Store the active tab in sessionStorage so it persists
    sessionStorage.setItem('friendsActiveTab', 'suggestions');
    
    // Use the onNavigate prop if available
    if (onNavigate) {
      onNavigate('friends');
    }
  };
  
  // Handle profile update
  const handleSaveProfile = (updatedProfile: { name: string; bio: string; avatar?: File }) => {
    // In a real app, you would upload the avatar file to a server
    // and get back a URL. For this demo, we'll create a local URL if there's a file
    let avatarUrl = currentUser?.avatar;
    
    if (updatedProfile.avatar) {
      // This is just for demo purposes - in a real app you'd upload to a server
      avatarUrl = URL.createObjectURL(updatedProfile.avatar);
    }
    
    // Update the user profile in the auth context
    // In a real app, you would call an API endpoint here
    console.log('Updating profile:', {
      ...currentUser,
      name: updatedProfile.name,
      bio: updatedProfile.bio,
      avatar: avatarUrl
    });
    
    // Close the modal
    setShowEditModal(false);
  };

  return (
    <div className="pt-2 pb-20 md:pb-6 bg-gray-900 min-h-screen">
      {/* Cover photo and profile section */}
      <motion.div 
        className="relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="h-72 w-full bg-gradient-to-r from-blue-800 to-blue-600 overflow-hidden relative">
          {displayUser.coverPhoto && (
            <img 
              src={displayUser.coverPhoto}
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          
          {/* Banner edit button - only visible for own profile */}
          {displayUser.id === currentUser?.id && (
            <>
              {/* Hidden file input for uploading cover photo */}
              <input 
                type="file" 
                id="cover-photo-upload" 
                className="hidden" 
                accept="image/*"
                onChange={(e) => {
                  // Handle file upload logic here
                  if (e.target.files && e.target.files[0]) {
                    // In a real app, you would upload the file to a server
                    console.log('File selected:', e.target.files[0].name);
                    // Reset the input
                    e.target.value = '';
                  }
                  setShowBannerOptions(false);
                }}
              />
              
              {/* Edit cover photo button */}
              <button 
                onClick={() => setShowBannerOptions(!showBannerOptions)}
                className="absolute top-4 right-4 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 p-2 rounded-full shadow-md transition-all z-40 flex items-center"
                aria-label="Edit cover photo"
              >
                <Camera size={18} className="text-blue-600 dark:text-blue-400" />
              </button>
              
              {/* Banner options popup */}
              {showBannerOptions && (
                <div className="absolute top-16 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-1 z-50 border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-700">
                    <label 
                      htmlFor="cover-photo-upload"
                      className="flex items-center px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <ImagePlus size={16} className="mr-2" />
                      Upload Photo
                    </label>
                    <button 
                      className="flex items-center px-4 py-3 text-sm font-medium text-red-500 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                      onClick={() => {
                        // Handle remove banner logic
                        console.log('Remove cover photo');
                        setShowBannerOptions(false);
                      }}
                    >
                      <X size={16} className="mr-2" />
                      Remove Photo
                    </button>
                  </div>
                </div>
              )}
              
              {/* Click outside to close popup */}
              {showBannerOptions && (
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setShowBannerOptions(false)}
                ></div>
              )}
            </>
          )}
        </div>
        
        <div className="container mx-auto px-4">
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg -mt-20 relative z-10 p-6 mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex flex-col md:flex-row">
              {/* Profile picture */}
              <div className="flex-shrink-0 -mt-16 md:-mt-20 mb-4 md:mb-0 md:mr-6">
                <div className="relative">
                  <motion.img 
                    src={displayUser.avatar}
                    alt={displayUser.name} 
                    className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-white object-cover shadow-lg"
                    whileHover={{ scale: 1.05 }}
                  />
                </div>
              </div>
              
              {/* Profile info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div>
                    <motion.h1 
                      className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {displayUser.name}
                      {displayUser.role === 'faculty' && (
                        <span className="ml-2 text-xs font-medium px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-full">
                          Faculty
                        </span>
                      )}
                    </motion.h1>
                    
                    {/* Program information */}
                    <motion.div
                      className="flex flex-wrap items-center mt-2 mb-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {displayUser.role === 'faculty' ? (
                        <span className="flex items-center text-sm bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                          <UserCog size={16} className="mr-1 text-blue-800 dark:text-blue-400" />
                          <span className="font-medium text-blue-800 dark:text-blue-400">Faculty</span>, Department of Computer Science
                        </span>
                      ) : (
                        <span className="flex items-center text-sm bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                          <GraduationCap size={16} className="mr-1 text-blue-800 dark:text-blue-400" />
                          <span className="font-medium text-blue-800 dark:text-blue-400">Student</span>, {displayUser.program || 'BCA'}
                        </span>
                      )}
                    </motion.div>
                    <div className="text-gray-600 dark:text-gray-400 flex flex-wrap items-center mt-2">
                      <span className="flex items-center text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                        <School size={16} className="mr-1 text-blue-800 dark:text-blue-400" />
                        {displayUser.universityId}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0 flex space-x-2">
                  {isCurrentUserProfile && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center"
                      onClick={() => setShowEditModal(true)}
                    >
                      <Edit size={16} className="mr-1" />
                      Edit Profile
                    </Button>
                  )}
                  {!isCurrentUserProfile && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex items-center"
                      onClick={() => handleNavigateToFriends()}
                    >
                      <Users size={16} className="mr-1" />
                      Connect
                    </Button>
                  )}
                  </div>
                </div>
                
                {displayUser.bio && (
                  <motion.p 
                    className="text-gray-700 dark:text-gray-300 mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {displayUser.bio}
                  </motion.p>
                )}
                
                <motion.div 
                  className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  <motion.div variants={item} className="bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-3 rounded-xl">
                    <div className="flex items-center text-blue-800 mb-1">
                      <BookOpen size={18} className="mr-2" />
                      <span className="text-sm font-medium">Memories</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">{userPosts.length}</div>
                  </motion.div>
                  <motion.div variants={item} className="bg-gradient-to-br from-purple-50 to-purple-100 px-4 py-3 rounded-xl">
                    <div className="flex items-center text-purple-800 mb-1">
                      <Users size={18} className="mr-2" />
                      <span className="text-sm font-medium">Friends</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-900">42</div>
                  </motion.div>
                  <motion.div variants={item} className="bg-gradient-to-br from-amber-50 to-amber-100 px-4 py-3 rounded-xl">
                    <div className="flex items-center text-amber-800 mb-1">
                      <Award size={18} className="mr-2" />
                      <span className="text-sm font-medium">Year</span>
                    </div>
                    <div className="text-2xl font-bold text-amber-900">2024</div>
                  </motion.div>
                  <motion.div variants={item} className="bg-gradient-to-br from-emerald-50 to-emerald-100 px-4 py-3 rounded-xl">
                    <div className="flex items-center text-emerald-800 mb-1">
                      <Heart size={18} className="mr-2" />
                      <span className="text-sm font-medium">Likes</span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-900">128</div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Tabs and content */}
      <div className="container mx-auto px-4 mt-6">
        <motion.div 
          className="bg-gray-800 rounded-xl shadow-md mb-6 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex border-b border-gray-700 justify-center overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <button 
              className={`px-3 sm:px-6 py-3 sm:py-4 font-medium flex items-center justify-center min-w-[80px] sm:min-w-[120px] ${activeTab === 'memories' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
              onClick={() => {
                setPrevTab(activeTab);
                setActiveTab('memories');
              }}
            >
              <BookOpen size={18} className="hidden sm:inline-block sm:mr-2" />
              <span className="text-sm sm:text-base">Memories</span>
            </button>
            <button 
              className={`px-3 sm:px-6 py-3 sm:py-4 font-medium flex items-center justify-center min-w-[80px] sm:min-w-[120px] ${activeTab === 'collections' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
              onClick={() => {
                setPrevTab(activeTab);
                setActiveTab('collections');
              }}
            >
              <Bookmark size={18} className="hidden sm:inline-block sm:mr-2" />
              <span className="text-sm sm:text-base">Collections</span>
            </button>
            <button 
              className={`px-3 sm:px-6 py-3 sm:py-4 font-medium flex items-center justify-center min-w-[80px] sm:min-w-[120px] ${activeTab === 'friends' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
              onClick={() => {
                setPrevTab(activeTab);
                setActiveTab('friends');
              }}
            >
              <Users size={18} className="hidden sm:inline-block sm:mr-2" />
              <span className="text-sm sm:text-base">Friends</span>
            </button>
            <button 
              className={`px-3 sm:px-6 py-3 sm:py-4 font-medium flex items-center justify-center min-w-[80px] sm:min-w-[120px] ${activeTab === 'about' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
              onClick={() => {
                setPrevTab(activeTab);
                setActiveTab('about');
              }}
            >
              <Link size={18} className="hidden sm:inline-block sm:mr-2" />
              <span className="text-sm sm:text-base">About</span>
            </button>
          </div>
        </motion.div>
        
        {/* Content section */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div 
            className="relative max-w-4xl mx-auto bg-gray-800 rounded-xl shadow-md p-4 w-full overflow-hidden"
            style={{ minHeight: '500px' }}
            variants={getSlideDirection() === 'rightToLeft' ? rightToLeftVariants : leftToRightVariants} // True Facebook-style tab animations
            initial="hidden"
            animate="show"
            exit="exit"
            key={activeTab} // Add key to force re-render on tab change
          >
          {/* Memories Tab */}
          {activeTab === 'memories' && (
            <div className="max-w-2xl mx-auto">
              {userPosts.length > 0 ? (
                <div className="space-y-6">
                  {userPosts.map((post) => (
                    <motion.div key={post.id} variants={item}>
                      <PostCard 
                        post={post} 
                        onNavigateToProfile={(userId) => {
                          onNavigate && onNavigate('profile', userId);
                        }}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div 
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center"
                  variants={item}
                >
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen size={24} className="text-blue-800 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">No memories shared yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Start sharing your university moments with friends!</p>
                  <Button variant="primary" size="lg">
                    Share Your First Memory
                  </Button>
                </motion.div>
              )}
            </div>
          )}

          {/* Collections Tab */}
          {activeTab === 'collections' && (
            <div className="w-full">
              <CollectionsView posts={userPosts} />
            </div>
          )}

          {/* Friends Tab */}
          {activeTab === 'friends' && (
            <div className="w-full">
              <FriendsView 
                _currentUser={currentUser} 
                displayUser={displayUser} 
                isCurrentUserProfile={isCurrentUserProfile}
                onNavigateToProfile={(userId) => {
                  onNavigate && onNavigate('profile', userId);
                }}
              />
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="w-full">
              <AboutView 
                displayUser={displayUser} 
                isCurrentUserProfile={isCurrentUserProfile} 
              />
            </div>
          )}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <EditProfileModal 
            onClose={() => setShowEditModal(false)} 
            onSave={handleSaveProfile}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
