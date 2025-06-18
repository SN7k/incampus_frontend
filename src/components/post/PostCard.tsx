import React, { useState, useRef, useEffect } from 'react';
import { Heart, Share2, MoreHorizontal, Check, Copy, Trash2 } from 'lucide-react';
import { Post } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { postsApi } from '../../services/postsApi';
import { getAvatarUrl } from '../../utils/avatarUtils';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { user: currentUser } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [shareIcon, setShareIcon] = useState<'share' | 'copy' | 'check'>('share');
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Load likes from localStorage on component mount
  useEffect(() => {
    if (currentUser) {
      // Check if current user has liked this post
      const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');
      const postLikes = JSON.parse(localStorage.getItem(`post_${post.id}_likes`) || '[]');
      
      // Set initial like state based on localStorage
      setIsLiked(likedPosts[post.id] === true);
      setLikesCount(postLikes.length);
    }
  }, [currentUser, post.id]);

  const toggleLike = async () => {
    if (!currentUser || loading) return; // Ensure user is logged in
    
    setLoading(true);
    try {
      // Update local state
      const newIsLiked = !isLiked;
      const newLikesCount = isLiked ? likesCount - 1 : likesCount + 1;
      
      setIsLiked(newIsLiked);
      setLikesCount(newLikesCount);
      
      // Call API to update like status
      if (newIsLiked) {
        await postsApi.likePost(post.id);
      } else {
        await postsApi.unlikePost(post.id);
      }
      
      // Update localStorage for user's liked posts
      const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');
      if (newIsLiked) {
        likedPosts[post.id] = true;
      } else {
        delete likedPosts[post.id];
      }
      localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
      
      // Update localStorage for post's likes
      let postLikes = JSON.parse(localStorage.getItem(`post_${post.id}_likes`) || '[]');
      if (newIsLiked) {
        // Add user to likes if not already present
        if (!postLikes.includes(currentUser.id)) {
          postLikes.push(currentUser.id);
        }
      } else {
        // Remove user from likes
        postLikes = postLikes.filter((id: string) => id !== currentUser.id);
      }
      localStorage.setItem(`post_${post.id}_likes`, JSON.stringify(postLikes));
      
      // Dispatch a custom event to notify other components about the like change
      window.dispatchEvent(new CustomEvent('postLikeChanged', { 
        detail: { 
          postId: post.id,
          likesCount: newLikesCount,
          isLiked: newIsLiked,
          userId: currentUser.id
        } 
      }));
      
      // Dispatch event for notifications if the user liked the post (not when unliking)
      if (newIsLiked) {
        window.dispatchEvent(new CustomEvent('postLike', { 
          detail: { 
            fromUser: currentUser.id,
            postId: post.id,
            postAuthorId: post.user.id
          } 
        }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert the UI state on error
      setIsLiked(!isLiked);
      setLikesCount(isLiked ? likesCount + 1 : likesCount - 1);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    // Create a shareable URL for the post
    const postUrl = `${window.location.origin}/post/${post.id}`;
    
    // Try to use the Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${post.user.name}`,
          text: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
          url: postUrl
        });
        return;
      } catch (error) {
        console.error('Error sharing:', error);
        // Fall back to clipboard if sharing fails
      }
    }
    
    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(postUrl);
      setShareIcon('check');
      setShowShareTooltip(true);
      
      // Reset the icon and hide tooltip after 2 seconds
      setTimeout(() => {
        setShareIcon('share');
        setShowShareTooltip(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Navigate to user profile
  const navigateToProfile = () => {
    const isCurrentUser = currentUser && post.user.id === currentUser.id;
    
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
  
  // Listen for like changes from other components
  useEffect(() => {
    const handleLikeChange = (event: CustomEvent) => {
      const { postId, likesCount: newLikesCount, userId } = event.detail;
      
      // Only update if this is the same post and not triggered by the current user
      if (postId === post.id && currentUser && userId !== currentUser.id) {
        setLikesCount(newLikesCount);
      }
    };
    
    window.addEventListener('postLikeChanged', handleLikeChange as EventListener);
    return () => {
      window.removeEventListener('postLikeChanged', handleLikeChange as EventListener);
    };
  }, [post.id, currentUser]);

  // Handle delete post
  const handleDeletePost = async () => {
    if (!currentUser || post.user?.id !== currentUser.id) return;
    
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postsApi.deletePost(post.id);
        
        // Remove any likes associated with this post
        localStorage.removeItem(`post_${post.id}_likes`);
        
        // Update user's liked posts to remove this post if it was liked
        const likedPostsStr = localStorage.getItem('likedPosts') || '{}';
        const likedPosts = JSON.parse(likedPostsStr);
        if (likedPosts[post.id]) {
          delete likedPosts[post.id];
          localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
        }
        
        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('postDeleted', { 
          detail: { postId: post.id } 
        }));
        
        // Close the menu first to avoid UI glitches
        setShowMenu(false);
        
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
    
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg mb-6 w-full max-w-2xl mx-auto">
      {/* Post header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img 
            src={getAvatarUrl(post.user?.avatar, post.user?.name || 'User')} 
            alt={post.user?.name || 'User'} 
            className="w-10 h-10 rounded-full object-cover flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={navigateToProfile}
          />
          <div className="overflow-hidden">
            <div 
              className="font-semibold text-gray-800 dark:text-gray-100 truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              onClick={navigateToProfile}
            >
              {post.user?.name || 'User'}
              {post.user?.role === 'faculty' && (
                <span className="ml-2 text-xs font-medium px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                  Faculty
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center truncate">
              {formatDate(post.createdAt)} · {post.user?.universityId || (post.user?.role === 'faculty' ? 'Faculty' : 'Student')}
            </div>
          </div>
        </div>
        {/* Show menu only for current user's posts */}
        {currentUser && post.user?.id === currentUser.id && (
          <div className="relative">
            <button 
              ref={buttonRef}
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex-shrink-0 ml-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <MoreHorizontal size={20} />
            </button>
            
            {showMenu && (
              <div 
                ref={menuRef}
                className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 py-1 ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                <button
                  onClick={handleDeletePost}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Post content (always render) */}
      <div className="px-4 py-2">
        <p className="text-gray-800 dark:text-gray-100 whitespace-pre-line break-words">{post.content}</p>
      </div>
      
      {/* Post media (optional) */}
      {post.images && post.images.length > 0 && (
        <div className="w-full">
          {post.images[0].type === 'image' && (
            <img 
              src={post.images[0].url} 
              alt="Post content" 
              className="w-full h-auto object-cover max-h-[500px]"
              loading="lazy"
            />
          )}
          {post.images[0].type === 'video' && (
            <video 
              src={post.images[0].url} 
              controls 
              className="w-full h-auto max-h-[500px]"
              preload="metadata"
            />
          )}
        </div>
      )}
      
      {/* Post stats */}
      <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div>
          {likesCount > 0 && (
            <span>{likesCount} like{likesCount !== 1 ? 's' : ''}</span>
          )}
        </div>
        <div></div>
      </div>
      
      {/* Post actions */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-2">
        <button 
          onClick={toggleLike}
          disabled={loading}
          className={`flex items-center justify-center space-x-2 py-1.5 rounded-md ${isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400'} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
        >
          <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
          <span className="sm:inline">Like</span>
        </button>
        <button 
          onClick={handleShare}
          className="relative flex items-center justify-center space-x-2 py-1.5 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {shareIcon === 'share' && <Share2 size={18} />}
          {shareIcon === 'copy' && <Copy size={18} />}
          {shareIcon === 'check' && <Check size={18} className="text-green-500" />}
          <span className="sm:inline">{shareIcon === 'check' ? 'Copied!' : 'Share'}</span>
          
          {showShareTooltip && (
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
              Link copied to clipboard!
            </div>
          )}
        </button>
      </div>

    </div>
  );
};

export default PostCard;