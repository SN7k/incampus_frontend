import React, { useState, useRef, useEffect } from 'react';
import { Heart, Share2, MoreHorizontal, Check, Copy, Trash2 } from 'lucide-react';
import { Post } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { getAvatarUrl } from '../../utils/avatarUtils';
import { postsApi } from '../../services/postsApi';
import ImageGallery from './ImageGallery';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { user: currentUser } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes.length);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [shareIcon, setShareIcon] = useState<'share' | 'copy' | 'check'>('share');
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Load likes on component mount
  useEffect(() => {
    if (currentUser) {
      // Check if current user has liked this post by comparing IDs
      const userLiked = Array.isArray(post.likes) && post.likes.some(
        like => like.id === currentUser.id || 
               (typeof like === 'string' && like === currentUser.id)
      );
      
      console.log(`PostCard: Post ${post.id} - User liked: ${userLiked}, Likes count: ${post.likes.length}`);
      setIsLiked(userLiked);
      setLikesCount(post.likes.length);
    }
  }, [currentUser, post.id, post.likes]);

  const toggleLike = async () => {
    if (!currentUser) return; // Ensure user is logged in
    
    try {
      // Update local state optimistically
      const newIsLiked = !isLiked;
      const newLikesCount = isLiked ? likesCount - 1 : likesCount + 1;
      
      setIsLiked(newIsLiked);
      setLikesCount(newLikesCount);
      
      // Call API to toggle like
      const response = await postsApi.toggleLike(post.id);
      
      // Update state with actual response from server
      setIsLiked(response.isLiked);
      setLikesCount(response.likesCount);
      
      // Dispatch a custom event to notify other components about the like change
      window.dispatchEvent(new CustomEvent('postLikeChanged', { 
        detail: { 
          postId: post.id,
          likesCount: response.likesCount,
          isLiked: response.isLiked,
          userId: currentUser.id
        } 
      }));
      
      // Dispatch event for notifications if the user liked the post (not when unliking)
      if (response.isLiked) {
        window.dispatchEvent(new CustomEvent('postLike', { 
          detail: { 
            fromUser: currentUser.id,
            postId: post.id,
            postAuthorId: post.user.id
          } 
        }));
      }
    } catch (error) {
      // Revert to original state if API call fails
      console.error('Error toggling like:', error);
      setIsLiked(!isLiked);
      setLikesCount(isLiked ? likesCount + 1 : likesCount - 1);
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
    console.log('PostCard: navigateToProfile called', { 
      postUser: post.user, 
      postUserId: post.user?.id,
      postUserIdField: post.userId,
      postAuthor: (post as any)?.author,
      fullPost: post
    });
    
    // Try multiple possible locations for the user ID
    const userId = post.user?.id || 
                   post.userId || 
                   (post as any)?.author?.id || 
                   (post as any)?.author?._id ||
                   (post as any)?.author;
    
    // If userId is an object, extract the _id from it
    const finalUserId = typeof userId === 'object' && userId !== null ? userId._id || userId.id : userId;
    
    if (!finalUserId) {
      console.log('PostCard: No user ID found in any expected location, cannot navigate');
      console.log('PostCard: Available fields:', {
        'post.user.id': post.user?.id,
        'post.userId': post.userId,
        'post.author.id': (post as any)?.author?.id,
        'post.author': (post as any)?.author,
        'post.user': post.user
      });
      return;
    }

    console.log('PostCard: Found user ID:', finalUserId);
    console.log('PostCard: User ID type:', typeof finalUserId);
    console.log('PostCard: User ID length:', finalUserId.length);
    console.log('PostCard: Setting viewProfileUserId in localStorage:', finalUserId);
    // Set the user ID for the profile page to load
    localStorage.setItem('viewProfileUserId', finalUserId);
    
    console.log('PostCard: Dispatching navigate event to profile page');
    // Navigate to the profile page
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'profile' } }));
    
    // Use setTimeout to ensure the Profile component is mounted before dispatching viewProfile event
    setTimeout(() => {
      console.log('PostCard: Dispatching viewProfile event with userId:', finalUserId);
      // Dispatch a specific event for the profile page to listen to,
      // ensuring it re-renders even if it's already the current page.
      window.dispatchEvent(new CustomEvent('viewProfile', { detail: { userId: finalUserId } }));
    }, 100);
    
    // Ensure the page scrolls to the top
    window.scrollTo(0, 0);
    
    console.log('PostCard: Navigation events dispatched successfully');
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
      const { postId, likesCount: newLikesCount, isLiked: newIsLiked, userId } = event.detail;
      
      if (postId === post.id) {
        // Update likes count for all users
        setLikesCount(newLikesCount);
        
        // If this is the current user's action, update the isLiked state
        if (currentUser && userId === currentUser.id) {
          setIsLiked(newIsLiked);
        }
      }
    };
    
    window.addEventListener('postLikeChanged', handleLikeChange as EventListener);
    return () => {
      window.removeEventListener('postLikeChanged', handleLikeChange as EventListener);
    };
  }, [post.id, currentUser]);

  // Handle delete post
  const handleDeletePost = async () => {
    try {
      // Call API to delete the post
      await postsApi.deletePost(post.id);
      
      // Dispatch event to notify other components about the deletion
      window.dispatchEvent(new CustomEvent('postDeleted', { 
        detail: { 
          postId: post.id,
          userId: post.user?.id || ''
        } 
      }));
      
      setShowMenu(false);
    } catch (error) {
      console.error('Error deleting post:', error);
      // Optionally, show a non-intrusive error (e.g., toast)
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Helper to extract user id from post
  const getPostOwnerId = (post: any): string | undefined => {
    // Try all possible locations for the user id
    if (post.user && typeof post.user.id === 'string') return post.user.id;
    if (typeof post.userId === 'string') return post.userId;
    if (post.author && typeof post.author.id === 'string') return post.author.id;
    if (post.author && typeof post.author === 'string') return post.author;
    if (post.user && typeof post.user === 'string') return post.user;
    // Try _id fields
    if (post.user && typeof post.user._id === 'string') return post.user._id;
    if (post.author && typeof post.author._id === 'string') return post.author._id;
    return undefined;
  };

  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-4 overflow-hidden">
      {/* Post header with user info */}
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={navigateToProfile}>
          <img 
            src={getAvatarUrl(post.user?.avatar, post.user?.name || 'User')} 
            alt={post.user?.name || 'User'} 
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              {post.user?.name || 'Unknown User'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(new Date(post.createdAt))}
            </p>
          </div>
        </div>
        
        {/* Post menu */}
          <div className="relative">
            <button 
              ref={buttonRef}
              onClick={() => setShowMenu(!showMenu)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
            <MoreHorizontal className="h-5 w-5" />
            </button>
            
            {showMenu && (
              <div 
                ref={menuRef}
              className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700"
              >
              <div className="py-1">
                <button
                  onClick={async () => {
                    await handleShare();
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy link
                </button>
                
                {/* Show delete option only for user's own posts */}
                {currentUser && post.user && (currentUser.id === getPostOwnerId(post)) && (
                  <button
                    onClick={handleDeletePost}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete post
                  </button>
                )}
              </div>
              </div>
            )}
          </div>
      </div>
      
      {/* Post content */}
      {post.content && (
      <div className="px-4 py-2">
          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
            {post.content}
          </p>
      </div>
      )}
      
      {/* Post media - Use the new ImageGallery component */}
      {post.images && post.images.length > 0 ? (
        <div className="mt-2">
          <ImageGallery images={post.images} />
        </div>
      ) : (post as any).media && (post as any).media.url ? (
        // Fallback for legacy posts with single media
        <div className="mt-2">
            <img 
            src={(post as any).media.url} 
              alt="Post content" 
            className="w-full object-cover max-h-[500px]"
            />
        </div>
      ) : null}
      
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
          className={`flex items-center justify-center space-x-2 py-1.5 rounded-md 
            ${isLiked 
              ? 'text-red-500 font-medium' 
              : 'text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400'
            } 
            hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
          title={isLiked ? "Unlike" : "Like"}
        >
          <Heart 
            className={`h-5 w-5 transition-all duration-300 ${
              isLiked 
                ? 'fill-current scale-110' 
                : ''
            }`} 
          />
          <span className="sm:inline">{isLiked ? 'Liked' : 'Like'}</span>
        </button>
        <button 
          onClick={handleShare}
          className="relative flex items-center justify-center space-x-2 py-1.5 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {shareIcon === 'share' && <Share2 className="h-5 w-5" />}
          {shareIcon === 'copy' && <Copy className="h-5 w-5" />}
          {shareIcon === 'check' && <Check className="h-5 w-5 text-green-500" />}
          <span className="sm:inline">{shareIcon === 'check' ? 'Copied!' : 'Share'}</span>
          
          {showShareTooltip && (
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
              Link copied to clipboard!
            </div>
          )}
        </button>
      </div>
    </article>
  );
};

export default PostCard;