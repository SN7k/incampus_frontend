import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
<<<<<<< HEAD
import { Users, UserPlus, UserCheck, MoreVertical, UserMinus, Check, X, Loader } from 'lucide-react';
import { mockUsers } from '../data/mockData';
import { friendsApi } from '../services/friendsApi';
import { USE_MOCK_DATA } from '../utils/mockDataTransition';
// User type is used in type annotations

// Create mock data from mockUsers
const createMockFriend = (user: any) => ({
  id: parseInt(user.id),
  name: user.name,
  avatar: user.avatar,
  department: user.role === 'faculty' ? 'Faculty' : 'Computer Science'
});

const createMockSuggestion = (user: any) => ({
  id: parseInt(user.id),
  name: user.name,
  avatar: user.avatar,
  department: user.role === 'faculty' ? 'Faculty' : 'Computer Science',
  mutualFriends: Math.floor(Math.random() * 5) + 1,
  relevance: [] as string[] // Array to store relevance indicators like 'Same Year', 'Same Department'
});

// We'll initialize these in the component to filter out the current user

type FriendTab = 'friends' | 'requests' | 'suggestions';

// No toast notifications as per user request

=======
import { Users, UserPlus, UserCheck, MoreVertical, UserMinus, Check, X } from 'lucide-react';
import { friendApi, userApi } from '../services/api';
import { User } from '../types';

// Define interfaces for our data structures
interface Friend {
  id: number;
  name: string;
  avatar: string;
  department: string;
}

interface FriendRequest extends Friend {
  mutualFriends: number;
}

interface Suggestion extends FriendRequest {
  relevance: string[];
}

type FriendTab = 'friends' | 'requests' | 'suggestions';

