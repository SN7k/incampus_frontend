import React, { useState, useEffect, useCallback } from 'react';
import PullToRefresh from 'react-simple-pull-to-refresh';
import { friendsApi, FriendRequest, FriendSuggestion } from '../services/friendsApi';
import { User } from '../types';
import { UserPlus, UserCheck, Users, UserMinus, Check, X } from 'lucide-react';
import { getAvatarUrl } from '../utils/avatarUtils';
import { useAuth } from '../contexts/AuthContext';

type FriendTab = 'friends' | 'requests' | 'suggestions';

const Friends: React.FC = () => {
  useAuth();
  const [activeTab, setActiveTab] = useState<FriendTab>(() => {
    const savedTab = localStorage.getItem('friendsActiveTab');
    return (savedTab === 'friends' || savedTab === 'requests' || savedTab === 'suggestions') 
      ? savedTab as FriendTab 
      : 'friends';
  });

  useEffect(() => {
    const savedTab = localStorage.getItem('friendsActiveTab');
    if (savedTab) {
      localStorage.removeItem('friendsActiveTab');
    }
  }, []);
  
  const [friends, setFriends] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Load data based on active tab
  const loadData = useCallback(async () => {
    try {
      console.log('Friends: Loading data for tab:', activeTab);
      if (activeTab === 'friends') {
        const data = await friendsApi.getFriendsList();
        console.log('Friends: Loaded friends data:', data);
        setFriends(data);
      } else if (activeTab === 'requests') {
        // Load both received and sent requests
        const [receivedData, sentData] = await Promise.all([
          friendsApi.getPendingRequests(),
          friendsApi.getSentRequests()
        ]);
        console.log('Friends: Loaded received requests data:', receivedData);
        console.log('Friends: Loaded sent requests data:', sentData);
        setFriendRequests(receivedData);
        setSentRequests(sentData);
      } else if (activeTab === 'suggestions') {
        // Set loading state
        setLoadingSuggestions(true);
        
        // Make multiple attempts to get real suggestions
        console.log('Friends: Attempting to load real suggestions...');
        let attempts = 0;
        let data: FriendSuggestion[] = [];
        
        while (attempts < 2 && data.length === 0) {
          try {
            data = await friendsApi.getFriendSuggestions();
            console.log(`Friends: Attempt ${attempts + 1} - Got ${data.length} suggestions`);
            attempts++;
            
            // If no data, wait briefly before trying again
            if (data.length === 0 && attempts < 2) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          } catch (error) {
            console.error(`Friends: Attempt ${attempts + 1} failed:`, error);
            attempts++;
            if (attempts < 2) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }
        
        // Only use real suggestions, never placeholders
        setSuggestions(data);
        setLoadingSuggestions(false);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // End loading state in case of error
      if (activeTab === 'suggestions') {
        setLoadingSuggestions(false);
      }
    }
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);
  
  // Debug logging for suggestions
  useEffect(() => {
    console.log('Friends: Suggestions updated:', suggestions);
  }, [suggestions]);
  
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
            const [receivedData, sentData] = await Promise.all([
              friendsApi.getPendingRequests(),
              friendsApi.getSentRequests()
            ]);
            setFriendRequests(receivedData);
            setSentRequests(sentData);
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
    // Check if this is a placeholder suggestion
    if (userId.startsWith('placeholder')) {
      console.log('Friends: Tried to view profile of placeholder user');
      alert('This is a demo suggestion. Profile viewing is not available for demo users.');
      return;
    }
    
    // Set navigation data
    localStorage.setItem('viewProfileUserId', userId);
    
    // Use the custom navigation event instead of page reload
    window.dispatchEvent(new CustomEvent('navigate', { 
      detail: { page: 'profile', userId: userId } 
    }));
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

  // Handle canceling a sent friend request
  const handleCancelRequest = async (requestId: string) => {
    try {
      await friendsApi.cancelSentRequest(requestId);
      setSentRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Error canceling sent friend request:', error);
    }
  };

  // Handle adding a friend from suggestions
  const handleAddFriend = async (suggestionId: string) => {
    try {
      // Check if this is a placeholder suggestion
      if (suggestionId.startsWith('placeholder')) {
        console.log('Friends: Clicked on placeholder suggestion');
        alert('This is a demo suggestion. In a real app, this would send a friend request.');
        return;
      }
      
      console.log('Friends: Sending friend request to suggestion ID:', suggestionId);
      await friendsApi.sendFriendRequest(suggestionId);
      console.log('Friends: Friend request sent successfully');
      // Remove from suggestions
      setSuggestions(prev => prev.filter(sugg => sugg.user.id !== suggestionId));
      console.log('Friends: Removed suggestion from list');
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
                        <div key={friend?.id || 'unknown'} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <img
                              src={getAvatarUrl(friend?.avatar, friend?.name || 'User')}
                              alt={friend?.name || 'User'} 
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white">{friend?.name || 'User'}</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {friend?.role === 'faculty' ? 'Faculty' : 'Student'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                              <button 
                              onClick={() => {
                                if (!friend?.id) {
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
                                    onClick={() => friend?.id && handleUnfriend(friend.id)}
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
                        <div className="space-y-6">
                    {/* Received Requests Section */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Received Requests ({friendRequests.length})
                      </h3>
                      {friendRequests.length === 0 ? (
                        <div className="text-center py-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <UserPlus className="mx-auto h-8 w-8 text-gray-400" />
                          <h4 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No received requests</h4>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            You don't have any pending friend requests.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {friendRequests.map(request => (
                            <div key={request?.id || 'unknown'} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <div className="flex items-center space-x-3 min-w-0 flex-1">
                                <img
                                  src={getAvatarUrl(request?.sender?.avatar, request?.sender?.name || 'User')}
                                  alt={request?.sender?.name || 'User'}
                                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <h3 className="font-medium text-gray-900 dark:text-white truncate">{request?.sender?.name || 'User'}</h3>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    {request?.sender?.role === 'faculty' ? 'Faculty' : 'Student'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
                                <button 
                                  onClick={() => request?.id && handleAcceptRequest(request.id)}
                                  className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg"
                                  title="Accept"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => request?.id && handleDeclineRequest(request.id)}
                                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg"
                                  title="Decline"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Sent Requests Section */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Sent Requests ({sentRequests.length})
                      </h3>
                      {sentRequests.length === 0 ? (
                        <div className="text-center py-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <UserPlus className="mx-auto h-8 w-8 text-gray-400" />
                          <h4 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No sent requests</h4>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            You haven't sent any friend requests yet.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {sentRequests.map(request => (
                            <div key={request?.id || 'unknown'} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <div className="flex items-center space-x-3 min-w-0 flex-1">
                                <img
                                  src={getAvatarUrl(request?.receiver?.avatar, request?.receiver?.name || 'User')}
                                  alt={request?.receiver?.name || 'User'}
                                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <h3 className="font-medium text-gray-900 dark:text-white truncate">{request?.receiver?.name || 'User'}</h3>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    {request?.receiver?.role === 'faculty' ? 'Faculty' : 'Student'}
                                  </p>
                                  <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                                    Pending response
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
                                <button
                                  onClick={() => {
                                    if (!request?.receiver?.id) {
                                      console.error('FRIENDS: Receiver ID is undefined!');
                                      return;
                                    }
                                    navigateToProfile(request.receiver.id);
                                  }}
                                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                                >
                                  View Profile
                                </button>
                                <button 
                                  onClick={() => request?.id && handleCancelRequest(request.id)}
                                  className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-lg"
                                  title="Cancel"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    </div>
                )}

                {activeTab === 'suggestions' && (
                  <div className="space-y-4">
                    {/* Development debugging tools */}
                    {process.env.NODE_ENV !== 'production' && (
                      <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Development tools:</p>
                        <button 
                          onClick={async () => {
                            try {
                              console.log('Testing API connection...');
                              const response = await fetch('https://incampus-backend.onrender.com/api/friends/suggestions', {
                                headers: {
                                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                                }
                              });
                              const data = await response.json();
                              console.log('Direct API response:', data);
                              alert('Check console for API response details');
                            } catch (error) {
                              console.error('API connection test failed:', error);
                              alert('API test failed. See console for details.');
                            }
                          }}
                          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                          Test API Connection
                        </button>
                      </div>
                    )}
                    
                    {/* Group and display suggestions */}
                    {(() => {
                      // Show loading indicator if loading
                      if (loadingSuggestions) {
                        return (
                          <div className="flex flex-col items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-400">Loading suggestions...</p>
                          </div>
                        );
                      }
                      
                      // Use all suggestions
                      const filteredSuggestions = suggestions;
                      
                      if (filteredSuggestions.length === 0) {
                        return (
                          <div className="text-center py-8">
                            <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No suggestions</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              We couldn't find any suggestions for you right now.
                            </p>
                          </div>
                        );
                      }
                      
                      // Group suggestions by course
                      const courseGroups: Record<string, FriendSuggestion[]> = {};
                      const batchGroups: Record<string, FriendSuggestion[]> = {};
                      const roleGroups: Record<string, FriendSuggestion[]> = {};
                      
                      // Populate groups
                      filteredSuggestions.forEach(suggestion => {
                        // Group by course (BCA, MCA, etc.)
                        const course = suggestion.user.course || 'Other';
                        if (!courseGroups[course]) {
                          courseGroups[course] = [];
                        }
                        courseGroups[course].push(suggestion);
                        
                        // Group by batch (year)
                        const batch = suggestion.user.batch || 'Other';
                        if (!batchGroups[batch]) {
                          batchGroups[batch] = [];
                        }
                        batchGroups[batch].push(suggestion);
                        
                        // Group by role (Student/Faculty)
                        const role = suggestion.user.role || 'Other';
                        if (!roleGroups[role]) {
                          roleGroups[role] = [];
                        }
                        roleGroups[role].push(suggestion);
                      });
                      
                      // First check if we have course groups with more than one entry
                      const hasMultipleCourses = Object.keys(courseGroups).length > 1;
                      const hasMultipleBatches = Object.keys(batchGroups).length > 1;
                      
                      // Determine the primary grouping method
                      let primaryGroups: Record<string, FriendSuggestion[]> = {};
                      let groupingTitle = "";
                      
                      if (hasMultipleCourses) {
                        primaryGroups = courseGroups;
                        groupingTitle = "Program";
                      } else if (hasMultipleBatches) {
                        primaryGroups = batchGroups;
                        groupingTitle = "Batch";
                      } else {
                        primaryGroups = roleGroups;
                        groupingTitle = "Role";
                      }
                      
                      return (
                        <div className="space-y-6">
                          {Object.entries(primaryGroups).map(([group, groupSuggestions]) => (
                            <div key={group} className="space-y-3">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                                {groupingTitle}: {group} ({groupSuggestions.length})
                              </h3>
                              {groupSuggestions.map(suggestion => (
                                <div key={suggestion?.user?.id || 'unknown'} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                  <div className="flex items-center space-x-4">
                                    <img
                                      src={getAvatarUrl(suggestion?.user?.avatar, suggestion?.user?.name || 'User')}
                                      alt={suggestion?.user?.name || 'User'}
                                      className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div>
                                      <h3 className="font-medium text-gray-900 dark:text-white">{suggestion?.user?.name || 'User'}</h3>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {suggestion?.user?.course && (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                                            {suggestion.user.course}
                                          </span>
                                        )}
                                        {suggestion?.user?.batch && (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                                            {suggestion.user.batch}
                                          </span>
                                        )}
                                        {suggestion?.user?.role && (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100">
                                            {suggestion.user.role}
                                          </span>
                                        )}
                                      </div>
                                      {suggestion?.mutualFriends > 0 && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                          {suggestion.mutualFriends} mutual {suggestion.mutualFriends === 1 ? 'friend' : 'friends'}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => {
                                        if (!suggestion?.user?.id) {
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
                                      onClick={() => suggestion?.user?.id && handleAddFriend(suggestion.user.id)}
                                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                                    >
                                      Add Friend
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
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
