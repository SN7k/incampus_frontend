import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Post, Comment } from '../types';
import { mockPosts } from '../data/mockData';
import { useAuth } from './AuthContext';
import { useFriends } from './FriendContext';

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
    if (user && friends.length > 0) {
      refreshFeed();
    }
  }, [friends, user]);
  
  // Load post data from localStorage or initialize with mock data
  const loadPostData = () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Try to load from localStorage first
      const savedPostData = localStorage.getItem('postData');
      
      if (savedPostData) {
        const parsedData = JSON.parse(savedPostData);
        // Convert string dates back to Date objects
        const allPosts = parsedData.allPosts.map((post: any) => ({
          ...post,
          createdAt: new Date(post.createdAt),
          comments: post.comments.map((comment: any) => ({
            ...comment,
            createdAt: new Date(comment.createdAt)
          }))
        }));
        
        setState({
          allPosts,
          feedPosts: filterFeedPosts(allPosts),
          loading: false,
          error: null
        });
      } else {
        // Initialize with mock data
        setState({
          allPosts: mockPosts,
          feedPosts: filterFeedPosts(mockPosts),
          loading: false,
          error: null
        });
        
        // Save to localStorage
        localStorage.setItem('postData', JSON.stringify({ allPosts: mockPosts }));
      }
    } catch (error) {
      console.error('Error loading post data:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to load posts' 
      }));
    }
  };
  
  // Filter posts for the feed (posts from user and friends)
  const filterFeedPosts = (posts: Post[]): Post[] => {
    if (!user) return [];
    
    const friendIds = friends.map(f => f.id);
    
    return posts.filter(post => 
      post.userId === user.id || friendIds.includes(post.userId)
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  };
  
  // Refresh the feed
  const refreshFeed = () => {
    if (!user) return;
    
    setState(prev => ({
      ...prev,
      feedPosts: filterFeedPosts(prev.allPosts)
    }));
  };
  
  // Save current state to localStorage
  const saveState = (newState: Partial<PostState>) => {
    const updatedState = { ...state, ...newState };
    setState(updatedState);
    
    localStorage.setItem('postData', JSON.stringify({ 
      allPosts: updatedState.allPosts 
    }));
  };
  
  // Create a new post
  const createPost = async (content: string, media?: { type: 'image' | 'video', url: string }[]) => {
    if (!user) return;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create new post
      const newPost: Post = {
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
      const allPosts = [newPost, ...state.allPosts];
      
      saveState({ 
        allPosts,
        feedPosts: filterFeedPosts(allPosts),
        loading: false
      });
    } catch (error) {
      console.error('Error creating post:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to create post' 
      }));
    }
  };
  
  // Like a post
  const likePost = async (postId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Update post likes
      const allPosts = state.allPosts.map(post => {
        if (post.id === postId) {
          return { ...post, likes: post.likes + 1 };
        }
        return post;
      });
      
      saveState({ 
        allPosts,
        feedPosts: filterFeedPosts(allPosts),
        loading: false
      });
    } catch (error) {
      console.error('Error liking post:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to like post' 
      }));
    }
  };
  
  // Add a comment to a post
  const addComment = async (postId: string, content: string) => {
    if (!user) return;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create new comment
      const newComment: Comment = {
        id: `comment_${Date.now()}`,
        userId: user.id,
        user: user,
        content,
        createdAt: new Date()
      };
      
      // Add comment to post
      const allPosts = state.allPosts.map(post => {
        if (post.id === postId) {
          return { 
            ...post, 
            comments: [...post.comments, newComment] 
          };
        }
        return post;
      });
      
      saveState({ 
        allPosts,
        feedPosts: filterFeedPosts(allPosts),
        loading: false
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to add comment' 
      }));
    }
  };
  
  // Delete a post
  const deletePost = async (postId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove post
      const allPosts = state.allPosts.filter(post => post.id !== postId);
      
      saveState({ 
        allPosts,
        feedPosts: filterFeedPosts(allPosts),
        loading: false
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to delete post' 
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
