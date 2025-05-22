import { useEffect } from 'react';
import usePosts from '../hooks/usePosts';
import CreatePost from '../components/CreatePost';
import Post from '../components/Post';
import PostSkeleton from '../components/PostSkeleton';

const Feed = () => {
  const { posts, loading, error, fetchPosts, deletePost } = usePosts();

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        Error loading posts: {error}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Feed</h1>
      
      <CreatePost />

      {loading ? (
        // Show 3 skeleton loaders while loading
        <>
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </>
      ) : posts.length === 0 ? (
        <div className="text-center text-gray-500 p-4">
          No posts yet. Be the first to post!
        </div>
      ) : (
        posts.map((post) => (
          <Post
            key={post._id}
            post={post}
            onDelete={deletePost}
          />
        ))
      )}
    </div>
  );
};

export default Feed; 