>>>>>>> a80153d (Update frontend)
const Friends: React.FC = () => {
  const { user } = useAuth();
  
  // Initialize activeTab from localStorage if available
  const [activeTab, setActiveTab] = useState<FriendTab>(() => {
    const savedTab = localStorage.getItem('friendsActiveTab');
<<<<<<< HEAD
    // Clear the localStorage value after reading it
=======
>>>>>>> a80153d (Update frontend)
    if (savedTab) {
      localStorage.removeItem('friendsActiveTab');
    }
    return (savedTab === 'friends' || savedTab === 'requests' || savedTab === 'suggestions') 
      ? savedTab as FriendTab 
      : 'friends';
  });
  
<<<<<<< HEAD
  // Search functionality removed as requested
  
=======
>>>>>>> a80153d (Update frontend)
  // State to track dropdown menus for each friend
  const [friendDropdowns, setFriendDropdowns] = useState<{[key: string]: boolean}>({});
  
  // Ref for dropdown menus to detect outside clicks
  const dropdownRefs = useRef<{[key: string]: React.RefObject<HTMLDivElement>}>({});
  
  // State for tracking sent friend requests
<<<<<<< HEAD
  const [sentRequests, setSentRequests] = useState<Array<{
    id: number | string;
    name: string;
    avatar: string;
    department: string;
    status: 'pending' | 'accepted' | 'declined';
  }>>([]);
  
  // State for API loading and errors
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Helper function to extract year from university ID (e.g., 'BWU/BCA/20/001' -> '20')
=======
  const [sentRequests, setSentRequests] = useState<Array<FriendRequest & { status: 'pending' | 'accepted' | 'declined' }>>([]);
  
  // State for friends, requests, and suggestions
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to extract year from university ID
>>>>>>> a80153d (Update frontend)
  const extractYear = (universityId: string): string => {
    const parts = universityId.split('/');
    return parts.length >= 3 ? parts[2] : '';
  };
  
<<<<<<< HEAD
  // Helper function to extract department from university ID (e.g., 'BWU/BCA/20/001' -> 'BCA')
=======
  // Helper function to extract department from university ID
>>>>>>> a80153d (Update frontend)
  const extractDepartment = (universityId: string): string => {
    const parts = universityId.split('/');
    return parts.length >= 2 ? parts[1] : '';
  };

<<<<<<< HEAD
  // Initialize state for friends, requests, and suggestions
  const [friends, setFriends] = useState<Array<{
    id: number | string;
    name: string;
    avatar: string;
    department: string;
  }>>([]);
  
  const [friendRequests, setFriendRequests] = useState<Array<{
    id: number | string;
    name: string;
    avatar: string;
    department: string;
    mutualFriends?: number;
    relevance?: string[];
  }>>([]);
  
  const [suggestions, setSuggestions] = useState<Array<{
    id: number | string;
    name: string;
    avatar: string;
    department: string;
    mutualFriends: number;
    relevance: string[];
  }>>([]);
  
  // Load friends data
  useEffect(() => {
    if (!user) return;
    
    const loadFriendsData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (USE_MOCK_DATA) {
          // Load mock data
          // Friends
          const mockFriends = mockUsers
            .filter(mockUser => mockUser.id !== user.id)
            .slice(0, 2)
            .map(mockUser => createMockFriend(mockUser));
          setFriends(mockFriends);
          
          // Friend requests
          const mockRequests = mockUsers
            .filter(mockUser => mockUser.id !== user.id)
            .slice(2, 3)
            .map(mockUser => createMockSuggestion(mockUser));
          setFriendRequests(mockRequests);
          
          // Friend suggestions
          const currentUserYear = extractYear(user.universityId);
          const currentUserDept = extractDepartment(user.universityId);
          
          const mockSuggestions = mockUsers
            .filter(mockUser => mockUser.id !== user.id)
            .sort((a, b) => {
              const aYear = extractYear(a.universityId);
              const aDept = extractDepartment(a.universityId);
              const bYear = extractYear(b.universityId);
              const bDept = extractDepartment(b.universityId);
              
              // Calculate relevance score (higher is more relevant)
              const aScore = (aYear === currentUserYear ? 2 : 0) + (aDept === currentUserDept ? 3 : 0);
              const bScore = (bYear === currentUserYear ? 2 : 0) + (bDept === currentUserDept ? 3 : 0);
              
              // Sort by relevance score (descending)
              return bScore - aScore;
            })
            .slice(0, 5) // Get top 5 most relevant suggestions
            .map(mockUser => {
              const suggestion = createMockSuggestion(mockUser);
              // Add relevance indicators
              const year = extractYear(mockUser.universityId);
              const dept = extractDepartment(mockUser.universityId);
              suggestion.relevance = [];
              if (year === currentUserYear) {
                suggestion.relevance.push('Same Year');
              }
              if (dept === currentUserDept) {
                suggestion.relevance.push('Same Department');
              }
              return suggestion;
            });
          setSuggestions(mockSuggestions);
        } else {
          // Load data from API
          // Get friends list
          const friendsList = await friendsApi.getFriendsList();
          const formattedFriends = friendsList.map(friend => ({
            id: friend.id,
            name: friend.name,
            avatar: friend.avatar,
            department: friend.role === 'faculty' ? 'Faculty' : 'Computer Science'
          }));
          setFriends(formattedFriends);
          
          // Get pending requests
          const pendingRequests = await friendsApi.getPendingRequests();
          const formattedRequests = pendingRequests
            .filter(request => request.receiver.id === user.id) // Only show received requests
            .map(request => ({
              id: request.id,
              name: request.sender.name,
              avatar: request.sender.avatar,
              department: request.sender.role === 'faculty' ? 'Faculty' : 'Computer Science',
              mutualFriends: 0, // API doesn't provide this yet
              relevance: []
            }));
          setFriendRequests(formattedRequests);
          
          // Get sent requests for tracking
          const sentRequestsData = pendingRequests
            .filter(request => request.sender.id === user.id)
            .map(request => ({
              id: request.receiver.id,
              name: request.receiver.name,
              avatar: request.receiver.avatar,
              department: request.receiver.role === 'faculty' ? 'Faculty' : 'Computer Science',
              status: 'pending' as const
            }));
          setSentRequests(sentRequestsData);
          
          // Get suggestions
          const suggestionsData = await friendsApi.getFriendSuggestions();
          const formattedSuggestions = suggestionsData.map(suggestion => ({
            id: suggestion.user.id,
            name: suggestion.user.name,
            avatar: suggestion.user.avatar,
            department: suggestion.user.role === 'faculty' ? 'Faculty' : 'Computer Science',
            mutualFriends: suggestion.mutualFriends,
            relevance: suggestion.relevance
          }));
          setSuggestions(formattedSuggestions);
        }
      } catch (error) {
        console.error('Error loading friends data:', error);
        setError('Failed to load friends data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFriendsData();
  }, [user]);
  
  // Notify the app about friend requests changes
  useEffect(() => {
    // Create and dispatch a custom event when friend requests change
=======
  // Load friends, requests, and suggestions from API
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const [friendsList, requestsList, suggestionsList] = await Promise.all([
          friendApi.getFriends(),
          friendApi.getFriendRequests(),
          userApi.getSuggestions()
        ]);

        // Transform API data to match our interfaces
        setFriends(friendsList.map((friend: User) => ({
          id: parseInt(friend.id),
          name: friend.name,
          avatar: friend.avatar,
          department: friend.role === 'faculty' ? 'Faculty' : extractDepartment(friend.universityId)
        })));

        setFriendRequests(requestsList.map((request: User) => ({
          id: parseInt(request.id),
          name: request.name,
          avatar: request.avatar,
          department: request.role === 'faculty' ? 'Faculty' : extractDepartment(request.universityId),
          mutualFriends: 0 // This would come from the API in a real implementation
        })));

        setSuggestions(suggestionsList.map((suggestion: User) => {
          const relevance: string[] = [];
          const year = extractYear(suggestion.universityId);
          const dept = extractDepartment(suggestion.universityId);
          
          if (user && year === extractYear(user.universityId)) {
            relevance.push('Same Year');
          }
          if (user && dept === extractDepartment(user.universityId)) {
            relevance.push('Same Department');
          }
          
          return {
            id: parseInt(suggestion.id),
            name: suggestion.name,
            avatar: suggestion.avatar,
            department: suggestion.role === 'faculty' ? 'Faculty' : dept,
            mutualFriends: 0, // This would come from the API in a real implementation
            relevance
          };
        }));
      } catch (err) {
        console.error('Error loading friends data:', err);
        setError('Failed to load friends data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Notify the app about friend requests changes
  useEffect(() => {
>>>>>>> a80153d (Update frontend)
    const event = new CustomEvent('friendRequestsChange', {
      detail: { hasRequests: friendRequests.length > 0 }
    });
    window.dispatchEvent(event);
  }, [friendRequests]);
<<<<<<< HEAD
  
  // No toast notifications as per user request
  
  // Navigate to user profile - completely rewritten to fix profile navigation issues
  const navigateToProfile = (userId: string | number = '') => {
    // For debugging - log the user ID we're trying to navigate to
    console.log('NAVIGATION: Going to profile ID:', userId);
    
    // First, ensure we're working with a string ID
    const userIdString = userId.toString();
    
    // IMPORTANT: We need to clear any existing navigation state first
    localStorage.clear(); // Clear all localStorage to prevent any conflicts
    
    // Set the current page to profile
    localStorage.setItem('currentPage', 'profile');
    
    // Set the profile ID if provided
    if (userIdString) {
      // Set the profile ID in localStorage
      localStorage.setItem('viewProfileUserId', userIdString);
      console.log('NAVIGATION: Set viewProfileUserId in localStorage:', userIdString);
      
      // Force a refresh of the profile page
      // We're adding a timestamp to ensure the event is unique
      const timestamp = new Date().getTime();
      console.log('NAVIGATION: Dispatching event with timestamp:', timestamp);
      
      // Dispatch the navigation event
      window.dispatchEvent(new CustomEvent('navigate', { 
        detail: { 
          page: 'profile', 
          userId: userIdString,
          timestamp: timestamp
        } 
      }));
    } else {
      console.log('NAVIGATION: Going to own profile');
      window.dispatchEvent(new CustomEvent('navigate', { 
        detail: { 
          page: 'profile',
          timestamp: new Date().getTime()
        } 
      }));
    }
  };
  
  // Handle accepting a friend request
  const handleAcceptRequest = async (requestId: number | string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (USE_MOCK_DATA) {
        // Mock implementation
        // Find the request
        const request = friendRequests.find(req => req.id === requestId);
        if (!request) return;
        
        // Check if user is already in friends list to avoid duplicates
        const isAlreadyFriend = friends.some(friend => friend.id === requestId);
        
        if (!isAlreadyFriend) {
          // Add to friends list
          setFriends(prev => [...prev, {
            id: request.id,
            name: request.name,
            avatar: request.avatar,
            department: request.department
          }]);
          
          // Dispatch event to create a notification for the sender
          if (user) {
            window.dispatchEvent(new CustomEvent('friendRequest', { 
              detail: { 
                fromUser: user.id,
                toUser: typeof request.id === 'number' ? request.id.toString() : request.id,
                requestType: 'accepted'
              } 
            }));
          }
        }
        
        // Remove from requests
        setFriendRequests(prev => prev.filter(req => req.id !== requestId));
        
        // Also remove from suggestions if present
        setSuggestions(prev => prev.filter(sug => sug.id !== requestId));
      } else {
        // Real API implementation
        // Accept the friend request
        const requestIdStr = typeof requestId === 'number' ? requestId.toString() : requestId;
        await friendsApi.acceptFriendRequest(requestIdStr);
        
        // Find the request to get user details
        const request = friendRequests.find(req => req.id === requestId);
        if (request) {
          // Add to friends list
          setFriends(prev => [...prev, {
            id: request.id,
            name: request.name,
            avatar: request.avatar,
            department: request.department
          }]);
        }
        
        // Remove from requests
        setFriendRequests(prev => prev.filter(req => req.id !== requestId));
        
        // Refresh friends data to ensure consistency
        const friendsList = await friendsApi.getFriendsList();
        const formattedFriends = friendsList.map(friend => ({
          id: friend.id,
          name: friend.name,
          avatar: friend.avatar,
          department: friend.role === 'faculty' ? 'Faculty' : 'Computer Science'
        }));
        setFriends(formattedFriends);
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      setError('Failed to accept friend request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle declining a friend request
  const handleDeclineRequest = async (requestId: number | string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (USE_MOCK_DATA) {
        // Mock implementation
        // Remove from requests
        setFriendRequests(prev => prev.filter(req => req.id !== requestId));
      } else {
        // Real API implementation
        // Decline the friend request
        const requestIdStr = typeof requestId === 'number' ? requestId.toString() : requestId;
        await friendsApi.declineFriendRequest(requestIdStr);
        
        // Remove from requests
        setFriendRequests(prev => prev.filter(req => req.id !== requestId));
      }
    } catch (error) {
      console.error('Error declining friend request:', error);
      setError('Failed to decline friend request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle adding a friend from suggestions - sends a request instead of immediately adding
  const handleAddFriend = async (suggestionId: number | string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (USE_MOCK_DATA) {
        // Mock implementation
        // Find the suggestion
        const suggestion = suggestions.find(sug => sug.id === suggestionId);
        if (!suggestion) return;
        
        // Check if user is already in friends list or if a request is already sent
        const isAlreadyFriend = friends.some(friend => friend.id === suggestionId);
        const requestAlreadySent = sentRequests.some(req => req.id === suggestionId);
        
        if (!isAlreadyFriend && !requestAlreadySent) {
          // Add to sent requests list
          setSentRequests(prev => [...prev, {
            id: suggestion.id,
            name: suggestion.name,
            avatar: suggestion.avatar,
            department: suggestion.department,
            status: 'pending'
          }]);
          
          // Dispatch event to create a notification for the recipient
          if (user) {
            console.log('Sending friend request notification:', {
              fromUser: user.id,
              toUser: typeof suggestion.id === 'number' ? suggestion.id.toString() : suggestion.id,
              requestType: 'new'
            });
            
            // Create a friend request for the current user (for demo purposes)
            // This simulates the recipient getting a notification
            window.dispatchEvent(new CustomEvent('friendRequest', { 
              detail: { 
                fromUser: typeof suggestion.id === 'number' ? suggestion.id.toString() : suggestion.id, // From the suggestion user
                toUser: user.id, // To the current user (for testing)
                requestType: 'new'
              } 
            }));
            
            // Also dispatch the original event (which would go to the recipient in a real app)
            window.dispatchEvent(new CustomEvent('friendRequest', { 
              detail: { 
                fromUser: user.id,
                toUser: typeof suggestion.id === 'number' ? suggestion.id.toString() : suggestion.id,
                requestType: 'new'
              } 
            }));
          }
          
          // In a real app, this would make an API call to send the request
          console.log(`Friend request sent to ${suggestion.name}`);
        }
        
        // Remove from suggestions
        setSuggestions(prev => prev.filter(sug => sug.id !== suggestionId));
      } else {
        // Real API implementation
        // Find the suggestion
        const suggestion = suggestions.find(sug => sug.id === suggestionId);
        if (!suggestion) return;
        
        // Send friend request via API
        const receiverId = typeof suggestionId === 'number' ? suggestionId.toString() : suggestionId;
        await friendsApi.sendFriendRequest(receiverId);
        
        // Add to sent requests list
        setSentRequests(prev => [...prev, {
          id: suggestion.id,
          name: suggestion.name,
          avatar: suggestion.avatar,
          department: suggestion.department,
          status: 'pending'
        }]);
        
        // Remove from suggestions
        setSuggestions(prev => prev.filter(sug => sug.id !== suggestionId));
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      setError('Failed to send friend request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle unfriending a user
  const handleUnfriend = async (friendId: number | string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (USE_MOCK_DATA) {
        // Mock implementation
        // Remove from friends list
        setFriends(prev => prev.filter(friend => friend.id !== friendId));
        
        // Close the dropdown
        const friendIdKey = friendId.toString();
        const newDropdownState = {...friendDropdowns};
        newDropdownState[friendIdKey] = false;
        setFriendDropdowns(newDropdownState);
      } else {
        // Real API implementation
        // Unfriend via API
        const friendIdStr = typeof friendId === 'number' ? friendId.toString() : friendId;
        await friendsApi.unfriend(friendIdStr);
        
        // Remove from friends list
        setFriends(prev => prev.filter(friend => friend.id !== friendId));
        
        // Close the dropdown
        const friendIdKey = friendId.toString();
        const newDropdownState = {...friendDropdowns};
        newDropdownState[friendIdKey] = false;
        setFriendDropdowns(newDropdownState);
      }
    } catch (error) {
      console.error('Error unfriending user:', error);
      setError('Failed to unfriend user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Loop through all open dropdowns
      Object.entries(friendDropdowns).forEach(([friendId, isOpen]) => {
        if (isOpen) {
          const dropdownRef = dropdownRefs.current[friendId];
          // If the dropdown is open and the click is outside the dropdown
          if (dropdownRef && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            // Close this dropdown
=======

  // Handle accepting a friend request
  const handleAcceptRequest = async (requestId: number) => {
    try {
      const request = friendRequests.find((req: FriendRequest) => req.id === requestId);
      if (!request) return;

      await friendApi.acceptFriendRequest(requestId.toString());
      
      // Update local state
      setFriends((prev: Friend[]) => [...prev, {
        id: request.id,
        name: request.name,
        avatar: request.avatar,
        department: request.department
      }]);
      
      setFriendRequests((prev: FriendRequest[]) => prev.filter((req: FriendRequest) => req.id !== requestId));
      setSuggestions((prev: Suggestion[]) => prev.filter((sug: Suggestion) => sug.id !== requestId));
    } catch (err) {
      console.error('Error accepting friend request:', err);
    }
  };

  // Handle declining a friend request
  const handleDeclineRequest = async (requestId: number) => {
    try {
      await friendApi.declineFriendRequest(requestId.toString());
      setFriendRequests((prev: FriendRequest[]) => prev.filter((req: FriendRequest) => req.id !== requestId));
    } catch (err) {
      console.error('Error declining friend request:', err);
    }
  };

  // Handle adding a friend from suggestions
  const handleAddFriend = async (suggestionId: number) => {
    try {
      const suggestion = suggestions.find((sug: Suggestion) => sug.id === suggestionId);
      if (!suggestion) return;

      const isAlreadyFriend = friends.some((friend: Friend) => friend.id === suggestionId);
      const requestAlreadySent = sentRequests.some((req: FriendRequest & { status: string }) => req.id === suggestionId);

      if (!isAlreadyFriend && !requestAlreadySent) {
        await friendApi.sendFriendRequest(suggestionId.toString());
        
        setSentRequests((prev: Array<FriendRequest & { status: 'pending' | 'accepted' | 'declined' }>) => [...prev, {
          ...suggestion,
          status: 'pending' as const
        }]);
        
        setSuggestions((prev: Suggestion[]) => prev.filter((sug: Suggestion) => sug.id !== suggestionId));
      }
    } catch (err) {
      console.error('Error sending friend request:', err);
    }
  };

  // Handle unfriending a user
  const handleUnfriend = async (friendId: number) => {
    try {
      await friendApi.unfriend(friendId.toString());
      setFriends((prev: Friend[]) => prev.filter((friend: Friend) => friend.id !== friendId));
      
      // Close the dropdown
      const newDropdownState = {...friendDropdowns};
      newDropdownState[friendId] = false;
      setFriendDropdowns(newDropdownState);
    } catch (err) {
      console.error('Error unfriending user:', err);
    }
  };

  // Handle canceling a sent friend request
  const handleCancelRequest = async (requestId: number) => {
    try {
      const canceledRequest = sentRequests.find((req: FriendRequest & { status: 'pending' | 'accepted' | 'declined' }) => req.id === requestId);
      if (!canceledRequest) return;

      // In a real implementation, we would call an API to cancel the request
      // For now, we'll just update the local state
      setSentRequests((prev: Array<FriendRequest & { status: 'pending' | 'accepted' | 'declined' }>) => 
        prev.filter((req: FriendRequest & { status: 'pending' | 'accepted' | 'declined' }) => req.id !== requestId)
      );

      // Add back to suggestions
      const newSuggestion: Suggestion = {
        id: canceledRequest.id,
        name: canceledRequest.name,
        avatar: canceledRequest.avatar,
        department: canceledRequest.department,
        mutualFriends: 0,
        relevance: []
      };

      setSuggestions((prev: Suggestion[]) => [...prev, newSuggestion]);
    } catch (err) {
      console.error('Error canceling friend request:', err);
    }
  };

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.entries(friendDropdowns).forEach(([friendId, isOpen]) => {
        if (isOpen) {
          const dropdownRef = dropdownRefs.current[friendId];
          if (dropdownRef?.current && !dropdownRef.current.contains(event.target as Node)) {
>>>>>>> a80153d (Update frontend)
            setFriendDropdowns(prev => ({
              ...prev,
              [friendId]: false
            }));
          }
        }
      });
    };
    
<<<<<<< HEAD
    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [friendDropdowns]);
  
  // Handle canceling a sent friend request
  const handleCancelRequest = async (requestId: number | string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (USE_MOCK_DATA) {
        // Mock implementation
        // Remove from sent requests list
        setSentRequests(prev => prev.filter(req => req.id !== requestId));
        
        // Add back to suggestions
        const canceledRequest = sentRequests.find(req => req.id === requestId);
        if (canceledRequest) {
          // Create a proper suggestion object with all required properties
          const newSuggestion = {
            id: canceledRequest.id,
            name: canceledRequest.name,
            avatar: canceledRequest.avatar,
            department: canceledRequest.department,
            mutualFriends: Math.floor(Math.random() * 5) + 1,
            relevance: [] as string[] // Add the required relevance property
          };
          
          // Add relevance indicators if user exists
          if (user) {
            // Find the original user in mockUsers
            const originalUser = mockUsers.find(u => {
              const userId = typeof canceledRequest.id === 'number' ? canceledRequest.id : parseInt(canceledRequest.id);
              return parseInt(u.id) === userId;
            });
            if (originalUser) {
              const year = extractYear(originalUser.universityId);
              const dept = extractDepartment(originalUser.universityId);
              if (year === extractYear(user.universityId)) {
                newSuggestion.relevance.push('Same Year');
              }
              if (dept === extractDepartment(user.universityId)) {
                newSuggestion.relevance.push('Same Department');
              }
            }
          }
          
          setSuggestions(prev => [...prev, newSuggestion]);
        }
      } else {
        // Real API implementation
        // In a real API, we would need to find the friend request ID
        // For now, we'll simulate by getting all pending requests and finding the matching one
        const pendingRequests = await friendsApi.getPendingRequests();
        const sentRequest = pendingRequests.find(req => 
          req.sender.id === user?.id && 
          req.receiver.id === (typeof requestId === 'number' ? requestId.toString() : requestId)
        );
        
        if (sentRequest) {
          // Decline the request (this is the same as canceling from the sender's perspective)
          await friendsApi.declineFriendRequest(sentRequest.id);
        }
        
        // Remove from sent requests list
        setSentRequests(prev => prev.filter(req => req.id !== requestId));
        
        // Refresh suggestions to get the user back in suggestions
        const suggestionsData = await friendsApi.getFriendSuggestions();
        const formattedSuggestions = suggestionsData.map(suggestion => ({
          id: suggestion.user.id,
          name: suggestion.user.name,
          avatar: suggestion.user.avatar,
          department: suggestion.user.role === 'faculty' ? 'Faculty' : 'Computer Science',
          mutualFriends: suggestion.mutualFriends,
          relevance: suggestion.relevance
        }));
        setSuggestions(formattedSuggestions);
      }
    } catch (error) {
      console.error('Error canceling friend request:', error);
      setError('Failed to cancel friend request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // The navigateToProfile function is already defined below

  if (!user) return null;

  // Don't filter the tab content - always show all items in each tab
  // This keeps the active tab content unchanged when searching
  const filteredFriends = friends;
  const filteredRequests = friendRequests;
  
  // Filter out users who are already friends, have sent requests, or have received requests
  const validSuggestions = suggestions
    .filter(suggestion => 
      !friends.some(friend => friend.id === suggestion.id) && // Not already a friend
      !friendRequests.some(req => req.id === suggestion.id) && // Not in received requests
      !sentRequests.some(req => req.id === suggestion.id) // Not in sent requests
    );
    
  // Don't filter suggestions either
  const filteredSuggestions = validSuggestions;
  
  // The search only affects the search popup, not the active tab content
=======
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [friendDropdowns]);

  // Navigate to user profile
  const navigateToProfile = (userId: string | number = '') => {
    const userIdString = userId.toString();
    localStorage.clear();
    localStorage.setItem('currentPage', 'profile');
    
    if (userIdString) {
      localStorage.setItem('viewProfileUserId', userIdString);
      window.dispatchEvent(new CustomEvent('navigate', { 
        detail: { 
          page: 'profile', 
          userId: userIdString,
          timestamp: new Date().getTime()
        } 
      }));
    } else {
      window.dispatchEvent(new CustomEvent('navigate', { 
        detail: { 
          page: 'profile',
          timestamp: new Date().getTime()
        } 
      }));
    }
  };

  if (!user) return null;

  // Filter out users who are already friends, have sent requests, or have received requests
  const validSuggestions = suggestions.filter((suggestion: Suggestion) => 
    !friends.some((friend: Friend) => friend.id === suggestion.id) &&
    !friendRequests.some((req: FriendRequest) => req.id === suggestion.id) &&
    !sentRequests.some((req: FriendRequest) => req.id === suggestion.id)
  );
>>>>>>> a80153d (Update frontend)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="pt-20 pb-20 md:pb-0 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
<<<<<<< HEAD
      {/* No toast notifications as per user request */}
      
      <div className="container mx-auto px-4">
        <div className="flex flex-col space-y-6 mt-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Friends</h1>
            {/* Search bar removed as requested */}
          </div>

          {/* Tabs */}
=======
      <div className="container mx-auto px-4">
        <div className="flex flex-col space-y-6 mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Friends</h1>
          </div>

>>>>>>> a80153d (Update frontend)
          <div className="grid grid-cols-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <button
              className={`flex flex-col sm:flex-row items-center justify-center sm:justify-start px-2 sm:px-4 py-3 ${activeTab === 'friends' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 font-medium' : 'text-gray-600 dark:text-gray-400'}`}
              onClick={() => {
                setActiveTab('friends');
              }}
            >
              <UserCheck size={18} className="mb-1 sm:mb-0 sm:mr-2" />
              <span className="text-xs sm:text-sm">Friends</span>
            </button>
            <button
              className={`flex flex-col sm:flex-row items-center justify-center sm:justify-start px-2 sm:px-4 py-3 ${activeTab === 'requests' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 font-medium' : 'text-gray-600 dark:text-gray-400'}`}
              onClick={() => {
                setActiveTab('requests');
              }}
            >
              <div className="relative">
                <UserPlus size={18} className="mb-1 sm:mb-0 sm:mr-2" />
                {(friendRequests.length > 0 || sentRequests.filter(req => req.status === 'pending').length > 0) && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs font-medium px-1 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                    {friendRequests.length + sentRequests.filter(req => req.status === 'pending').length}
                  </span>
                )}
              </div>
              <span className="text-xs sm:text-sm">Requests</span>
            </button>
            
            <button
              className={`flex flex-col sm:flex-row items-center justify-center sm:justify-start px-2 sm:px-4 py-3 ${activeTab === 'suggestions' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 font-medium' : 'text-gray-600 dark:text-gray-400'}`}
              onClick={() => {
                setActiveTab('suggestions');
              }}
            >
              <div className="relative">
                <Users size={18} className="mb-1 sm:mb-0 sm:mr-2" />
                {validSuggestions.length > 0 && (
<<<<<<< HEAD
                  <span className="absolute -top-1.5 -right-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs font-medium px-1 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
=======
                  <span className="absolute -top-1.5 -right-1.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-1 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
>>>>>>> a80153d (Update frontend)
                    {validSuggestions.length}
                  </span>
                )}
              </div>
              <span className="text-xs sm:text-sm">Suggestions</span>
            </button>
          </div>

<<<<<<< HEAD
          {/* Content */}
=======
>>>>>>> a80153d (Update frontend)
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-100 dark:border-gray-700"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
<<<<<<< HEAD
            key={activeTab} // This forces animation to restart when tab changes
          >
            {isLoading && (
              <div className="loading-overlay">
                <Loader className="spinner" />
                <p>Loading...</p>
              </div>
            )}
            
            {error && (
              <div className="error-message">
                <p>{error}</p>
                <button onClick={() => setError(null)}>Dismiss</button>
              </div>
            )}
            
            {activeTab === 'friends' && (
              <>
                {filteredFriends.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredFriends.map(friend => (
=======
            key={activeTab}
          >
            {activeTab === 'friends' && (
              <>
                {friends.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {friends.map(friend => (
>>>>>>> a80153d (Update frontend)
                      <motion.div 
                        key={friend.id}
                        id={`friend-${friend.id}`}
                        className="flex items-center p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        variants={itemVariants}
                      >
                        <img 
                          src={friend.avatar} 
                          alt={friend.name} 
                          className="w-12 h-12 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity" 
                          onClick={(e) => {
                            e.stopPropagation();
<<<<<<< HEAD
                            // Add data attribute to track which profile we're clicking
                            console.log(`Navigating to friend profile ID: ${friend.id}`);
                            // Use direct ID reference
                            navigateToProfile(friend.id);
                          }}
                          data-profile-id={friend.id}
                        />
                        <div 
                          className="ml-3 cursor-pointer" 
                          onClick={(e) => {
                            e.stopPropagation();
                            // Log which profile we're clicking
                            console.log(`Navigating to friend profile ID from name: ${friend.id}`);
                            // Use direct ID reference
                            navigateToProfile(friend.id);
                          }}
                          data-profile-id={friend.id}
=======
                            navigateToProfile(friend.id);
                          }}
                        />
                        <div 
                          className="ml-3 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateToProfile(friend.id);
                          }}
>>>>>>> a80153d (Update frontend)
                        >
                          <h3 className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{friend.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{friend.department}</p>
                        </div>
                        <div className="ml-auto relative">
<<<<<<< HEAD
                          {/* Initialize ref for this friend if it doesn't exist */}
=======
>>>>>>> a80153d (Update frontend)
                          {(() => {
                            const friendId = friend.id.toString();
                            if (!dropdownRefs.current[friendId]) {
                              dropdownRefs.current[friendId] = React.createRef<HTMLDivElement>();
                            }
                            return null;
                          })()}
                          <button 
                            className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30"
                            onClick={() => {
<<<<<<< HEAD
                              // Toggle dropdown for this specific friend
                              const newDropdownState = {...friendDropdowns};
                              // Close all other dropdowns first
                              Object.keys(newDropdownState).forEach(key => {
                                newDropdownState[key] = false;
                              });
                              // Toggle this dropdown
=======
                              const newDropdownState = {...friendDropdowns};
                              Object.keys(newDropdownState).forEach(key => {
                                newDropdownState[key] = false;
                              });
>>>>>>> a80153d (Update frontend)
                              newDropdownState[friend.id] = !friendDropdowns[friend.id];
                              setFriendDropdowns(newDropdownState);
                            }}
                          >
                            <MoreVertical size={18} />
                          </button>
                          
<<<<<<< HEAD
                          {/* Dropdown menu */}
=======
>>>>>>> a80153d (Update frontend)
                          {friendDropdowns[friend.id] && (
                            <div 
                              ref={dropdownRefs.current[friend.id.toString()]}
                              className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10"
                            >
                              <button 
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={() => handleUnfriend(friend.id)}
                              >
                                <UserMinus size={16} className="mr-2" />
                                Unfriend
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No friends found</h3>
                    <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or check out suggestions</p>
                  </div>
                )}
              </>
            )}

            {activeTab === 'requests' && (
              <>
<<<<<<< HEAD
                {/* Received Requests Section */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Received Requests</h2>
                  {filteredRequests.length > 0 ? (
                    <div className="space-y-4">
                      {filteredRequests.map(request => (
=======
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Received Requests</h2>
                  {friendRequests.length > 0 ? (
                    <div className="space-y-4">
                      {friendRequests.map(request => (
>>>>>>> a80153d (Update frontend)
                        <motion.div 
                          key={request.id}
                          id={`request-${request.id}`}
                          className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          variants={itemVariants}
                        >
                          <div className="flex items-center">
                            <img 
                              src={request.avatar} 
                              alt={request.name} 
                              className="w-14 h-14 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity" 
                              onClick={(e) => {
                                e.stopPropagation();
                                navigateToProfile(request.id);
                              }}
                            />
                            <div 
                              className="ml-3 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigateToProfile(request.id);
                              }}
                            >
                              <h3 className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{request.name}</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{request.department}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {request.mutualFriends} mutual friend{request.mutualFriends !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-3">
                            <button 
                              className="p-2 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-800/40 text-green-600 dark:text-green-400 rounded-full transition-colors"
                              onClick={() => handleAcceptRequest(request.id)}
                              aria-label="Accept"
                              title="Accept"
                            >
                              <Check size={20} />
                            </button>
                            <button 
                              className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/40 text-red-600 dark:text-red-400 rounded-full transition-colors"
                              onClick={() => handleDeclineRequest(request.id)}
                              aria-label="Decline"
                              title="Decline"
                            >
                              <X size={20} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <UserPlus size={36} className="mx-auto text-gray-400 dark:text-gray-600 mb-3" />
                      <h3 className="text-md font-medium text-gray-900 dark:text-white mb-1">No friend requests</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">You don't have any pending friend requests</p>
                    </div>
                  )}
                </div>
                
<<<<<<< HEAD
                {/* Sent Requests Section */}
=======
>>>>>>> a80153d (Update frontend)
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Sent Requests</h2>
                  {sentRequests.filter(req => req.status === 'pending').length > 0 ? (
                    <div className="space-y-4">
                      {sentRequests
                        .filter(req => req.status === 'pending')
                        .map(request => (
                          <motion.div 
                            key={request.id}
                            id={`sent-request-${request.id}`}
                            className="flex flex-col sm:flex-row sm:items-center p-4 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            variants={itemVariants}
                          >
                            <div className="flex items-center">
                              <img 
                                src={request.avatar} 
                                alt={request.name} 
                                className="w-14 h-14 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigateToProfile(request.id);
                                }}
                              />
                              <div 
                                className="ml-3 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigateToProfile(request.id);
                                }}
                              >
                                <h3 className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{request.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{request.department}</p>
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Pending approval</p>
                              </div>
                            </div>
                            <div className="flex space-x-2 mt-4 sm:mt-0 sm:ml-auto">
                              <button 
                                className="flex-1 sm:flex-none px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
                                onClick={() => handleCancelRequest(request.id)}
                              >
                                Cancel Request
                              </button>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <UserPlus size={36} className="mx-auto text-gray-400 dark:text-gray-600 mb-3" />
                      <h3 className="text-md font-medium text-gray-900 dark:text-white mb-1">No sent requests</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">You haven't sent any friend requests yet</p>
                    </div>
                  )}
                </div>
                

              </>
            )}

            {activeTab === 'suggestions' && (
              <>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">People you may know</h2>
<<<<<<< HEAD
                  {filteredSuggestions.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filteredSuggestions.map(suggestion => (
=======
                  {validSuggestions.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {validSuggestions.map(suggestion => (
>>>>>>> a80153d (Update frontend)
                        <motion.div 
                          key={suggestion.id}
                          id={`suggestion-${suggestion.id}`}
                          className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          variants={itemVariants}
                        >
                          <div className="flex items-center">
                            <img 
                              src={suggestion.avatar} 
                              alt={suggestion.name} 
                              className="w-14 h-14 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity" 
                              onClick={(e) => {
                                e.stopPropagation();
                                navigateToProfile(suggestion.id);
                              }}
                            />
                            <div 
                              className="ml-3 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigateToProfile(suggestion.id);
                              }}
                            >
                              <h3 className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{suggestion.name}</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{suggestion.department}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {suggestion.mutualFriends} mutual friend{suggestion.mutualFriends !== 1 ? 's' : ''}
                              </p>
                              {suggestion.relevance && suggestion.relevance.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {suggestion.relevance.map((rel, index) => (
                                    <span key={index} className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">
                                      {rel}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-3">
                            <button 
                              className="p-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/40 text-blue-600 dark:text-blue-400 rounded-full transition-colors"
                              onClick={() => handleAddFriend(suggestion.id)}
                              aria-label="Add Friend"
                              title="Add Friend"
                            >
                              <UserPlus size={20} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No suggestions found</h3>
                      <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria</p>
                    </div>
                  )}
                </div>
                

              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Friends;
