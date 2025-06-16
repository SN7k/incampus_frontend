import React, { createContext, useContext, useState, ReactNode } from 'react';
<<<<<<< HEAD
import { mockUsers, mockPosts } from '../data/mockData';
=======
import { userApi, postApi } from '../services/api';
>>>>>>> a80153d (Update frontend)

// Define search result types
interface SearchResult {
  type: 'user' | 'post' | 'comment';
  id: string;
  title: string;
  subtitle: string;
  avatar?: string;
  url?: string;
}

interface SearchContextType {
  searchQuery: string;
  searchResults: SearchResult[];
  isSearching: boolean;
  setSearchQuery: (query: string) => void;
  performSearch: (query: string) => void;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Normalize query for case-insensitive search
    const normalizedQuery = query.toLowerCase().trim();
    
    // Search users
<<<<<<< HEAD
    const userResults = mockUsers
=======
    const userResults = userApi
>>>>>>> a80153d (Update frontend)
      .filter(user => 
        user.name.toLowerCase().includes(normalizedQuery) || 
        user.universityId.toLowerCase().includes(normalizedQuery) ||
        (user.bio && user.bio.toLowerCase().includes(normalizedQuery))
      )
      .map(user => ({
        type: 'user' as const,
        id: user.id,
        title: user.name,
        subtitle: user.universityId,
        avatar: user.avatar,
        url: `/profile/${user.id}`
      }));
    
    // Search posts
<<<<<<< HEAD
    const postResults = mockPosts
=======
    const postResults = postApi
>>>>>>> a80153d (Update frontend)
      .filter(post => 
        post.content.toLowerCase().includes(normalizedQuery)
      )
      .map(post => ({
        type: 'post' as const,
        id: post.id,
        title: post.user.name,
        subtitle: post.content.length > 60 ? post.content.substring(0, 60) + '...' : post.content,
        avatar: post.user.avatar,
        url: `/post/${post.id}`
      }));
    
    // Search comments
<<<<<<< HEAD
    const commentResults = mockPosts
=======
    const commentResults = postApi
>>>>>>> a80153d (Update frontend)
      .flatMap(post => 
        post.comments
          .filter(comment => comment.content.toLowerCase().includes(normalizedQuery))
          .map(comment => ({
            type: 'comment' as const,
            id: comment.id,
            title: comment.user.name,
            subtitle: comment.content.length > 60 ? comment.content.substring(0, 60) + '...' : comment.content,
            avatar: comment.user.avatar,
            url: `/post/${post.id}`
          }))
      );
    
    // Combine and sort results
    const allResults = [...userResults, ...postResults, ...commentResults];
    
    // Sort by relevance (simple implementation - could be improved)
    const sortedResults = allResults.sort((a, b) => {
      // Exact matches first
      const aExact = a.title.toLowerCase() === normalizedQuery || a.subtitle.toLowerCase() === normalizedQuery;
      const bExact = b.title.toLowerCase() === normalizedQuery || b.subtitle.toLowerCase() === normalizedQuery;
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      // Then prioritize by type: users > posts > comments
      const typeOrder = { user: 0, post: 1, comment: 2 };
      return typeOrder[a.type] - typeOrder[b.type];
    });
    
    setSearchResults(sortedResults);
    setIsSearching(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        searchResults,
        isSearching,
        setSearchQuery,
        performSearch,
        clearSearch
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};
