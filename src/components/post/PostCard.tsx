import React, { useState } from 'react';
import { Heart, Share2, MoreHorizontal } from 'lucide-react';
import { Post } from '../../types';

interface PostCardProps {
  post: Post;
  onNavigateToProfile?: (userId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onNavigateToProfile }) => {
  // Auth info removed as comments feature has been removed
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);


  const toggleLike = () => {
    if (isLiked) {
      setLikesCount(likesCount - 1);
    } else {
      setLikesCount(likesCount + 1);
    }
    setIsLiked(!isLiked);
  };



  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg mb-6">
      {/* Post header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img 
            src={post.user.avatar} 
            alt={post.user.name} 
            className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => onNavigateToProfile && onNavigateToProfile(post.user.id)}
            title={`View ${post.user.name}'s profile`}
          />
          <div>
            <div 
              className="font-semibold text-gray-800 dark:text-gray-200 cursor-pointer hover:underline"
              onClick={() => onNavigateToProfile && onNavigateToProfile(post.user.id)}
            >
              {post.user.name}
              {post.user.role === 'faculty' && (
                <span className="ml-2 text-xs font-medium px-2 py-0.5 bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 rounded-full">
                  Faculty
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              {formatDate(post.createdAt)} · {post.user.universityId}
            </div>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
          <MoreHorizontal size={20} />
        </button>
      </div>
      
      {/* Post content */}
      <div className="px-4 pb-2">
        <p className="text-gray-800 dark:text-gray-200 mb-3">{post.content}</p>
      </div>
      
      {/* Post media */}
      {post.media && post.media.length > 0 && (
        <div className="w-full">
          {post.media[0].type === 'image' && (
            <img 
              src={post.media[0].url} 
              alt="Post content" 
              className="w-full h-auto object-cover"
            />
          )}
          {post.media[0].type === 'video' && (
            <video 
              src={post.media[0].url} 
              controls 
              className="w-full h-auto"
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
      <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 flex">
        <button 
          onClick={toggleLike}
          className={`flex items-center justify-center space-x-1 flex-1 py-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
            isLiked ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'
          }`}
        >
          <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
          <span>Like</span>
        </button>

        <button 
          onClick={() => {
            // Create the share data
            const shareData = {
              title: `${post.user.name}'s post on InCampus`,
              text: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
              url: window.location.href
            };
            
            // Use the Web Share API if available
            if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
              navigator.share(shareData)
                .catch(err => console.error('Error sharing:', err));
            } else {
              // Fallback: copy link to clipboard
              try {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href)
                    .then(() => alert('Link copied to clipboard!'))
                    .catch(err => {
                      console.error('Could not copy link:', err);
                      // Create a temporary input element as a last resort fallback
                      const tempInput = document.createElement('input');
                      tempInput.value = window.location.href;
                      document.body.appendChild(tempInput);
                      tempInput.select();
                      try {
                        document.execCommand('copy');
                        alert('Link copied to clipboard!');
                      } catch (e) {
                        console.error('Fallback clipboard copy failed:', e);
                        alert('Could not copy link. Please copy the URL manually.');
                      }
                      document.body.removeChild(tempInput);
                    });
                } else {
                  // Fallback for browsers without clipboard API
                  const tempInput = document.createElement('input');
                  tempInput.value = window.location.href;
                  document.body.appendChild(tempInput);
                  tempInput.select();
                  try {
                    document.execCommand('copy');
                    alert('Link copied to clipboard!');
                  } catch (e) {
                    console.error('Fallback clipboard copy failed:', e);
                    alert('Could not copy link. Please copy the URL manually.');
                  }
                  document.body.removeChild(tempInput);
                }
              } catch (error) {
                console.error('Clipboard operation failed:', error);
                alert('Could not copy link. Please copy the URL manually.');
              }
            }
          }}
          className="flex items-center justify-center space-x-1 flex-1 py-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
        >
          <Share2 size={18} />
          <span>Share</span>
        </button>
      </div>
      

    </div>
  );
};

export default PostCard;