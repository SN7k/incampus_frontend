import axios from 'axios';
import { ProfileResponse, ProfileData } from '../types/profile';
<<<<<<< HEAD

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
=======
import { User, Post } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authState')
      ? JSON.parse(localStorage.getItem('authState')!).token
      : null;
    
>>>>>>> a80153d (Update frontend)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
<<<<<<< HEAD
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
=======
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      localStorage.removeItem('authState');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (identifier: string, password: string) => {
    const response = await api.post('/auth/login', { identifier, password });
    return response.data;
  },
  
  signup: async (userData: {
    email: string;
    password: string;
    collegeId: string;
    role: 'student' | 'faculty';
  }) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },
  
  verifyOTP: async (email: string, otp: string) => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    return response.data;
  },
  
  resendOTP: async (email: string) => {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  updateProfile: async (data: FormData) => {
    const response = await api.put('/auth/profile', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

// Profile API
export const profileApi = {
  getProfile: async (userId?: string) => {
    const url = userId ? `/profile/${userId}` : '/profile/me';
    const response = await api.get(url);
    return response.data;
  },
  
  updateProfile: async (profileData: FormData) => {
    const response = await api.put('/profile', profileData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  uploadAvatar: async (avatar: File) => {
    const formData = new FormData();
    formData.append('avatar', avatar);
    const response = await api.post('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

// Post API
export const postApi = {
  getFeed: async (page = 1, limit = 10) => {
    const response = await api.get(`/posts/feed?page=${page}&limit=${limit}`);
    return response.data;
  },
  
  getUserPosts: async (userId: string) => {
    const response = await api.get(`/posts/user/${userId}`);
    return response.data;
  },
  
  createPost: async (postData: FormData) => {
    const response = await api.post('/posts', postData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  likePost: async (postId: string) => {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  },
  
  addComment: async (postId: string, text: string) => {
    const response = await api.post(`/posts/${postId}/comments`, { text });
    return response.data;
  },
  
  deletePost: async (postId: string) => {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  }
};

// Friend API
export const friendApi = {
  getFriends: async () => {
    const response = await api.get('/friends');
    return response.data;
  },
  
  getFriendRequests: async () => {
    const response = await api.get('/friends/requests');
    return response.data;
  },
  
  sendFriendRequest: async (userId: string) => {
    const response = await api.post(`/friends/request/${userId}`);
    return response.data;
  },
  
  acceptFriendRequest: async (userId: string) => {
    const response = await api.put(`/friends/accept/${userId}`);
    return response.data;
  },
  
  declineFriendRequest: async (userId: string) => {
    const response = await api.put(`/friends/decline/${userId}`);
    return response.data;
  },
  
  unfriend: async (userId: string) => {
    const response = await api.delete(`/friends/${userId}`);
    return response.data;
  }
};

// Notification API
export const notificationApi = {
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },
  
  markAsRead: async (notificationId: string) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },
  
  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  }
};

// User API
export const userApi = {
  searchUsers: async (query: string) => {
    const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
  
  getUser: async (userId: string) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  getSuggestions: async () => {
    const response = await api.get('/users/suggestions');
    return response.data;
  },

  getFriends: async () => {
    const response = await api.get('/users/friends');
    return response.data;
  },
  
  sendFriendRequest: async (userId: string) => {
    const response = await api.post(`/users/friends/request/${userId}`);
    return response.data;
  },
  
  acceptFriendRequest: async (userId: string) => {
    const response = await api.post(`/users/friends/accept/${userId}`);
    return response.data;
  },
  
  rejectFriendRequest: async (userId: string) => {
    const response = await api.post(`/users/friends/reject/${userId}`);
    return response.data;
  },
  
  unfriend: async (userId: string) => {
    const response = await api.delete(`/users/friends/${userId}`);
    return response.data;
  }
};

export default api;
>>>>>>> a80153d (Update frontend)
