import React, { useState, useEffect, useCallback } from 'react';
import PullToRefresh from 'react-simple-pull-to-refresh';
import { friendsApi, FriendRequest, FriendSuggestion } from '../services/friendsApi';
import { User } from '../types';
import { UserPlus, UserCheck, Users, UserMinus, Check, X } from 'lucide-react';
import { getAvatarUrl } from '../utils/avatarUtils';
import { useAuth } from '../contexts/AuthContext';

type FriendTab = 'friends' | 'requests' | 'suggestions';

const Friends: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<FriendTab>(() => {
    const savedTab = localStorage.getItem('friendsActiveTab');
    if (savedTab) {
      localStorage.removeItem('friendsActiveTab');
    }
    return (savedTab === 'friends' || savedTab === 'requests' || savedTab === 'suggestions') 
      ? savedTab as FriendTab 
      : 'friends';
  });
  
  const [friends, setFriends] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([]);

  // Load data based on active tab
  const loadData = useCallback(async () => {
    try {
      if (activeTab === 'friends') {
        const data = await friendsApi.getFriendsList();
        setFriends(data);
      } else if (activeTab === 'requests') {
        const data = await friendsApi.getPendingRequests();
        setFriendRequests(data);
      } else if (activeTab === 'suggestions') {
        const data = await friendsApi.getFriendSuggestions();
        setSuggestions(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);
  
  // Notify the app about friend requests changes
  useEffect(() => {
    const event = new CustomEvent('friendRequestsChange', {
      detail: { hasRequests: friendRequests.length > 0 }
    });
    window.dispatchEvent(event);
  }, [friendRequests]);
  
  // Refresh friend requests when notifications change
  useEffect(() => {
    const handleNotificationChange = () => {
      if (activeTab === 'requests') {
        const fetchRequests = async () => {
          try {
            const data = await friendsApi.getPendingRequests();
            setFriendRequests(data);
          } catch (error) {
            console.error('Error refreshing friend requests:', error);
          }
        };
        fetchRequests();
      }
    };

    window.addEventListener('notificationChange', handleNotificationChange);
    return () => {
      window.removeEventListener('notificationChange', handleNotificationChange);
    };
  }, [activeTab]);
  
  // Navigate to user profile
  const navigateToProfile = (userId: string) => {
    console.log('=== FRIENDS NAVIGATION DEBUG ===');
    console.log('NAVIGATION: Going to profile ID:', userId);
    console.log('NAVIGATION: Current user ID:', user?.id);
    console.log('NAVIGATION: Are we viewing own profile?', userId === user?.id);
    console.log('NAVIGATION: localStorage before setting:', localStorage.getItem('viewProfileUserId'));
    
    // Set navigation data
    localStorage.setItem('currentPage', 'profile');
    localStorage.setItem('viewProfileUserId', userId);
    
    console.log('NAVIGATION: Set currentPage to profile');
    console.log('NAVIGATION: Set viewProfileUserId to:', userId);
    console.log('NAVIGATION: localStorage after setting:', localStorage.getItem('viewProfileUserId'));
    
    // Add a small delay to ensure localStorage is set before reload
    setTimeout(() => {
      console.log('NAVIGATION: About to reload page, localStorage viewProfileUserId:', localStorage.getItem('viewProfileUserId'));
      window.location.reload();
    }, 100);
  };
  
  // Handle accepting a friend request
  const handleAcceptRequest = async (requestId: string) => {
    try {
      const result = await friendsApi.acceptFriendRequest(requestId);
    const request = friendRequests.find(req => req.id === requestId);
      if (request && result) {
        setFriends(prev => [...prev, request.sender]);
        setFriendRequests(prev => prev.filter(req => req.id !== requestId));
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };
  
  // Handle declining a friend request
  const handleDeclineRequest = async (requestId: string) => {
    try {
      await friendsApi.declineFriendRequest(requestId);
    setFriendRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Error declining friend request:', error);
    }
  };

  // Handle adding a friend from suggestions
  const handleAddFriend = async (suggestionId: string) => {
    try {
      await friendsApi.sendFriendRequest(suggestionId);
      // Remove from suggestions
      setSuggestions(prev => prev.filter(sugg => sugg.user.id !== suggestionId));
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  // Handle unfriending
  const handleUnfriend = async (friendId: string) => {
    try {
      await friendsApi.unfriend(friendId);
      setFriends(prev => prev.filter(friend => friend.id !== friendId));
    } catch (error) {
      console.error('Error unfriending user:', error);
    }
  };

  // Handle refresh function for pull-to-refresh
  const handleRefresh = async () => {
    try {
      await loadData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <PullToRefresh 
          onRefresh={handleRefresh}
          pullingContent={
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Pull to refresh...</span>
            </div>
          }
          refreshingContent={
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Refreshing...</span>
            </div>
          }
        >
          <div>
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Friends</h1>
              <p className="text-gray-600 dark:text-gray-400">Connect with your classmates and faculty</p>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setActiveTab('friends')}
                  className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                    activeTab === 'friends'
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Users className="inline-block w-5 h-5 mr-2" />
                  Friends
                </button>
                <button
                  onClick={() => setActiveTab('requests')}
                  className={`flex-1 py-4 px-6 text-center font-medium transition-colors relative ${
                    activeTab === 'requests'
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <UserPlus className="inline-block w-5 h-5 mr-2" />
                  Requests
                  {friendRequests.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {friendRequests.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('suggestions')}
                  className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                    activeTab === 'suggestions'
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <UserCheck className="inline-block w-5 h-5 mr-2" />
                  Suggestions
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'friends' && (
                  <div className="space-y-4">
                    {friends.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No friends yet</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Start connecting with your classmates and faculty members.
                        </p>
                      </div>
                    ) : (
                      friends.map(friend => (
                        <div key={friend.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <img
                              src={getAvatarUrl(friend.avatar, friend.name)}
                              alt={friend.name} 
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white">{friend.name}</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {friend.role === 'faculty' ? 'Faculty' : 'Student'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                              <button 
                              onClick={() => {
                                console.log('FRIENDS: View Profile clicked for friend:', friend);
                                console.log('FRIENDS: Friend ID:', friend.id);
                                if (!friend.id) {
                                  console.error('FRIENDS: Friend ID is undefined!');
                                  return;
                                }
                                navigateToProfile(friend.id);
                              }}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                            >
                              View Profile
                              </button>
                                  <button 
                                    onClick={() => handleUnfriend(friend.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                                    >
                              <UserMinus className="w-5 h-5" />
                                  </button>
                                </div>
                            </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'requests' && (
                        <div className="space-y-4">
                    {friendRequests.length === 0 ? (
                      <div className="text-center py-8">
                        <UserPlus className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No friend requests</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          You don't have any pending friend requests.
                        </p>
                      </div>
                    ) : (
                      friendRequests.map(request => (
                        <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <img
                              src={getAvatarUrl(request.sender.avatar, request.sender.name)}
                              alt={request.sender.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white">{request.sender.name}</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {request.sender.role === 'faculty' ? 'Faculty' : 'Student'}
                                  </p>
                                </div>
                              </div>
                          <div className="flex items-center space-x-2">
                                <button 
                                  onClick={() => handleAcceptRequest(request.id)}
                              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                                >
                              <Check className="w-4 h-4 inline mr-1" />
                              Accept
                                </button>
                                <button 
                                  onClick={() => handleDeclineRequest(request.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                                >
                              <X className="w-4 h-4 inline mr-1" />
                              Decline
                                </button>
                              </div>
                        </div>
                      ))
                      )}
                    </div>
                )}

                {activeTab === 'suggestions' && (
                  <div className="space-y-4">
                    {suggestions.length === 0 ? (
                      <div className="text-center py-8">
                        <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No suggestions</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          We couldn't find any suggestions for you right now.
                        </p>
                      </div>
                    ) : (
                      suggestions.map(suggestion => (
                        <div key={suggestion.user.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <img
                              src={getAvatarUrl(suggestion.user.avatar, suggestion.user.name)}
                              alt={suggestion.user.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white">{suggestion.user.name}</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {suggestion.user.role === 'faculty' ? 'Faculty' : 'Student'}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                {suggestion.mutualFriends} mutual {suggestion.mutualFriends === 1 ? 'friend' : 'friends'}
                              </p>
                                </div>
                              </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                console.log('FRIENDS: View Profile clicked for suggestion:', suggestion.user);
                                console.log('FRIENDS: Suggestion user ID:', suggestion.user.id);
                                if (!suggestion.user.id) {
                                  console.error('FRIENDS: Suggestion user ID is undefined!');
                                  return;
                                }
                                navigateToProfile(suggestion.user.id);
                              }}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                            >
                              View Profile
                            </button>
                                <button 
                              onClick={() => handleAddFriend(suggestion.user.id)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                            >
                              <UserPlus className="w-4 h-4 inline mr-1" />
                              Add Friend
                                </button>
                              </div>
                        </div>
                      ))
                      )}
                    </div>
                )}
              </div>
            </div>
          </div>
        </PullToRefresh>
      </div>
    </div>
  );
};

export default Friends;
