import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useSearch } from '../../contexts/SearchContext';
import { getAvatarUrl } from '../../utils/avatarUtils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile?: boolean;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, isMobile = false }) => {
  // Local state for the input value to ensure it works on mobile
  const [inputValue, setInputValue] = useState('');
  
  const { 
    searchQuery,
    setSearchQuery, 
    searchResults, 
    performSearch,
    clearSearch,
    isSearching 
  } = useSearch();

  // Sync local input value with search context when modal opens
  useEffect(() => {
    if (isOpen) {
      setInputValue(searchQuery);
    }
  }, [isOpen, searchQuery]);

  // Handle local input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value); // Update local state immediately
    
    // Update search context and perform search
    setSearchQuery(value);
    if (value.trim().length >= 2) {
      performSearch(value);
    } else {
      clearSearch();
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      performSearch(inputValue);
    }
  };
  
  const handleSearchResultClick = (url: string) => {
    // Navigate to the result
    onClose();
    
    // Extract page from URL
    const page = url.split('/')[1];
    if (page === 'profile' || page === 'post') {
      const id = url.split('/')[2];
      if (page === 'profile') {
        localStorage.setItem('viewProfileUserId', id);
      }
      window.dispatchEvent(new CustomEvent('navigate', { detail: { page } }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 ${isMobile ? 'md:hidden' : ''}`}>
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className={`relative bg-white dark:bg-gray-800 w-full mx-auto ${isMobile ? 'mt-16' : 'mt-20'} rounded-lg shadow-xl overflow-hidden max-w-md`}>
        {/* Header with search input */}
        <div className="p-2 flex items-center border-b border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search InCampus..."
              value={inputValue}
              onChange={handleInputChange}
              autoFocus
              className="block w-full pl-10 pr-3 py-2 border-0 focus:ring-0 bg-transparent placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none text-gray-900 dark:text-gray-100"
            />
          </form>
        </div>
        
        {/* Search results */}
        <div className="p-4">
          {isSearching ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 dark:border-blue-400"></div>
            </div>
          ) : inputValue.length < 2 ? (
            <div className="py-4"></div>
          ) : searchResults.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-4">
              No results found for "{inputValue}"
            </div>
          ) : (
            <>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Results ({searchResults.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searchResults.map((result) => (
                  <div 
                    key={`${result.type}-${result.id}`}
                    className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => handleSearchResultClick(result.url || '#')}
                  >
                    <img 
                      src={getAvatarUrl(result.avatar, result.title, 32)} 
                      alt={result.title}
                      className="w-8 h-8 rounded-full object-cover mr-3"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                        {result.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {result.type === 'user' ? 'User' : result.type === 'post' ? 'Post' : 'Comment'}: {result.subtitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
