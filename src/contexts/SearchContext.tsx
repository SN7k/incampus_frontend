import React, { createContext, useContext, useState, ReactNode } from 'react';
import axiosInstance from '../utils/axios';

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
  performSearch: (query: string) => Promise<void>;
  clearSearch: () => void;
}

interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
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

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      const response = await axiosInstance.get<ApiResponse<{
        users: Array<{
          id: string;
          name: string;
          universityId: string;
          avatar?: string;
          bio?: string;
        }>;
        posts: Array<{
          id: string;
          content: string;
          user: {
            id: string;
            name: string;
            avatar?: string;
          };
        }>;
        comments: Array<{
          id: string;
          content: string;
          user: {
            id: string;
            name: string;
            avatar?: string;
          };
          postId: string;
        }>;
      }>>(`/api/search?q=${encodeURIComponent(query)}`);

      if (response.data.status === 'success') {
        const { users, posts, comments } = response.data.data;

        // Transform users into search results
        const userResults = users.map(user => ({
          type: 'user' as const,
          id: user.id,
          title: user.name,
          subtitle: user.universityId,
          avatar: user.avatar,
          url: `/profile/${user.id}`
        }));

        // Transform posts into search results
        const postResults = posts.map(post => ({
          type: 'post' as const,
          id: post.id,
          title: post.user.name,
          subtitle: post.content.length > 60 ? post.content.substring(0, 60) + '...' : post.content,
          avatar: post.user.avatar,
          url: `/post/${post.id}`
        }));

        // Transform comments into search results
        const commentResults = comments.map(comment => ({
          type: 'comment' as const,
          id: comment.id,
          title: comment.user.name,
          subtitle: comment.content.length > 60 ? comment.content.substring(0, 60) + '...' : comment.content,
          avatar: comment.user.avatar,
          url: `/post/${comment.postId}`
        }));

        // Combine and sort results
        const allResults = [...userResults, ...postResults, ...commentResults];
        
        // Sort by relevance (simple implementation - could be improved)
        const sortedResults = allResults.sort((a, b) => {
          // Exact matches first
          const normalizedQuery = query.toLowerCase();
          const aExact = a.title.toLowerCase() === normalizedQuery || a.subtitle.toLowerCase() === normalizedQuery;
          const bExact = b.title.toLowerCase() === normalizedQuery || b.subtitle.toLowerCase() === normalizedQuery;
          
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;
          
          // Then prioritize by type: users > posts > comments
          const typeOrder = { user: 0, post: 1, comment: 2 };
          return typeOrder[a.type] - typeOrder[b.type];
        });

        setSearchResults(sortedResults);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
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
