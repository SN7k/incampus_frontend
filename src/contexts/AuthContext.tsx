import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AuthState, User } from '../types';
import axiosInstance from '../utils/axios';

interface AuthContextType extends AuthState {
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
}

interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  error: null,
  loading: false
};

const AuthContext = createContext<AuthContextType>({
  ...initialState,
  login: async () => {},
  logout: () => {},
  updateProfile: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        return {
          isAuthenticated: true,
          user: JSON.parse(savedUser),
          error: null,
          loading: false
        };
      } catch (e) {
        console.error('Failed to parse saved user data', e);
        return initialState;
      }
    }
    return initialState;
  });

  const login = async (identifier: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await axiosInstance.post<ApiResponse<{ token: string; user: User }>>('/api/auth/login', {
        identifier,
        password
      });

      if (response.data.status === 'success') {
        const { token, user } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        setState({
          isAuthenticated: true,
          user,
          loading: false,
          error: null
        });
      } else {
        setState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: response.data.message
        });
      }
    } catch (error: any) {
      setState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: error.response?.data?.message || 'Authentication failed. Please try again.'
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setState(initialState);
  };

  const updateProfile = async (profileData: Partial<User>) => {
    if (!state.user) return;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await axiosInstance.patch<ApiResponse<User>>(`/api/user/${state.user.id}`, profileData);
      
      if (response.data.status === 'success') {
        const updatedUser = response.data.data;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setState(prev => ({
          ...prev,
          user: updatedUser,
          loading: false,
          error: null
        }));
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: response.data.message
        }));
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || 'Failed to update profile'
      }));
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};