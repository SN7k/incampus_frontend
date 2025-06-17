import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { postsApi } from '../../services/postsApi';
import { X, Image, Smile, MapPin } from 'lucide-react';
import Button from '../ui/Button';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      
      if (!isValidType) {
        setError('Please select only image or video files');
        return false;
      }
      
      if (!isValidSize) {
        setError('File size must be less than 10MB');
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length + mediaFiles.length > 5) {
      setError('You can upload a maximum of 5 files');
      return;
    }
    
    setError('');
    setMediaFiles(prev => [...prev, ...validFiles]);
    
    // Create previews for new files
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
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
    
    try {
      // Create post with content and media
      const postData = {
        content: content.trim(),
        image: mediaFiles[0] || null, // For now, just use the first file
        visibility: 'public' as const
      };
      
      const newPost = await postsApi.createPost(postData);
      
      // Dispatch event to notify other components about the new post
      window.dispatchEvent(new CustomEvent('postCreated', { 
        detail: { post: newPost } 
      }));
      
      // Reset form and close modal
      setContent('');
      setMediaFiles([]);
      setMediaPreviews([]);
      onClose();
      
    } catch (error: any) {
      setError(error.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setContent('');
      setMediaFiles([]);
      setMediaPreviews([]);
      setError('');
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
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}
          
          {/* User info */}
          <div className="flex items-center space-x-3 mb-4">
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&size=40&background=random`}
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
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={mediaFiles.length >= 5}
                className="p-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Image className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Smile className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <MapPin className="h-5 w-5" />
              </button>
            </div>
            
            <Button
              onClick={handleSubmit}
              loading={loading}
              disabled={!content.trim() && mediaFiles.length === 0}
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
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default CreatePostModal;
