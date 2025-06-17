import API from './api';
import { User } from '../types';

interface UsersResponse {
  status: string;
  data: {
    users: User[];
  };
}

interface UserResponse {
  status: string;
  data: {
    user: User;
  };
}

interface SearchResponse {
  status: string;
  data: {
    users: User[];
    posts: any[];
  };
}

export const usersApi = {
  // Search users and posts
  search: async (query: string): Promise<{ users: User[]; posts: any[] }> => {
    try {
      const response = await API.get<SearchResponse>(`/users/search?q=${encodeURIComponent(query)}`);
      return response.data.data;
    } catch (error) {
      console.error('Error searching:', error);
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (userId: string): Promise<User> => {
    try {
      const response = await API.get<UserResponse>(`/users/${userId}`);
      return response.data.data.user;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await API.get<UserResponse>('/users/me');
      return response.data.data.user;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },

  // Update current user
  updateCurrentUser: async (userData: Partial<User>): Promise<User> => {
    try {
      const response = await API.patch<UserResponse>('/users/me', userData);
      return response.data.data.user;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Get user suggestions (for friend suggestions)
  getUserSuggestions: async (): Promise<User[]> => {
    try {
      const response = await API.get<{status: string, data: User[]}>('/friends/suggestions');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user suggestions:', error);
      throw new Error('An error occurred');
    }
  },

  // Upload avatar
  uploadAvatar: async (file: File): Promise<{ avatar: { url: string; publicId?: string } }> => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await API.post<{ status: string; data: { avatar: { url: string; publicId?: string } } }>('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  },

  // Upload cover photo
  uploadCoverPhoto: async (file: File): Promise<{ coverPhoto: { url: string; publicId?: string } }> => {
    try {
      const formData = new FormData();
      formData.append('coverPhoto', file);
      
      const response = await API.post<{ status: string; data: { coverPhoto: { url: string; publicId?: string } } }>('/users/cover-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error uploading cover photo:', error);
      throw error;
    }
  }
};

export default usersApi; 