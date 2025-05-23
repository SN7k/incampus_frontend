import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import { User, AuthState } from '../types';

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

// Helper function to check for registration flags
const checkForRegistrationFlags = () => {
  const justCompletedRegistration = localStorage.getItem('justCompletedRegistration') === 'true';
  const redirectAfterRegistration = sessionStorage.getItem('redirectAfterRegistration') === 'true';
  const bypassTokenVerification = localStorage.getItem('bypassTokenVerification') === 'true';
  const comingFromRegistration = localStorage.getItem('comingFromRegistration') === 'true';
  const inRegistrationFlow = localStorage.getItem('inRegistrationFlow') === 'true';
  const completingOnboarding = localStorage.getItem('completingOnboarding') === 'true';
  
  const hasFlags = (
    justCompletedRegistration || 
    redirectAfterRegistration || 
    bypassTokenVerification || 
    comingFromRegistration || 
    inRegistrationFlow || 
    completingOnboarding
  );
  
  return {
    justCompletedRegistration,
    redirectAfterRegistration,
    bypassTokenVerification,
    comingFromRegistration,
    inRegistrationFlow,
    completingOnboarding,
    hasFlags
  };
};

// Helper function to check and fix authentication issues
const checkAndFixAuthIssues = () => {
  // Always remove the forceLogout parameter from URL if present
  const urlParams = new URLSearchParams(window.location.search);
  
  // Check for registration flags first
  const registrationStatus = checkForRegistrationFlags();
  
  // If any registration flags are set, preserve authentication data
  if (registrationStatus.hasFlags) {
    console.log('Registration flags detected, preserving authentication data:', registrationStatus);
    
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
    console.log('forceLogout parameter detected, clearing authentication data');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    
    // Remove the parameter from URL
    const newUrl = window.location.pathname + 
      (window.location.search ? '?' + window.location.search.substring(1).replace(/[&?]forceLogout=true/, '') : '');
    window.history.replaceState({}, document.title, newUrl);
    
    return true; // Force logout
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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Check registration flags first
  const registrationStatus = checkForRegistrationFlags();
  console.log('Checking for registration flags before any auth checks:', registrationStatus);

  // Only execute the auth check if we don't have any registration flags
  const forcedLogout = registrationStatus.hasFlags ? false : checkAndFixAuthIssues();

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
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          
          // Set token in axios headers
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          return {
            isAuthenticated: true,
            user: parsedUser,
            error: null,
            loading: false
          };
        } catch (error) {
          console.error('Error parsing user data from storage during registration flow:', error);
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
        
        // Set token in axios headers
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        return {
          isAuthenticated: true,
          user: parsedUser,
          error: null,
          loading: false
        };
      } catch (error) {
        console.error('Error parsing user data from storage:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    return { ...initialState, loading: false };
  });

  // Add axios interceptor to handle authentication errors
  useEffect(() => {
    const interceptor = axiosInstance.interceptors.response.use(
      response => response,
      error => {
        // Check for registration flags before handling auth errors
        const registrationStatus = checkForRegistrationFlags();
        
        // Also check for additional registration flags that might not be in the helper function
        const completedFriendSuggestions = localStorage.getItem('completedFriendSuggestions') === 'true';
        const forceAuthenticated = localStorage.getItem('forceAuthenticated') === 'true';
        const feedLoaded = localStorage.getItem('feedLoaded') === 'true';
        
        const inRegistrationProcess = registrationStatus.hasFlags || completedFriendSuggestions || forceAuthenticated;
        
        // Log the registration status for debugging
        console.log('Registration flags detected in interceptor:', {
          ...registrationStatus,
          completedFriendSuggestions,
          forceAuthenticated,
          feedLoaded,
          inRegistrationProcess
        });
        
        // If we're in registration flow or have completed friend suggestions, preserve auth state
        if (inRegistrationProcess && error.response && (error.response.status === 401 || error.response.status === 403)) {
          console.log('Auth error during registration flow, preserving auth state');
          
          // Try to recover token from multiple sources
          let token = localStorage.getItem('token') || sessionStorage.getItem('token');
          
          // If no token in storage, try to extract from cookies
          if (!token) {
            try {
              const cookies = document.cookie.split(';');
              const authCookie = cookies.find(c => c.trim().startsWith('authToken='));
              if (authCookie) {
                token = authCookie.split('=')[1];
                console.log('Recovered token from cookies in interceptor');
                
                // Save the recovered token to storage
                localStorage.setItem('token', token);
                sessionStorage.setItem('token', token);
              }
            } catch (e) {
              console.error('Error extracting token from cookies in interceptor:', e);
            }
          }
          
          if (token) {
            console.log('Token exists, preserving auth state and setting in axios headers');
            
            // Ensure token is set in axios headers for future requests
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // For GET requests, we can retry with the token
            if (error.config && error.config.method === 'get') {
              console.log('Retrying GET request with token');
              error.config.headers['Authorization'] = `Bearer ${token}`;
              return axiosInstance(error.config);
            }
            
            // For other requests, resolve with a success response
            return Promise.resolve({ 
              data: { 
                status: 'success', 
                message: 'Auth preserved by interceptor',
                data: { token }
              } 
            });
          }
        }
        
        // For normal 401/403 errors outside of registration flow
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          // Check for ANY registration flags before logging out
          if (inRegistrationProcess || feedLoaded) {
            console.log('Auth error but preserving session due to registration flags');
            return Promise.reject(error);
          }
          
          console.log('Auth error, clearing auth data');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          
          // Set auth error flag
          localStorage.setItem('authError', 'true');
          
          // Update auth state
          setState({
            isAuthenticated: false,
            user: null,
            error: 'Authentication failed. Please login again.',
            loading: false
          });
          
          // Redirect to login page
          window.location.href = '/login';
        }
        
        // For all other errors, just pass them through
        return Promise.reject(error);
      }
    );
    
    return () => {
      axiosInstance.interceptors.response.eject(interceptor);
    };
  }, []);

  const login = async (payload: LoginPayload): Promise<void> => {
    setState(prevState => ({ ...prevState, loading: true, error: null }));
    
    try {
      const response = await axiosInstance.post<ApiResponse<{ token: string; user: User }>>('/api/auth/login', payload);
      
      if (response.data.status === 'success') {
        const { token, user } = response.data.data;
        
        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Also store in sessionStorage for redundancy
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(user));
        
        // Set token in axios headers
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setState({
          isAuthenticated: true,
          user,
          error: null,
          loading: false
        });
      } else {
        setState({
          isAuthenticated: false,
          user: null,
          error: response.data.message,
          loading: false
        });
      }
    } catch (error: any) {
      setState({
        isAuthenticated: false,
        user: null,
        error: error.response?.data?.message || 'Login failed. Please try again.',
        loading: false
      });
    }
  };

  const logout = (): void => {
    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    
    // Clear all registration flags
    localStorage.removeItem('justCompletedRegistration');
    localStorage.removeItem('bypassTokenVerification');
    localStorage.removeItem('comingFromRegistration');
    localStorage.removeItem('inRegistrationFlow');
    localStorage.removeItem('completingOnboarding');
    sessionStorage.removeItem('redirectAfterRegistration');
    
    // Remove token from axios headers
    delete axiosInstance.defaults.headers.common['Authorization'];
    
    setState({
      isAuthenticated: false,
      user: null,
      error: null,
      loading: false
    });
  };

  const updateProfile = async (profileData: Partial<User>): Promise<void> => {
    if (!state.user) return;
    
    setState(prevState => ({ ...prevState, loading: true, error: null }));
    
    try {
      const response = await axiosInstance.patch<ApiResponse<User>>(`/api/user/${state.user._id}`, profileData);
      
      if (response.data.status === 'success') {
        const updatedUser = response.data.data;
        
        // Update user in storage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        
        setState(prevState => ({
          ...prevState,
          user: updatedUser,
          loading: false,
          error: null
        }));
      } else {
        setState(prevState => ({
          ...prevState,
          loading: false,
          error: response.data.message
        }));
      }
    } catch (error: any) {
      setState(prevState => ({
        ...prevState,
        loading: false,
        error: error.response?.data?.message || 'Failed to update profile'
      }));
    }
  };

  const authenticateWithToken = (token: string, user: User): void => {
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
      
      // Ensure token is saved in all storage mechanisms
      localStorage.setItem('token', token);
      sessionStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('user', JSON.stringify(user));
      document.cookie = `authToken=${token}; path=/; max-age=86400`; // Also save in cookies for 24 hours
      
      // Set token in axios headers
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Token set in axios headers');
      
      // Update the auth state
      setState({
        isAuthenticated: true,
        user,
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
    <AuthContext.Provider value={{ 
      ...state, 
      login, 
      logout, 
      updateProfile, 
      authenticateWithToken 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
