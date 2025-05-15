import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { mockUsers } from '../data/mockData';
import { useAuth } from './AuthContext';

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
  searchUsers: (query: string) => User[];
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
  searchUsers: () => []
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
  
  // Load friend data from localStorage or initialize with mock data
  const loadFriendData = () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Try to load from localStorage first
      const savedFriendData = localStorage.getItem(`friendData_${user?.id}`);
      
      if (savedFriendData) {
        const parsedData = JSON.parse(savedFriendData);
        setState({
          ...parsedData,
          loading: false,
          error: null
        });
      } else {
        // Initialize with mock data
        // For demo purposes, we'll set up some initial friend relationships
        const mockFriends: User[] = [mockUsers[2]]; // Prof. Robert is a friend
        const mockFriendRequests: User[] = [mockUsers[0]]; // John sent a request
        
        // Suggested friends are users who aren't friends or haven't sent requests
        const mockSuggestions = mockUsers.filter(u => 
          u.id !== user?.id && 
          !mockFriends.some(f => f.id === u.id) &&
          !mockFriendRequests.some(r => r.id === u.id)
        );
        
        const newState = {
          friends: mockFriends,
          friendRequests: mockFriendRequests,
          pendingRequests: [],
          suggestedFriends: mockSuggestions,
          loading: false,
          error: null
        };
        
        setState(newState);
        
        // Save to localStorage
        localStorage.setItem(`friendData_${user?.id}`, JSON.stringify(newState));
      }
    } catch (error) {
      console.error('Error loading friend data:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to load friend data' 
      }));
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
    } catch (error) {
      console.error('Error sending friend request:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to send friend request' 
      }));
    }
  };
  
  // Accept a friend request
  const acceptFriendRequest = async (userId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
    } catch (error) {
      console.error('Error accepting friend request:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to accept friend request' 
      }));
    }
  };
  
  // Reject a friend request
  const rejectFriendRequest = async (userId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove from friend requests
      const friendRequests = state.friendRequests.filter(u => u.id !== userId);
      
      saveState({ 
        friendRequests,
        loading: false
      });
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to reject friend request' 
      }));
    }
  };
  
  // Remove a friend
  const removeFriend = async (userId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove from friends
      const friends = state.friends.filter(u => u.id !== userId);
      
      // Add to suggested friends
      const targetUser = mockUsers.find(u => u.id === userId);
      let suggestedFriends = [...state.suggestedFriends];
      
      if (targetUser && !suggestedFriends.some(u => u.id === userId)) {
        suggestedFriends = [...suggestedFriends, targetUser];
      }
      
      saveState({ 
        friends,
        suggestedFriends,
        loading: false
      });
    } catch (error) {
      console.error('Error removing friend:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to remove friend' 
      }));
    }
  };
  
  // Search users by name or ID
  const searchUsers = (query: string): User[] => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    
    return mockUsers.filter(u => 
      u.id !== user?.id && 
      (u.name.toLowerCase().includes(lowerQuery) || 
       u.universityId.toLowerCase().includes(lowerQuery) ||
       u.email.toLowerCase().includes(lowerQuery))
    );
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
