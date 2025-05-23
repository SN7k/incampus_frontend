import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axiosInstance from '../utils/axios';
import { hasRegistrationFlags } from '../utils/authFlowHelpers';

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

export interface LoginPayload {
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
  // Always remove the forceLogout parameter from URL, regardless of whether we clear auth data
  const urlParams = new URLSearchParams(window.location.search);
  
  // Check for all possible registration completion flags
  const inRegistrationFlow = localStorage.getItem('inRegistrationFlow');
  const completingOnboarding = localStorage.getItem('completingOnboarding');
  const justCompletedRegistration = localStorage.getItem('justCompletedRegistration');
  const redirectAfterRegistration = sessionStorage.getItem('redirectAfterRegistration');
  const bypassTokenVerification = localStorage.getItem('bypassTokenVerification');
  const comingFromRegistration = localStorage.getItem('comingFromRegistration');
  
  // Check if any registration completion flags are set
  const hasRegistrationFlags = 
    justCompletedRegistration === 'true' || 
    redirectAfterRegistration === 'true' || 
    bypassTokenVerification === 'true' || 
    comingFromRegistration === 'true' || 
    inRegistrationFlow === 'true' || 
    completingOnboarding === 'true';
  
  // If any registration flags are set, preserve authentication data
  if (hasRegistrationFlags) {
    console.log('Registration flags detected, preserving authentication data:', {
      justCompletedRegistration,
      redirectAfterRegistration,
      bypassTokenVerification,
      comingFromRegistration,
      inRegistrationFlow,
      completingOnboarding
    });
    
    // Remove the forceLogout parameter if present, but don't clear auth data
    if (urlParams.has('forceLogout')) {
      const newUrl = window.location.pathname + 
        (window.location.search ? '?' + window.location.search.substring(1).replace(/[&?]forceLogout=true/, '') : '');
      window.history.replaceState({}, document.title, newUrl);
      console.log('Removed forceLogout parameter but preserved auth data due to registration flags');
    }
    
    return false; // Don't force logout
  }
  
  // Handle regular forceLogout parameter
  if (urlParams.has('forceLogout')) {
    // Always remove the parameter from URL without causing a refresh
    const newUrl = window.location.pathname + 
      (window.location.search ? '?' + window.location.search.substring(1).replace(/[&?]forceLogout=true/, '') : '');
    window.history.replaceState({}, document.title, newUrl);
    console.log('Removed forceLogout parameter from URL');
    
    // Only clear authentication data if we don't have any registration flags
    if (!hasRegistrationFlags) {
      const forceLogout = urlParams.get('forceLogout');
      if (forceLogout === 'true') {
        console.log('Force logout parameter detected and no registration flags, clearing authentication data');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        return true;
      }
    } else {
      console.log('Registration flags detected, ignoring forceLogout parameter');
    }
  }

  // If we're in registration or onboarding flow, preserve authentication state
  if (inRegistrationFlow === 'true' || completingOnboarding === 'true') {
    console.log('In registration/onboarding flow, preserving authentication data');
    return false;
  }
  
  // Check for previous errors (only if not in registration/onboarding flow)
  const hasAuthError = localStorage.getItem('authError');
  if (hasAuthError) {
    console.log('Previous authentication error detected, clearing authentication data');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('authError');
    return true;
  }
  
  return false;
};

// Check for registration flags before doing any auth checks
const checkForRegistrationFlags = () => {
  const justCompletedRegistration = localStorage.getItem('justCompletedRegistration') === 'true';
  const redirectAfterRegistration = sessionStorage.getItem('redirectAfterRegistration') === 'true';
  const bypassTokenVerification = localStorage.getItem('bypassTokenVerification') === 'true';
  const comingFromRegistration = localStorage.getItem('comingFromRegistration') === 'true';
  const inRegistrationFlow = localStorage.getItem('inRegistrationFlow') === 'true';
  const completingOnboarding = localStorage.getItem('completingOnboarding') === 'true';
  
  return {
    hasFlags: justCompletedRegistration || redirectAfterRegistration || bypassTokenVerification || 
             comingFromRegistration || inRegistrationFlow || completingOnboarding,
    flags: {
      justCompletedRegistration,
      redirectAfterRegistration,
      bypassTokenVerification,
      comingFromRegistration,
      inRegistrationFlow,
      completingOnboarding
    }
  };
};

// Check registration flags first
const registrationStatus = checkForRegistrationFlags();
console.log('Checking for registration flags before any auth checks:', registrationStatus);

