import React, { useState, useEffect, useCallback } from 'react';
import { profileApi } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import PostCard from '../components/post/PostCard';
import { useAuth } from '../contexts/AuthContext';
import { School, MapPin, Edit, Camera, BookOpen, Users, Award, User as UserIcon } from 'lucide-react';
import Button from '../components/ui/Button';
import { Post, ProfileData, User } from '../types/profile';
import CreatePostModal from '../components/post/CreatePostModal';
import { postsApi } from '../services/postsApi';
import { friendApi } from '../services/api';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [friendsList, setFriendsList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'friends'>('posts');
  const [editForm, setEditForm] = useState<Partial<ProfileData>>({});

  // Get the user ID to view (either current user or someone else)
  const viewingUserId = localStorage.getItem('viewProfileUserId');
  const isOwnProfile = !viewingUserId || (user && viewingUserId === user.id);

  // Load profile data
  const loadProfileData = useCallback(async () => {
    if (!user) {
      console.error('User is null or undefined');
      setError('User not found. Please log in again.');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const targetUserId = viewingUserId || user.id;
      console.log('Loading profile for user ID:', targetUserId);
      
      if (!targetUserId) {
        throw new Error('User ID is undefined');
      }
      
      const profile = await profileApi.getUserProfile(targetUserId);
      setProfileData(profile);
      
      // Load user posts
      const posts = await postsApi.getUserPosts(targetUserId);
      setUserPosts(posts);
      
      // Load friends list
      const friends = await friendApi.getFriends();
      setFriendsList(friends);
      
    } catch (error: unknown) {
      console.error('Error loading profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load profile';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, viewingUserId]);

  // Initial load
  useEffect(() => {
      loadProfileData();
  }, [loadProfileData]);
  
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
  
  const handleEditProfile = () => {
    if (profileData) {
      setEditForm(profileData);
    }
  };

  if (loading) {
  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                  <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
          </div>
        </div>
              </div>
                        </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-red-500 mb-4">{error}</div>
            <Button onClick={loadProfileData}>Try Again</Button>
                </div>
                </div>
                    </div>
    );
  }

  if (!profileData) {
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
          {/* Cover Photo */}
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
            {profileData.coverPhoto && (
              <img
                src={profileData.coverPhoto}
              alt="Cover" 
              className="w-full h-full object-cover"
            />
            )}
            {isOwnProfile && (
              <button className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors">
                <Camera className="h-5 w-5" />
              </button>
            )}
        </div>
        
          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            <div className="flex items-end -mt-16 mb-4">
                <div className="relative">
                <img
                  src={profileData.avatar}
                  alt={profileData.name}
                  className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover"
                />
                {isOwnProfile && (
                  <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                    <Camera className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              <div className="ml-6 flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {profileData.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  {profileData.universityId}
                </p>
                {profileData.location && (
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <MapPin className="h-4 w-4 mr-1" />
                    {profileData.location}
                  </div>
                )}
                  </div>
                  
              {isOwnProfile && (
                <Button onClick={handleEditProfile} className="ml-4">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                      </Button>
                    )}
                </div>
                
            {profileData.bio && (
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {profileData.bio}
              </p>
            )}
            
            {/* Stats */}
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  {friendsList.length} friends
                </span>
                    </div>
              <div className="flex items-center">
                <BookOpen className="h-4 w-4 mr-1 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  {userPosts.length} posts
                </span>
                    </div>
                    </div>
                    </div>
        </div>
        
        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'posts', label: 'Posts', icon: BookOpen },
                { id: 'about', label: 'About', icon: UserIcon },
                { id: 'friends', label: 'Friends', icon: Users }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'posts' | 'about' | 'friends')}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
                    </div>
          
          {/* Tab Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'posts' && (
        <motion.div 
                  key="posts"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {isOwnProfile && (
                    <Button
                      onClick={() => setShowCreatePost(true)}
                      className="mb-6"
                    >
                      Create Post
                    </Button>
                  )}
                  
                  {userPosts.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        No posts yet
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        {isOwnProfile ? 'Create your first post to get started!' : 'This user hasn\'t posted anything yet.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                  {userPosts.map((post) => (
                        <PostCard key={post.id} post={post} />
                  ))}
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
                    {profileData.education && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                          <School className="h-5 w-5 mr-2" />
                          Education
                        </h3>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {profileData.education.degree}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">
                            {profileData.education.institution}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-500">
                            {profileData.education.years}
                          </p>
                </div>
              </div>
                    )}
                    
                    {/* Skills */}
                    {profileData.skills && profileData.skills.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                          Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {profileData.skills.map((skill, index: number) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                            >
                              {skill.name}
                            </span>
                          ))}
                      </div>
                    </div>
                    )}
                    
                    {/* Achievements */}
                    {profileData.achievements && profileData.achievements.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                          <Award className="h-5 w-5 mr-2" />
                          Achievements
                        </h3>
                        <div className="space-y-3">
                          {profileData.achievements.map((achievement: { title: string; description: string; year: string }, index: number) => (
                            <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                              <p className="font-medium text-gray-900 dark:text-gray-100">
                                {achievement.title}
                              </p>
                              <p className="text-gray-600 dark:text-gray-400">
                                {achievement.description}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-500">
                                {achievement.year}
                              </p>
                            </div>
                    ))}
                  </div>
                      </div>
                    )}
                  </div>
            </motion.div>
          )}

          {activeTab === 'friends' && (
            <motion.div 
                  key="friends"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Friends ({friendsList.length})
                </h3>
                  
                  {friendsList.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        No friends yet
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        {isOwnProfile ? 'Start connecting with other students and faculty!' : 'This user hasn\'t added any friends yet.'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {friendsList.map((friend) => (
                        <div
                        key={friend.id}
                          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center space-x-3"
                      >
                        <img 
                          src={friend.avatar}
                          alt={friend.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {friend.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {friend.universityId}
                            </p>
                        </div>
                        </div>
                      ))}
                </div>
              )}
            </motion.div>
          )}
            </AnimatePresence>
                  </div>
                </div>
                
      {/* Create Post Modal */}
      <CreatePostModal 
          isOpen={showCreatePost}
          onClose={() => setShowCreatePost(false)}
        />
      </div>
    </div>
  );
};

export default Profile;