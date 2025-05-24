import React, { useState, useMemo, useEffect } from 'react';
import Button from '../ui/Button';
import { User } from '../../types';
import { Search } from 'lucide-react';
import { friendService } from '../../services/friendService';
import { setRegistrationFlags, saveToken } from '../../utils/authFlowHelpers';
import axiosInstance from '../../utils/axios';

interface FriendSuggestionsProps {
  currentUser?: Partial<User>;
}

const FriendSuggestions: React.FC<FriendSuggestionsProps> = () => {
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setRegistrationFlags();
        
        let token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
          const cookies = document.cookie.split(';');
          const authCookie = cookies.find(cookie => cookie.trim().startsWith('authToken='));
          if (authCookie) {
            token = authCookie.split('=')[1];
            saveToken(token);
          }
        }
        
        if (!token) {
          console.error('No authentication token found during friend suggestions load');
          setError('Authentication error. Please try logging in again.');
          return;
        }
        
        friendService.setAuthToken(token);
        
        const data = await friendService.getSuggestions();
        setSuggestions(data);
      } catch (err) {
        setError('Failed to load suggestions');
        console.error('Error fetching suggestions:', err);
      }
    };
    fetchSuggestions();
  }, []);
  
  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return suggestions;
    
    const query = searchQuery.toLowerCase();
    return suggestions.filter(user => 
      user.name.toLowerCase().includes(query) || 
      (user.collegeId && user.collegeId.toLowerCase().includes(query)) ||
      (user.role && user.role.toLowerCase().includes(query))
    );
  }, [suggestions, searchQuery]);
  
  const toggleUserSelection = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };
  
  const handleComplete = async () => {
    setLoading(true);
    try {
      localStorage.setItem('justCompletedRegistration', 'true');
      localStorage.setItem('completedFriendSuggestions', 'true');
      localStorage.setItem('registrationStep', 'completed');
      localStorage.setItem('registrationCompleted', 'true');
      
      let token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        const cookies = document.cookie.split(';');
        const authCookie = cookies.find(cookie => cookie.trim().startsWith('authToken='));
        if (authCookie) {
          token = authCookie.split('=')[1];
          saveToken(token);
        }
      }
      
      if (!token) {
        console.error('No authentication token found during friend suggestions completion');
        setError('Authentication error. Please try logging in again.');
        setLoading(false);
        return;
      }
      
      localStorage.setItem('token', token);
      sessionStorage.setItem('token', token);
      document.cookie = `authToken=${token}; path=/; max-age=86400`; 
      
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          parsedUser.hasCompletedRegistration = true;
          localStorage.setItem('user', JSON.stringify(parsedUser));
          sessionStorage.setItem('user', JSON.stringify(parsedUser));
        } catch (e) {
          console.error('Error updating user data:', e);
        }
      }
      
      if (typeof axiosInstance !== 'undefined') {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      friendService.setAuthToken(token);
      
      if (selectedUsers.length > 0) {
        try {
          await Promise.all(
            selectedUsers.map(userId => friendService.sendFriendRequest(userId))
          );
          console.log(`Successfully followed ${selectedUsers.length} users`);
        } catch (followError) {
          console.error('Error following users:', followError);
        }
      }
      
      console.log('Friend suggestions complete, redirecting to feed');
      
      setTimeout(() => {
        try {
          window.location.href = '/';
        } catch (error) {
          console.error('Navigation error:', error);
          window.location.replace('/');
        }
      }, 500);
    } catch (error) {
      setError('Failed to send friend requests');
      console.error('Failed to save followed users', error);
      
      setTimeout(() => {
        try {
          window.location.href = '/';
        } catch (navError) {
          console.error('Navigation error after handling error:', navError);
        }
      }, 1000);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSkip = () => {
    setLoading(true);
    
    setSelectedUsers([]);
    
    try {
      console.log('Skipping friend suggestions and completing onboarding');
      
      let token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        const cookies = document.cookie.split(';');
        const authCookie = cookies.find(cookie => cookie.trim().startsWith('authToken='));
        if (authCookie) {
          token = authCookie.split('=')[1];
        }
      }
      
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
      
      if (!token || !userStr) {
        console.error('Missing authentication data during friend suggestions skip');
        setError('Authentication error. Please try logging in again.');
        setLoading(false);
        return;
      }
      
      localStorage.setItem('token', token);
      sessionStorage.setItem('token', token);
      document.cookie = `authToken=${token}; path=/; max-age=86400`; 
      
      let userData = null;
      
      try {
        userData = JSON.parse(userStr);
        console.log('User data parsed successfully:', userData);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
      
      setTimeout(() => {
        console.log('CRITICAL FIX: Using direct navigation to go to feed page');
        window.location.href = '/';
      }, 100);
    } catch (error) {
      console.error('Error in handleSkip:', error);
      setError('Failed to complete onboarding');
      setLoading(false);
      
      setTimeout(() => {
        try {
          window.location.href = '/';
        } catch (navError) {
          console.error('Navigation error after handling error:', navError);
        }
      }, 1000);
    }
  };
  
  const getBatchOrDepartment = (user: User) => {
    if (!user.collegeId) return '';
    const parts = user.collegeId.split('/');
    return parts[2] || '';
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-lg w-full">
      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold text-blue-900 dark:text-blue-400 mb-2">Find People You Know</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Follow people to see their posts in your feed
        </p>
        
        {/* Search input */}
        <div className="relative max-w-md mx-auto mb-4">
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2 pl-10 pr-4 rounded-full border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          <div className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500">
            <Search size={18} />
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {filteredSuggestions.map(user => (
          <div 
            key={user._id}
            className={`p-4 rounded-lg border ${
              selectedUsers.includes(user._id)
                ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700'
            } transition-colors duration-200 cursor-pointer`}
            onClick={() => toggleUserSelection(user._id)}
          >
            <div className="flex items-center">
              <div className="relative">
                <img 
                  src={user.avatar || '/default-avatar.png'} 
                  alt={user.name} 
                  className="w-12 h-12 rounded-full object-cover"
                />
                {selectedUsers.includes(user._id) && (
                  <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center border-2 border-white dark:border-gray-800">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                )}
              </div>
              <div className="ml-3">
                <div className="font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {user.role === 'faculty' ? 'Faculty' : 'Student'} • {user.role === 'faculty' ? 'Department' : 'Batch'} {getBatchOrDepartment(user)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between items-center">
        <button
          onClick={handleSkip}
          disabled={loading}
          className="text-gray-500 dark:text-gray-400 text-sm hover:text-blue-800 dark:hover:text-blue-400"
        >
          Skip for now
        </button>
        
        <Button
          onClick={handleComplete}
          loading={loading}
          disabled={selectedUsers.length === 0}
          size="lg"
        >
          {selectedUsers.length > 0 ? `Follow ${selectedUsers.length} ${selectedUsers.length === 1 ? 'Person' : 'People'}` : 'Continue'}
        </Button>
      </div>
    </div>
  );
};

export default FriendSuggestions;
