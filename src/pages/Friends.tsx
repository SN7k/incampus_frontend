import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, UserPlus, UserCheck, MoreVertical, UserMinus, Check, X } from 'lucide-react';
import { friendsApi, FriendRequest, FriendSuggestion } from '../services/friendsApi';
import { getAvatarUrl } from '../utils/avatarUtils';
import { User } from '../types';
import PullToRefresh from 'react-simple-pull-to-refresh';

type FriendTab = 'friends' | 'requests' | 'suggestions';

const Friends: React.FC = () => {
  useAuth();
  const [activeTab, setActiveTab] = useState<FriendTab>(() => {
    const savedTab = localStorage.getItem('friendsActiveTab');
    if (savedTab) {
      localStorage.removeItem('friendsActiveTab');
    }
    return (savedTab === 'friends' || savedTab === 'requests' || savedTab === 'suggestions') 
      ? savedTab as FriendTab 
      : 'friends';
  });

  // State for dropdown menus for each friend
  const [friendDropdowns, setFriendDropdowns] = useState<{[key: string]: boolean}>({});
  const dropdownRefs = useRef<{[key: string]: React.RefObject<HTMLDivElement>}>({});

  const [friends, setFriends] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([]);

  // Load data based on active tab
  const loadData = useCallback(async () => {
    try {
      if (activeTab === 'friends') {
        const data = await friendsApi.getFriendsList();
        setFriends(data);
      } else if (activeTab === 'requests') {
        const [receivedData, sentData] = await Promise.all([
          friendsApi.getPendingRequests(),
          friendsApi.getSentRequests()
        ]);
        setFriendRequests(receivedData);
        setSentRequests(sentData);
      } else if (activeTab === 'suggestions') {
        let data: FriendSuggestion[] = [];
        while (data.length === 0) {
          try {
            data = await friendsApi.getFriendSuggestions();
          } catch (error) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        setSuggestions(data);
      }
    } catch {}
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

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.entries(friendDropdowns).forEach(([friendId, isOpen]) => {
        if (isOpen) {
          const dropdownRef = dropdownRefs.current[friendId];
          if (dropdownRef && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setFriendDropdowns(prev => ({ ...prev, [friendId]: false }));
          }
        }
      });
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [friendDropdowns]);

  // Navigation
  const navigateToProfile = (userId: string) => {
    localStorage.setItem('viewProfileUserId', userId);
    window.dispatchEvent(new CustomEvent('navigate', { 
      detail: { page: 'profile', userId: userId } 
    }));
  };

  // Accept friend request
  const handleAcceptRequest = async (requestId: string) => {
    try {
      const result = await friendsApi.acceptFriendRequest(requestId);
      const request = friendRequests.find(req => req.id === requestId);
      if (request && result) {
        setFriends(prev => [...prev, request.sender]);
        setFriendRequests(prev => prev.filter(req => req.id !== requestId));
      }
    } catch {}
  };

  // Decline friend request
  const handleDeclineRequest = async (requestId: string) => {
    try {
      await friendsApi.declineFriendRequest(requestId);
      setFriendRequests(prev => prev.filter(req => req.id !== requestId));
    } catch {}
  };

  // Cancel sent request
  const handleCancelRequest = async (requestId: string) => {
    try {
      await friendsApi.cancelSentRequest(requestId);
      setSentRequests(prev => prev.filter(req => req.id !== requestId));
    } catch {}
  };

  // Add friend from suggestions
  const handleAddFriend = async (suggestionId: string) => {
    try {
      await friendsApi.sendFriendRequest(suggestionId);
      setSuggestions(prev => prev.filter(sugg => sugg.user.id !== suggestionId));
    } catch {}
  };

  // Unfriend
  const handleUnfriend = async (friendId: string) => {
    try {
      await friendsApi.unfriend(friendId);
      setFriends(prev => prev.filter(friend => friend.id !== friendId));
    } catch {}
  };

  // Tab content
  const filteredFriends = friends;
  const filteredRequests = friendRequests;
  const filteredSuggestions = suggestions.filter(s => s.user && s.user.id && s.user.name);

  const handleRefresh = async () => {
    await loadData();
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}
      pullingContent={
        <div className="flex items-center justify-center py-4 z-50 relative mt-16">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      }
      refreshingContent={
        <div className="flex items-center justify-center py-4 z-50 relative mt-16">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      }
    >
      <div className="pt-20 pb-20 md:pb-0 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 mt-2">Friends</h1>
          <div className="mb-8">
            <div className="grid grid-cols-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 w-full">
              <button
                className={`flex flex-col sm:flex-row items-center justify-center sm:justify-start px-2 sm:px-4 py-3 ${activeTab === 'friends' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 font-medium' : 'text-gray-600 dark:text-gray-400'}`}
                onClick={() => setActiveTab('friends')}
              >
                <UserCheck size={18} className="mb-1 sm:mb-0 sm:mr-2" />
                <span className="text-xs sm:text-sm">Friends</span>
              </button>
              <button
                className={`flex flex-col sm:flex-row items-center justify-center sm:justify-start px-2 sm:px-4 py-3 ${activeTab === 'requests' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 font-medium' : 'text-gray-600 dark:text-gray-400'}`}
                onClick={() => setActiveTab('requests')}
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
                onClick={() => setActiveTab('suggestions')}
              >
                <div className="relative">
                  <Users size={18} className="mb-1 sm:mb-0 sm:mr-2" />
                  {filteredSuggestions.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-1 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                      {filteredSuggestions.length}
                    </span>
                  )}
                </div>
                <span className="text-xs sm:text-sm">Suggestions</span>
              </button>
            </div>
          </div>
          {activeTab === 'friends' && (
            <>
              {filteredFriends.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredFriends.map(friend => (
                    <div 
                      key={friend.id}
                      className="flex items-center p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      <img 
                        src={getAvatarUrl(friend.avatar, friend.name)} 
                        alt={friend.name} 
                        className="w-12 h-12 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity" 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateToProfile(friend.id);
                        }}
                        data-profile-id={friend.id}
                      />
                      <div 
                        className="ml-3 cursor-pointer" 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateToProfile(friend.id);
                        }}
                        data-profile-id={friend.id}
                      >
                        <h3 className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{friend.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{friend.role === 'faculty' ? 'Faculty' : friend.universityId}</p>
                      </div>
                      <div className="ml-auto relative">
                        {/* Initialize ref for this friend if it doesn't exist */}
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
                            const newDropdownState = {...friendDropdowns};
                            Object.keys(newDropdownState).forEach(key => {
                              newDropdownState[key] = false;
                            });
                            newDropdownState[friend.id] = !friendDropdowns[friend.id];
                            setFriendDropdowns(newDropdownState);
                          }}
                        >
                          <MoreVertical size={18} />
                        </button>
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
                    </div>
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
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Received Requests</h2>
                {filteredRequests.length > 0 ? (
                  <div className="space-y-4">
                    {filteredRequests.map(request => (
                      <div 
                        key={request.id}
                        className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        <div className="flex items-center">
                          <img 
                            src={getAvatarUrl(request.sender.avatar, request.sender.name)} 
                            alt={request.sender.name} 
                            className="w-14 h-14 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity" 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateToProfile(request.sender.id);
                            }}
                          />
                          <div 
                            className="ml-3 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateToProfile(request.sender.id);
                            }}
                          >
                            <h3 className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{request.sender.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{request.sender.role === 'faculty' ? 'Faculty' : request.sender.universityId}</p>
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
                      </div>
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
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Sent Requests</h2>
                {sentRequests.filter(req => req.status === 'pending').length > 0 ? (
                  <div className="space-y-4">
                    {sentRequests
                      .filter(req => req.status === 'pending')
                      .map(request => (
                        <div 
                          key={request.id}
                          className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          <div className="flex items-center cursor-pointer" onClick={() => navigateToProfile(request.receiver.id)}>
                            <img
                              src={getAvatarUrl(request.receiver.avatar, request.receiver.name)}
                              alt={request.receiver.name}
                              className="w-14 h-14 rounded-full object-cover mr-3"
                            />
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{request.receiver.name}</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{request.receiver.role === 'faculty' ? 'Faculty' : request.receiver.universityId}</p>
                              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Pending approval</p>
                            </div>
                          </div>
                          <button
                            className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/40 text-red-600 dark:text-red-400 rounded-full ml-2"
                            onClick={() => handleCancelRequest(request.id)}
                            aria-label="Cancel Request"
                            title="Cancel Request"
                          >
                            <X size={20} />
                          </button>
                        </div>
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
                {filteredSuggestions.length > 0 ? (
                  <div className="space-y-2">
                    {filteredSuggestions.map(suggestion => (
                      <div 
                        key={suggestion.user.id}
                        className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                      >
                        <div className="flex items-center cursor-pointer" onClick={() => navigateToProfile(suggestion.user.id)}>
                          <img
                            src={getAvatarUrl(suggestion.user.avatar, suggestion.user.name)}
                            alt={suggestion.user.name}
                            className="w-10 h-10 rounded-full object-cover mr-3"
                          />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{suggestion.user.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{suggestion.user.universityId}</div>
                          </div>
                        </div>
                        <button
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full"
                          onClick={() => handleAddFriend(suggestion.user.id)}
                          aria-label="Add Friend"
                          title="Add Friend"
                        >
                          <UserPlus size={20} />
                        </button>
                      </div>
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
        </div>
      </div>
    </PullToRefresh>
  );
};

export default Friends;
