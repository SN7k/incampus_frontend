import React, { createContext, useContext, useState, ReactNode } from 'react';
import axiosInstance from '../utils/axios';

// Define the User interface directly in this file to avoid import issues
interface User {
  _id: string;
  id?: string; // For backward compatibility
  name: string;
  email: string;
  universityId: string;
  role: 'student' | 'teacher' | 'admin' | 'faculty';
  avatar: string;
  department?: string;
  batch?: string;
  status?: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
  bio?: string;
  coverPhoto?: string;
  relevance?: string[];
}

// Define AuthState with User type
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  error: string | null;
  loading: boolean;
}

interface LoginPayload {
  email?: string;
  universityId?: string;
  password: string;
  role: 'student' | 'faculty';
}

interface AuthContextType extends AuthState {
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  authenticateWithToken: (token: string, user: User) => void;
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
  error: string | null;
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

// Add a function to detect and fix authentication issues on page load
const checkAndFixAuthIssues = () => {
  // Check if there's a URL parameter indicating we should force logout
  const urlParams = new URLSearchParams(window.location.search);
  const forceLogout = urlParams.get('forceLogout');
  
  if (forceLogout === 'true') {
    console.log('Force logout parameter detected, clearing authentication data');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Remove the parameter from URL
    const newUrl = window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
    return true;
  }
  
  // Check for previous errors
  const hasAuthError = localStorage.getItem('authError');
  if (hasAuthError) {
    console.log('Previous authentication error detected, clearing authentication data');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('authError');
    return true;
  }
  
  // Check if we're completing onboarding - in this case, do NOT force logout
  const completingOnboarding = localStorage.getItem('completingOnboarding');
  if (completingOnboarding === 'true') {
    console.log('Detected onboarding completion flag in AuthContext, preserving authentication');
    return false;
  }
  
  return false;
};

// Execute the check immediately
const forcedLogout = checkAndFixAuthIssues();

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(() => {
    // If we've already forced a logout, return initial state
    if (forcedLogout) {
      return { ...initialState, loading: false };
    }
    
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        
        // Validate required fields
        if (!parsedUser || !parsedUser._id || !parsedUser.name || !parsedUser.email) {
          console.error('Invalid user data in localStorage:', parsedUser);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return { ...initialState, loading: false };
        }
        
        // Ensure user object has all required fields
        const validUser: User = {
          _id: parsedUser._id,
          id: parsedUser._id, // For backward compatibility
          name: parsedUser.name,
          email: parsedUser.email,
          universityId: parsedUser.universityId || '',
          role: parsedUser.role || 'student',
          avatar: parsedUser.avatar || '/default-avatar.png',
          createdAt: parsedUser.createdAt || new Date().toISOString(),
          updatedAt: parsedUser.updatedAt || new Date().toISOString(),
          bio: parsedUser.bio,
          coverPhoto: parsedUser.coverPhoto
        };
        
        // Set axios authorization header
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Add error interceptor to handle authentication errors
        axiosInstance.interceptors.response.use(
          response => response,
          error => {
            // Check if error is due to authentication
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
              console.error('Authentication error detected, clearing credentials');
              // Clear stored credentials
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              // Reset state
              setState(initialState);
              // Redirect to login page
              window.location.href = '/';
            }
            return Promise.reject(error);
          }
        );
        
        // If we're completing onboarding, ensure we stay authenticated
        const completingOnboarding = localStorage.getItem('completingOnboarding');
        if (completingOnboarding === 'true') {
          console.log('Completing onboarding, ensuring authentication state');
          return {
            isAuthenticated: true,
            user: validUser,
            error: null,
            loading: false
          };
        }
        
        return {
          isAuthenticated: true,
          user: validUser,
          error: null,
          loading: false
        };
      } catch (e) {
        console.error('Failed to parse saved user data', e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return { ...initialState, loading: false };
      }
    }
    return { ...initialState, loading: false };
  });

  const login = async (payload: LoginPayload) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('Sending login request with payload:', payload);
      
      const response = await axiosInstance.post<ApiResponse<{ token: string; user: User }>>('/api/auth/login', payload);

      if (response.data.status === 'success') {
        const { token, user } = response.data.data;
        
        // Ensure user object has all required fields
        const validUser: User = {
          _id: user._id,
          id: user._id, // For backward compatibility
          name: user.name,
          email: user.email,
          universityId: user.universityId || '',
          role: user.role || 'student',
          avatar: user.avatar || '/default-avatar.png',
          createdAt: user.createdAt || new Date().toISOString(),
          updatedAt: user.updatedAt || new Date().toISOString(),
          bio: user.bio,
          coverPhoto: user.coverPhoto
        };
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(validUser));
        
        // Set axios authorization header
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setState({
          isAuthenticated: true,
          user: validUser,
          loading: false,
          error: null
        });
        
        // Redirect to home page
        window.location.href = '/';
      } else {
        setState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: response.data.message
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: error.response?.data?.message || 'Authentication failed. Please try again.'
      });
      throw error; // Re-throw the error to be handled by the component
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
      const response = await axiosInstance.patch<ApiResponse<User>>(`/api/user/${state.user._id}`, profileData);
      
      if (response.data.status === 'success') {
        const updatedUser = response.data.data;
        
        // Ensure updated user has all required fields
        const validUser: User = {
          _id: updatedUser._id,
          id: updatedUser._id, // For backward compatibility
          name: updatedUser.name,
          email: updatedUser.email,
          universityId: updatedUser.universityId || '',
          role: updatedUser.role || 'student',
          avatar: updatedUser.avatar || '/default-avatar.png',
          createdAt: updatedUser.createdAt || new Date().toISOString(),
          updatedAt: updatedUser.updatedAt || new Date().toISOString()
        };
        
        localStorage.setItem('user', JSON.stringify(validUser));
        
        setState(prev => ({
          ...prev,
          user: validUser,
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
      // Validate required fields
      if (!user || !user._id || !user.name || !user.email) {
        console.error('Invalid user data in authenticateWithToken:', user);
        setState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: 'Invalid user data received from server'
        });
        return;
      }
      
      // Ensure user object has all required fields
      const validUser: User = {
        _id: user._id,
        id: user._id, // For backward compatibility
        name: user.name,
        email: user.email,
        universityId: user.universityId || '',
        role: user.role || 'student',
        avatar: user.avatar || '/default-avatar.png',
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: user.updatedAt || new Date().toISOString()
      };
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(validUser));
      
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setState({
        isAuthenticated: true,
        user: validUser,
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