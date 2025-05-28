import axios from 'axios';
import { ProfileResponse, ProfileData } from '../types/profile';
import { User, Post } from '../types';

// Configure axios with base URL and default headers
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
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

// Profile API calls
export const profileApi = {
  // Get user profile by ID
  getUserProfile: async (userId: string): Promise<ProfileData> => {
    try {
      const response = await API.get<ProfileResponse>(`/users/${userId}/profile`);
      return response.data.data.profile;
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
      const response = await API.get<{status: string, data: {friends: User[]}}>('/friends');
      return response.data.data.friends;
    } catch (error) {
      console.error('Error fetching friends:', error);
      throw error;
    }
  },
  
  // Get friend requests (received)
  getFriendRequests: async (): Promise<{id: string, sender: User, createdAt: string}[]> => {
    try {
      const response = await API.get<{status: string, data: {requests: {id: string, sender: User, createdAt: string}[]}}>('/friends/requests');
      return response.data.data.requests;
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      throw error;
    }
  },
  
  // Get sent friend requests
  getSentRequests: async (): Promise<{id: string, receiver: User, createdAt: string}[]> => {
    try {
      const response = await API.get<{status: string, data: {requests: {id: string, receiver: User, createdAt: string}[]}}>('/friends/sent');
      return response.data.data.requests;
    } catch (error) {
      console.error('Error fetching sent requests:', error);
      throw error;
    }
  },
  
  // Get friend suggestions
  getSuggestions: async (): Promise<{user: User, mutualFriends: number}[]> => {
    try {
      const response = await API.get<{status: string, data: {suggestions: {user: User, mutualFriends: number}[]}}>('/friends/suggestions');
      return response.data.data.suggestions;
    } catch (error) {
      console.error('Error fetching friend suggestions:', error);
      throw error;
    }
  },
  
  // Send friend request
  sendRequest: async (receiverId: string): Promise<{id: string, receiver: User}> => {
    try {
      const response = await API.post<{status: string, data: {friendRequest: {id: string, receiver: User}}}>('/friends/requests', { receiverId });
      return response.data.data.friendRequest;
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  },
  
  // Accept friend request
  acceptRequest: async (requestId: string): Promise<{id: string, sender: User}> => {
    try {
      const response = await API.patch<{status: string, data: {friendRequest: {id: string, sender: User}}}>(`/friends/requests/${requestId}/accept`);
      return response.data.data.friendRequest;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      throw error;
    }
  },
  
  // Decline friend request
  declineRequest: async (requestId: string): Promise<{id: string}> => {
    try {
      const response = await API.patch<{status: string, data: {friendRequest: {id: string}}}>(`/friends/requests/${requestId}/decline`);
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
