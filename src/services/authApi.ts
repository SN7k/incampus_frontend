// API service for authentication
import { User } from '../types';
import API from './api';

// Authentication API response types
export interface AuthResponse {
  status: string;
  data: {
    token: string;
    user: User;
  };
}

export interface ErrorResponse {
  status: string;
  message: string;
}

// Authentication API service
export const authApi = {
  // Register a new user
  signup: async (
    email: string, 
    password: string, 
    collegeId: string, 
    name: string, 
    role: 'student' | 'faculty'
  ): Promise<AuthResponse> => {
    try {
      const response = await API.post<AuthResponse>('/auth/signup', {
        email,
        password,
        collegeId,
        name,
        role
      });
      return response.data;
    } catch (error) {
      console.error('Error during signup:', error);
      throw error;
    }
  },

  // Login with email/universityId and password
  login: async (
    identifier: string,
    password: string,
    role: 'student' | 'faculty'
  ): Promise<AuthResponse> => {
    try {
      // Determine if identifier is email or universityId
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
      
      const payload = {
        password,
        role,
        ...(isEmail ? { email: identifier } : { universityId: identifier })
      };
      
      const response = await API.post<AuthResponse>('/auth/login', payload);
      return response.data;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  },

  // Verify OTP
  verifyOTP: async (email: string, otp: string): Promise<AuthResponse> => {
    try {
      const response = await API.post<AuthResponse>('/auth/verify-otp', {
        email,
        otp
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  },

  // Resend OTP
  resendOTP: async (email: string): Promise<{ status: string; message: string }> => {
    try {
      const response = await API.post<{ status: string; message: string }>('/auth/resend-otp', {
        email
      });
      return response.data;
    } catch (error) {
      console.error('Error resending OTP:', error);
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await API.get<{ status: string; data: { user: User } }>('/users/me');
      return response.data.data.user;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },

  // Forgot Password - send OTP to email/universityId
  forgotPassword: async (
    identifier: string,
    role: 'student' | 'faculty'
  ): Promise<{ status: string; message: string }> => {
    try {
      // Determine if identifier is email or universityId
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
      const payload = {
        role,
        ...(isEmail ? { email: identifier } : { universityId: identifier })
      };
      const response = await API.post<{ status: string; message: string }>('/auth/forgot-password', payload);
      return response.data;
    } catch (error) {
      console.error('Error sending forgot password OTP:', error);
      throw error;
    }
  },

  // Reset Password with OTP
  resetPassword: async (
    identifier: string,
    otp: string,
    newPassword: string,
    role: 'student' | 'faculty'
  ): Promise<{ status: string; message: string }> => {
    try {
      // Determine if identifier is email or universityId
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
      const payload = {
        otp,
        newPassword,
        role,
        ...(isEmail ? { email: identifier } : { universityId: identifier })
      };
      const response = await API.post<{ status: string; message: string }>('/auth/reset-password', payload);
      return response.data;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }
};

// Token management
export const tokenService = {
  // Set token in localStorage and axios headers
  setToken: (token: string): void => {
    localStorage.setItem('token', token);
    API.defaults.headers.common.Authorization = `Bearer ${token}`;
  },

  // Get token from localStorage
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  // Remove token from localStorage and axios headers
  removeToken: (): void => {
    localStorage.removeItem('token');
    delete API.defaults.headers.common.Authorization;
  },

  // Check if token exists
  hasToken: (): boolean => {
    return !!localStorage.getItem('token');
  }
};

export default authApi;
