import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image } from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string, media: File[]) => void;
  loading?: boolean;
}

const PostModal: React.FC<PostModalProps> = ({ isOpen, onClose, onSubmit, loading = false }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
      
      // Create previews
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Remove a file from selection
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Handle post submission
  const handleSubmit = () => {
    if (content.trim() || selectedFiles.length > 0) {
      onSubmit(content, selectedFiles);
      setContent('');
      setSelectedFiles([]);
      setPreviews([]);
      onClose();
    }
  };

  // Check if post button should be disabled
  const isDisabled = content.trim() === '' && selectedFiles.length === 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-lg overflow-hidden"
          >
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Create post</h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* User info */}
            <div className="px-4 pt-4 pb-2">
              <div className="flex items-center">
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-10 h-10 rounded-full object-cover mr-3"
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
                  <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mt-1">
                    <button className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-md px-2 py-1">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span>Public</span>
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Content input */}
            <div className="px-4 py-2">
              <textarea
                ref={textareaRef}
                placeholder="What's on your mind, Shombhu?"
                className="w-full border-0 focus:ring-0 text-lg resize-none outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              
              {/* Media previews */}
              {previews.length > 0 && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <img src={preview} alt={`Preview ${index}`} className="w-full h-48 object-cover" />
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white rounded-full p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Add to your post */}
              <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Add to your post</span>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="text-green-500 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full"
                    >
                      <Image size={20} />
                    </button>
                  </div>
                </div>
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,video/*"
                multiple
                className="hidden"
              />
            </div>
            
            {/* Footer */}
            <div className="px-4 py-3">
              <Button
                variant="primary"
                className="w-full py-2"
                disabled={isDisabled || loading}
                onClick={handleSubmit}
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
                    Posting...
                  </>
                ) : 'Post'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PostModal;
