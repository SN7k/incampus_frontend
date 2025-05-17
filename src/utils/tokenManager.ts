/**
 * Token Manager
 * 
 * This utility provides centralized token management for the application.
 * It handles token storage, retrieval, and validation across multiple storage locations
 * to ensure robust authentication even when tokens might be lost in one location.
 * 
 * Enhanced with token validation and improved error handling for production use.
 */

// The key used for storing the token in various storage mechanisms
const TOKEN_KEY = 'incampus_auth_token';

/**
 * Saves the authentication token to multiple storage locations for redundancy
 * @param token The JWT token to save
 */
export const saveToken = (token: string): void => {
  if (!token) {
    console.warn('Attempted to save empty token');
    return;
  }
  
  try {
    // Primary storage: localStorage
    localStorage.setItem(TOKEN_KEY, token);
    
    // Backup storage 1: sessionStorage (lost on tab close but useful for redundancy)
    sessionStorage.setItem(TOKEN_KEY, token);
    
    // Backup storage 2: authState object in localStorage
    const authStateStr = localStorage.getItem('authState');
    const authState = authStateStr ? JSON.parse(authStateStr) : {};
    authState.token = token;
    localStorage.setItem('authState', JSON.stringify(authState));
    
    // Legacy support: also store in the original 'token' key
    localStorage.setItem('token', token);
    
    console.log('Token saved to multiple storage locations');
  } catch (error) {
    console.error('Error saving token:', error);
  }
};

/**
 * Retrieves the authentication token from any available storage location
 * @returns The JWT token or null if not found
 */
export const getToken = (): string | null => {
  let token = null;
  
  try {
    // Try primary storage first
    token = localStorage.getItem(TOKEN_KEY);
    
    // If not found, try the legacy key
    if (!token) {
      token = localStorage.getItem('token');
      if (token) {
        console.log('Retrieved token from legacy storage');
        // Migrate to new storage key
        saveToken(token);
      }
    }
    
    // If still not found, try session storage
    if (!token) {
      token = sessionStorage.getItem(TOKEN_KEY);
      if (token) {
        console.log('Retrieved token from sessionStorage');
        // Restore to primary storage
        localStorage.setItem(TOKEN_KEY, token);
      }
    }
    
    // If still not found, try authState
    if (!token) {
      const authStateStr = localStorage.getItem('authState');
      if (authStateStr) {
        const authState = JSON.parse(authStateStr);
        if (authState.token) {
          token = authState.token;
          console.log('Retrieved token from authState');
          // Restore to primary storage
          localStorage.setItem(TOKEN_KEY, token);
        }
      }
    }
  } catch (error) {
    console.error('Error retrieving token:', error);
  }
  
  return token;
};

/**
 * Removes the authentication token from all storage locations
 */
export const removeToken = (): void => {
  try {
    // Clear from all storage locations
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('token'); // Legacy key
    
    // Also clear from authState
    const authStateStr = localStorage.getItem('authState');
    if (authStateStr) {
      const authState = JSON.parse(authStateStr);
      delete authState.token;
      localStorage.setItem('authState', JSON.stringify(authState));
    }
    
    console.log('Token removed from all storage locations');
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

/**
 * Checks if a token exists and attempts to validate its basic structure
 * @returns true if a token exists and appears valid, false otherwise
 */
export const hasToken = (): boolean => {
  const token = getToken();
  return token !== null && isTokenValid(token);
};

/**
 * Validates a JWT token's basic structure and expiration
 * @param token The token to validate
 * @returns true if the token appears valid, false otherwise
 */
export const isTokenValid = (token: string): boolean => {
  if (!token) return false;
  
  try {
    // Basic structure validation (should have 3 parts separated by dots)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('Token has invalid format');
      return false;
    }
    
    // Try to decode the payload
    const payload = JSON.parse(atob(parts[1]));
    
    // Check if token has expired
    if (payload.exp) {
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      
      if (currentTime > expirationTime) {
        console.warn('Token has expired');
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};

/**
 * Gets the authorization header value for API requests
 * @returns The Authorization header value or null if no token exists
 */
export const getAuthHeader = (): string | null => {
  const token = getToken();
  return token ? `Bearer ${token}` : null;
};

/**
 * Refreshes the token's storage (useful after detecting a token might be missing in one location)
 * @returns true if a valid token was found and refreshed, false otherwise
 */
export const refreshTokenStorage = (): boolean => {
  const token = getToken();
  if (token && isTokenValid(token)) {
    saveToken(token);
    return true;
  }
  return false;
};

/**
 * Checks if the token is about to expire and needs refreshing
 * @param thresholdMinutes Minutes before expiration to consider token as needing refresh
 * @returns true if token needs refreshing, false otherwise
 */
export const isTokenNearExpiry = (thresholdMinutes: number = 5): boolean => {
  const token = getToken();
  if (!token) return false;
  
  try {
    // Decode the token payload
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false;
    
    // Check if token is about to expire within the threshold
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const thresholdMs = thresholdMinutes * 60 * 1000;
    
    return (expirationTime - currentTime) < thresholdMs;
  } catch (error) {
    console.error('Error checking token expiry:', error);
    return false;
  }
};

/**
 * Gets the user ID from the token if available
 * @returns The user ID from the token or null if not available
 */
export const getUserIdFromToken = (): string | null => {
  const token = getToken();
  if (!token) return null;
  
  try {
    // Decode the token payload
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    return payload.id || payload._id || payload.userId || payload.sub || null;
  } catch (error) {
    console.error('Error extracting user ID from token:', error);
    return null;
  }
};

// Initialize: ensure token is stored consistently across all storage mechanisms
refreshTokenStorage();
