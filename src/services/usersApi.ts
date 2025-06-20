import API from './api';
import { User } from '../types';

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

interface OTPResponse {
  status: string;
  message: string;
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
      // Always convert id to string for each user
      return response.data.data.map(user => {
        const anyUser = user as any;
        return {
          ...user,
          id: (user.id || anyUser._id) ? String(user.id || anyUser._id) : '',
        };
      });
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
  },

  // Email change OTP functions
  sendEmailChangeOTP: async (newEmail: string): Promise<OTPResponse> => {
    try {
      const response = await API.post<OTPResponse>('/users/send-email-change-otp', { newEmail });
      return response.data;
    } catch (error) {
      console.error('Error sending email change OTP:', error);
      throw error;
    }
  },

  verifyEmailChangeOTP: async (otp: string, newEmail: string): Promise<UserResponse> => {
    try {
      const response = await API.post<UserResponse>('/users/verify-email-change-otp', { otp, newEmail });
      return response.data;
    } catch (error) {
      console.error('Error verifying email change OTP:', error);
      throw error;
    }
  },

  // Password change OTP functions
  sendPasswordChangeOTP: async (currentPassword: string): Promise<OTPResponse> => {
    try {
      const response = await API.post<OTPResponse>('/users/send-password-change-otp', { currentPassword });
      return response.data;
    } catch (error) {
      console.error('Error sending password change OTP:', error);
      throw error;
    }
  },

  verifyPasswordChangeOTP: async (otp: string, newPassword: string): Promise<OTPResponse> => {
    try {
      const response = await API.post<OTPResponse>('/users/verify-password-change-otp', { otp, newPassword });
      return response.data;
    } catch (error) {
      console.error('Error verifying password change OTP:', error);
      throw error;
    }
  },

  // Account deletion OTP functions
  sendDeleteAccountOTP: async (): Promise<OTPResponse> => {
    try {
      const response = await API.post<OTPResponse>('/users/send-delete-account-otp');
      return response.data;
    } catch (error) {
      console.error('Error sending delete account OTP:', error);
      throw error;
    }
  },

  verifyDeleteAccountOTP: async (otp: string): Promise<OTPResponse> => {
    try {
      const response = await API.post<OTPResponse>('/users/verify-delete-account-otp', { otp });
      return response.data;
    } catch (error) {
      console.error('Error verifying delete account OTP:', error);
      throw error;
    }
  }
};

export default usersApi; 