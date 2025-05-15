import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AuthState, User, SignupData } from '../types';
import { mockUsers } from '../data/mockData';

// Interface to store user credentials for demo purposes
interface UserCredential {
  id: string;
  password: string;
}

// Store user credentials in memory (in a real app, this would be in a secure database)
let userCredentials: UserCredential[] = [
  { id: '1', password: 'password' },
  { id: '2', password: 'password' },
  { id: '3', password: 'password' }
];

interface ProfileUpdateData {
  avatar?: string;
  bio?: string;
  coverPhoto?: string;
  interests?: string[];
}

interface AuthContextType extends AuthState {
  login: (universityId: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  requestOTP: (name: string, email: string, universityId: string) => Promise<boolean>;
  verifyOTPAndRegister: (data: SignupData & { otp: string }) => Promise<void>;
  updateUserProfile: (data: ProfileUpdateData) => Promise<void>;
  logout: () => void;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  error: null,
  loading: false,
  profileSetupComplete: false
};

const AuthContext = createContext<AuthContextType>({
  ...initialState,
  login: async () => {},
  signup: async () => {},
  requestOTP: async () => false,
  verifyOTPAndRegister: async () => {},
  updateUserProfile: async () => {},
  logout: () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from localStorage and JWT token
  const [state, setState] = useState<AuthState>(() => {
    const savedAuth = localStorage.getItem('authState');
    const token = localStorage.getItem('token');
    
    // If we have a token but no saved auth state, we should consider the user authenticated
    // but need to fetch their details
    if (token && !savedAuth) {
      console.log('Token exists but no auth state. Initializing with authenticated state.');
      return {
        ...initialState,
        isAuthenticated: true,
        loading: true, // Will trigger fetch user data
      };
    }
    
    return savedAuth ? JSON.parse(savedAuth) : initialState;
  });
  
  // Helper function to ensure all state updates include profileSetupComplete
  const updateState = (newState: Partial<AuthState>) => {
    setState(prev => ({
      ...prev,
      ...newState,
      profileSetupComplete: 'profileSetupComplete' in newState 
        ? newState.profileSetupComplete as boolean 
        : prev.profileSetupComplete
    }));
  };

  // Update localStorage when state changes
  React.useEffect(() => {
    if (state.isAuthenticated && state.user) {
      localStorage.setItem('authState', JSON.stringify(state));
    } else if (!state.isAuthenticated && !state.user) {
      localStorage.removeItem('authState');
    }
    console.log('Auth state updated:', state);
  }, [state]);

  const login = async (universityId: string, password: string) => {
    updateState({ loading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, find user in mock data
      // Check both universityId and email for login
      const user = mockUsers.find(u => 
        u.universityId === universityId || 
        u.email === universityId
      );
      
      if (!user) {
        updateState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: 'User not found',
          profileSetupComplete: false
        });
        return;
      }
      
      // Find user credentials
      const userCred = userCredentials.find(cred => cred.id === user.id);
      
      // For demo purposes, also allow 'password' as a universal password
      if (userCred && (userCred.password === password || password === 'password')) {
        updateState({
          isAuthenticated: true,
          user,
          loading: false,
          error: null,
          profileSetupComplete: true
        });
      } else {
        updateState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: 'Invalid ID/email or password',
          profileSetupComplete: false
        });
      }
    } catch (error) {
      updateState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: 'Authentication failed. Please try again.',
        profileSetupComplete: false
      });
    }
  };

  const signup = async (data: SignupData) => {
    updateState({ loading: true, error: null, profileSetupComplete: false });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      const userExists = mockUsers.some(u => 
        (u.universityId && u.universityId.toLowerCase() === data.universityId.toLowerCase()) || 
        u.email.toLowerCase() === data.email.toLowerCase()
      );
      
      if (userExists) {
        updateState({
          loading: false,
          error: 'User with this ID or email already exists'
        });
        return;
      }
      
      // Create new user with a new ID
      const newUserId = (mockUsers.length + 1).toString();
      const newUser: User = {
        id: newUserId,
        name: data.name,
        universityId: data.universityId,
        email: data.email,
        role: data.role,
        program: data.program || '',
        batch: data.batch || '',
        avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150',
        bio: `${data.role === 'student' ? 'Student' : 'Faculty'} at Brainware University`
      };
      
      // Store user credentials
      userCredentials.push({
        id: newUserId,
        password: data.password
      });
      
      // In a real app, you would save this to a database
      // For demo, we'll just log it and authenticate the user
      console.log('New user registered:', newUser);
      
      // Add the new user to mockUsers array (for demo purposes)
      // This ensures the user can be found in subsequent logins
      mockUsers.push(newUser);
      
      updateState({
        isAuthenticated: true,
        user: newUser,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Signup error:', error);
      updateState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: 'Registration failed. Please try again.',
        profileSetupComplete: false
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('authState');
    updateState(initialState);
  };

  // Request OTP for registration
  const requestOTP = async (name: string, email: string, universityId: string) => {
    updateState({ loading: true, error: null });
    
    try {
      console.log(`Requesting OTP for ${name} (${email}) with ID ${universityId}`);
      
      // For development mode, bypass the actual API call
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Bypassing OTP request API call');
        
        // Check if user already exists in mockUsers
        const userExists = mockUsers.some(u => 
          u.email.toLowerCase() === email.toLowerCase() || 
          (u.universityId && u.universityId.toLowerCase() === universityId.toLowerCase())
        );
        
        if (userExists) {
          // For testing, let's allow reusing the same email/ID in development mode
          console.log('Development mode: User exists but allowing OTP request anyway');
        }
        
        console.log(`Development mode: OTP for ${email} is 123456`);
        
        // Simulate a successful OTP request
        updateState({ loading: false, error: null });
        return true;
      }
      
      // Make API call to request OTP
      const API_BASE_URL = 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/auth/request-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, universityId })
      });
      
      // Handle non-JSON responses
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OTP request error: Status ${response.status}:`, errorText);
        
        // Check if it's a 'user already exists' error
        if (errorText.includes('User already exists')) {
          // For development mode, allow continuing despite the error
          if (process.env.NODE_ENV === 'development') {
            console.log('Development mode: User exists but allowing OTP request anyway');
            updateState({ loading: false, error: null });
            return true;
          }
          
          throw new Error('A user with this email or university ID already exists. Please try logging in instead.');
        }
        
        throw new Error(errorText || `Request failed with status ${response.status}`);
      }
      
      // For OTP request, we just need to know if it was successful
      // No need to parse the response body
      
      console.log(`OTP requested for ${name} (${email})`);
      
      updateState({ loading: false, error: null });
      return true;
    } catch (error: any) {
      console.error('OTP request error:', error);
      
      // For development mode, simulate success even if there's an error
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Simulating successful OTP request despite error');
        updateState({ loading: false, error: null });
        return true;
      }
      
      updateState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: error.message || 'Failed to send verification code. Please try again.',
        profileSetupComplete: false
      });
      return false;
    }
  };
  
  // Verify OTP and complete registration
  const verifyOTPAndRegister = async (data: SignupData & { otp: string }) => {
    updateState({ loading: true, error: null });
    
    try {
      console.log('Verifying OTP and registering user:', { ...data, password: '[REDACTED]' });
      
      // For development mode, bypass actual API call and simulate success
      if (process.env.NODE_ENV === 'development' && data.otp === '123456') {
        console.log('Development mode: Bypassing OTP verification API call');
        
        // Create a mock user response
        const mockUser: User = {
          id: Date.now().toString(),
          name: data.name,
          universityId: data.universityId,
          email: data.email,
          role: data.role || 'student',
          program: data.program || '',
          batch: data.batch || '',
          avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150',
          bio: `${data.role === 'student' ? 'Student' : 'Faculty'} at Brainware University`
        };
        
        // Store the mock user in mockUsers array
        mockUsers.push(mockUser);
        
        // Store user credentials
        userCredentials.push({
          id: mockUser.id,
          password: data.password
        });
        
        // Store a mock token in localStorage
        const mockToken = 'mock-jwt-token-' + Date.now();
        localStorage.setItem('token', mockToken);
        console.log('Mock token stored:', mockToken);
        
        // Store in a separate variable to ensure the update is immediate
        const newState = {
          isAuthenticated: true,
          user: mockUser,
          loading: false,
          error: null,
          profileSetupComplete: false
        };
        
        // Also store directly in localStorage to ensure persistence
        localStorage.setItem('authState', JSON.stringify(newState));
        
        updateState(newState);
        
        console.log('Mock user created:', mockUser);
        return;
      }
      
      // Make API call to verify OTP and register user
      const API_BASE_URL = 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      // Handle non-JSON responses
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Verification error: Status ${response.status}:`, errorText);
        throw new Error(errorText || `Verification failed with status ${response.status}`);
      }
      
      // Check if response is empty
      const text = await response.text();
      const responseData = text ? JSON.parse(text) : {};
      
      if (!responseData) {
        throw new Error('Empty response from server');
      }
      
      // For demo purposes, we'll create a user from the response data
      // In a real app, this would come from the backend
      const newUser: User = {
        id: responseData.user._id || responseData.user.id || Date.now().toString(),
        name: data.name,
        universityId: data.universityId,
        email: data.email,
        role: data.role,
        program: data.program || '',
        batch: data.batch || '',
        avatar: responseData.user.avatar || 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150',
        bio: responseData.user.bio || `${data.role === 'student' ? 'Student' : 'Faculty'} at Brainware University`
      };
      
      // For demo purposes, store user credentials
      userCredentials.push({
        id: newUser.id,
        password: data.password
      });
      
      // Add the new user to mockUsers array for demo purposes
      mockUsers.push(newUser);
      
      // Store the token in localStorage
      localStorage.setItem('token', responseData.token);
      console.log('Real token stored:', responseData.token);
      
      // Store in a separate variable to ensure the update is immediate
      const newState = {
        isAuthenticated: true,
        user: newUser,
        loading: false,
        error: null,
        profileSetupComplete: false
      };
      
      // Also store directly in localStorage to ensure persistence
      localStorage.setItem('authState', JSON.stringify(newState));
      
      updateState(newState);
    } catch (error: any) {
      console.error('OTP verification error:', error);
      updateState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: error.message || 'Verification failed. Please try again.',
        profileSetupComplete: false
      });
    }
  };

  // Update user profile
  const updateUserProfile = async (data: ProfileUpdateData) => {
    updateState({ loading: true, error: null });
    console.log('Updating user profile with data:', data);
    console.log('Current auth state:', state);
    
    try {
      // Check if we have user data from local storage in case it was lost in memory
      if (!state.user) {
        const savedAuth = localStorage.getItem('authState');
        if (savedAuth) {
          const parsedAuth = JSON.parse(savedAuth);
          if (parsedAuth.user && parsedAuth.isAuthenticated) {
            console.log('Recovered user from localStorage:', parsedAuth.user);
            updateState({
              isAuthenticated: true,
              user: parsedAuth.user,
              error: null
            });
          }
        }
      }
      
      // If we still don't have a user after checking localStorage
      if (!state.user) {
        // For development mode, create a mock user if none exists
        if (process.env.NODE_ENV === 'development') {
          console.log('Development mode: Creating mock user for profile update');
          const mockUser: User = {
            id: '999',
            name: 'Test User',
            email: 'test@example.com',
            universityId: 'TEST/123',
            role: 'student',
            program: 'Computer Science',
            batch: '2020-2024',
            avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150',
            bio: ''
          };
          
          updateState({
            isAuthenticated: true,
            user: mockUser,
            error: null
          });
          
          // Update the mock user with the profile data
          const updatedUser = {
            ...mockUser,
            avatar: data.avatar || mockUser.avatar,
            bio: data.bio || mockUser.bio,
            coverPhoto: data.coverPhoto,
            interests: data.interests || []
          };
          
          // Update state
          updateState({
            user: updatedUser,
            loading: false,
            profileSetupComplete: true
          });
          
          console.log('Mock profile created:', updatedUser);
          return;
        } else {
          throw new Error('User not authenticated');
        }
      }
      
      // In a real app, this would be an API call to update the user profile
      console.log('Updating profile with data:', data);
      
      // Update user in mockUsers array
      const updatedUser = {
        ...state.user,
        avatar: data.avatar || state.user.avatar,
        bio: data.bio || state.user.bio,
        coverPhoto: data.coverPhoto,
        interests: data.interests || []
      };
      
      // Find and update the user in mockUsers
      const userIndex = mockUsers.findIndex(u => u.id === state.user?.id);
      if (userIndex !== -1) {
        mockUsers[userIndex] = updatedUser;
      } else {
        // Add user to mockUsers if not found
        mockUsers.push(updatedUser);
      }
      
      // Update state
      updateState({
        user: updatedUser,
        loading: false,
        profileSetupComplete: true
      });
      
      console.log('Profile updated successfully:', updatedUser);
    } catch (error: any) {
      console.error('Profile update error:', error);
      
      // For development mode, simulate success even if there's an error
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Simulating successful profile update despite error');
        updateState({
          loading: false,
          profileSetupComplete: true,
          error: null
        });
        return;
      }
      
      updateState({
        loading: false,
        error: error.message || 'Failed to update profile. Please try again.'
      });
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, signup, requestOTP, verifyOTPAndRegister, updateUserProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};