import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AuthState, User } from '../types';
import axiosInstance from '../utils/axios';

interface AuthContextType extends AuthState {
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  authenticateWithToken: (token: string, user: User) => void;
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
  updateProfile: async () => {},
  authenticateWithToken: () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        // Parse the user data and validate it has an ID
        const parsedUser = JSON.parse(savedUser);
        
        // Validate that the user object has the required fields
        if (!parsedUser || !parsedUser.id) {
          console.error('Invalid user data in localStorage:', parsedUser);
          // Clear invalid data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return { ...initialState, loading: false };
        }
        
        // Set the token in axios instance
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        console.log('Successfully restored auth state with user:', parsedUser.id);
        return {
          isAuthenticated: true,
          user: parsedUser,
          error: null,
          loading: false
        };
      } catch (e) {
        console.error('Failed to parse saved user data', e);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return { ...initialState, loading: false };
      }
    }
    return { ...initialState, loading: false };
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

  const authenticateWithToken = (token: string, user: User) => {
    try {
      // Validate user data before storing
      if (!user || !user.id) {
        console.error('Invalid user data in authenticateWithToken:', user);
        setState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: 'Invalid user data received from server'
        });
        return;
      }
      
      console.log('Authenticating with token, user ID:', user.id);
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set the token in axios instance
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update auth state
      setState({
        isAuthenticated: true,
        user,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error in authenticateWithToken:', error);
      setState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: 'Failed to authenticate user'
      });
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateProfile, authenticateWithToken }}>
      {children}
    </AuthContext.Provider>
  );
};