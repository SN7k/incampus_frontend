import axios from 'axios';
import { ProfileResponse, ProfileData } from '../types/profile';
import { User, Post } from '../types';

// Configure axios with base URL and default headers
const API = axios.create({
  baseURL: 'https://incampus-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor to include auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('authState');
      window.location.href = '/';
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      throw new Error('Network error. Please check your connection.');
    }
    
    // Handle server errors
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data);
      throw new Error('Server error. Please try again later.');
    }
    
    // Handle validation errors
    if (error.response?.status === 400) {
      const message = error.response.data?.message || 'Invalid request';
      throw new Error(message);
    }
    
    // Handle other errors
    const message = error.response?.data?.message || 'An error occurred';
    throw new Error(message);
  }
);

// Profile API calls
export const profileApi = {
  // Get user profile by ID
  getUserProfile: async (userId: string): Promise<ProfileData> => {
    try {
      const response = await API.get<{status: string, data: ProfileData}>(`/profile/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },
  
  // Update user profile
  updateProfile: async (userId: string, profileData: Partial<ProfileData>): Promise<ProfileData> => {
    try {
      const response = await API.patch<ProfileResponse>(`/users/${userId}/profile`, profileData);
      return response.data.data.profile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
  
  // Get user posts
  getUserPosts: async (userId: string): Promise<Post[]> => {
    try {
      const response = await API.get<{status: string, data: {posts: Post[]}}>(`/users/${userId}/posts`);
      return response.data.data.posts;
    } catch (error) {
      console.error('Error fetching user posts:', error);
      throw error;
    }
  }
};

// Friend management API calls
export const friendApi = {
  // Get friends list
  getFriends: async (): Promise<User[]> => {
    try {
      const response = await API.get<{status: string, data: {friends: User[]}}>('/friends/friends-list');
      return response.data.data.friends;
    } catch (error) {
      console.error('Error fetching friends:', error);
      throw error;
    }
  },
  
  // Get friend requests (received)
  getFriendRequests: async (): Promise<{id: string, sender: User, createdAt: string}[]> => {
    try {
      const response = await API.get<{status: string, data: {pendingRequests: {id: string, sender: User, createdAt: string}[]}}>('/friends/pending-requests');
      return response.data.data.pendingRequests;
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      throw error;
    }
  },
  
  // Get sent friend requests
  getSentRequests: async (): Promise<{id: string, receiver: User, createdAt: string}[]> => {
    try {
      const response = await API.get<{status: string, data: {sentRequests: {id: string, receiver: User, createdAt: string}[]}}>('/friends/sent-requests');
      return response.data.data.sentRequests;
    } catch (error) {
      console.error('Error fetching sent requests:', error);
      throw error;
    }
  },
  
  // Get friend suggestions
  getSuggestions: async (): Promise<{user: User, mutualFriends: number}[]> => {
    try {
      const response = await API.get<{status: string, data: User[]}>('/friends/suggestions');
      return response.data.data.map(user => ({ user, mutualFriends: 0 }));
    } catch (error) {
      console.error('Error fetching friend suggestions:', error);
      throw error;
    }
  },
  
  // Send friend request
  sendRequest: async (receiverId: string): Promise<{id: string, receiver: User}> => {
    try {
      const response = await API.post<{status: string, data: {friendRequest: {id: string, receiver: User}}}>('/friends/send-request', { receiverId });
      return response.data.data.friendRequest;
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  },
  
  // Accept friend request
  acceptRequest: async (requestId: string): Promise<{id: string, sender: User}> => {
    try {
      const response = await API.patch<{status: string, data: {friendRequest: {id: string, sender: User}}}>(`/friends/accept-request/${requestId}`);
      return response.data.data.friendRequest;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      throw error;
    }
  },
  
  // Decline friend request
  declineRequest: async (requestId: string): Promise<{id: string}> => {
    try {
      const response = await API.patch<{status: string, data: {friendRequest: {id: string}}}>(`/friends/decline-request/${requestId}`);
      return response.data.data.friendRequest;
    } catch (error) {
      console.error('Error declining friend request:', error);
      throw error;
    }
  },
  
  // Unfriend a user
  unfriend: async (friendId: string): Promise<{success: boolean}> => {
    try {
      const response = await API.delete<{status: string, message: string}>(`/friends/${friendId}`);
      return { success: response.data.status === 'success' };
    } catch (error) {
      console.error('Error unfriending user:', error);
      throw error;
    }
  }
};

// Export the configured axios instance for other API calls
export default API;
