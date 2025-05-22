import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';

const usePosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    try {
      const response = await axiosInstance.get('/api/posts/feed');
      setPosts(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching posts');
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const createPost = async (postData) => {
    try {
      const response = await axiosInstance.post('/api/posts', postData);
      setPosts(prev => [response.data.data, ...prev]);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Error creating post');
    }
  };

  const deletePost = async (postId) => {
    try {
      await axiosInstance.delete(`/api/posts/${postId}`);
      setPosts(prev => prev.filter(post => post.id !== postId));
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Error deleting post');
    }
  };

  const likePost = async (postId) => {
    try {
      const response = await axiosInstance.post(`/api/posts/${postId}/like`);
      setPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, likes: response.data.data.likes } : post
      ));
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Error liking post');
    }
  };

  const unlikePost = async (postId) => {
    try {
      const response = await axiosInstance.delete(`/api/posts/${postId}/like`);
      setPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, likes: response.data.data.likes } : post
      ));
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Error unliking post');
    }
  };

  const addComment = async (postId, content) => {
    try {
      const response = await axiosInstance.post(`/api/posts/${postId}/comments`, { content });
      setPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, comments: [...post.comments, response.data.data] } : post
      ));
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Error adding comment');
    }
  };

  const deleteComment = async (postId, commentId) => {
    try {
      await axiosInstance.delete(`/api/posts/${postId}/comments/${commentId}`);
      setPosts(prev => prev.map(post => 
        post.id === postId ? {
          ...post,
          comments: post.comments.filter(comment => comment.id !== commentId)
        } : post
      ));
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Error deleting comment');
    }
  };

  return {
    posts,
    loading,
    error,
    createPost,
    deletePost,
    likePost,
    unlikePost,
    addComment,
    deleteComment,
    refreshPosts: fetchPosts
  };
};

export default usePosts; 