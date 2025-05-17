// API utility functions for making requests to the backend

// Dynamically determine API URL based on environment
const getApiBaseUrl = () => {
  // Check if we're in production (deployed) environment
  if (import.meta.env.PROD) {
    // Use the deployed backend URL
    // You should update this to your actual deployed backend URL
    return 'https://incampus-backend.onrender.com'; // Replace with your actual deployed backend URL
  }
  // Use localhost for development
  return 'http://localhost:5000';
};

const API_BASE_URL = getApiBaseUrl();

// Get auth token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Generic fetch function with auth token
const fetchWithAuth = async (
  endpoint: string, 
  options: RequestInit = {}
): Promise<any> => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };
  
  const config = {
    ...options,
    headers
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle non-JSON responses
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${endpoint}) Status ${response.status}:`, errorText);
      throw new Error(errorText || `Request failed with status ${response.status}`);
    }
    
    // Check if response is empty
    const text = await response.text();
    if (!text) {
      return null; // Return null for empty responses
    }
    
    // Parse JSON
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error(`JSON Parse Error (${endpoint}):`, e, 'Response text:', text);
      throw new Error('Invalid JSON response from server');
    }
  } catch (error: any) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// API functions for auth
export const authAPI = {
  requestOTP: (name: string, email: string, universityId: string) => 
    fetchWithAuth('/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify({ name, email, universityId })
    }),
    
  verifyOTP: (data: any) => 
    fetchWithAuth('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    
  login: (universityId: string, password: string) => 
    fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ universityId, password })
    }),
    
  getProfile: () => 
    fetchWithAuth('/auth/me'),
    
  updateProfile: (data: any) => 
    fetchWithAuth('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
};

// API functions for posts
export const postAPI = {
  getPosts: () => 
    fetchWithAuth('/posts'),
    
  createPost: (data: any) => 
    fetchWithAuth('/posts', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    
  likePost: (postId: string) => 
    fetchWithAuth(`/posts/${postId}/like`, {
      method: 'POST'
    }),
    
  addComment: (postId: string, content: string) => 
    fetchWithAuth(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content })
    }),
    
  deletePost: (postId: string) => 
    fetchWithAuth(`/posts/${postId}`, {
      method: 'DELETE'
    }),
};

// API functions for friends
export const friendAPI = {
  getFriends: () => 
    fetchWithAuth('/friends'),
    
  getFriendRequests: () => 
    fetchWithAuth('/friends/requests'),
    
  getSuggestions: () => 
    fetchWithAuth('/friends/suggestions'),
    
  sendRequest: (userId: string) => 
    fetchWithAuth(`/friends/request/${userId}`, {
      method: 'POST'
    }),
    
  acceptRequest: (userId: string) => 
    fetchWithAuth(`/friends/accept/${userId}`, {
      method: 'POST'
    }),
    
  rejectRequest: (userId: string) => 
    fetchWithAuth(`/friends/reject/${userId}`, {
      method: 'POST'
    }),
    
  removeFriend: (userId: string) => 
    fetchWithAuth(`/friends/${userId}`, {
      method: 'DELETE'
    }),
    
  searchUsers: (query: string) => 
    fetchWithAuth(`/users/search?q=${encodeURIComponent(query)}`),
};

export default {
  auth: authAPI,
  posts: postAPI,
  friends: friendAPI
};
