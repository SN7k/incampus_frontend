import React, { useState, useEffect } from 'react';
import { friendApi } from '../../services/api';
import { User } from '../../types';
import { UserMinus, UserPlus, X, Check } from 'lucide-react';
import { getAvatarUrl } from '../../utils/avatarUtils';

const FriendsList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'suggestions'>('friends');
  const [friends, setFriends] = useState<User[]>([]);
  const [requests, setRequests] = useState<{id: string, sender: User, createdAt: string}[]>([]);
  const [suggestions, setSuggestions] = useState<{user: User, mutualFriends: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data based on active tab
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (activeTab === 'friends') {
          const friendsData = await friendApi.getFriends();
          setFriends(friendsData);
        } else if (activeTab === 'requests') {
          const requestsData = await friendApi.getFriendRequests();
          setRequests(requestsData);
        } else if (activeTab === 'suggestions') {
          const suggestionsData = await friendApi.getSuggestions();
          setSuggestions(suggestionsData);
        }
        setLoading(false);
      } catch (error) {
        console.error(`Error loading ${activeTab}:`, error);
        setError(`Failed to load ${activeTab}. Please try again.`);
        setLoading(false);
      }
    };
    
    loadData();
  }, [activeTab]);

  // Handle friend request actions
  const handleAcceptRequest = async (requestId: string) => {
    try {
      await friendApi.acceptRequest(requestId);
      
      // Update UI optimistically
      const acceptedRequest = requests.find(req => req.id === requestId);
      if (acceptedRequest) {
        setFriends(prev => [...prev, acceptedRequest.sender]);
        setRequests(prev => prev.filter(req => req.id !== requestId));
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      // Handle error (could revert the optimistic update)
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await friendApi.declineRequest(requestId);
      
      // Update UI optimistically
      setRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Error declining friend request:', error);
      // Handle error
    }
  };

  const handleAddFriend = async (userId: string) => {
    try {
      await friendApi.sendRequest(userId);
      
      // Update UI optimistically
      setSuggestions(prev => prev.filter(suggestion => suggestion.user._id !== userId));
    } catch (error) {
      console.error('Error sending friend request:', error);
      // Handle error
    }
  };

  const handleUnfriend = async (userId: string) => {
    try {
      await friendApi.unfriend(userId);
      
      // Update UI optimistically
      setFriends(prev => prev.filter(friend => friend._id !== userId));
    } catch (error) {
      console.error('Error unfriending user:', error);
      // Handle error
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          className={`flex-1 py-3 px-4 text-center font-medium ${
            activeTab === 'friends'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('friends')}
        >
          Friends
        </button>
        <button
          className={`flex-1 py-3 px-4 text-center font-medium ${
            activeTab === 'requests'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('requests')}
        >
          Requests
        </button>
        <button
          className={`flex-1 py-3 px-4 text-center font-medium ${
            activeTab === 'suggestions'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('suggestions')}
        >
          Suggestions
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500 dark:text-red-400">
            {error}
            <button
              className="block mx-auto mt-2 text-blue-600 dark:text-blue-400 hover:underline"
              onClick={() => setActiveTab(activeTab)} // This will trigger a reload
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'friends' && (
              <div className="space-y-3">
                {friends.length === 0 ? (
                  <p className="text-center py-4 text-gray-500 dark:text-gray-400">
                    You don't have any friends yet. Check out the suggestions tab to find people you may know.
                  </p>
                ) : (
                  friends.map(friend => (
                    <div key={friend._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <img
                          src={getAvatarUrl(friend.avatar, friend.name)}
                          alt={friend.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="ml-3">
                          <p className="font-medium text-gray-800 dark:text-white">{friend.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {friend.role === 'faculty' ? 'Faculty' : 'Student'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleUnfriend(friend._id)}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
                        title="Unfriend"
                      >
                        <UserMinus size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="space-y-3">
                {requests.length === 0 ? (
                  <p className="text-center py-4 text-gray-500 dark:text-gray-400">
                    You don't have any friend requests at the moment.
                  </p>
                ) : (
                  requests.map(request => (
                    <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <img
                          src={getAvatarUrl(request.sender.avatar, request.sender.name)}
                          alt={request.sender.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="ml-3">
                          <p className="font-medium text-gray-800 dark:text-white">{request.sender.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {request.sender.role === 'faculty' ? 'Faculty' : 'Student'}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAcceptRequest(request.id)}
                          className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-full"
                          title="Accept"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(request.id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full"
                          title="Decline"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'suggestions' && (
              <div className="space-y-3">
                {suggestions.length === 0 ? (
                  <p className="text-center py-4 text-gray-500 dark:text-gray-400">
                    No suggestions available at the moment.
                  </p>
                ) : (
                  suggestions.map(suggestion => (
                    <div key={suggestion.user._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <img
                          src={getAvatarUrl(suggestion.user.avatar, suggestion.user.name)}
                          alt={suggestion.user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="ml-3">
                          <p className="font-medium text-gray-800 dark:text-white">{suggestion.user.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {suggestion.mutualFriends} mutual {suggestion.mutualFriends === 1 ? 'friend' : 'friends'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddFriend(suggestion.user._id)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full"
                        title="Add Friend"
                      >
                        <UserPlus size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FriendsList;
