import React, { useState, useRef, useEffect } from 'react';
import { Heart, Share2, Trash2, MoreVertical } from 'lucide-react';
import { Post } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { postsApi } from '../../services/postsApi';
import { getAvatarUrl } from '../../utils/avatarUtils';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { user: currentUser } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const handleLike = async () => {
    if (!currentUser || loading) return;
    
    setLoading(true);
    try {
      if (isLiked) {
        // Unlike
        await postsApi.unlikePost(post.id);
        setLikeCount(prev => prev - 1);
        setIsLiked(false);
      } else {
        // Like
        await postsApi.likePost(post.id);
        setLikeCount(prev => prev + 1);
        setIsLiked(true);
      }
    } catch (error: unknown) {
      console.error('Error toggling like:', error);
      // Revert the UI state on error
    } finally {
      setLoading(false);
    }
  };

  // Navigate to user profile
  const navigateToProfile = () => {
    const isCurrentUser = currentUser && post.user?.id === currentUser.id;
    
    // First, clear any existing localStorage data to prevent conflicts
    localStorage.removeItem('activeProfileTab'); // Clear any active tab selection
    
    // Save the current page and target user ID to localStorage
    localStorage.setItem('currentPage', 'profile');
    
    if (!isCurrentUser) {
      // Store the target user ID if it's not the current user
      if (post.user?.id) {
        localStorage.setItem('viewProfileUserId', post.user.id);
        
        // If this is a faculty profile, store a special ID
        if (post.user?.role === 'faculty') {
          localStorage.setItem('viewProfileUserId', 'faculty-1');
        }
      }
    } else {
      // Clear any stored user ID if viewing own profile
      localStorage.removeItem('viewProfileUserId');
    }
    
    // Add timestamp to make the event unique
    const timestamp = new Date().getTime();
    
    // Trigger a navigation event with scroll instructions
    window.dispatchEvent(new CustomEvent('navigate', { 
      detail: { 
        page: 'profile',
        scrollToTop: true,
        timestamp: timestamp
      } 
    }));
    
    // Ensure the page scrolls to the top
    window.scrollTo(0, 0);
  };

  // Handle click outside to close the menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current && 
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle delete post
  const handleDeletePost = async () => {
    if (!currentUser || post.user?.id !== currentUser.id) return;
    
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postsApi.deletePost(post.id);
        
        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('postDeleted', { 
          detail: { postId: post.id } 
        }));
      } catch (error: unknown) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post. Please try again.');
      }
    }
  };

  const formatDate = (date: Date | string) => {
    // Ensure we have a Date object
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Unknown time';
    }
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    } else {
      return dateObj.toLocaleDateString();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Post Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={getAvatarUrl(post.user?.avatar, post.user?.name || 'User')}
              alt={post.user?.name || 'User'}
              className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
              onClick={navigateToProfile}
            />
            <div>
              <h3 
                className="font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                onClick={navigateToProfile}
              >
                {post.user?.name || 'User'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(post.createdAt)}
              </p>
            </div>
          </div>
          
          {/* Post Menu */}
          {currentUser && post.user?.id === currentUser.id && (
            <div className="relative">
              <button
                ref={buttonRef}
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <MoreVertical className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
              
              {showMenu && (
                <div
                  ref={menuRef}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10"
                >
                  <button
                    onClick={handleDeletePost}
                    className="w-full px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Post
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Post Content */}
      <div className="p-4">
        <p className="text-gray-900 dark:text-gray-100 mb-4 whitespace-pre-wrap">
          {post.content}
        </p>
        
        {/* Post Media */}
        {post.images && post.images.length > 0 && (
          <div className="mb-4">
            {post.images.map((image, index) => (
              <div key={index} className="mb-2">
                {image.type === 'image' ? (
                  <img
                    src={image.url}
                    alt={`Post image ${index + 1}`}
                    className="w-full rounded-lg object-cover max-h-96"
                  />
                ) : (
                  <video
                    src={image.url}
                    controls
                    className="w-full rounded-lg max-h-96"
                  />
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Post Actions */}
        <div className="flex items-center justify-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-8">
            <button
              onClick={handleLike}
              disabled={loading}
              className={`flex items-center space-x-2 transition-colors ${
                isLiked 
                  ? 'text-red-500 dark:text-red-400' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400'
              }`}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{likeCount}</span>
            </button>
            
            <button className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
              <Share2 className="h-5 w-5" />
              <span className="text-sm font-medium">Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;