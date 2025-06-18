// API service for friend management
import { User } from '../types';
import API from './api';

// Helper function to transform backend data (convert _id to id)
const transformUser = (user: any): User => {
  return {
    id: user._id || user.id,
    name: user.name,
    universityId: user.universityId,
    role: user.role,
    avatar: user.avatar,
    bio: user.bio,
    coverPhoto: user.coverPhoto,
    email: user.email
  };
};

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
      const friends = response.data.data.friends;
      return friends.map(transformUser);
    } catch (error) {
      console.error('Error fetching friends list:', error);
      throw error;
    }
  },

  // Get pending friend requests (both sent and received)
  getPendingRequests: async (): Promise<FriendRequest[]> => {
    try {
      const response = await API.get<FriendRequestsResponse>('/friends/pending-requests');
      const requests = response.data.data.requests;
      return requests.map(request => ({
        ...request,
        sender: transformUser(request.sender),
        receiver: transformUser(request.receiver)
      }));
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      throw error;
    }
  },

  // Get friend suggestions
  getFriendSuggestions: async (): Promise<FriendSuggestion[]> => {
    try {
      const response = await API.get<FriendSuggestionsResponse>('/friends/suggestions');
      const suggestions = response.data.data.suggestions;
      return suggestions.map(suggestion => ({
        ...suggestion,
        user: transformUser(suggestion.user)
      }));
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
      const request = response.data.data.friendRequest;
      return {
        ...request,
        sender: transformUser(request.sender),
        receiver: transformUser(request.receiver)
      };
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  },

  // Accept friend request
  acceptFriendRequest: async (requestId: string): Promise<FriendRequest> => {
    try {
      const response = await API.patch<FriendRequestResponse>(`/friends/accept-request/${requestId}`);
      const request = response.data.data.friendRequest;
      return {
        ...request,
        sender: transformUser(request.sender),
        receiver: transformUser(request.receiver)
      };
    } catch (error) {
      console.error('Error accepting friend request:', error);
      throw error;
    }
  },

  // Decline friend request
  declineFriendRequest: async (requestId: string): Promise<FriendRequest> => {
    try {
      const response = await API.patch<FriendRequestResponse>(`/friends/decline-request/${requestId}`);
      const request = response.data.data.friendRequest;
      return {
        ...request,
        sender: transformUser(request.sender),
        receiver: transformUser(request.receiver)
      };
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
