import React, { useState, useEffect } from 'react';
import { friendApi } from '../services/api';
import { User } from '../types';
import { UserPlus, UserCheck, Users, UserMinus, Check, X } from 'lucide-react';
import { getAvatarUrl } from '../utils/avatarUtils';

type FriendTab = 'friends' | 'requests' | 'suggestions';

interface FriendRequest {
  id: string;
  sender: User;
  createdAt: string;
}

interface Suggestion {
  user: User;
  mutualFriends: number;
}

const Friends: React.FC = () => {
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
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (activeTab === 'friends') {
          const data = await friendApi.getFriends();
          setFriends(data);
        } else if (activeTab === 'requests') {
          const data = await friendApi.getFriendRequests();
          setFriendRequests(data);
        } else if (activeTab === 'suggestions') {
          const data = await friendApi.getSuggestions();
          setSuggestions(data);
        }
      } catch {
        // Handle error silently for now
      }
    };
    fetchData();
  }, [activeTab]);
  
  // Notify the app about friend requests changes
  useEffect(() => {
    const event = new CustomEvent('friendRequestsChange', {
      detail: { hasRequests: friendRequests.length > 0 }
    });
    window.dispatchEvent(event);
  }, [friendRequests]);
  
  // Navigate to user profile
  const navigateToProfile = (userId: string) => {
    console.log('NAVIGATION: Going to profile ID:', userId);
    
    localStorage.clear();
    localStorage.setItem('currentPage', 'profile');
    
    if (userId) {
      localStorage.setItem('viewProfileUserId', userId);
      console.log('NAVIGATION: Set viewProfileUserId in localStorage:', userId);
      
      const timestamp = new Date().getTime();
      console.log('NAVIGATION: Dispatching event with timestamp:', timestamp);
      
      window.dispatchEvent(new CustomEvent('navigate', { 
        detail: { 
          page: 'profile', 
          userId: userId,
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
  const handleAcceptRequest = async (requestId: string) => {
    try {
      const result = await friendApi.acceptRequest(requestId);
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
      await friendApi.declineRequest(requestId);
    setFriendRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Error declining friend request:', error);
    }
  };

  // Handle adding a friend from suggestions
  const handleAddFriend = async (suggestionId: string) => {
    try {
      await friendApi.sendRequest(suggestionId);
      // Remove from suggestions
      setSuggestions(prev => prev.filter(sugg => sugg.user._id !== suggestionId));
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  // Handle unfriending
  const handleUnfriend = async (friendId: string) => {
    try {
      await friendApi.unfriend(friendId);
      setFriends(prev => prev.filter(friend => friend._id !== friendId));
    } catch (error) {
      console.error('Error unfriending user:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4">
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
                    <div key={friend._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
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
                          onClick={() => navigateToProfile(friend._id)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                        >
                          View Profile
                          </button>
                              <button 
                                onClick={() => handleUnfriend(friend._id)}
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
                    <div key={suggestion.user._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
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
                          onClick={() => navigateToProfile(suggestion.user._id)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                        >
                          View Profile
                        </button>
                            <button 
                          onClick={() => handleAddFriend(suggestion.user._id)}
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
    </div>
  );
};

export default Friends;
