import axios from 'axios';
import { ProfileResponse, ProfileData } from '../types/profile';

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
  getUserPosts: async (userId: string): Promise<ProfileData['posts']> => {
    try {
      const response = await API.get<{status: string, data: {posts: ProfileData['posts']}}>(`/users/${userId}/posts`);
      return response.data.data.posts;
    } catch (error) {
      console.error('Error fetching user posts:', error);
      throw error;
    }
  }
};

// Export the configured axios instance for other API calls
export default API;
