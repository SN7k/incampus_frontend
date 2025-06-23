import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import { User } from '../../types';
import { profileApi } from '../../services/profileApi';

interface ProfileSetupProps {
  userInfo: {
    fullName: string;
    email: string;
    role: 'student' | 'faculty';
  };
  onProfileComplete: (userData: Partial<User>) => void;
  onSkip: () => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ userInfo, onProfileComplete, onSkip }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { updateProfile } = useAuth();
  
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
      setCoverPhoto(file);
      setCoverPhotoPreview(URL.createObjectURL(file));
    }
  };
  
  const handleNextStep = () => {
    if (!profilePicture) {
      setError('Please upload a profile picture');
      return;
    }
    setError('');
    setStep(2);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // First, upload the images to get the URLs
      let avatarUrl = '';
      if (profilePicture) {
        const result = await profileApi.uploadProfilePicture(profilePicture);
        avatarUrl = result.avatar.url;
      }

      let coverPhotoUrl = '';
      if (coverPhoto) {
        const result = await profileApi.uploadCoverPhoto(coverPhoto);
        coverPhotoUrl = result.coverPhotoUrl;
      }

      // Now, create the complete profile data object
      const profileData = {
        name: userInfo.fullName,
        role: userInfo.role,
        bio: bio || undefined,
        avatar: avatarUrl ? { url: avatarUrl } : undefined,
        coverPhoto: coverPhotoUrl ? { url: coverPhotoUrl } : undefined,
      };
      
      // Call the dedicated setup API endpoint
      const updatedUser = await profileApi.setupProfile(profileData);
      
      // Update the auth context and signal completion
      onProfileComplete(updatedUser);

    } catch (error) {
      console.error('Profile setup error:', error);
      setError('Failed to complete profile setup. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-blue-900 dark:text-blue-400 mb-2">
          {step === 1 ? 'Set Up Your Profile' : 'Almost Done!'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {step === 1 
            ? 'Let\'s add a profile picture to get started' 
            : 'Add a few more details to complete your profile'}
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      {step === 1 ? (
        <div className="flex flex-col items-center">
          <div className="mb-6 relative">
            <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg">
              {profilePicturePreview ? (
                <img 
                  src={profilePicturePreview} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                </svg>
              )}
            </div>
            <label 
              htmlFor="profile-upload" 
              className="absolute bottom-0 right-0 bg-blue-800 text-white p-2 rounded-full cursor-pointer shadow-md hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </label>
            <input 
              id="profile-upload" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleProfilePictureChange} 
            />
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
            Upload a profile picture that shows your face clearly.
          </p>
          
          <div className="flex flex-col space-y-3">
            <Button
              onClick={handleNextStep}
              className="w-full"
              size="lg"
            >
              Continue
            </Button>
            
            <button
              type="button"
              onClick={onSkip}
              className="text-gray-600 dark:text-gray-400 hover:text-blue-800 dark:hover:text-blue-400 text-sm font-medium"
            >
              Skip profile setup
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cover Photo
            </label>
            <div className="relative h-32 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden mb-2">
              {coverPhotoPreview ? (
                <img 
                  src={coverPhotoPreview} 
                  alt="Cover" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path>
                  </svg>
                </div>
              )}
              <label 
                htmlFor="cover-upload" 
                className="absolute bottom-2 right-2 bg-blue-800 text-white p-2 rounded-md cursor-pointer shadow-md hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </label>
              <input 
                id="cover-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleCoverPhotoChange} 
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Optional: Add a cover photo to personalize your profile
            </p>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bio
            </label>
            <textarea
              placeholder="Tell us a bit about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 min-h-[100px]"
              rows={4}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Optional: Share your interests, department, or anything you'd like others to know
            </p>
          </div>
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={onSkip}
              disabled={loading}
              size="lg"
            >
              Skip for Now
            </Button>
            
            <Button
              type="submit"
              loading={loading}
              size="lg"
            >
              Complete Profile
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfileSetup;
