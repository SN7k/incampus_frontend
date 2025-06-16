import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../services/api';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (emailOrId: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null
  });

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await authApi.getCurrentUser();
          if (response.status === 'success') {
            setState({
              isAuthenticated: true,
              user: response.data.user,
              loading: false,
              error: null
            });
          } else {
            // Invalid token, clear it
            localStorage.removeItem('token');
            setState(prev => ({ ...prev, loading: false }));
          }
        } else {
          setState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    checkAuth();
  }, []);

  const login = async (emailOrId: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await authApi.login(emailOrId, password);
      
      if (response.status === 'success') {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        
        setState({
          isAuthenticated: true,
          user,
          loading: false,
          error: null
        });
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: response.message || 'Login failed'
        }));
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || 'Login failed. Please try again.'
      }));
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setState({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null
    });
  };

  const updateProfile = async (data: Partial<User>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await authApi.updateProfile(data);
      
      if (response.status === 'success') {
        setState(prev => ({
          ...prev,
          user: { ...prev.user!, ...response.data.user },
          loading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: response.message || 'Failed to update profile'
        }));
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || 'Failed to update profile. Please try again.'
      }));
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};