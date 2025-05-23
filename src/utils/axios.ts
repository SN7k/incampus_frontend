import axios from 'axios';

// Get the base URL based on the environment
const getBaseUrl = () => {
  return 'https://incampus-backend.onrender.com';
};

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Disable credentials for now to avoid CORS issues
  timeout: 10000 // Add a 10 second timeout
});

// Check for authHeader that might have been set during page transitions
const authHeader = localStorage.getItem('authHeader');
if (authHeader) {
  console.log('Found authHeader, applying to axios instance');
  axiosInstance.defaults.headers.common['Authorization'] = authHeader;
  // Remove it after using it
  localStorage.removeItem('authHeader');
}

// Add request interceptor to add JWT token to all requests
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });

    if (error.response?.status === 401) {
      // Check if we're in the registration flow or just completed it
      const inRegistrationFlow = localStorage.getItem('inRegistrationFlow');
      const completingOnboarding = localStorage.getItem('completingOnboarding');
      const justCompletedRegistration = localStorage.getItem('justCompletedRegistration');
      const redirectAfterRegistration = sessionStorage.getItem('redirectAfterRegistration');
      
      if (inRegistrationFlow === 'true' || completingOnboarding === 'true' || 
          justCompletedRegistration === 'true' || redirectAfterRegistration === 'true') {
        console.log('In registration flow or just completed it, ignoring 401 error');
        // Don't clear auth data or redirect if we're in the registration flow
        return Promise.reject(error);
      }
      
      // Token expired or invalid (not in registration flow)
      console.log('401 error outside of registration flow, clearing auth data');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    } else if (!error.response) {
      // Network error or server not responding
      console.error('Network error - server might be down');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 