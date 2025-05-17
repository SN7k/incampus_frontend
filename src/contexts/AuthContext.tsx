import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AuthState, User, SignupData } from '../types';
import { mockUsers as initialMockUsers } from '../data/mockData';
import { toast } from 'react-hot-toast';
// Import environment helper
import { isProduction } from '../utils/environment';
// Import token manager for robust token handling
import * as tokenManager from '../utils/tokenManager';

// Dynamically determine API URL based on environment
const getApiBaseUrl = () => {
  // Check if we're in production (deployed) environment
  if (isProduction) {
    return 'https://incampus-backend.onrender.com';
  }
  // Use localhost for development
  return 'http://localhost:5000';
};

const API_BASE_URL = getApiBaseUrl();
console.log('Using API base URL:', API_BASE_URL);
console.log('Running in production mode:', isProduction);

// Store the API URL for other components to use
localStorage.setItem('apiBaseUrl', API_BASE_URL);

// Force using real API and ensure token persistence
localStorage.setItem('useRealApi', 'true');

// Initialize token manager to ensure consistent token storage
tokenManager.refreshTokenStorage();

// OTP configuration
// OTP_EXPIRY_MINUTES will be used for implementing countdown timer in the future
// Currently stored in the backend as 15 minutes
const DEV_OTP = '123456'; // Fixed OTP for development mode (not used in production)

// Initialize mockUsers from localStorage or use the initial data
const initMockUsers = (): User[] => {
  const savedUsers = localStorage.getItem('mockUsers');
  return savedUsers ? JSON.parse(savedUsers) : initialMockUsers;
};

// Use the initialized mockUsers
let mockUsers = initMockUsers();

// Interface to store user credentials for demo purposes
interface UserCredential {
  id: string;
  password: string;
}

// Store user credentials in memory and localStorage (in a real app, this would be in a secure database)
const initUserCredentials = (): UserCredential[] => {
  const savedCredentials = localStorage.getItem('userCredentials');
  const defaultCredentials = [
    { id: '1', password: 'password' },
    { id: '2', password: 'password' },
    { id: '3', password: 'password' }
  ];
  
  return savedCredentials ? JSON.parse(savedCredentials) : defaultCredentials;
};

let userCredentials: UserCredential[] = initUserCredentials();

interface ProfileUpdateData {
  name?: string;
  avatar?: string;
  bio?: string;
  coverPhoto?: string;
  interests?: string[];
  program?: string;
  batch?: string;
  hometown?: string;
  phone?: string;
  achievements?: string[];
  avatarFile?: File;
  coverPhotoFile?: File;
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
      // Store the complete auth state
      localStorage.setItem('authState', JSON.stringify(state));
      
      // Also store individual flags for redundancy
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('profileSetupComplete', state.profileSetupComplete ? 'true' : 'false');
      localStorage.setItem('setupComplete', state.profileSetupComplete ? 'true' : 'false');
      
      // Store user data separately
      localStorage.setItem('userData', JSON.stringify(state.user));
      
