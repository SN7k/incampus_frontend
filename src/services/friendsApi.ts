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
    email: user.email,
    course: user.course,
    batch: user.batch
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
  priority: number;
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
    pendingRequests: FriendRequest[];
  };
}

interface SentRequestsResponse {
  status: string;
  data: {
    sentRequests: FriendRequest[];
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
      const friends = response.data.data.friends || [];
      return friends.map(transformUser);
    } catch (error) {
      console.error('Error fetching friends list:', error);
      return []; // Return empty array on error
    }
  },

  // Get pending friend requests (both sent and received)
  getPendingRequests: async (): Promise<FriendRequest[]> => {
    try {
      console.log('FriendsApi: Fetching pending requests...');
      const response = await API.get<FriendRequestsResponse>('/friends/pending-requests');
      console.log('FriendsApi: Pending requests response:', response.data);
      console.log('FriendsApi: Response data structure:', {
        status: response.data.status,
        hasData: !!response.data.data,
        dataKeys: response.data.data ? Object.keys(response.data.data) : 'no data',
        pendingRequests: response.data.data?.pendingRequests,
        requests: (response.data.data as any)?.requests
      });
      const requests = response.data.data.pendingRequests || [];
      console.log('FriendsApi: Parsed requests:', requests);
      const transformedRequests = requests.map(request => ({
        ...request,
        sender: transformUser(request.sender),
        receiver: transformUser(request.receiver)
      }));
      console.log('FriendsApi: Transformed requests:', transformedRequests);
      return transformedRequests;
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      return []; // Return empty array on error
    }
  },

  // Get sent friend requests
  getSentRequests: async (): Promise<FriendRequest[]> => {
    try {
      console.log('FriendsApi: Fetching sent requests...');
      const response = await API.get<SentRequestsResponse>('/friends/sent-requests');
      console.log('FriendsApi: Sent requests response:', response.data);
      const requests = response.data.data.sentRequests || [];
      console.log('FriendsApi: Parsed sent requests:', requests);
      const transformedRequests = requests.map(request => ({
        ...request,
        sender: transformUser(request.sender),
        receiver: transformUser(request.receiver)
      }));
      console.log('FriendsApi: Transformed sent requests:', transformedRequests);
      return transformedRequests;
    } catch (error) {
      console.error('Error fetching sent requests:', error);
      return []; // Return empty array on error
    }
  },

  // Get friend suggestions
  getFriendSuggestions: async (): Promise<FriendSuggestion[]> => {
    try {
      console.log('FriendsApi: Fetching friend suggestions...');
      const response = await API.get<FriendSuggestionsResponse>('/friends/suggestions');
      console.log('FriendsApi: Suggestions response:', response.data);
      const suggestions = response.data.data.suggestions || [];
      console.log('FriendsApi: Parsed suggestions:', suggestions);
      
      // Ensure each suggestion has the required properties
      const transformedSuggestions = suggestions.map(suggestion => ({
        user: transformUser(suggestion.user),
        mutualFriends: suggestion.mutualFriends || 0,
        relevance: suggestion.relevance || [],
        priority: suggestion.priority || 0
      }));
      
      console.log('FriendsApi: Transformed suggestions:', transformedSuggestions);
      return transformedSuggestions;
    } catch (error) {
      console.error('Error fetching friend suggestions:', error);
      return []; // Return empty array on error
    }
  },

  // Send friend request
  sendFriendRequest: async (receiverId: string): Promise<FriendRequest> => {
    try {
      console.log('FriendsApi: Sending friend request to:', receiverId);
      const response = await API.post<FriendRequestResponse>('/friends/send-request', {
        receiverId
      });
      console.log('FriendsApi: Friend request response:', response.data);
      const request = response.data.data.friendRequest;
      console.log('FriendsApi: Parsed friend request:', request);
      const transformedRequest = {
        ...request,
        sender: transformUser(request.sender),
        receiver: transformUser(request.receiver)
      };
      console.log('FriendsApi: Transformed friend request:', transformedRequest);
      return transformedRequest;
    } catch (error) {
      console.error('FriendsApi: Error sending friend request:', error);
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

  // Cancel sent friend request
  cancelSentRequest: async (requestId: string): Promise<{ status: string; message: string }> => {
    try {
      const response = await API.delete<{ status: string; message: string }>(`/friends/cancel-request/${requestId}`);
      return response.data;
    } catch (error) {
      console.error('Error canceling sent friend request:', error);
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
  },

  // Check if a user is in friends list
  isFriend: async (userId: string): Promise<boolean> => {
    try {
      const friends = await friendsApi.getFriendsList();
      return friends.some(friend => friend.id === userId);
    } catch (error) {
      console.error('Error checking if user is friend:', error);
      return false;
    }
  }
};

export default friendsApi;
