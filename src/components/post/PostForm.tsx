import React, { useState, useEffect } from 'react';
import { Image } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePosts } from '../../contexts/PostContext';
import PostModal from './PostModal';
import { useMediaQuery } from './useMediaQuery';



const PostForm: React.FC = () => {
  const { user } = useAuth();
  const { createPost, loading } = usePosts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // Update window width on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Open modal when clicking on the form
  const handleFormClick = () => {
    setIsModalOpen(true);
  };



  // Handle post submission from modal
  const handleModalSubmit = async (postContent: string, files: File[]) => {
    try {
      // Convert files to data URLs for preview
      const mediaItems = await Promise.all(
        files.map(async (file) => {
          return new Promise<{ type: 'image' | 'video', url: string }>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const dataUrl = e.target?.result as string;
              resolve({
                type: file.type.startsWith('image/') ? 'image' : 'video',
                url: dataUrl
              });
            };
            reader.readAsDataURL(file);
          });
        })
      );
      
      // Create the post with content and media
      await createPost(postContent, mediaItems);
      
      // Close modal
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  // Consistent theme for all screen sizes with dark mode support
  // Note: We're keeping the light theme styling as per user preference, but adding dark mode variants
  const bgColor = 'bg-white dark:bg-gray-800';
  const inputBgColor = 'bg-gray-100 dark:bg-gray-700';
  const inputHoverColor = 'hover:bg-gray-200 dark:hover:bg-gray-600';
  const textColor = 'text-gray-500 dark:text-gray-400';
  const buttonTextColor = 'text-gray-600 dark:text-gray-300';
  const containerClasses = `${bgColor} rounded-xl shadow-md p-3 md:p-4 mb-3 md:mb-4`;
  
  // Responsive button text
  const showButtonText = windowWidth > 480;
  
  return (
    <div className={containerClasses}>
      <div className="flex items-center space-x-3">
        <img 
          src={user?.avatar || "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150"} 
          alt="Your avatar" 
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1 flex">
          <div 
            className={`flex-1 ${inputBgColor} ${inputHoverColor} ${textColor} rounded-l-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base cursor-pointer transition-colors`}
            onClick={handleFormClick}
          >
            Capture your moment ✨
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className={`flex items-center justify-center space-x-1 ${buttonTextColor} ${inputBgColor} ${inputHoverColor} py-2 md:py-2.5 px-3 md:px-4 rounded-r-full transition-colors`}
          >
            <Image size={isMobile ? 20 : 20} className="text-green-500" />
            {showButtonText && <span className="text-sm md:text-base">Photo/video</span>}
          </button>
        </div>
      </div>

      {/* Modal for creating post */}
      <PostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleModalSubmit}
        loading={loading}
      />
    </div>
  );
};

export default PostForm;