import React, { useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import CreatePostModal from './CreatePostModal';

const PostForm: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Open modal when photo/video button is clicked
  const handlePhotoVideo = () => {
    setIsModalOpen(true);
  };
  
  // Open modal when clicking anywhere in the form
  const handleFormClick = () => {
    setIsModalOpen(true);
  };
  
  // Navigate to user profile
  const navigateToProfile = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the post modal
    
    // Save the current page to localStorage
    localStorage.setItem('currentPage', 'profile');
    
    // Trigger a navigation event
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'profile' } }));
  };

  return (
    <>
      <div 
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl ${isDarkMode ? 'shadow-md shadow-gray-900' : 'shadow-sm'} p-3 mb-6 transition-colors duration-200 cursor-pointer hover:shadow-lg`}
        onClick={handleFormClick}
      >
        <div className="flex items-center space-x-3">
          <img 
            src={user?.avatar || "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150"} 
            alt={user?.name || "Your avatar"} 
            className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onClick={navigateToProfile}
          />
          <div className={`flex-1 flex items-center justify-between ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full px-4 py-2.5 transition-colors duration-200`}>
            <div
              className={`flex-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-200`}
            >
              Capture your moment
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePhotoVideo();
              }}
              className={`flex items-center justify-center ml-2 ${isDarkMode ? 'text-green-400 hover:text-green-300' : 'text-green-500 hover:text-green-600'} transition-colors`}
            >
              <ImagePlus size={20} />
            </button>
          </div>
        </div>
      </div>
      
      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        userAvatar={user?.avatar || "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150"}
        userName={user?.name || "User"}
      />
    </>
  );
};

export default PostForm;