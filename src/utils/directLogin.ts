import axios from 'axios';

// Direct login utility that bypasses the existing authentication system
export const directLogin = async (
  identifier: string,
  password: string,
  role: 'student' | 'faculty'
): Promise<boolean> => {
  try {
    // Clear any existing auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    
    // Clear any URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);
    
    // Create a fresh axios instance for this login attempt
    const loginAxios = axios.create({
      baseURL: 'https://incampus-backend.onrender.com',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: false,
      timeout: 15000 // Longer timeout for login
    });
    
    // Determine if the identifier is an email
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    
    // Create the login payload
    const loginPayload = {
      password,
      role
    } as any;
    
    // Add the appropriate identifier field
    if (isEmail) {
      loginPayload.email = identifier;
    } else {
      loginPayload.universityId = identifier;
    }
    
    console.log('Direct login attempt with payload:', { ...loginPayload, password: '[REDACTED]' });
    
    // Make the login request
    const response = await loginAxios.post<{
      status: string;
      message: string;
      data: { token: string; user: any }
    }>('/api/auth/login', loginPayload);
    
    if (response.data.status === 'success') {
      const { token, user } = response.data.data;
      
      console.log('Direct login successful, storing auth data');
      
      // Store token and user data in multiple places for redundancy
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
      
      // Set a cookie with the token
      document.cookie = `authToken=${token}; path=/; max-age=86400`; // 24 hours
      
      // Set a flag to indicate successful login
      localStorage.setItem('directLoginSuccess', 'true');
      localStorage.setItem('loginTimestamp', Date.now().toString());
      
      // Refresh the page to apply the new authentication state
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
      
      return true;
    } else {
      console.error('Login failed:', response.data.message);
      return false;
    }
  } catch (error: any) {
    console.error('Direct login error:', error);
    return false;
  }
};
