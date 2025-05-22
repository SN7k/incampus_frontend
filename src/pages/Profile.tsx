import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import PostCard from '../components/post/PostCard';
import { useAuth } from '../contexts/AuthContext';
import { School, MapPin, Edit, Link, Camera, BookOpen, Users, Award, Bookmark, Heart, X, Save, UserMinus } from 'lucide-react';
import Button from '../components/ui/Button';
import { Post, User } from '../types';
import CreatePostModal from '../components/post/CreatePostModal';
import axiosInstance from '../utils/axios';

// Define types for profile data
interface Skill {
  name: string;
  proficiency: number;
}

interface Achievement {
  title: string;
  description: string;
  year: string;
}

interface ProfileData extends User {
  education: {
    degree: string;
    institution: string;
    years: string;
  };
  location: string;
  skills: Skill[];
  achievements: Achievement[];
  interests: string[];
  posts?: Post[];
}

// Define API response types
interface ApiResponse<T> {
  data: T;
  message?: string;
  status: string;
}

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { userId } = useParams<{ userId: string }>();
  const [activeTab, setActiveTab] = useState<'memories' | 'collections' | 'friends' | 'about'>('memories');
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [editFormData, setEditFormData] = useState<ProfileData | null>(null);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoadingProfile(true);
      setError(null);
      
      try {
        const targetUserId = userId || user?.id;
        if (!targetUserId) return;

        const response = await axiosInstance.get<ApiResponse<ProfileData>>(`/api/user/${targetUserId}`);
        const profileData = response.data.data;
        
        setProfileData(profileData);
        setEditFormData(profileData);
        
        // Fetch user's posts
        const postsResponse = await axiosInstance.get<ApiResponse<{ posts: Post[] }>>(`/api/posts/user/${targetUserId}`);
        setUserPosts(postsResponse.data.data.posts);
        
      } catch (err) {
        setError('Failed to load profile data. Please try again.');
        console.error('Error fetching profile:', err);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [userId, user?.id]);

  // Handle opening the edit profile modal
  const handleOpenEditModal = () => {
    if (profileData) {
      setEditFormData(profileData);
      setIsEditProfileModalOpen(true);
    }
  };
  
  // Handle save changes
  const handleSaveChanges = async () => {
    if (!editFormData || !user?.id) return;
    
    try {
      const response = await axiosInstance.patch<ApiResponse<ProfileData>>(`/api/user/${user.id}`, editFormData);
      setProfileData(response.data.data);
      
      // Update the user context to reflect changes across the app
      updateProfile({
        name: editFormData.name,
        avatar: editFormData.avatar,
        bio: editFormData.bio
      });
      
      setIsEditProfileModalOpen(false);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error('Error updating profile:', err);
    }
  };

  // Handle input changes in edit form
  const handleInputChange = (field: keyof ProfileData, subfield: string, value: string) => {
    if (!editFormData) return;

    if (subfield) {
      setEditFormData(prev => {
        if (!prev) return prev;
        const fieldData = prev[field];
        if (typeof fieldData === 'object' && fieldData !== null) {
          return {
            ...prev,
            [field]: {
              ...fieldData,
              [subfield]: value
            }
          };
        }
        return prev;
      });
    } else {
      setEditFormData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          [field]: value
        };
      });
    }
  };

  // Add new achievement
  const addAchievement = () => {
    if (!editFormData) return;
    
    setEditFormData(prev => ({
      ...prev!,
      achievements: [{ title: '', description: '', year: '' }, ...prev!.achievements]
    }));
  };
  
  // Remove achievement
  const removeAchievement = (index: number) => {
    if (!editFormData) return;
    
    setEditFormData(prev => ({
      ...prev!,
      achievements: prev!.achievements.filter((_, i) => i !== index)
    }));
  };
  
  // Handle interests change
  const handleInterestsChange = (value: string) => {
    if (!editFormData) return;
    
    const interestsArray = value.split(',').map(item => item.trim()).filter(item => item !== '');
    setEditFormData(prev => ({
      ...prev!,
      interests: interestsArray
    }));
  };

  if (!user) return null;
  if (!profileData) return null;

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
        </div>
      )}

      {/* Profile Header */}
      <div className="relative">
        {/* Cover Photo */}
        <div className="h-48 md:h-64 bg-gray-200 dark:bg-gray-700 relative">
          {profileData.coverPhoto && (
            <img
              src={profileData.coverPhoto}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
          {user.id === profileData.id && (
            <button
              onClick={() => {/* Handle cover photo upload */}}
              className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Camera className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          )}
        </div>

        {/* Profile Info */}
        <div className="container mx-auto px-4 -mt-16 relative">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={profileData.avatar}
                  alt={profileData.name}
                  className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800"
                />
                {user.id === profileData.id && (
                  <button
                    onClick={() => {/* Handle avatar upload */}}
                    className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Camera className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </button>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profileData.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  {profileData.bio}
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                  {profileData.location && (
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <MapPin className="w-4 h-4 mr-1" />
                      {profileData.location}
                    </div>
                  )}
                  {profileData.education?.institution && (
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <School className="w-4 h-4 mr-1" />
                      {profileData.education.institution}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {user.id === profileData.id ? (
                <Button
                  onClick={handleOpenEditModal}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Profile</span>
                </Button>
              ) : (
                <Button
                  onClick={() => {/* Handle friend request */}}
                  variant="primary"
                  className="flex items-center space-x-2"
                >
                  <UserMinus className="w-4 h-4" />
                  <span>Add Friend</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 mt-6">
        <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
          {['memories', 'collections', 'friends', 'about'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === tab
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-4 mt-6">
        <AnimatePresence mode="wait">
          {activeTab === 'memories' && (
            <motion.div
              key="memories"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {user.id === profileData.id && (
                <Button
                  onClick={() => setIsCreatePostModalOpen(true)}
                  variant="primary"
                  className="w-full md:w-auto"
                >
                  Create Post
                </Button>
              )}
              {userPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </motion.div>
          )}

          {activeTab === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Skills */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Skills</h3>
                <div className="space-y-4">
                  {profileData.skills.map((skill, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600 dark:text-gray-300">{skill.name}</span>
                        <span className="text-gray-600 dark:text-gray-300">{skill.proficiency}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full"
                          style={{ width: `${skill.proficiency}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Achievements</h3>
                <div className="space-y-4">
                  {profileData.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <Award className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{achievement.title}</h4>
                        <p className="text-gray-600 dark:text-gray-300">{achievement.description}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{achievement.year}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profileData.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Edit Profile Modal */}
      {isEditProfileModalOpen && editFormData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Profile</h2>
              <button
                onClick={() => setIsEditProfileModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Basic Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => handleInputChange('name', '', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bio
                </label>
                <textarea
                  value={editFormData.bio}
                  onChange={(e) => handleInputChange('bio', '', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                />
              </div>

              {/* Education */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Institution
                </label>
                <input
                  type="text"
                  value={editFormData.education.institution}
                  onChange={(e) => handleInputChange('education', 'institution', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={editFormData.skills.map(s => s.name).join(', ')}
                  onChange={(e) => {
                    const skills = e.target.value.split(',').map(s => ({
                      name: s.trim(),
                      proficiency: 50
                    }));
                    setEditFormData(prev => prev ? { ...prev, skills } : null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Interests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Interests (comma-separated)
                </label>
                <input
                  type="text"
                  value={editFormData.interests.join(', ')}
                  onChange={(e) => handleInterestsChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Achievements */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Achievements
                  </label>
                  <button
                    onClick={addAchievement}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    Add Achievement
                  </button>
                </div>
                <div className="space-y-4">
                  {editFormData.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={achievement.title}
                          onChange={(e) => {
                            const newAchievements = [...editFormData.achievements];
                            newAchievements[index] = {
                              ...newAchievements[index],
                              title: e.target.value
                            };
                            setEditFormData(prev => prev ? { ...prev, achievements: newAchievements } : null);
                          }}
                          placeholder="Title"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                        <input
                          type="text"
                          value={achievement.description}
                          onChange={(e) => {
                            const newAchievements = [...editFormData.achievements];
                            newAchievements[index] = {
                              ...newAchievements[index],
                              description: e.target.value
                            };
                            setEditFormData(prev => prev ? { ...prev, achievements: newAchievements } : null);
                          }}
                          placeholder="Description"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                        <input
                          type="text"
                          value={achievement.year}
                          onChange={(e) => {
                            const newAchievements = [...editFormData.achievements];
                            newAchievements[index] = {
                              ...newAchievements[index],
                              year: e.target.value
                            };
                            setEditFormData(prev => prev ? { ...prev, achievements: newAchievements } : null);
                          }}
                          placeholder="Year"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <button
                        onClick={() => removeAchievement(index)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <Button
                onClick={() => setIsEditProfileModalOpen(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveChanges}
                variant="primary"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {isCreatePostModalOpen && (
        <CreatePostModal
          onClose={() => setIsCreatePostModalOpen(false)}
          onPostCreated={(newPost) => {
            setUserPosts(prev => [newPost, ...prev]);
            setIsCreatePostModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default Profile;