import axiosInstance from '../utils/axios';
import { User } from '../types';

interface ApiResponse<T> {
  data: T;
  message: string;
  status: string;
}

export const friendService = {
  // Set auth token in axios instance
  setAuthToken: (token: string): void => {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  // Get friend suggestions
  getSuggestions: async (): Promise<User[]> => {
    const response = await axiosInstance.get<ApiResponse<User[]>>('/api/friends/suggestions');
    return response.data.data;
  },

  // Search users
  searchUsers: async (query: string): Promise<User[]> => {
    const response = await axiosInstance.get<ApiResponse<User[]>>(`/api/users/search?q=${encodeURIComponent(query)}`);
    return response.data.data;
  },

  // Get friends list
  getFriends: async (): Promise<User[]> => {
    const response = await axiosInstance.get<ApiResponse<User[]>>('/api/friends');
    return response.data.data;
  },

  // Get friend requests
  getFriendRequests: async (): Promise<User[]> => {
    const response = await axiosInstance.get<ApiResponse<User[]>>('/api/friends/requests');
    return response.data.data;
  },

  // Get sent friend requests
  getSentRequests: async (): Promise<User[]> => {
    const response = await axiosInstance.get<ApiResponse<User[]>>('/api/friends/sent-requests');
    return response.data.data;
  },

  // Send friend request
  sendFriendRequest: async (userId: string): Promise<void> => {
    await axiosInstance.post('/api/friends/request', { receiverId: userId });
  },

  // Accept friend request
  acceptFriendRequest: async (userId: string): Promise<void> => {
    await axiosInstance.post(`/api/friends/accept/${userId}`);
  },

  // Reject friend request
  rejectFriendRequest: async (userId: string): Promise<void> => {
    await axiosInstance.post(`/api/friends/reject/${userId}`);
  },

  // Remove friend
  removeFriend: async (userId: string): Promise<void> => {
    await axiosInstance.delete(`/api/friends/${userId}`);
  }
}; 