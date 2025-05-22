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
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (!error.response) {
      // Network error or server not responding
      console.error('Network error - server might be down');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 