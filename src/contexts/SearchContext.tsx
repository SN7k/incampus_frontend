import React, { createContext, useContext, useState, ReactNode } from 'react';
import { usersApi } from '../services/usersApi';
import { postsApi } from '../services/postsApi';
import { User, Post } from '../types';

// Define search result types
interface SearchResult {
  type: 'user' | 'post' | 'comment';
  id: string;
  title: string;
  subtitle: string;
  avatar?: { url: string; publicId?: string; };
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

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const normalizedQuery = query.toLowerCase().trim();

    try {
      // Fetch users and posts from API
      const [users, posts] = await Promise.all([
        usersApi.search(query),
        postsApi.getFeedPosts()
      ]);

      // Search users
      const userResults = users.users
        .filter((user: User) => 
          user.name.toLowerCase().includes(normalizedQuery) || 
          user.universityId.toLowerCase().includes(normalizedQuery) ||
          (user.bio && user.bio.toLowerCase().includes(normalizedQuery))
        )
        .map((user: User) => ({
          type: 'user' as const,
          id: user.id,
          title: user.name,
          subtitle: user.universityId,
          avatar: user.avatar,
          url: `/profile/${user.id}`
        }));

      // Search posts
      const postResults = posts
        .filter((post: Post) => 
          post.content.toLowerCase().includes(normalizedQuery)
        )
        .map((post: Post) => ({
          type: 'post' as const,
          id: post.id,
          title: post.user.name,
          subtitle: post.content.length > 60 ? post.content.substring(0, 60) + '...' : post.content,
          avatar: post.user.avatar,
          url: `/post/${post.id}`
        }));

      // Search comments
      const commentResults = posts
        .flatMap((post: Post) => 
          post.comments
            .filter((comment: any) => comment.content.toLowerCase().includes(normalizedQuery))
            .map((comment: any) => ({
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
      const sortedResults = allResults.sort((a, b) => {
        const aExact = a.title.toLowerCase() === normalizedQuery || a.subtitle.toLowerCase() === normalizedQuery;
        const bExact = b.title.toLowerCase() === normalizedQuery || b.subtitle.toLowerCase() === normalizedQuery;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        const typeOrder: { [key: string]: number } = { user: 0, post: 1, comment: 2 };
        return typeOrder[a.type] - typeOrder[b.type];
      });
      setSearchResults(sortedResults);
    } catch {
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
