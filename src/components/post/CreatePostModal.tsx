import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { postsApi } from '../../services/postsApi';
import { X, Image, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import { getAvatarUrl } from '../../utils/avatarUtils';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxRetries = 3;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Reset error
    setError('');
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      // Only allow images, not videos
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      
      if (!isValidType) {
        setError('Please select only image files. Videos are not supported.');
        return false;
      }
      
      if (!isValidSize) {
        setError('File size must be less than 5MB');
        return false;
      }
      
      return true;
    });
    
    // Check if adding these files would exceed the 3-image limit
    if (validFiles.length + mediaFiles.length > 3) {
      setError('You can upload a maximum of 3 images');
      return;
    }
    
    if (validFiles.length === 0 && files.length > 0) {
      // Don't update state if no valid files were selected
      return;
    }
    
    setMediaFiles(prev => [...prev, ...validFiles]);
    
    // Create previews for new files
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
    
    // Clear the file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && mediaFiles.length === 0) {
      setError('Please add some content or media to your post');
      return;
    }
    
    setLoading(true);
    setError('');
    setUploadProgress(0);
    
    try {
      // Create post with content and media
      const postData = {
        content: content.trim(),
        images: mediaFiles.length > 0 ? mediaFiles : null, // Send all selected files
        visibility: 'public' as const
      };
      
      const newPost = await postsApi.createPost(postData, (progress) => {
        setUploadProgress(progress);
      });
      
      // Normalize for frontend: ensure 'user' field exists
      if ((newPost as any)?.author && !(newPost as any)?.user) {
        (newPost as any).user = (newPost as any).author;
      }
      
      // Dispatch event to notify other components about the new post
      window.dispatchEvent(new CustomEvent('postCreated', { 
        detail: { post: newPost } 
      }));
      
      // Reset form and close modal
      setContent('');
      setMediaFiles([]);
      setMediaPreviews([]);
      setUploadProgress(0);
      setRetryCount(0);
      onClose();
      
    } catch (error: any) {
      console.error('Post creation error:', error);
      
      // Handle network errors
      if (!navigator.onLine) {
        setError('You are offline. Please check your internet connection and try again.');
      } else if (error.message === 'Network Error' || error.message.includes('timeout')) {
        // Network error but browser thinks we're online - could be server issue
        if (retryCount < maxRetries) {
          setError(`Upload failed. Retrying... (${retryCount + 1}/${maxRetries})`);
          setRetryCount(prev => prev + 1);
          setTimeout(() => {
            handleSubmit();
          }, 2000); // Wait 2 seconds before retrying
          return;
        } else {
          setError('Failed to upload post after multiple attempts. Please try again later.');
        }
      } else {
        // Other errors
        setError(error.message || 'Failed to create post. Please try again.');
      }
    } finally {
      if (retryCount >= maxRetries) {
        setLoading(false);
      }
    }
  };

  const handleClose = () => {
    if (!loading) {
      setContent('');
      setMediaFiles([]);
      setMediaPreviews([]);
      setError('');
      setUploadProgress(0);
      setRetryCount(0);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Create Post
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          
          {/* User info */}
          <div className="flex items-center space-x-3 mb-4">
            <img
              src={getAvatarUrl(user?.avatar, user?.name || 'User')}
              alt={user?.name || 'User'}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {user?.name || 'User'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.universityId || 'Student'}
              </p>
            </div>
          </div>
          
          {/* Post content */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            rows={4}
            maxLength={2000}
            disabled={loading}
          />
          
          {/* Character count */}
          <div className="text-right text-sm text-gray-500 dark:text-gray-400 mt-1">
            {content.length}/2000
          </div>
          
          {/* Media previews */}
          {mediaPreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {mediaPreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeMedia(index)}
                    disabled={loading}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Upload progress */}
          {loading && uploadProgress > 0 && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                Uploading: {uploadProgress}%
              </p>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={mediaFiles.length >= 3 || loading}
                className={`p-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${(mediaFiles.length >= 3 || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={mediaFiles.length >= 3 ? "Maximum 3 images allowed" : "Add images"}
              >
                <Image className="h-5 w-5" />
              </button>
              {mediaFiles.length > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {mediaFiles.length}/3 images
                </span>
              )}
            </div>
            
            <Button
              onClick={handleSubmit}
              loading={loading}
              disabled={(!content.trim() && mediaFiles.length === 0) || loading}
              className="px-6"
            >
              Post
            </Button>
          </div>
        </div>
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default CreatePostModal;
