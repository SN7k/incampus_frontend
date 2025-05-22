import axios from 'axios';

// Get the base URL based on the environment
const getBaseUrl = () => {
  if (import.meta.env.PROD) {
    return 'https://incampus-backend.onrender.com';
  }
  return 'http://localhost:5000';
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
      window.location.href = '/login';
    } else if (!error.response) {
      // Network error or server not responding
      console.error('Network error - server might be down');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 