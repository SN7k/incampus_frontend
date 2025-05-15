import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';

interface ProfileSetupProps {
  onComplete: () => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete }) => {
  const { user, updateUserProfile } = useAuth();
  
  // Profile setup state
  const [avatar, setAvatar] = useState<string | null>(null);
  const [bio, setBio] = useState(user?.bio || '');
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Interest options
  const interestOptions = [
    'Technology', 'Science', 'Arts', 'Literature', 'Sports',
    'Music', 'Movies', 'Travel', 'Food', 'Fashion',
    'Photography', 'Gaming', 'Coding', 'Design', 'Business'
  ];
  
  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatar(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  // Handle cover photo file selection
  const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCoverPhoto(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  // Toggle interest selection
  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };
  
  // Handle next step
  const handleNextStep = () => {
    setCurrentStep(currentStep + 1);
  };
  
  // Handle previous step
  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };
  
  // Complete profile setup
  const handleCompleteSetup = async () => {
    setLoading(true);
    console.log('Starting profile setup completion');
    console.log('Current user state:', user);
    console.log('Token in localStorage:', localStorage.getItem('token'));
    
    try {
      // Update user profile with new information
      const profileData = {
        avatar: avatar || user?.avatar,
        bio,
        coverPhoto: coverPhoto || '',
        interests
      };
      
      console.log('Updating profile with data:', profileData);
      await updateUserProfile(profileData);
      
      // Force update the profileSetupComplete flag in localStorage
      const authState = localStorage.getItem('authState');
      if (authState) {
        const parsedState = JSON.parse(authState);
        parsedState.profileSetupComplete = true;
        localStorage.setItem('authState', JSON.stringify(parsedState));
        console.log('Updated profileSetupComplete in localStorage');
      }
      
      // Ensure setup is marked as complete for future loads
      localStorage.setItem('setupComplete', 'true');
      
      // Notify parent component that setup is complete
      console.log('Profile setup completed successfully');
      onComplete();
    } catch (error) {
      console.error('Profile setup error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Skip profile setup
  const handleSkip = () => {
    onComplete();
  };
  
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-blue-900 mb-2">Complete Your Profile</h2>
        <p className="text-gray-600">Let's personalize your InCampus experience</p>
      </div>
      
      {/* Step indicators */}
      <div className="flex justify-center mb-6">
        {[1, 2, 3].map(step => (
          <div 
            key={step}
            className={`w-3 h-3 rounded-full mx-1 ${currentStep === step ? 'bg-blue-600' : 'bg-gray-300'}`}
          />
        ))}
      </div>
      
      {/* Step 1: Profile Picture */}
      {currentStep === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Add a Profile Picture</h3>
            <p className="text-gray-600 text-sm">Help others recognize you</p>
          </div>
          
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-32 h-32 mb-4">
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                {avatar ? (
                  <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
            <p className="text-sm text-gray-500">Click the camera icon to upload</p>
            
            {/* Cover Photo Upload */}
            <div className="w-full mt-6">
              <h4 className="text-md font-medium text-gray-700 mb-2">Cover Photo</h4>
              <div className="relative w-full h-24 rounded-lg bg-gray-200 overflow-hidden mb-2">
                {coverPhoto ? (
                  <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Add a cover photo</span>
                  </div>
                )}
                <label htmlFor="cover-upload" className="absolute bottom-2 right-2 bg-blue-600 text-white p-1.5 rounded-md cursor-pointer shadow-lg text-xs flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                  Upload
                  <input 
                    id="cover-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleCoverPhotoChange}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">Recommended size: 820 x 312 pixels</p>
            </div>
          </div>
          
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={handleSkip}
              className="text-gray-600 hover:text-gray-800"
            >
              Skip for now
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-6 py-2"
            >
              Next
            </button>
          </div>
        </motion.div>
      )}
      
      {/* Step 2: Bio */}
      {currentStep === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Tell Us About Yourself</h3>
            <p className="text-gray-600 text-sm">Share a brief bio with your network</p>
          </div>
          
          <div className="mb-6">
            <textarea
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 h-32"
              placeholder="Write a short bio..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-2">
              {bio.length}/200 characters
            </p>
          </div>
          
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={handlePreviousStep}
              className="text-gray-600 hover:text-gray-800"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-6 py-2"
            >
              Next
            </button>
          </div>
        </motion.div>
      )}
      
      {/* Step 3: Interests */}
      {currentStep === 3 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Select Your Interests</h3>
            <p className="text-gray-600 text-sm">We'll use this to personalize your feed</p>
          </div>
          
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {interestOptions.map(interest => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    interests.includes(interest)
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={handlePreviousStep}
              className="text-gray-600 hover:text-gray-800"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleCompleteSetup}
              className={`bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-6 py-2 flex items-center ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg 
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    ></circle>
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : 'Complete Setup'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProfileSetup;
