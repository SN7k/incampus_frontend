import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { mockUsers } from '../data/mockData';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';
// Import environment helper
import { isProduction } from '../utils/environment';
// Import token manager for robust token handling
import * as tokenManager from '../utils/tokenManager';

// API base URL for backend calls - always use production URL
const API_BASE_URL = 'https://incampus-backend.onrender.com';
console.log('FriendContext using API base URL:', API_BASE_URL);
console.log('FriendContext running in production mode:', isProduction);

interface FriendState {
  friends: User[];
  friendRequests: User[];
  pendingRequests: User[];
  suggestedFriends: User[];
  loading: boolean;
  error: string | null;
}

interface FriendContextType extends FriendState {
  sendFriendRequest: (userId: string) => Promise<void>;
  acceptFriendRequest: (userId: string) => Promise<void>;
  rejectFriendRequest: (userId: string) => Promise<void>;
  removeFriend: (userId: string) => Promise<void>;
  searchUsers: (query: string) => Promise<User[]>;
}

const initialState: FriendState = {
  friends: [],
  friendRequests: [],
  pendingRequests: [],
  suggestedFriends: [],
  loading: false,
  error: null
};

const FriendContext = createContext<FriendContextType>({
  ...initialState,
  sendFriendRequest: async () => {},
  acceptFriendRequest: async () => {},
  rejectFriendRequest: async () => {},
  removeFriend: async () => {},
  searchUsers: async () => []
});

export const useFriends = () => useContext(FriendContext);

