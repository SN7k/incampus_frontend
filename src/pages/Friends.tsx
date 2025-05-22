import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Users, UserPlus, UserCheck, MoreVertical, UserMinus, Check, X } from 'lucide-react';
import axiosInstance from '../utils/axios';

interface Friend {
  id: number;
  name: string;
  avatar: string;
  department: string;
}

interface FriendRequest {
  id: number;
  name: string;
  avatar: string;
  department: string;
  mutualFriends: number;
}

interface FriendSuggestion extends FriendRequest {
  relevance: string[];
}

interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
}

type FriendTab = 'friends' | 'requests' | 'suggestions';

const Friends: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<FriendTab>('friends');
  const [friendDropdowns, setFriendDropdowns] = useState<{[key: string]: boolean}>({});
  const dropdownRefs = useRef<{[key: string]: React.RefObject<HTMLDivElement>}>({});
  
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch friends
  const fetchFriends = async () => {
    if (!user) return;
    try {
      const response = await axiosInstance.get<ApiResponse<Friend[]>>(`/api/friends/${user.id}`);
      if (response.data.status === 'success') {
        setFriends(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch friends:', error);
      setError('Failed to load friends');
    }
  };

  // Fetch friend requests
  const fetchFriendRequests = async () => {
    if (!user) return;
    try {
      const response = await axiosInstance.get<ApiResponse<FriendRequest[]>>(`/api/friends/requests/${user.id}`);
      if (response.data.status === 'success') {
        setFriendRequests(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch friend requests:', error);
      setError('Failed to load friend requests');
    }
  };

  // Fetch sent requests
  const fetchSentRequests = async () => {
    if (!user) return;
    try {
      const response = await axiosInstance.get<ApiResponse<FriendRequest[]>>(`/api/friends/sent-requests/${user.id}`);
      if (response.data.status === 'success') {
        setSentRequests(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch sent requests:', error);
      setError('Failed to load sent requests');
    }
  };

  // Fetch suggestions
  const fetchSuggestions = async () => {
    if (!user) return;
    try {
      const response = await axiosInstance.get<ApiResponse<FriendSuggestion[]>>(`/api/friends/suggestions/${user.id}`);
      if (response.data.status === 'success') {
        setSuggestions(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setError('Failed to load suggestions');
    }
  };

  // Load all data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([
          fetchFriends(),
          fetchFriendRequests(),
          fetchSentRequests(),
          fetchSuggestions()
        ]);
      } catch (error) {
        console.error('Failed to load data:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user]);

  // Handle accepting a friend request
  const handleAcceptRequest = async (requestId: number) => {
    try {
      const response = await axiosInstance.post<ApiResponse<Friend>>(`/api/friends/accept/${requestId}`);
      if (response.data.status === 'success') {
        // Add to friends list
        setFriends(prev => [...prev, response.data.data]);
        // Remove from requests
        setFriendRequests(prev => prev.filter(req => req.id !== requestId));
        // Remove from suggestions if present
        setSuggestions(prev => prev.filter(sug => sug.id !== requestId));
      }
    } catch (error) {
      console.error('Failed to accept friend request:', error);
      setError('Failed to accept friend request');
    }
  };

  // Handle declining a friend request
  const handleDeclineRequest = async (requestId: number) => {
    try {
      const response = await axiosInstance.post<ApiResponse<void>>(`/api/friends/decline/${requestId}`);
      if (response.data.status === 'success') {
        setFriendRequests(prev => prev.filter(req => req.id !== requestId));
      }
    } catch (error) {
      console.error('Failed to decline friend request:', error);
      setError('Failed to decline friend request');
    }
  };

  // Handle adding a friend from suggestions
  const handleAddFriend = async (suggestionId: number) => {
    try {
      const response = await axiosInstance.post<ApiResponse<FriendRequest>>(`/api/friends/request/${suggestionId}`);
      if (response.data.status === 'success') {
        setSentRequests(prev => [...prev, response.data.data]);
        setSuggestions(prev => prev.filter(sug => sug.id !== suggestionId));
      }
    } catch (error) {
      console.error('Failed to send friend request:', error);
      setError('Failed to send friend request');
    }
  };

  // Handle unfriending a user
  const handleUnfriend = async (friendId: number) => {
    try {
      const response = await axiosInstance.delete<ApiResponse<void>>(`/api/friends/${friendId}`);
      if (response.data.status === 'success') {
        setFriends(prev => prev.filter(friend => friend.id !== friendId));
        // Close the dropdown
        const newDropdownState = {...friendDropdowns};
        newDropdownState[friendId] = false;
        setFriendDropdowns(newDropdownState);
      }
    } catch (error) {
      console.error('Failed to unfriend user:', error);
      setError('Failed to unfriend user');
    }
  };

  // Handle canceling a sent friend request
  const handleCancelRequest = async (requestId: number) => {
    try {
      const response = await axiosInstance.delete<ApiResponse<void>>(`/api/friends/request/${requestId}`);
      if (response.data.status === 'success') {
        setSentRequests(prev => prev.filter(req => req.id !== requestId));
      }
    } catch (error) {
      console.error('Failed to cancel friend request:', error);
      setError('Failed to cancel friend request');
    }
  };

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.entries(friendDropdowns).forEach(([friendId, isOpen]) => {
        if (isOpen) {
          const dropdownRef = dropdownRefs.current[friendId];
          if (dropdownRef && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setFriendDropdowns(prev => ({
              ...prev,
              [friendId]: false
            }));
          }
        }
      });
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [friendDropdowns]);

  if (!user) return null;

  // Filter out users who are already friends, have sent requests, or have received requests
  const validSuggestions = suggestions.filter(suggestion => 
    !friends.some(friend => friend.id === suggestion.id) &&
    !friendRequests.some(req => req.id === suggestion.id) &&
    !sentRequests.some(req => req.id === suggestion.id)
  );

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

  if (loading) {
    return (
      <div className="pt-20 pb-20 md:pb-0 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-20 pb-20 md:pb-0 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-20 md:pb-0 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="flex flex-col space-y-6 mt-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Friends</h1>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
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
                {(friendRequests.length > 0 || sentRequests.length > 0) && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs font-medium px-1 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                    {friendRequests.length + sentRequests.length}
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
                {validSuggestions.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-1 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                    {validSuggestions.length}
                  </span>
                )}
              </div>
              <span className="text-xs sm:text-sm">Suggestions</span>
            </button>
          </div>

          {/* Content */}
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-100 dark:border-gray-700"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            key={activeTab}
          >
            {activeTab === 'friends' && (
              <>
                {friends.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {friends.map(friend => (
                      <motion.div 
                        key={friend.id}
                        className="flex items-center p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        variants={itemVariants}
                      >
                        <img 
                          src={friend.avatar} 
                          alt={friend.name} 
                          className="w-12 h-12 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity" 
                          onClick={() => window.location.href = `/profile/${friend.id}`}
                        />
                        <div 
                          className="ml-3 cursor-pointer" 
                          onClick={() => window.location.href = `/profile/${friend.id}`}
                        >
                          <h3 className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{friend.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{friend.department}</p>
                        </div>
                        <div className="ml-auto relative">
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
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No friends found</h3>
                    <p className="text-gray-500 dark:text-gray-400">Try checking out suggestions</p>
                  </div>
                )}
              </>
            )}

            {activeTab === 'requests' && (
              <>
                {/* Received Requests Section */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Received Requests</h2>
                  {friendRequests.length > 0 ? (
                    <div className="space-y-4">
                      {friendRequests.map(request => (
                        <motion.div 
                          key={request.id}
                          className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          variants={itemVariants}
                        >
                          <div className="flex items-center">
                            <img 
                              src={request.avatar} 
                              alt={request.name} 
                              className="w-14 h-14 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity" 
                              onClick={() => window.location.href = `/profile/${request.id}`}
                            />
                            <div 
                              className="ml-3 cursor-pointer"
                              onClick={() => window.location.href = `/profile/${request.id}`}
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
                
                {/* Sent Requests Section */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Sent Requests</h2>
                  {sentRequests.length > 0 ? (
                    <div className="space-y-4">
                      {sentRequests.map(request => (
                        <motion.div 
                          key={request.id}
                          className="flex flex-col sm:flex-row sm:items-center p-4 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          variants={itemVariants}
                        >
                          <div className="flex items-center">
                            <img 
                              src={request.avatar} 
                              alt={request.name} 
                              className="w-14 h-14 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity" 
                              onClick={() => window.location.href = `/profile/${request.id}`}
                            />
                            <div 
                              className="ml-3 cursor-pointer"
                              onClick={() => window.location.href = `/profile/${request.id}`}
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
                  {validSuggestions.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {validSuggestions.map(suggestion => (
                        <motion.div 
                          key={suggestion.id}
                          className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          variants={itemVariants}
                        >
                          <div className="flex items-center">
                            <img 
                              src={suggestion.avatar} 
                              alt={suggestion.name} 
                              className="w-14 h-14 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity" 
                              onClick={() => window.location.href = `/profile/${suggestion.id}`}
                            />
                            <div 
                              className="ml-3 cursor-pointer"
                              onClick={() => window.location.href = `/profile/${suggestion.id}`}
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
                      <p className="text-gray-500 dark:text-gray-400">Try checking back later for new suggestions</p>
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
