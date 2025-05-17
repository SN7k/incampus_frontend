import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Post, Comment } from '../types';
import { mockPosts } from '../data/mockData';
import { useAuth } from './AuthContext';
import { useFriends } from './FriendContext';

// API utilities
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
console.log('PostContext using API base URL:', API_BASE_URL);

interface PostState {
  allPosts: Post[];
  feedPosts: Post[];
  loading: boolean;
  error: string | null;
}

interface PostContextType extends PostState {
  createPost: (content: string, media?: { type: 'image' | 'video', url: string }[]) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  refreshFeed: () => void;
}

const initialState: PostState = {
  allPosts: [],
  feedPosts: [],
  loading: false,
  error: null
};

const PostContext = createContext<PostContextType>({
  ...initialState,
  createPost: async () => {},
  likePost: async () => {},
  addComment: async () => {},
  deletePost: async () => {},
  refreshFeed: () => {}
});

export const usePosts = () => useContext(PostContext);

export const PostProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { friends } = useFriends();
  const [state, setState] = useState<PostState>(initialState);
  
  // Load initial post data
  useEffect(() => {
    if (user) {
      loadPostData();
    } else {
      setState(initialState);
    }
  }, [user]);
  
  // Update feed posts when friends list changes
  useEffect(() => {
    if (user && friends && friends.length > 0) {
      refreshFeed();
    }
  }, [friends, user]);
  
  // Load posts from API
  const loadPostData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No authentication token found, using mock data');
        // Use mock data if no token is found
        setState(prev => ({
          ...prev,
          allPosts: mockPosts,
          feedPosts: filterFeedPosts(mockPosts),
          loading: false,
          error: null // Don't show error to user
        }));
        return;
      }
      
      // Check if backend is available (in development, might not be running)
      try {
        // Fetch posts from API with a timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(`${API_BASE_URL}/api/posts`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch posts: ${response.status}`);
        }
        
        const data = await response.json();
        const posts = data.data || [];
        
        setState(prev => ({
          ...prev,
          allPosts: posts,
          feedPosts: filterFeedPosts(posts),
          loading: false,
          error: null
        }));
      } catch (fetchError: any) {
        console.log('Error fetching from API, falling back to mock data:', fetchError.message);
        // Use mock data on fetch error
        setState(prev => ({
          ...prev,
          allPosts: mockPosts,
          feedPosts: filterFeedPosts(mockPosts),
          loading: false,
          error: null // Don't show error to user in UI
        }));
      }
    } catch (error: any) {
      console.error('Error loading post data:', error);
      
      // If API fails, fall back to mock data
      setState(prev => ({
        ...prev,
        allPosts: mockPosts,
        feedPosts: filterFeedPosts(mockPosts),
        loading: false,
        error: null // Don't show error to user
      }));
    }
  };
  
  // Filter posts for the feed (posts from user and friends)
  const filterFeedPosts = (posts: Post[]): Post[] => {
    if (!user) return [];
    if (!friends) return posts.filter(post => post.userId === user.id);
    
    const friendIds = friends.map((f: any) => f.id);
    
    return posts.filter(post => 
      post.userId === user.id || friendIds.includes(post.userId)
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };
  
  // Refresh the feed
  const refreshFeed = () => {
    if (!user) return;
    
    setState(prev => ({
      ...prev,
      feedPosts: filterFeedPosts(prev.allPosts)
    }));
  };
  
  // Create a new post
  const createPost = async (content: string, media?: { type: 'image' | 'video', url: string }[]) => {
    if (!user) return;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Prepare post data
      const postData = {
        content,
        media
      };
      
      // Send post to API
      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create post: ${response.status}`);
      }
      
      // Get the created post from response
      const data = await response.json();
      const newPost = data.data;
      
      // Update state with new post
      const allPosts = [newPost, ...state.allPosts];
      
      setState(prev => ({
        ...prev,
        allPosts,
        feedPosts: filterFeedPosts(allPosts),
        loading: false
      }));
    } catch (error: any) {
      console.error('Error creating post:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to create post: ' + error.message 
      }));
      
      // If in development and API fails, simulate with mock data
      if (import.meta.env.DEV) {
        // Create a mock post
        const mockPost: Post = {
          id: `post_${Date.now()}`,
          userId: user.id,
          user: user,
          content,
          media: media ? media.map((m, i) => ({ id: `media_${Date.now()}_${i}`, ...m })) : undefined,
          likes: 0,
          comments: [],
          createdAt: new Date()
        };
        
        // Add to posts
        const allPosts = [mockPost, ...state.allPosts];
        
        setState(prev => ({
          ...prev,
          allPosts,
          feedPosts: filterFeedPosts(allPosts),
          loading: false,
          error: 'Using mock data (API failed)'
        }));
      }
    }
  };
  
  // Like a post
  const likePost = async (postId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Send like request to API
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/like`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to like post: ${response.status}`);
      }
      
      // Update post in state
      const allPosts = state.allPosts.map(post => {
        if (post.id === postId) {
          return { ...post, likes: post.likes + 1 };
        }
        return post;
      });
      
      setState(prev => ({
        ...prev,
        allPosts,
        feedPosts: filterFeedPosts(allPosts),
        loading: false
      }));
    } catch (error: any) {
      console.error('Error liking post:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to like post: ' + error.message 
      }));
    }
  };
  
  // Add a comment to a post
  const addComment = async (postId: string, content: string) => {
    if (!user) return;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Prepare comment data
      const commentData = {
        content
      };
      
      // Send comment to API
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(commentData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to add comment: ${response.status}`);
      }
      
      // Get the created comment from response
      const data = await response.json();
      const newComment = data.data;
      
      // Add comment to post in state
      const allPosts = state.allPosts.map(post => {
        if (post.id === postId) {
          return { 
            ...post, 
            comments: [...post.comments, newComment] 
          };
        }
        return post;
      });
      
      setState(prev => ({
        ...prev,
        allPosts,
        feedPosts: filterFeedPosts(allPosts),
        loading: false
      }));
    } catch (error: any) {
      console.error('Error adding comment:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to add comment: ' + error.message 
      }));
    }
  };
  
  // Delete a post
  const deletePost = async (postId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Send delete request to API
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete post: ${response.status}`);
      }
      
      // Remove post from state
      const allPosts = state.allPosts.filter(post => post.id !== postId);
      
      setState(prev => ({
        ...prev,
        allPosts,
        feedPosts: filterFeedPosts(allPosts),
        loading: false
      }));
    } catch (error: any) {
      console.error('Error deleting post:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to delete post: ' + error.message 
      }));
    }
  };
  
  return (
    <PostContext.Provider 
      value={{ 
        ...state, 
        createPost, 
        likePost, 
        addComment, 
        deletePost,
        refreshFeed
      }}
    >
      {children}
    </PostContext.Provider>
  );
};
