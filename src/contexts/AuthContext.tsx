import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, User } from '../types';
import { authApi, tokenService } from '../services/authApi';
import { USE_MOCK_DATA } from '../utils/mockDataTransition';
import { mockUsers } from '../data/mockData';

interface AuthContextType extends AuthState {
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: Partial<User>) => void;
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
  updateProfile: () => {}
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

  // Check for token on component mount and restore session if valid
  useEffect(() => {
    const checkAuth = async () => {
      if (tokenService.hasToken()) {
        setState(prev => ({ ...prev, loading: true }));
        try {
          // Verify token by fetching current user
          const user = await authApi.getCurrentUser();
          setState({
            isAuthenticated: true,
            user,
            loading: false,
            error: null
          });
        } catch (error) {
          console.error('Error verifying token:', error);
          tokenService.removeToken();
          setState({
            isAuthenticated: false,
            user: null,
            loading: false,
            error: null
          });
        }
      }
    };
    
    checkAuth();
  }, []);

  const login = async (identifier: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      if (USE_MOCK_DATA) {
        // Mock login for development
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if identifier is an email
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
        
        // For demo purposes, find user in mock data
        let user;
        
        if (isEmail) {
          // If it's an email, let's pretend we're checking against email
          // For demo, we'll use a hardcoded email for the professor
          if (identifier === 'prof.williams@example.com') {
            user = mockUsers.find(u => u.role === 'faculty');
          } else {
            // For any other email, let's just use the first student for demo
            user = mockUsers.find(u => u.role === 'student');
          }
        } else {
          // If not an email, it's a university ID
          user = mockUsers.find(u => u.universityId === identifier);
          
          // Check if this might be a newly registered user
          if (!user && password === 'password') {
            // Try to get the user data from localStorage if it's a new registration
            const registrationData = localStorage.getItem('pendingRegistration');
            if (registrationData) {
              try {
                const pendingUser = JSON.parse(registrationData);
                if (pendingUser.universityId === identifier) {
                  user = pendingUser;
                  // Add this user to mockUsers for future logins
                  mockUsers.push(user);
                }
              } catch (e) {
                console.error('Failed to parse pending registration data', e);
              }
            }
          }
        }
        
        if (user && password === 'password') { // In a real app, you'd verify hashed passwords
          const newState = {
            isAuthenticated: true,
            user,
            loading: false,
            error: null
          };
          setState(newState);
          localStorage.setItem('authState', JSON.stringify(newState));
          localStorage.setItem('currentPage', 'feed'); // Set feed as the initial page
          // Clear the pending registration data after successful login
          localStorage.removeItem('pendingRegistration');
        } else {
          setState({
            isAuthenticated: false,
            user: null,
            loading: false,
            error: 'Invalid credentials. Please try again.'
          });
        }
      } else {
        // Real API login
        // Determine role based on identifier format (simplified for demo)
        const role = identifier.includes('FAC') ? 'faculty' : 'student';
        
        // Call the login API
        const response = await authApi.login(identifier, password, role);
        
        // Save token
        tokenService.setToken(response.data.token);
        
        // Update state
        const newState = {
          isAuthenticated: true,
          user: response.data.user,
          loading: false,
          error: null
        };
        
        setState(newState);
        localStorage.setItem('authState', JSON.stringify(newState));
        localStorage.setItem('currentPage', 'feed'); // Set feed as the initial page
      }
    } catch (error) {
      setState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: 'Authentication failed. Please try again.'
      });
    }
  };

  const logout = () => {
    setState(initialState);
    localStorage.removeItem('authState');
  };

  const updateProfile = async (profileData: Partial<User>) => {
    if (state.user) {
      setState(prev => ({ ...prev, loading: true }));
      
      try {
        if (USE_MOCK_DATA) {
          // Mock profile update
          const updatedUser = { ...state.user, ...profileData };
          const newState = {
            ...state,
            user: updatedUser,
            loading: false
          };
          setState(newState);
          localStorage.setItem('authState', JSON.stringify(newState));
        } else {
          // Real API profile update
          // This would typically call the profile API to update the user's profile
          // For now, we'll just update the local state with the new data
          const updatedUser = { ...state.user, ...profileData };
          const newState = {
            ...state,
            user: updatedUser,
            loading: false
          };
          setState(newState);
          localStorage.setItem('authState', JSON.stringify(newState));
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        setState(prev => ({ 
          ...prev, 
          loading: false,
          error: 'Failed to update profile. Please try again.'
        }));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};