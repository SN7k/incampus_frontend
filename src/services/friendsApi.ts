// API service for friend management
import { User } from '../types';
import API from './api';

// Friend types
export interface FriendRequest {
  id: string;
  sender: User;
  receiver: User;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface FriendSuggestion {
  user: User;
  mutualFriends: number;
  relevance: string[];
}

// API response types
interface FriendsResponse {
  status: string;
  data: {
    friends: User[];
  };
}

interface FriendRequestsResponse {
  status: string;
  data: {
    requests: FriendRequest[];
  };
}

interface FriendSuggestionsResponse {
  status: string;
  data: {
    suggestions: FriendSuggestion[];
  };
}

interface FriendRequestResponse {
  status: string;
  data: {
    friendRequest: FriendRequest;
  };
}

// Friends API service
export const friendsApi = {
  // Get friends list
  getFriendsList: async (): Promise<User[]> => {
    try {
      const response = await API.get<FriendsResponse>('/friends/friends-list');
      return response.data.data.friends;
    } catch (error) {
      console.error('Error fetching friends list:', error);
      throw error;
    }
  },

  // Get pending friend requests (both sent and received)
  getPendingRequests: async (): Promise<FriendRequest[]> => {
    try {
      const response = await API.get<FriendRequestsResponse>('/friends/pending-requests');
      return response.data.data.requests;
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      throw error;
    }
  },

  // Get friend suggestions
  getFriendSuggestions: async (): Promise<FriendSuggestion[]> => {
    try {
      const response = await API.get<FriendSuggestionsResponse>('/friends/suggestions');
      return response.data.data.suggestions;
    } catch (error) {
      console.error('Error fetching friend suggestions:', error);
      throw error;
    }
  },

  // Send friend request
  sendFriendRequest: async (receiverId: string): Promise<FriendRequest> => {
    try {
      const response = await API.post<FriendRequestResponse>('/friends/send-request', {
        receiverId
      });
      return response.data.data.friendRequest;
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  },

  // Accept friend request
  acceptFriendRequest: async (requestId: string): Promise<FriendRequest> => {
    try {
      const response = await API.patch<FriendRequestResponse>(`/friends/accept-request/${requestId}`);
      return response.data.data.friendRequest;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      throw error;
    }
  },

  // Decline friend request
  declineFriendRequest: async (requestId: string): Promise<FriendRequest> => {
    try {
      const response = await API.patch<FriendRequestResponse>(`/friends/decline-request/${requestId}`);
      return response.data.data.friendRequest;
    } catch (error) {
      console.error('Error declining friend request:', error);
      throw error;
    }
  },

  // Unfriend
  unfriend: async (friendId: string): Promise<{ status: string; message: string }> => {
    try {
      const response = await API.delete<{ status: string; message: string }>(`/friends/unfriend/${friendId}`);
      return response.data;
    } catch (error) {
      console.error('Error unfriending user:', error);
      throw error;
    }
  }
};

export default friendsApi;
