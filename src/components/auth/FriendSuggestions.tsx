import React, { useState, useMemo, useEffect } from 'react';
import Button from '../ui/Button';
import { User } from '../../types';
import { Search } from 'lucide-react';
import { friendsApi } from '../../services/friendsApi';

interface FriendSuggestion {
  user: User;
  mutualFriends: number;
}

interface FriendSuggestionsProps {
  onComplete: (followedUsers: string[]) => void;
}

const FriendSuggestions: React.FC<FriendSuggestionsProps> = ({ onComplete }) => {
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const data: FriendSuggestion[] = await friendsApi.getFriendSuggestions();
        setSuggestions(data.map((s) => s.user));
      } catch {
        setSuggestions([]);
      }
    };
    fetchSuggestions();
  }, []);

  // Filter suggestions based on search query
  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return suggestions;
    const query = searchQuery.toLowerCase();
    return suggestions.filter(user => 
      user.name.toLowerCase().includes(query) || 
      user.universityId.toLowerCase().includes(query) ||
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
      // In a real app, you would send the followed users to your backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      onComplete(selectedUsers);
    } catch (error) {
      console.error('Failed to save followed users', error);
    } finally {
      setLoading(false);
    }
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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {filteredSuggestions.map(user => (
          <div 
            key={user.id}
            className={`p-4 rounded-lg border ${
              selectedUsers.includes(user.id)
                ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700'
            } transition-colors duration-200 cursor-pointer`}
            onClick={() => toggleUserSelection(user.id)}
          >
            <div className="flex items-center">
              <div className="relative">
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-12 h-12 rounded-full object-cover"
                />
                {selectedUsers.includes(user.id) && (
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
                  {user.role === 'faculty' ? 'Faculty' : 'Student'} • {user.role === 'faculty' ? 'Department' : 'Batch'} {user.universityId.split('/')[2]}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between items-center">
        <button
          onClick={() => onComplete([])}
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
