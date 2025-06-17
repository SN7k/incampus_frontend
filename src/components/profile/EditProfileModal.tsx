import React, { useState, useEffect } from 'react';
import { X, Camera, Save } from 'lucide-react';
import Button from '../ui/Button';
import { User } from '../../types';
import { profileApi } from '../../services/profileApi';
import { useAuth } from '../../contexts/AuthContext';
import { ProfileData } from '../../types/profile';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: ProfileData | User | null;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, profileData }) => {
  const { updateProfile: updateAuthProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    education: {
      degree: '',
      institution: '',
      years: ''
    },
    interests: [] as string[],
    newInterest: ''
  });
  
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Initialize form data when profileData changes
  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.name || '',
        bio: 'bio' in profileData ? (profileData.bio || '') : '',
        location: 'location' in profileData ? (profileData.location || '') : '',
        education: 'education' in profileData ? profileData.education : {
          degree: '',
          institution: '',
          years: ''
        },
        interests: 'interests' in profileData ? profileData.interests : [],
        newInterest: ''
      });
      
      setProfilePicturePreview(profileData.avatar?.url || null);
      setCoverPhotoPreview('coverPhoto' in profileData && profileData.coverPhoto?.url ? profileData.coverPhoto.url : null);
    }
  }, [profileData]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => {
        // Create a properly typed copy of the parent object
        const parentObj = prev[parent as keyof typeof prev];
        if (typeof parentObj === 'object' && parentObj !== null) {
          return {
            ...prev,
            [parent]: {
              ...parentObj,
              [child]: value
            }
          };
        }
        return prev;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      setProfilePicturePreview(URL.createObjectURL(file));
    }
  };
  
  const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverPhotoPreview(URL.createObjectURL(file));
    }
  };
  
  const handleAddInterest = () => {
    if (formData.newInterest.trim()) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, prev.newInterest.trim()],
        newInterest: ''
      }));
    }
  };
  
  const handleRemoveInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Prepare the data to update
      const updateData: Partial<ProfileData> = {
        name: formData.name,
        bio: formData.bio,
        location: formData.location,
        education: formData.education,
        interests: formData.interests
      };
      
      // Real API update
      // First update the profile data
      await profileApi.updateProfile(updateData);
      
      // Then upload profile picture if changed
      if (profilePicture) {
        const avatarResult = await profileApi.uploadProfilePicture(profilePicture);
        updateData.avatar = avatarResult.avatar;
        
        // Update the profile with the new avatar object
        await profileApi.updateProfile({ avatar: avatarResult.avatar });
      }
      
      // Update auth context with new profile data
      updateAuthProfile({
        name: formData.name,
        avatar: updateData.avatar
      });
      
      setSuccess('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Cover Photo */}
          <div className="mb-6 relative">
            <div 
              className="h-40 w-full bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden"
              style={{
                backgroundImage: coverPhotoPreview ? `url(${coverPhotoPreview})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <label className="absolute bottom-2 right-2 bg-white dark:bg-gray-800 p-2 rounded-full cursor-pointer">
                <Camera size={20} />
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleCoverPhotoChange}
                />
              </label>
            </div>
          </div>
          
          {/* Profile Picture */}
          <div className="mb-6 flex items-center">
            <div className="relative">
              <div 
                className="h-24 w-24 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                style={{
                  backgroundImage: profilePicturePreview ? `url(${profilePicturePreview})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <label className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 p-2 rounded-full cursor-pointer">
                  <Camera size={16} />
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                  />
                </label>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Profile Picture</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Click the camera icon to upload a new profile picture
              </p>
            </div>
          </div>
          
          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          
          {/* Bio */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          {/* Location */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          {/* Education */}
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Education</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Degree
                </label>
                <input
                  type="text"
                  name="education.degree"
                  value={formData.education.degree}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Institution
                </label>
                <input
                  type="text"
                  name="education.institution"
                  value={formData.education.institution}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Years
                </label>
                <input
                  type="text"
                  name="education.years"
                  value={formData.education.years}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., 2020-2024"
                />
              </div>
            </div>
          </div>
          
          {/* Interests */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Interests</h3>
            
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.interests.map((interest, index) => (
                <div 
                  key={index}
                  className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 px-3 py-1 rounded-full flex items-center"
                >
                  <span>{interest}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveInterest(interest)}
                    className="ml-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex">
              <input
                type="text"
                name="newInterest"
                value={formData.newInterest}
                onChange={handleInputChange}
                placeholder="Add a new interest"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddInterest}
                className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add
              </button>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (
                <>
                  <Save size={16} className="mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