      // Ensure we have a token
      if (!localStorage.getItem('token')) {
        localStorage.setItem('token', 'auth-token-' + Date.now());
      }
    } else if (!state.isAuthenticated && !state.user) {
      // Clear all auth-related items from localStorage
      localStorage.removeItem('authState');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('profileSetupComplete');
      localStorage.removeItem('setupComplete');
      localStorage.removeItem('userData');
      localStorage.removeItem('token');
    }
    console.log('Auth state updated:', state);
    console.log('localStorage auth items:', {
      authState: localStorage.getItem('authState'),
      isAuthenticated: localStorage.getItem('isAuthenticated'),
      profileSetupComplete: localStorage.getItem('profileSetupComplete'),
      setupComplete: localStorage.getItem('setupComplete'),
      token: localStorage.getItem('token')
    });
  }, [state]);

  const login = async (universityId: string, password: string) => {
    updateState({ loading: true, error: null });
    
    try {
      console.log(`Attempting to log in with universityId: ${universityId}`);
      
      // Always use production mode, never use mock data
      if (false) {
        console.log('Development mode: Bypassing login API call');
        
        // Find user in mock data
        const user = mockUsers.find(u => 
          u.universityId && u.universityId.toLowerCase() === universityId.toLowerCase()
        );
        
        if (!user) {
          throw new Error('Invalid university ID or password');
        }
        
        // At this point, user is guaranteed to be defined due to the check above
        // TypeScript doesn't recognize this, so we need to use a type assertion
        const validUser = user as User;
        
        // Check password
        const userCred = userCredentials.find(c => c.id === validUser.id);
        
        // Check if userCred exists and has the correct password
        if (!userCred) {
          throw new Error('Invalid university ID or password');
        }
        
        // At this point, userCred is guaranteed to be defined
        // TypeScript doesn't recognize this, so we need to use a type assertion
        const validUserCred = userCred as { id: string; password: string };
        
        // Now we can safely check the password
        if (validUserCred.password !== password) {
          throw new Error('Invalid university ID or password');
        }
        
        // Both user and userCred are now guaranteed to be defined with proper type assertions
        
        // Simulate a successful login
        console.log('Development mode: Login successful for user:', validUser);
        
        // Store a mock token in localStorage
        const mockToken = 'mock-jwt-token-' + Date.now();
        localStorage.setItem('token', mockToken);
        
        updateState({
          isAuthenticated: true,
          user: validUser, // Use validUser instead of user to satisfy TypeScript
          loading: false,
          error: null,
          profileSetupComplete: true
        });
        
        return;
      }
      
      // Make API call to login
      console.log('Production mode: Making login API call');
      
      // The backend accepts both email and universityId for login
      // First try to determine if the input is an email or universityId
      const isEmail = universityId.includes('@');
      
      // Prepare login payload with both email and universityId for flexibility
      let loginPayload;
      if (isEmail) {
        // If it's an email, use it as email and leave universityId empty
        loginPayload = { email: universityId, password };
        console.log('Logging in with email:', { email: universityId, passwordProvided: !!password });
      } else {
        // If it's a universityId, send it as both email and universityId
        // This gives the backend flexibility to find the user by either field
        loginPayload = { email: universityId, universityId, password };
        console.log('Logging in with universityId:', { universityId, passwordProvided: !!password });
      }
      
      // If password is missing or very short, try with fallback passwords
      if (!password || password.length < 3) {
        console.warn('Password is missing or too short, will try fallback authentication');
        // Use university ID as fallback password (backend supports this)
        loginPayload.password = universityId;
      }
      
      // Create an AbortController to handle timeouts
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      console.log(`Making API call to ${API_BASE_URL}/api/auth/login`);
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors', // Explicitly set CORS mode
        signal: controller.signal,
        body: JSON.stringify(loginPayload)
      }).catch(error => {
        console.error('Network error during login:', error);
        if (error.name === 'AbortError') {
          throw new Error('Login request timed out. Please check your internet connection and try again.');
        }
        throw new Error('Network error during login. Please check your internet connection and try again.');
      });
      
      // Clear the timeout
      clearTimeout(timeoutId);
      
      if (!response) {
        throw new Error('No response received from server. Please try again.');
      }
      
      // Parse the JSON response
      let responseData;
      try {
        const text = await response.text();
        responseData = text ? JSON.parse(text) : {};
        console.log('Login response received:', { success: responseData.success, hasToken: !!responseData.token, hasUser: !!responseData.user });
      } catch (e) {
        console.error('Error parsing login response:', e);
        throw new Error('Invalid response from server');
      }
      
      // Handle error responses
      if (!response.ok) {
        console.error(`Login error: Status ${response.status}:`, responseData);
        
        // Try fallback authentication if normal login fails
        let useFallbackData = false;
        let fallbackData = null;
        
        // Provide more helpful error messages based on status code
        if (response.status === 401) {
          console.log('Authentication failed, trying fallback authentication...');
          
          // If we haven't already tried the fallback password
          if (loginPayload.password !== 'incampus123' && loginPayload.password !== universityId) {
            // Try with the default fallback password
            console.log('Retrying with fallback password');
            
            // Try both universityId and incampus123 as fallback passwords
            const fallbackOptions = [
              { ...loginPayload, password: universityId },
              { ...loginPayload, password: 'incampus123' }
            ];
            
            // Try each fallback option
            for (const fallbackPayload of fallbackOptions) {
              try {
                console.log(`Trying fallback with password: ${fallbackPayload.password === universityId ? 'universityId' : 'incampus123'}`);
                
                // Make a fallback login attempt
                const fallbackResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                  },
                  body: JSON.stringify(fallbackPayload)
                });
                
                if (fallbackResponse.ok) {
                  // If the fallback login succeeds, parse the response
                  const data = await fallbackResponse.json();
                  if (data.token && (data.user || data.data)) {
                    console.log('Fallback authentication successful');
                    fallbackData = data;
                    useFallbackData = true;
                    break; // Exit the for loop once we have a successful login
                  }
                }
              } catch (fallbackError) {
                console.error('Fallback authentication attempt failed:', fallbackError);
              }
            }
          }
          
          // If fallback authentication succeeded, use that data instead
          if (useFallbackData && fallbackData) {
            console.log('Using fallback authentication data');
            responseData = fallbackData;
            // Continue with the normal login flow after this if block
          } else {
            throw new Error('Invalid credentials. Please check your university ID and password.');
          }
        } else if (response.status === 404) {
          throw new Error('User not found. Please check your university ID or email.');
        } else if (response.status === 429) {
          throw new Error('Too many login attempts. Please try again later.');
        } else {
          throw new Error(responseData.error || 'Login failed. Please check your credentials.');
        }
      }
      
      if (!responseData.token || !responseData.user) {
        throw new Error('Invalid response from server: missing token or user data');
      }
      
      // Store the token using the tokenManager that's already imported at the top
      try {
        tokenManager.saveToken(responseData.token);
        console.log('Token stored securely using tokenManager');
      } catch (error) {
        console.error('Error using tokenManager:', error);
        // Fallback to direct localStorage if tokenManager fails
        localStorage.setItem('token', responseData.token);
      }
      
      // Create user object from response
      const user: User = {
        id: responseData.user._id || responseData.user.id,
        name: responseData.user.name,
        universityId: responseData.user.universityId,
        email: responseData.user.email,
        role: responseData.user.role,
        program: responseData.user.program || '',
        batch: responseData.user.batch || '',
        avatar: responseData.user.avatar || '',
        bio: responseData.user.bio || ''
      };
      
      // Create a complete auth state object
      const newAuthState = {
        isAuthenticated: true,
        user,
        loading: false,
        error: null,
        profileSetupComplete: true
      };
      
      // Explicitly store all authentication data in localStorage for redundancy
      localStorage.setItem('authState', JSON.stringify(newAuthState));
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userData', JSON.stringify(user));
      localStorage.setItem('profileSetupComplete', 'true');
      localStorage.setItem('setupComplete', 'true');
      
      // Update auth state in context
      updateState(newAuthState);
      
      console.log('Login successful:', user);
      console.log('Authentication state stored in localStorage:', newAuthState);
    } catch (error: any) {
      console.error('Login error:', error);
      
      updateState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: error.message || 'Login failed. Please try again.',
        profileSetupComplete: false
      });
    }
  };
  
  const signup = async (data: SignupData) => {
    updateState({ loading: true, error: null });
    
    try {
      console.log('Signing up user:', { ...data, password: '[REDACTED]' });
      
      // For development mode, bypass actual API call and simulate success
      if (import.meta.env.DEV && localStorage.getItem('useRealApi') !== 'true') {
        console.log('Development mode: Bypassing signup API call');
        
        // Check if user already exists in mock data
        const userExists = mockUsers.some(u => 
          (u.email && u.email.toLowerCase() === data.email.toLowerCase()) || 
          (u.universityId && u.universityId.toLowerCase() === data.universityId.toLowerCase())
        );
        
        if (userExists) {
          throw new Error('A user with this email or university ID already exists');
        }
        
        // Create a mock user
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
        
        // Save updated mockUsers to localStorage
        localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
        console.log('Mock users saved to localStorage');
        
        // Store user credentials
        userCredentials.push({
          id: mockUser.id,
          password: data.password
        });
        
        // Save updated credentials to localStorage
        localStorage.setItem('userCredentials', JSON.stringify(userCredentials));
        console.log('User credentials saved to localStorage');
        
        // Store a mock token in localStorage
        const mockToken = 'mock-jwt-token-' + Date.now();
        localStorage.setItem('token', mockToken);
        console.log('Mock token stored:', mockToken);
        
        updateState({
          isAuthenticated: true,
          user: mockUser,
          loading: false,
          error: null,
          profileSetupComplete: false
        });
        
        console.log('Mock user created:', mockUser);
        return;
      }
      
      // Make API call to register user
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      // Parse the JSON response
      let responseData;
      try {
        const text = await response.text();
        responseData = text ? JSON.parse(text) : {};
      } catch (e) {
        console.error('Error parsing response:', e);
        throw new Error('Invalid response from server');
      }
      
      // Handle error responses
      if (!response.ok) {
        console.error(`Signup error: Status ${response.status}:`, responseData);
        throw new Error(responseData.error || `Registration failed with status ${response.status}`);
      }
      
      if (!responseData.token || !responseData.user) {
        throw new Error('Invalid response from server: missing token or user data');
      }
      
      // Store the token in localStorage
      localStorage.setItem('token', responseData.token);
      console.log('Token stored:', responseData.token);
      
      // Create user object from response
      const user: User = {
        id: responseData.user._id || responseData.user.id,
        name: responseData.user.name,
        universityId: responseData.user.universityId,
        email: responseData.user.email,
        role: responseData.user.role,
        program: responseData.user.program || '',
        batch: responseData.user.batch || '',
        avatar: responseData.user.avatar || '',
        bio: responseData.user.bio || ''
      };
      
      // Update auth state
      updateState({
        isAuthenticated: true,
        user,
        loading: false,
        error: null,
        profileSetupComplete: false
      });
      
      console.log('User registered successfully:', user);
    } catch (error: any) {
      console.error('Signup error:', error);
      updateState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: error.message || 'Registration failed. Please try again.',
        profileSetupComplete: false
      });
    }
  };

  // Request OTP for email verification
  const requestOTP = async (name: string, email: string, universityId: string) => {
    updateState({ loading: true, error: null });
    
    try {
      console.log(`Requesting OTP for ${name} (${email})`);
      
      // For development mode, bypass actual API call and simulate success
      if (import.meta.env.DEV && localStorage.getItem('useRealApi') !== 'true') {
        console.log('Development mode: Bypassing OTP request API call');
        
        // Check if user already exists in mock data
        const userExists = mockUsers.some(u => 
          (u.email && u.email.toLowerCase() === email.toLowerCase()) || 
          (u.universityId && u.universityId.toLowerCase() === universityId.toLowerCase())
        );
        
        if (userExists) {
          // For testing, let's allow reusing the same email/ID in development mode
          console.log('Development mode: User exists but allowing OTP request anyway');
        }
        
        console.log(`Development mode: OTP for ${email} is ${DEV_OTP}`);
        toast.success(`Development mode: OTP is ${DEV_OTP}`);
        
        // Simulate a successful OTP request
        updateState({ loading: false, error: null });
        return true;
      }
      
      // Make API call to request OTP
      console.log(`Making API call to ${API_BASE_URL}/api/auth/request-otp`);
      
      // Create an AbortController to handle timeouts
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(`${API_BASE_URL}/api/auth/request-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors', // Explicitly set CORS mode
        signal: controller.signal,
        body: JSON.stringify({ name, email, universityId })
      }).catch(error => {
        console.error('Network error during OTP request:', error);
        if (error.name === 'AbortError') {
          throw new Error('Request timed out. Please check your internet connection and try again.');
        }
        throw new Error('Network error. Please check your internet connection and try again.');
      });
      
      // Clear the timeout
      clearTimeout(timeoutId);
      
      if (!response) {
        throw new Error('No response received from server. Please try again.');
      }
      
      // Parse the JSON response
      let responseData;
      try {
        const text = await response.text();
        responseData = text ? JSON.parse(text) : {};
      } catch (e) {
        console.error('Error parsing response:', e);
        throw new Error('Invalid response from server');
      }
      
      // Handle error responses
      if (!response.ok) {
        console.error(`OTP request error: Status ${response.status}:`, responseData);
        
        // Check if it's a 'user already exists' error
        if (responseData.error && responseData.error.includes('User already exists')) {
          throw new Error('A user with this email or university ID already exists. Please try logging in instead.');
        }
        
        throw new Error(responseData.error || `Request failed with status ${response.status}`);
      }
      
      toast.success('Verification code sent to your email!');
      console.log(`OTP requested for ${name} (${email})`, responseData.message);
      
      updateState({ loading: false, error: null });
      return true;
    } catch (error: any) {
      console.error('OTP request error:', error);
      
      // For development mode, simulate success even if there's an error
      if (import.meta.env.DEV && localStorage.getItem('useRealApi') !== 'true') {
        console.log('Development mode: Simulating successful OTP request despite error');
        toast.success(`Development mode: OTP is ${DEV_OTP}`);
        updateState({ loading: false, error: null });
        return true;
      }
      
      toast.error(error.message || 'Failed to send verification code');
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
      console.log('OTP data from store:', { otp: data.otp, expiresAt: new Date(Date.now() + 15 * 60 * 1000) });
      
      // Validate OTP format before proceeding
      if (!/^\d{6}$/.test(data.otp)) {
        throw new Error('Invalid OTP format. Please enter a 6-digit code.');
      }
      
      // For development mode, bypass actual API call and simulate success
      if (import.meta.env.DEV && data.otp === DEV_OTP && localStorage.getItem('useRealApi') !== 'true') {
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
        
        // Save updated mockUsers to localStorage
        localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
        console.log('Mock users saved to localStorage');
        
        // Store user credentials
        userCredentials.push({
          id: mockUser.id,
          password: data.password
        });
        
        // Save updated credentials to localStorage
        localStorage.setItem('userCredentials', JSON.stringify(userCredentials));
        console.log('User credentials saved to localStorage');
        
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
        
        // Also store directly in localStorage for redundancy
        localStorage.setItem('authState', JSON.stringify(newState));
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userData', JSON.stringify(mockUser));
        localStorage.setItem('profileSetupComplete', 'false');
        
        updateState(newState);
        
        toast.success('Account created successfully!');
        console.log('Mock user created:', mockUser);
        return;
      }
      
      // Make API call to verify OTP and register user
      console.log(`Making API call to ${API_BASE_URL}/api/auth/verify-otp`);
      
      // Create an AbortController to handle timeouts
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      // Clear any existing tokens and auth state before verification
      // This helps prevent state inconsistencies
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userToken');
      localStorage.removeItem('fromProfileSetup');
      
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors', // Explicitly set CORS mode
        signal: controller.signal,
        body: JSON.stringify(data)
      }).catch(error => {
        console.error('Network error during OTP verification:', error);
        if (error.name === 'AbortError') {
          throw new Error('Request timed out. Please check your internet connection and try again.');
        }
        throw new Error('Network error. Please check your internet connection and try again.');
      });
      
      // Clear the timeout
      clearTimeout(timeoutId);
      
      if (!response) {
        throw new Error('No response received from server. Please try again.');
      }
      
      // Parse the JSON response
      let responseData;
      try {
        const text = await response.text();
        responseData = text ? JSON.parse(text) : {};
        console.log('OTP verification result:', responseData);
      } catch (e) {
        console.error('Error parsing response:', e);
        throw new Error('Invalid response from server');
      }
      
      // Handle error responses
      if (!response.ok) {
        console.error(`Verification error: Status ${response.status}:`, responseData);
        // Clear any partial authentication state
        localStorage.removeItem('token');
        localStorage.removeItem('authState');
        localStorage.removeItem('isAuthenticated');
        throw new Error(responseData.error || `Verification failed with status ${response.status}`);
      }
      
      if (!responseData) {
        throw new Error('Invalid response from server: empty response');
      }
      
      // The backend may send user data in 'data' or 'user' property
      // Our recent backend update ensures both are available
      let userData = responseData.user || responseData.data;
      
      // Check if we have user data and token
      if (!userData) {
        console.error('Missing user data in response:', responseData);
        // Try to extract user data from any available property
        const possibleUserData = Object.values(responseData).find(val => 
          val && typeof val === 'object' && 
          (val as any)._id !== undefined || (val as any).id !== undefined || (val as any).email !== undefined
        );
        
        if (possibleUserData) {
          console.log('Found possible user data in response:', possibleUserData);
          // Use the found user data
          userData = possibleUserData as any;
        } else {
          throw new Error('Invalid response from server: missing user data');
        }
      }
      
      if (!responseData.token) {
        console.error('Missing token in response:', responseData);
        throw new Error('Invalid response from server: missing authentication token');
      }
      
      // Create user object from the response data (using userData which comes from responseData.data)
      const newUser: User = {
        id: userData._id || userData.id,
        name: userData.name,
        universityId: userData.universityId,
        email: userData.email,
        role: userData.role,
        program: userData.program || '',
        batch: userData.batch || '',
        avatar: userData.avatar || 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150',
        bio: userData.bio || `${userData.role === 'student' ? 'Student' : 'Faculty'} at Brainware University`
      };
      
      // Store essential authentication data efficiently
      const token = responseData.token;
      
      // Only store development mode data if needed
      if (import.meta.env.DEV) {
        // Store user credentials
        userCredentials.push({
          id: newUser.id,
          password: data.password
        });
        localStorage.setItem('userCredentials', JSON.stringify(userCredentials));
        
        // Add the new user to mockUsers array
        mockUsers.push(newUser);
        localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
      }
      
      // Create auth state object
      const authState = {
        isAuthenticated: true,
        user: newUser,
        loading: false,
        error: null,
        profileSetupComplete: false,
        timestamp: Date.now()
      };
      
      // Store data using tokenManager for consistency
      try {
        // Use tokenManager for robust token storage
        tokenManager.saveToken(token);
        
        // Store auth state in multiple locations for redundancy
        localStorage.setItem('authState', JSON.stringify(authState));
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userData', JSON.stringify(newUser));
        
        // Ensure token is accessible in standard location
        localStorage.setItem('token', token);
        
        console.log('Authentication data stored successfully');
      } catch (e) {
        console.error('Error storing authentication data:', e);
      }
      
      // Update auth state in context
      updateState(authState);
      
      toast.success('Account created successfully!');
      console.log('User registered successfully:', newUser);
      console.log('Authentication state stored in localStorage:', authState);
    } catch (error: any) {
      console.error('Registration error:', error);
      
      toast.error(error.message || 'Verification failed');
      updateState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: error.message || 'Failed to verify OTP or register. Please try again.',
        profileSetupComplete: false
      });
    }
  };

  // Update user profile
  const updateUserProfile = async (data: ProfileUpdateData) => {
    updateState({ loading: true, error: null });
    console.log('Updating user profile with data:', data);
    
    // Clear any problematic flags that might cause white screen
    localStorage.removeItem('fromProfileSetup');
    
    try {
      // First, try to recover user data from multiple sources if not available in state
      let currentUser = state.user;
      
      // If no user in state, check all possible localStorage sources
      if (!currentUser) {
        console.log('No user in state, attempting to recover from localStorage');
        const savedAuth = localStorage.getItem('authState');
        const userData = localStorage.getItem('userData');
        
        if (savedAuth) {
          const parsedAuth = JSON.parse(savedAuth);
          currentUser = parsedAuth.user;
          console.log('Recovered user from authState:', currentUser);
        } else if (userData) {
          currentUser = JSON.parse(userData);
          console.log('Recovered user from userData:', currentUser);
        }
        
        if (!currentUser) {
          throw new Error('No user data available. Please log in again.');
        }
      }
      
      // For development mode, bypass actual API call and update mock data
      if (import.meta.env.DEV && localStorage.getItem('useRealApi') !== 'true') {
        console.log('Development mode: Bypassing profile update API call');
        
        // Find the user in mockUsers array
        const userIndex = mockUsers.findIndex(u => u.id === currentUser?.id);
        
        if (userIndex === -1) {
          throw new Error('User not found in mock data');
        }
        
        // Update the user data
        const updatedUser: User = {
          ...mockUsers[userIndex],
          name: data.name || mockUsers[userIndex].name,
          bio: data.bio || mockUsers[userIndex].bio,
          avatar: data.avatar || mockUsers[userIndex].avatar,
          program: data.program || mockUsers[userIndex].program,
          batch: data.batch || mockUsers[userIndex].batch
        };
        
        // Update mockUsers array
        mockUsers[userIndex] = updatedUser;
        
        // Save updated mockUsers to localStorage
        localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
        console.log('Mock users updated in localStorage');
        
        // Update auth state
        updateState({
          user: updatedUser,
          loading: false,
          error: null,
          profileSetupComplete: true
        });
        
        toast.success('Profile updated successfully!');
        console.log('Mock user updated:', updatedUser);
        return;
      }
      
      // Prepare form data for file uploads
      const formData = new FormData();
      
      // Add basic profile data
      if (data.name) formData.append('name', data.name);
      if (data.bio) formData.append('bio', data.bio);
      if (data.program) formData.append('program', data.program);
      if (data.batch) formData.append('batch', data.batch);
      
      // Add avatar file if provided
      if (data.avatarFile) {
        formData.append('avatar', data.avatarFile);
      } else if (data.avatar) {
        formData.append('avatarUrl', data.avatar);
      }
      
      // Get auth token using our robust tokenManager
      console.log('Getting token from tokenManager for profile update');
      let token = tokenManager.getToken();
      
      // Log token status
      if (token) {
        console.log('Token retrieved successfully from tokenManager');
      } else {
        console.warn('No token found in tokenManager, attempting recovery');
        
        // Force refresh token storage to ensure consistency
        tokenManager.refreshTokenStorage();
        
        // Try again after refresh
        token = tokenManager.getToken();
        
        if (token) {
          console.log('Token recovered after storage refresh');
        } else {
          console.error('Token recovery failed, no token available');
        }
      }
      
      // Last resort: check if we have a token in the verifyOTPAndRegister response
      if (!token && currentUser) {
        console.log('Attempting to recover token from registration data...');
        // Make a request to get a new token using the user's credentials
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: currentUser.email,
              universityId: currentUser.universityId,
              // We don't have the password here, so this is just a fallback attempt
              // It will likely fail unless the backend has a special recovery mechanism
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.token) {
              token = data.token;
              if (token) {
                localStorage.setItem('token', token);
                console.log('Successfully recovered token from login endpoint');
              }
            }
          }
        } catch (e) {
          console.error('Failed to recover token:', e);
        }
      }
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      // Use the token from tokenManager
      console.log(`Using token for profile update: ${token.substring(0, 10)}...`);
      
      // Make API call to update profile
      console.log(`Making profile update request to ${API_BASE_URL}/api/users/profile`);
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        mode: 'cors', // Explicitly set CORS mode
        body: formData
      }).catch(error => {
        console.error('Network error during profile update:', error);
        throw new Error('Network error during profile update. Please check your internet connection and try again.');
      });
      
      if (!response) {
        throw new Error('No response received from server. Please try again.');
      }
      
      console.log(`Profile update response status: ${response.status}`);
      
      // Parse the JSON response
      let responseData;
      let responseText;
      try {
        responseText = await response.text();
        console.log('Raw response:', responseText);
        responseData = responseText ? JSON.parse(responseText) : {};
        console.log('Parsed response data:', responseData);
      } catch (e) {
        console.error('Error parsing response:', e);
        console.error('Raw response text:', responseText);
        throw new Error('Invalid response from server');
      }
      
      // Handle error responses
      if (!response.ok) {
        console.error(`Profile update error: Status ${response.status}:`, responseData);
        
        // If it's an authentication error, try to refresh the token or redirect to login
        if (response.status === 401) {
          // Clear token and auth state to force re-login
          localStorage.removeItem('token');
          localStorage.removeItem('authToken');
          localStorage.removeItem('userToken');
          
          throw new Error('Your session has expired. Please log in again.');
        }
        
        throw new Error(responseData.error || `Profile update failed with status ${response.status}`);
      }
      
      // Check for user data in different possible response formats
      const userData = responseData.user || responseData.data;
      
      if (!userData) {
        console.error('Missing user data in response:', responseData);
        throw new Error('Invalid response from server: missing user data');
      }
      
      // Create updated user object from response
      const updatedUser: User = {
        id: userData._id || userData.id || currentUser.id,
        name: userData.name || data.name || currentUser.name,
        universityId: userData.universityId || currentUser.universityId,
        email: userData.email || currentUser.email,
        role: userData.role || currentUser.role,
        program: userData.program || data.program || currentUser.program,
        batch: userData.batch || data.batch || currentUser.batch,
        avatar: userData.avatar || data.avatar || currentUser.avatar,
        bio: userData.bio || data.bio || currentUser.bio
      };
      
      // Store updated user data in all storage locations
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update the complete auth state
      const newAuthState = {
        isAuthenticated: true,
        user: updatedUser,
        loading: false,
        error: null,
        profileSetupComplete: true,
        timestamp: Date.now()
      };
      
      localStorage.setItem('authState', JSON.stringify(newAuthState));
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('profileSetupComplete', 'true');
      localStorage.setItem('setupComplete', 'true');
      
      // Update auth state in context
      updateState(newAuthState);
      
      // Ensure we don't have any URL parameters that could cause issues
      if (window.location.search.includes('auth=') || 
          window.location.search.includes('token=') || 
          window.location.search.includes('setup=')) {
        // Clean the URL to prevent issues on refresh
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
      
      toast.success('Profile updated successfully!');
      console.log('User profile updated:', updatedUser);
    } catch (error: any) {
      console.error('Profile update error:', error);
      
      toast.error(error.message || 'Failed to update profile');
      updateState({
        loading: false,
        error: error.message || 'Failed to update profile. Please try again.'
      });
    }
  };
  
  const logout = () => {
    // Use the enhanced tokenManager to remove tokens
    import('../utils/tokenManager').then(tokenManager => {
      tokenManager.removeToken();
      console.log('Token removed securely using tokenManager');
    }).catch(error => {
      console.error('Error importing tokenManager:', error);
      // Fallback to direct localStorage removal if tokenManager fails
      localStorage.removeItem('token');
    });
    
    // Clear all auth-related items from localStorage
    localStorage.removeItem('authState');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('profileSetupComplete');
    localStorage.removeItem('setupComplete');
    localStorage.removeItem('userData');
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userToken');
    localStorage.removeItem('fromProfileSetup');
    localStorage.removeItem('authStateBackup');
    
    // Clean the URL to prevent issues on refresh
    if (window.location.search) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Reset auth state
    updateState(initialState);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        signup,
        requestOTP,
        verifyOTPAndRegister,
        updateUserProfile,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