export const FriendProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [state, setState] = useState<FriendState>(initialState);
  
  // Load initial friend data when user changes
  useEffect(() => {
    if (user) {
      loadFriendData();
    } else {
      setState(initialState);
    }
  }, [user]);
  
  // Periodically check for new friend requests (every 30 seconds)
  useEffect(() => {
    if (!user) return;
    
    const intervalId = setInterval(() => {
      // Always refresh in production mode
      loadFriendData(true); // Silent refresh (no loading state)
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [user]);
  
  // Helper function to use fallback data from localStorage or generate mock data
  const useFallbackData = (silent = false) => {
    // Try to load from localStorage first
    const savedData = localStorage.getItem(`friendData_${user?.id}`);
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setState({
          ...parsedData,
          loading: false,
          error: null
        });
        return;
      } catch (e) {
        // Only log errors in non-silent mode
        if (!silent) {
          console.log('Error parsing saved friend data, generating new mock data');
        }
      }
    }
    
    // If no saved data or parsing error, generate mock data
    // Filter out current user
    const otherUsers = mockUsers.filter(u => u.id !== user?.id);
    
    // Randomly select some users as friends (30%)
    const friends = otherUsers
      .filter(() => Math.random() < 0.3)
      .slice(0, 5);
    
    // Randomly select some users as friend requests (20%)
    const friendRequests = otherUsers
      .filter(u => !friends.some(f => f.id === u.id) && Math.random() < 0.2)
      .slice(0, 3);
    
    // Randomly select some users as pending requests (10%)
    const pendingRequests = otherUsers
      .filter(u => 
        !friends.some(f => f.id === u.id) && 
        !friendRequests.some(f => f.id === u.id) && 
        Math.random() < 0.1
      )
      .slice(0, 2);
    
    // The rest are suggested friends
    const suggestedFriends = otherUsers
      .filter(u => 
        !friends.some(f => f.id === u.id) && 
        !friendRequests.some(f => f.id === u.id) &&
        !pendingRequests.some(f => f.id === u.id)
      )
      .slice(0, 8);
    
    const newState = {
      friends,
      friendRequests,
      pendingRequests,
      suggestedFriends,
      loading: false,
      error: null
    };
    
    setState(newState);
    
    if (user?.id) {
      localStorage.setItem(`friendData_${user.id}`, JSON.stringify(newState));
    }
  };
  
  // Load friend data from the backend API
  const loadFriendData = async (silent = false) => {
    if (!user) return;
    
    if (!silent) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    }
    
    try {
      // Get auth token using the robust tokenManager
      const token = tokenManager.getToken();
      
      // Log token retrieval attempt
      console.log('Attempting to retrieve token using tokenManager in FriendContext');
      
      if (!token) {
        // In production mode, authentication token is required
        throw new Error('Authentication token not found - please log in again');
      }
      
      // Refresh token storage to ensure it's available in all locations
      tokenManager.refreshTokenStorage();
      
      // Get the authorization header for the API request
      const authHeader = tokenManager.getAuthHeader();
      if (!authHeader) {
        throw new Error('Failed to create authorization header');
      }
      
      // Log token usage
      console.log('Using tokenManager for friend data request');
      
      // Fetch friend data from the API
      try {
        const response = await fetch(`${API_BASE_URL}/api/friends`, {
          method: 'GET',
          headers: {
            'Authorization': authHeader, // Use the authorization header from tokenManager
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          mode: 'cors' // Explicitly set CORS mode
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch friend data: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Update state with the data from the API
        const newState = {
          friends: data.friends || [],
          friendRequests: data.friendRequests || [],
          pendingRequests: data.pendingRequests || [],
          suggestedFriends: data.suggestedFriends || [],
          loading: false,
          error: null
        };
        
        setState(newState);
        
        // Store in localStorage as a cache
        localStorage.setItem(`friendData_${user.id}`, JSON.stringify(newState));
      } catch (apiError: unknown) {
        // API error - fall back to local data in development mode
        if (import.meta.env.DEV) {
          const errorMessage = apiError instanceof Error ? apiError.message : 'Unknown error';
          console.log('API error, using local data:', errorMessage);
          useFallbackData(silent);
          return;
        } else {
          throw apiError;
        }
      }
    } catch (error) {
      // Only log errors in non-silent mode to avoid console spam
      if (!silent) {
        console.error('Error loading friend data:', error);
      
      useFallbackData(silent);
      }
    }
  };
  
  // Save current state to localStorage
  const saveState = (newState: Partial<FriendState>) => {
    const updatedState = { ...state, ...newState };
    setState(updatedState);
    
    if (user) {
      localStorage.setItem(`friendData_${user.id}`, JSON.stringify(updatedState));
    }
  };
  
  // Send a friend request to another user
  const sendFriendRequest = async (userId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Get auth token using the robust tokenManager
      const token = tokenManager.getToken();
      
      // Log token retrieval attempt
      console.log('Attempting to retrieve token using tokenManager in sendFriendRequest');
      
      if (!token) {
        // In production mode, authentication token is required
        throw new Error('Authentication token not found - please log in again');
      }
      
      // Refresh token storage to ensure it's available in all locations
      tokenManager.refreshTokenStorage();
      
      // Get the authorization header for the API request
      const authHeader = tokenManager.getAuthHeader();
      if (!authHeader) {
        throw new Error('Failed to create authorization header');
      }
      
      // Token is already validated by tokenManager
      
      // Send friend request to the API
      const response = await fetch(`${API_BASE_URL}/api/friends/request/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader, // Use the authorization header from tokenManager
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors' // Explicitly set CORS mode
      });
      
      if (!response.ok) {
        throw new Error(`Failed to send friend request: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Find the user
      const targetUser = mockUsers.find(u => u.id === userId) || {
        id: userId,
        name: data.targetUser?.name || 'User',
        email: data.targetUser?.email || '',
        universityId: data.targetUser?.universityId || '',
        role: data.targetUser?.role || 'student',
        avatar: data.targetUser?.avatar || ''
      } as User;
      
      // Add to pending requests
      const pendingRequests = [...state.pendingRequests, targetUser];
      
      // Remove from suggested friends
      const suggestedFriends = state.suggestedFriends.filter(u => u.id !== userId);
      
      saveState({ 
        pendingRequests,
        suggestedFriends,
        loading: false
      });
      
      // Show success toast
      toast.success('Friend request sent!');
    } catch (error) {
      console.error('Error sending friend request:', error);
      
      // If in development mode, continue with local update
      if (import.meta.env.DEV) {
        console.log('Development mode: Continuing with local friend request update');
        
        // Find the user
        const targetUser = mockUsers.find(u => u.id === userId);
        
        if (!targetUser) {
          throw new Error('User not found');
        }
        
        // Add to pending requests
        const pendingRequests = [...state.pendingRequests, targetUser];
        
        // Remove from suggested friends
        const suggestedFriends = state.suggestedFriends.filter(u => u.id !== userId);
        
        saveState({ 
          pendingRequests,
          suggestedFriends,
          loading: false
        });
        
        toast.success('Friend request sent! (Development mode)');
      } else {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Failed to send friend request' 
        }));
        
        toast.error('Failed to send friend request');
      }
    }
  };
  
  // Accept a friend request
  const acceptFriendRequest = async (userId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Send accept request to the API
      const response = await fetch(`${API_BASE_URL}/api/friends/accept/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to accept friend request: ${response.status}`);
      }
      
      await response.json();
      
      // Find the user in friend requests
      const requestUser = state.friendRequests.find(u => u.id === userId);
      
      if (!requestUser) {
        throw new Error('Friend request not found');
      }
      
      // Add to friends
      const friends = [...state.friends, requestUser];
      
      // Remove from friend requests
      const friendRequests = state.friendRequests.filter(u => u.id !== userId);
      
      saveState({ 
        friends,
        friendRequests,
        loading: false
      });
      
      // Show success toast
      toast.success('Friend request accepted!');
    } catch (error) {
      console.error('Error accepting friend request:', error);
      
      // If in development mode, continue with local update
      if (import.meta.env.DEV) {
        console.log('Development mode: Continuing with local friend request acceptance');
        
        // Find the user in friend requests
        const requestUser = state.friendRequests.find(u => u.id === userId);
        
        if (!requestUser) {
          throw new Error('Friend request not found');
        }
        
        // Add to friends
        const friends = [...state.friends, requestUser];
        
        // Remove from friend requests
        const friendRequests = state.friendRequests.filter(u => u.id !== userId);
        
        saveState({ 
          friends,
          friendRequests,
          loading: false
        });
        
        toast.success('Friend request accepted! (Development mode)');
      } else {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Failed to accept friend request' 
        }));
        
        toast.error('Failed to accept friend request');
      }
    }
  };
  
  // Reject a friend request
  const rejectFriendRequest = async (userId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Send reject request to the API
      const response = await fetch(`${API_BASE_URL}/api/friends/reject/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to reject friend request: ${response.status}`);
      }
      
      await response.json();
      
      // Remove from friend requests
      const friendRequests = state.friendRequests.filter(u => u.id !== userId);
      
      saveState({ 
        friendRequests,
        loading: false
      });
      
      // Show success toast
      toast.success('Friend request rejected');
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      
      // If in development mode, continue with local update
      if (import.meta.env.DEV) {
        console.log('Development mode: Continuing with local friend request rejection');
        
        // Remove from friend requests
        const friendRequests = state.friendRequests.filter(u => u.id !== userId);
        
        saveState({ 
          friendRequests,
          loading: false
        });
      } else {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Failed to reject friend request' 
        }));
        
        toast.error('Failed to reject friend request');
      }
    }
  };
  
  // Remove a friend
  const removeFriend = async (userId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Send remove friend request to the API
      const response = await fetch(`${API_BASE_URL}/api/friends/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to remove friend: ${response.status}`);
      }
      
      await response.json();
      
      // Remove from friends
      const friends = state.friends.filter(u => u.id !== userId);
      
      saveState({ 
        friends,
        loading: false
      });
      
      // Show success toast
      toast.success('Friend removed');
    } catch (error) {
      console.error('Error removing friend:', error);
      
      // If in development mode, continue with local update
      if (import.meta.env.DEV) {
        console.log('Development mode: Continuing with local friend removal');
        
        // Remove from friends
        const friends = state.friends.filter(u => u.id !== userId);
        
        saveState({ 
          friends,
          loading: false
        });
      } else {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Failed to remove friend' 
        }));
        
        toast.error('Failed to remove friend');
      }
    }
  };
  
  // Search users
  const searchUsers = async (query: string): Promise<User[]> => {
    if (!query.trim()) return [];
    
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Search users via the API
      const response = await fetch(`${API_BASE_URL}/api/users/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to search users: ${response.status}`);
      }
      
      const data = await response.json();
      return data.users || [];
    } catch (error) {
      console.error('Error searching users:', error);
      
      // If in development mode, fall back to local search
      if (import.meta.env.DEV) {
        console.log('Development mode: Falling back to local user search');
        
        const searchTerm = query.toLowerCase().trim();
        
        // Filter users by name or email containing the search term
        return mockUsers.filter(user => 
          user.name.toLowerCase().includes(searchTerm) || 
          (user.email && user.email.toLowerCase().includes(searchTerm))
        );
      }
      
      return [];
    }
  };
  
  return (
    <FriendContext.Provider 
      value={{ 
        ...state, 
        sendFriendRequest, 
        acceptFriendRequest, 
        rejectFriendRequest, 
        removeFriend,
        searchUsers
      }}
    >
      {children}
    </FriendContext.Provider>
  );
};
