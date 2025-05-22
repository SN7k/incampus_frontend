import React, { useState, useRef } from 'react';
import { X, ImagePlus } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import axios from 'axios';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAvatar: string;
  userName: string;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ 
  isOpen, 
  onClose, 
  userAvatar,
  userName 
}) => {
  const { isDarkMode } = useTheme();
  const [content, setContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  if (!isOpen) return null;
  
  const handlePhotoUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Convert FileList to array and filter by image type
    const newFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    // Create object URLs for previews
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    
    setMediaPreviews(prev => [...prev, ...newPreviews]);
    setMediaFiles(prev => [...prev, ...newFiles]);
    
    // Reset the file input
    if (e.target) e.target.value = '';
  };
  
  const removeMedia = (index: number) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(mediaPreviews[index]);
    
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async () => {
    if (!content.trim() && mediaFiles.length === 0) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('text', content);
      
      if (mediaFiles.length > 0) {
        formData.append('media', mediaFiles[0]); // Currently supporting single media upload
      }
      
      const response = await axios.post('/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Dispatch an event to notify other components about the new post
      window.dispatchEvent(new CustomEvent('postCreated', { 
        detail: { post: (response.data as { data: { post: any } }).data.post } 
      }));
      
      // Reset the form and close modal
      setContent('');
      setMediaPreviews([]);
      setMediaFiles([]);
      onClose();
      
    } catch (err) {
      const error = err as Error & { response?: { data?: { message: string } } };
      setError(error.response?.data?.message || 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Prevent clicks inside the modal from closing it
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg w-full max-w-lg transition-colors duration-200`}
        onClick={handleModalClick}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Create post
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={24} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
          </button>
        </div>
        
        {/* User info */}
        <div className="p-4 flex items-center space-x-2">
          <img 
            src={userAvatar} 
            alt={userName} 
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{userName}</div>
          </div>
        </div>
        
        {/* Post content */}
        <div className="px-4 pb-2">
          <textarea
            placeholder={`What's on your mind, ${userName.split(' ')[0]}?`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={`w-full p-2 min-h-[120px] resize-none border-none ${isDarkMode ? 'bg-gray-800 text-white placeholder-gray-400' : 'bg-white text-gray-800 placeholder-gray-500'} focus:outline-none text-lg`}
            disabled={isSubmitting}
          />
          
          {/* Error message */}
          {error && (
            <div className="mt-2 text-red-500 text-sm">
              {error}
            </div>
          )}
          
          {/* Media previews */}
          {mediaPreviews.length > 0 && (
            <div className={`mt-2 rounded-lg overflow-hidden border ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
              {isUploading && (
                <div className={`p-3 ${isDarkMode ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50 text-blue-600'} text-sm`}>
                  Uploading media...
                </div>
              )}
              
              <div className={`relative ${mediaPreviews.length > 1 ? 'grid grid-cols-2 gap-1 p-1' : ''}`}>
                {mediaPreviews.map((preview, index) => (
                  <div key={index} className="relative rounded-lg overflow-hidden">
                    <img 
                      src={preview} 
                      alt={`Upload preview ${index + 1}`} 
                      className="w-full h-auto max-h-80 object-cover"
                    />
                    <button 
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white p-1 rounded-full hover:bg-opacity-100 transition-all"
                      disabled={isSubmitting}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Add to your post */}
          <div className={`mt-4 p-3 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
            <div className="text-sm font-medium">Add to your post</div>
            <div>
              <button 
                onClick={handlePhotoUpload}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-green-500"
                disabled={isSubmitting}
              >
                <ImagePlus size={20} />
              </button>
            </div>
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
            multiple
            disabled={isSubmitting}
          />
        </div>
        
        {/* Post button */}
        <div className="p-4">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || (!content.trim() && mediaPreviews.length === 0)}
            className={`w-full py-2 rounded-lg font-medium ${
              isSubmitting || (!content.trim() && mediaPreviews.length === 0)
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            } transition-colors`}
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
