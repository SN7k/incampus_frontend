import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AuthState, User } from '../types';
import { authApi, tokenService } from '../services/authApi';
import { usersApi } from '../services/usersApi';

interface AuthContextType extends AuthState {
  login: (identifier: string, password: string, role: 'student' | 'faculty') => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: Partial<User>) => void;
  updateProfileState: (profileData: Partial<User>) => void;
  signup: (email: string, password: string, collegeId: string, name: string, role: 'student' | 'faculty') => Promise<any>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
  clearCorruptedData: () => void;
  authApi: typeof authApi;
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
  updateProfileState: () => {},
  signup: async () => ({}),
  verifyOTP: async () => {},
  resendOTP: async () => {},
  clearCorruptedData: () => {},
  authApi: authApi,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from localStorage if available
  const [state, setState] = useState<AuthState>(() => {
    const savedAuth = localStorage.getItem('authState');
    if (savedAuth) {
      try {
        const parsedAuth = JSON.parse(savedAuth) as AuthState;
        
        // Validate the parsed data structure
        if (parsedAuth && typeof parsedAuth === 'object') {
          // Check if user object has required properties
          if (parsedAuth.user && typeof parsedAuth.user === 'object') {
            const user = parsedAuth.user;
            
            // Ensure avatar has proper structure
            if (user.avatar && typeof user.avatar === 'object') {
              if (!user.avatar.url || typeof user.avatar.url !== 'string') {
                console.warn('Invalid avatar structure, resetting to default');
                user.avatar = { url: '' };
              }
            } else if (user.avatar && typeof user.avatar === 'string') {
              // Convert string avatar to object format
              user.avatar = { url: user.avatar };
            } else {
              // Set default avatar if missing
              user.avatar = { url: '' };
            }
            
            // Ensure other required fields exist
            if (!user.name || typeof user.name !== 'string') {
              user.name = 'User';
            }
            if (!user.id || typeof user.id !== 'string') {
              console.warn('Invalid user ID, clearing auth state');
              return initialState;
            }
            
            return parsedAuth;
          } else if (parsedAuth.user === null) {
            // Valid null user state
            return parsedAuth;
          }
        }
        
        console.warn('Invalid auth state structure, clearing');
        localStorage.removeItem('authState');
        return initialState;
      } catch (e) {
        console.error('Failed to parse saved auth state', e);
        localStorage.removeItem('authState');
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
      
      // Don't log in automatically - wait for OTP verification
      // Just show success message and clear loading state
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: null 
      }));
      
      // Return the response for the parent component to handle OTP flow
      return response;
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
      
      // Validate the response data before storing
      if (!response.data || !response.data.user || !response.data.token) {
        throw new Error('Invalid response from server');
      }
      
      // Ensure user data has proper structure
      const userData = response.data.user;
      
      // Validate and fix avatar structure
      if (userData.avatar && typeof userData.avatar === 'object') {
        if (!userData.avatar.url || typeof userData.avatar.url !== 'string') {
          userData.avatar = { url: '' };
        }
      } else if (userData.avatar && typeof userData.avatar === 'string') {
        userData.avatar = { url: userData.avatar };
      } else {
        userData.avatar = { url: '' };
      }
      
      // Ensure other required fields
      if (!userData.name || typeof userData.name !== 'string') {
        userData.name = 'User';
      }
      if (!userData.id || typeof userData.id !== 'string') {
        throw new Error('Invalid user data received');
      }
      
      // Store token
      tokenService.setToken(response.data.token);
      
      const newState = {
        isAuthenticated: true,
        user: userData,
        loading: false,
        error: null
      };
      
      setState(newState);
      localStorage.setItem('authState', JSON.stringify(newState));
      localStorage.setItem('currentPage', 'feed');
    } catch (error: any) {
      // Clear any corrupted data
      localStorage.removeItem('authState');
      localStorage.removeItem('currentPage');
      
      // Check if the error message indicates the email/ID is already registered
      let errorMessage = 'Login failed';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: errorMessage
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

  // Function to update profile state directly without API call
  const updateProfileState = (profileData: Partial<User>) => {
    if (!state.user) return;
    
    console.log('updateProfileState called with:', profileData);
    console.log('Current user state:', state.user);
    
    const updatedUser = {
      ...state.user,
      ...profileData
    };
    
    console.log('Updated user object:', updatedUser);
    
    const newState = {
      ...state,
      user: updatedUser
    };
    
    console.log('New auth state:', newState);
    
    setState(newState);
    localStorage.setItem('authState', JSON.stringify(newState));
    
    console.log('AuthContext state updated successfully');
  };

  const clearCorruptedData = () => {
    // Clear all localStorage data
    localStorage.removeItem('authState');
    localStorage.removeItem('currentPage');
    localStorage.removeItem('previousPage');
    localStorage.removeItem('viewProfileUserId');
    
    // Clear token
    tokenService.removeToken();
    
    // Reset state
    setState(initialState);
    
    console.log('Corrupted data cleared, please login again');
  };

  return (
    <AuthContext.Provider value={{ 
      ...state, 
      login, 
      logout, 
      updateProfile, 
      updateProfileState,
      signup, 
      verifyOTP, 
      resendOTP,
      clearCorruptedData,
      authApi: authApi,
    }}>
      {children}
    </AuthContext.Provider>
  );
};