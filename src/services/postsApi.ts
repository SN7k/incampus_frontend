import API from './api';
import { Post } from '../types';

/**
 * Interface for post creation data
 */
export interface CreatePostData {
  content: string;
  image?: File | null;
  visibility?: 'public' | 'friends' | 'private';
}

/**
 * Interface for post API response
 */
interface PostResponse {
  status: string;
  data: {
    post: Post;
  };
}

/**
 * Interface for multiple posts API response
 */
interface PostsResponse {
  status: string;
  data: {
    posts: Post[];
  };
}

/**
 * Get all posts for the feed (timeline)
 * @returns Array of posts
 */
export const getFeedPosts = async (): Promise<Post[]> => {
  const response = await API.get<PostsResponse>('/posts/feed');
  return response.data.data.posts;
};

/**
 * Get posts for a specific user
 * @param userId User ID to get posts for
 * @returns Array of posts
 */
export const getUserPosts = async (userId: string): Promise<Post[]> => {
  const response = await API.get<PostsResponse>(`/posts/user/${userId}`);
  return response.data.data.posts;
};

/**
 * Create a new post
 * @param postData Post data to create
 * @returns Created post
 */
export const createPost = async (postData: CreatePostData): Promise<Post> => {
  // If there's an image, use FormData
  if (postData.image) {
    const formData = new FormData();
    formData.append('text', postData.content);
    formData.append('images', postData.image);
    
    if (postData.visibility) {
      formData.append('visibility', postData.visibility);
    }
    
    const response = await API.post<PostResponse>('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.data.post;
  }
  
  // No image, use regular JSON
  const response = await API.post<PostResponse>('/posts', {
    text: postData.content,
    visibility: postData.visibility
  });
  return response.data.data.post;
};

/**
 * Update an existing post
 * @param postId Post ID to update
 * @param postData Updated post data
 * @returns Updated post
 */
export const updatePost = async (postId: string, postData: Partial<CreatePostData>): Promise<Post> => {
  const response = await API.put<PostResponse>(`/posts/${postId}`, postData);
  return response.data.data.post;
};

/**
 * Delete a post
 * @param postId Post ID to delete
 * @returns Success status
 */
export const deletePost = async (postId: string): Promise<boolean> => {
  await API.delete(`/posts/${postId}`);
  return true;
};

/**
 * Like a post
 * @param postId Post ID to like
 * @returns Like status
 */
export const likePost = async (postId: string): Promise<{ likes: number; isLiked: boolean }> => {
  const response = await API.patch(`/posts/${postId}/like`);
  return response.data.data;
};

/**
 * Unlike a post
 * @param postId Post ID to unlike
 * @returns Like status
 */
export const unlikePost = async (postId: string): Promise<{ likes: number; isLiked: boolean }> => {
  const response = await API.patch(`/posts/${postId}/like`);
  return response.data.data;
};

/**
 * Add a comment to a post
 * @param postId Post ID to comment on
 * @param content Comment content
 * @returns Updated post with new comment
 */
export const addComment = async (postId: string, content: string): Promise<Post> => {
  const response = await API.post<PostResponse>(`/posts/${postId}/comments`, { text: content });
  return response.data.data.post;
};

/**
 * Delete a comment from a post
 * @param postId Post ID the comment belongs to
 * @param commentId Comment ID to delete
 * @returns Updated post without the deleted comment
 */
export const deleteComment = async (postId: string, commentId: string): Promise<Post> => {
  const response = await API.delete<PostResponse>(`/posts/${postId}/comments/${commentId}`);
  return response.data.data.post;
};

// Export all functions as a single object for easier imports
export const postsApi = {
  getFeedPosts,
  getUserPosts,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  deleteComment
};
