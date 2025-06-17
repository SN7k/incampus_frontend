import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AuthState, User } from '../types';
import { authApi, tokenService } from '../services/authApi';
import { usersApi } from '../services/usersApi';

interface AuthContextType extends AuthState {
  login: (identifier: string, password: string, role: 'student' | 'faculty') => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: Partial<User>) => void;
  signup: (email: string, password: string, collegeId: string, name: string, role: 'student' | 'faculty') => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
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
  updateProfile: () => {},
  signup: async () => {},
  verifyOTP: async () => {},
  resendOTP: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from localStorage if available
  const [state, setState] = useState<AuthState>(() => {
    const savedAuth = localStorage.getItem('authState');
    if (savedAuth) {
      try {
        return JSON.parse(savedAuth) as AuthState;
      } catch (e) {
        console.error('Failed to parse saved auth state', e);
        return initialState;
      }
    }
    return initialState;
  });

  const signup = async (
    email: string,
    password: string,
    collegeId: string,
    name: string,
    role: 'student' | 'faculty'
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await authApi.signup(email, password, collegeId, name, role);
      
      // Store token
      tokenService.setToken(response.data.token);
      
      const newState = {
        isAuthenticated: true,
        user: response.data.user,
        loading: false,
        error: null
      };
      
      setState(newState);
      localStorage.setItem('authState', JSON.stringify(newState));
      localStorage.setItem('currentPage', 'feed');
    } catch (error: any) {
      setState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: error.message || 'Signup failed'
      });
      throw error;
    }
  };

  const login = async (identifier: string, password: string, role: 'student' | 'faculty') => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await authApi.login(identifier, password, role);
      
      // Store token
      tokenService.setToken(response.data.token);
      
      const newState = {
        isAuthenticated: true,
        user: response.data.user,
        loading: false,
        error: null
      };
      
      setState(newState);
      localStorage.setItem('authState', JSON.stringify(newState));
      localStorage.setItem('currentPage', 'feed');
    } catch (error: any) {
      setState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: error.message || 'Login failed'
      });
      throw error;
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await authApi.verifyOTP(email, otp);
      
      // Store token
      tokenService.setToken(response.data.token);
      
      const newState = {
        isAuthenticated: true,
        user: response.data.user,
        loading: false,
        error: null
      };
      
      setState(newState);
      localStorage.setItem('authState', JSON.stringify(newState));
      localStorage.setItem('currentPage', 'feed');
    } catch (error: any) {
      setState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: error.message || 'OTP verification failed'
      });
      throw error;
    }
  };

  const resendOTP = async (email: string) => {
    try {
      await authApi.resendOTP(email);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to resend OTP');
    }
  };

  const logout = () => {
    tokenService.removeToken();
    setState(initialState);
    localStorage.removeItem('authState');
    localStorage.removeItem('currentPage');
  };

  const updateProfile = async (profileData: Partial<User>) => {
    if (!state.user) return;
    
    try {
      const updatedUser = await usersApi.updateCurrentUser(profileData);
      
      const newState = {
        ...state,
        user: updatedUser
      };
      
      setState(newState);
      localStorage.setItem('authState', JSON.stringify(newState));
    } catch (error: any) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      ...state, 
      login, 
      logout, 
      updateProfile, 
      signup, 
      verifyOTP, 
      resendOTP 
    }}>
      {children}
    </AuthContext.Provider>
  );
};