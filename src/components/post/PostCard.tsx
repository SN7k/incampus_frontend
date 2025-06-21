import React, { useState, useRef, useEffect } from 'react';
import { Heart, Share2, MoreHorizontal, Check, Copy, Trash2, MessageSquare } from 'lucide-react';
import { Post, User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { postsApi } from '../../services/postsApi';
import { getAvatarUrl } from '../../utils/avatarUtils';
import { friendsApi } from '../../services/friendsApi';

interface PostCardProps {
  post: Post;
  onCommentClick: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onCommentClick }) => {
  const { user: currentUser } = useAuth();
  
  const [isLiked, setIsLiked] = useState(
    currentUser ? post.likes.some(like => (like as User).id === currentUser.id) : false
  );
  const [likesCount, setLikesCount] = useState(post.likes.length);
  
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [loadingLike, setLoadingLike] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setIsLiked(currentUser ? post.likes.some(like => (like as User).id === currentUser.id) : false);
    setLikesCount(post.likes.length);
  }, [post, currentUser]);

  useEffect(() => {
    if (currentUser) {
      const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');
      const postLikes = JSON.parse(localStorage.getItem(`post_${post.id}_likes`) || '[]');
      
      setIsLiked(likedPosts[post.id] === true);
      setLikesCount(postLikes.length);
    }
  }, [currentUser, post.id]);

  useEffect(() => {
    if (currentUser) {
      friendsApi.getFriendsList();
    }
  }, [currentUser]);

  const toggleLike = async () => {
    if (!currentUser || loadingLike) return;
    
    setLoadingLike(true);
    
    const originalIsLiked = isLiked;
    const originalLikesCount = likesCount;
    setIsLiked(!originalIsLiked);
    setLikesCount(originalIsLiked ? originalLikesCount - 1 : originalLikesCount + 1);

    try {
      await postsApi.toggleLike(post.id);
    } catch (error) {
      console.error('Failed to toggle like:', error);
      setIsLiked(originalIsLiked);
      setLikesCount(originalLikesCount);
    } finally {
      setLoadingLike(false);
    }
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${post.user.name}`,
          text: post.content.substring(0, 100),
          url: postUrl
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      await navigator.clipboard.writeText(postUrl);
      setShowShareTooltip(true);
      setTimeout(() => setShowShareTooltip(false), 2000);
    }
  };

  const navigateToProfile = () => {
    if (post.user?.id) {
      localStorage.setItem('viewProfileUserId', post.user.id);
      window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'profile' } }));
    }
  };

  const handleDeletePost = async () => {
    if (!currentUser || post.user?.id !== currentUser.id) return;
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postsApi.deletePost(post.id);
        window.dispatchEvent(new CustomEvent('postDeleted', { detail: { postId: post.id } }));
      } catch (error) {
        console.error('Failed to delete post:', error);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  useEffect(() => {
    const handleLikeChange = (event: CustomEvent) => {
      const { postId, likesCount: newLikesCount, userId } = event.detail;
      
      if (postId === post.id && currentUser && userId !== currentUser.id) {
        setLikesCount(newLikesCount);
      }
    };
    
    window.addEventListener('postLikeChanged', handleLikeChange as EventListener);
    return () => {
      window.removeEventListener('postLikeChanged', handleLikeChange as EventListener);
    };
  }, [post.id, currentUser]);

  if (!post || !post.user) {
    return null;
  }

  const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Just now';
    
    const diff = new Date().getTime() - d.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 1) return `${days}d`;
    if (hours > 1) return `${hours}h`;
    if (minutes > 1) return `${minutes}m`;
    return 'Just now';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md mb-4 transition-colors duration-200">
      {(post as any).likedByFriend && (
        <div className="px-5 pt-3 pb-1 text-sm text-gray-500 dark:text-gray-400 flex items-center">
          <Heart size={14} className="mr-2 text-gray-400" />
          <span>{(post as any).likedByFriend} liked this</span>
        </div>
      )}

      <div className="flex items-center px-5 pt-4">
        <img
          src={getAvatarUrl(post.user.avatar, post.user.name)}
          alt={post.user.name}
          className="w-11 h-11 rounded-full object-cover cursor-pointer"
          onClick={navigateToProfile}
        />
        <div className="ml-3">
          <h4 
            className="font-semibold text-gray-800 dark:text-gray-100 cursor-pointer"
            onClick={navigateToProfile}
          >
            {post.user.name}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(post.createdAt)}
          </p>
        </div>
        <div className="ml-auto relative">
          <button 
            ref={buttonRef}
            onClick={() => setShowMenu(!showMenu)} 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          >
            <MoreHorizontal size={20} />
          </button>
          {showMenu && (
            <div ref={menuRef} className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-xl z-10 border border-gray-100 dark:border-gray-600">
              {currentUser && post.user.id === currentUser.id ? (
                <button
                  onClick={handleDeletePost}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete Post
                </button>
              ) : (
                <button
                  onClick={handleShare}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center"
                >
                  <Copy size={16} className="mr-2" />
                  Copy link
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="px-5 py-3">
        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{post.content}</p>
      </div>

      {post.images && post.images.length > 0 && (
        <div className={`grid gap-1 ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {post.images.slice(0, 4).map((image, index) => (
            <div key={index} className="relative aspect-square bg-gray-100 dark:bg-gray-700">
              <img src={image.url} alt={`Post media ${index + 1}`} className="w-full h-full object-cover" />
              {post.images && post.images.length > 4 && index === 3 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">+{post.images.length - 4}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center px-5 py-2 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <button 
            onClick={toggleLike}
            className={`flex items-center space-x-2 p-2 rounded-full transition-colors ${isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/50'}`}
            disabled={loadingLike}
          >
            <Heart fill={isLiked ? 'currentColor' : 'none'} size={22} />
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-300">{likesCount}</span>
        </div>
        <button 
          onClick={() => onCommentClick(post.id)}
          className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 p-2 rounded-full transition-colors"
        >
          <MessageSquare size={22} />
        </button>
        <button 
          onClick={handleShare}
          className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/50 p-2 rounded-full transition-colors relative"
        >
          <Share2 size={22} />
          {showShareTooltip && (
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2">
              Link copied!
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default PostCard;