// Only execute the auth check if we don't have any registration flags
const forcedLogout = registrationStatus.hasFlags ? false : checkAndFixAuthIssues();

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(() => {
    // Check if we just completed registration or are redirecting after registration
    const justCompletedRegistration = localStorage.getItem('justCompletedRegistration') === 'true';
    const redirectAfterRegistration = sessionStorage.getItem('redirectAfterRegistration') === 'true';
    
    console.log('AuthProvider initial state check:', {
      justCompletedRegistration,
      redirectAfterRegistration,
      forcedLogout
    });
    
    // If we just completed registration, force authentication regardless of other checks
    if (justCompletedRegistration || redirectAfterRegistration) {
      console.log('Registration just completed, forcing authentication state');
      
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          console.log('Forcing authentication with user:', parsedUser);
          
          // Ensure token is set in axios headers
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Return authenticated state
          return {
            isAuthenticated: true,
            user: parsedUser,
            error: null,
            loading: false
          };
        } catch (e) {
          console.error('Error parsing user data during forced authentication:', e);
        }
      }
    }
    
    // If we've already forced a logout, return initial state
    if (forcedLogout) {
      return { ...initialState, loading: false };
    }
    
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('Restoring session with user:', parsedUser);
        
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
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
              // Check for registration flags before logging out
              if (hasRegistrationFlags()) {
                console.log('Authentication error detected but registration flags are present, preserving credentials');
                // Don't clear credentials or redirect if we're in the registration flow
                // This is critical to prevent unwanted logouts during registration
              } else {
                console.error('Authentication error detected, clearing credentials');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setState(initialState);
                window.location.href = '/';
              }
            }
            return Promise.reject(error);
          }
        );
        
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

  // Add effect to verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      // Check for bypass flags
      const bypassTokenVerification = localStorage.getItem('bypassTokenVerification') === 'true';
      const redirectAfterRegistration = sessionStorage.getItem('redirectAfterRegistration') === 'true';
      const justCompletedRegistration = localStorage.getItem('justCompletedRegistration') === 'true';
      const comingFromRegistration = localStorage.getItem('comingFromRegistration') === 'true';
      
      // If any of these flags are set, skip token verification
      if (bypassTokenVerification || redirectAfterRegistration || justCompletedRegistration || comingFromRegistration) {
        console.log('Detected special flags, skipping token verification:', {
          bypassTokenVerification,
          redirectAfterRegistration,
          justCompletedRegistration,
          comingFromRegistration
        });
        
        // Clear the flags after checking them
        if (bypassTokenVerification) localStorage.removeItem('bypassTokenVerification');
        if (redirectAfterRegistration) sessionStorage.removeItem('redirectAfterRegistration');
        if (justCompletedRegistration) localStorage.removeItem('justCompletedRegistration');
        if (comingFromRegistration) localStorage.removeItem('comingFromRegistration');
        
        // Force authentication state if we have token and user data
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
        
        if (token && userStr) {
          try {
            const userData = JSON.parse(userStr);
            console.log('Forcing authentication state with user:', userData);
            
            // Set token in axios headers
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // Update the auth state
            setState({
              isAuthenticated: true,
              user: userData,
              loading: false,
              error: null
            });
          } catch (e) {
            console.error('Error parsing user data during forced authentication:', e);
          }
        }
        
        return; // Skip verification
      }
      
      // Normal token verification flow
      const token = localStorage.getItem('token');
      if (token && state.isAuthenticated) {
        try {
          // Verify token with backend
          const response = await axiosInstance.get<ApiResponse<{ valid: boolean }>>('/api/auth/verify');
          if (response.data.status === 'success' && response.data.data.valid) {
            console.log('Token verified successfully');
          } else {
            throw new Error('Token verification failed');
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setState(initialState);
          // Redirect to login page on verification failure
          window.location.href = '/';
        }
      }
    };

    verifyToken();
  }, [state.isAuthenticated]);

  const login = async (payload: LoginPayload) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('Sending login request with payload:', payload);
      
      const responsePromise = axiosInstance.post<ApiResponse<{ token: string; user: User }>>('/api/auth/login', payload);
      console.log('Login API request sent.');

      const response = await responsePromise;
      console.log('Login API response received:', response);
      console.log('Response status:', response.data.status);
      console.log('Response data:', response.data.data);

      if (response.data.status === 'success') {
        console.log('Login successful. Processing response data...');
        const { token, user } = response.data.data;
        
        console.log('Token and user data extracted.');

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
        console.log('Valid user object created.');
        
        // Set axios authorization header first
        console.log('Setting axios authorization header...');
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('Axios authorization header set.');

        
        // Then store the data
        console.log('Storing token and user in local storage...');
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(validUser));
        console.log('Token and user stored in local storage.');

        
        // Update state
        console.log('Updating authentication state...');
        setState({
          isAuthenticated: true,
          user: validUser,
          loading: false,
          error: null
        });
        console.log('Authentication state updated.');

        
        // Use requestAnimationFrame to ensure state is updated before redirect
        console.log('Requesting next animation frame for redirect...');
        requestAnimationFrame(() => {
          console.log('Executing redirect...');
          window.location.href = '/';
        });
      } else {
        console.log('Login failed. Setting error state.');
        setState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: response.data.message
        });
        console.log('Error state set.');
      }
    } catch (error: any) {
      console.error('Login caught error:', error);
      setState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: error.response?.data?.message || 'Authentication failed. Please try again.'
      });
      // Re-throw the error to be handled by the global unhandledrejection handler if it's a promise rejection
      throw error;
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
      console.log('Authenticating with token, user data:', { id: user._id, name: user.name });
      
      // Validate required fields
      if (!user || !user._id) {
        console.error('Invalid user data in authenticateWithToken:', user);
        setState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: 'Invalid user data received from server'
        });
        return;
      }
      
      // Ensure user object has all required fields with fallbacks for everything
      const validUser: User = {
        _id: user._id,
        id: user._id, // For backward compatibility
        name: user.name || user.universityId || 'User',
        email: user.email || '',
        universityId: user.universityId || '',
        role: user.role || 'student',
        avatar: user.avatar || '/default-avatar.png',
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: user.updatedAt || new Date().toISOString(),
        // Copy any additional fields
        ...(user.department && { department: user.department }),
        ...(user.batch && { batch: user.batch }),
        ...(user.bio && { bio: user.bio }),
        ...(user.coverPhoto && { coverPhoto: user.coverPhoto })
      };
      
      // Ensure token is saved in all storage mechanisms
      localStorage.setItem('token', token);
      sessionStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(validUser));
      sessionStorage.setItem('user', JSON.stringify(validUser));
      document.cookie = `authToken=${token}; path=/; max-age=86400`; // Also save in cookies for 24 hours
      
      // Set token in axios headers
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Token set in axios headers');
      
      // Update the auth state
      setState({
        isAuthenticated: true,
        user: validUser,
        loading: false,
        error: null
      });
      console.log('Auth state updated, user is authenticated');
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