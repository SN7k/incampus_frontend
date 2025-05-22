import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import usePosts from '../hooks/usePosts';

const Post = ({ post, onDelete }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toggleLike, addComment } = usePosts();

  const handleLike = async () => {
    try {
      await toggleLike(post._id);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    try {
      await addComment(post._id, commentText);
      setCommentText('');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={post.author.avatar || 'https://via.placeholder.com/40'}
            alt={post.author.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="font-medium">{post.author.name}</h3>
            <p className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(post._id)}
            className="text-red-500 hover:text-red-600"
          >
            Delete
          </button>
        )}
      </div>

      <p className="mb-4">{post.text}</p>

      {post.media && (
        <div className="mb-4">
          {post.media.type === 'image' ? (
            <img
              src={post.media.url}
              alt="Post media"
              className="rounded-lg max-h-96 w-full object-cover"
            />
          ) : (
            <video
              src={post.media.url}
              controls
              className="rounded-lg max-h-96 w-full"
            />
          )}
        </div>
      )}

      <div className="flex items-center space-x-4 mb-4">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-1 ${
            post.isLiked ? 'text-blue-500' : 'text-gray-500'
          }`}
        >
          <span>{post.likes} likes</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="text-gray-500"
        >
          {post.comments.length} comments
        </button>
      </div>

      {showComments && (
        <div className="mt-4">
          <form onSubmit={handleComment} className="mb-4">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="w-full p-2 border rounded-lg"
              disabled={isSubmitting}
            />
          </form>
          <div className="space-y-2">
            {post.comments.map((comment) => (
              <div key={comment._id} className="flex items-start space-x-2">
                <img
                  src={comment.user.avatar || 'https://via.placeholder.com/32'}
                  alt={comment.user.name}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1 bg-gray-50 rounded-lg p-2">
                  <p className="font-medium text-sm">{comment.user.name}</p>
                  <p className="text-sm">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Post; 