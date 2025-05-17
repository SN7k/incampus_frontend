/**
 * Token Patch
 * 
 * This utility file patches the token handling in the application to ensure
 * consistent token management and fix the "User not authenticated" issue.
 * 
 * It works by:
 * 1. Intercepting fetch calls to automatically add the token
 * 2. Monitoring localStorage changes to ensure token consistency
 * 3. Providing a global token refresh mechanism
 * 4. Adding special handling for registration and login responses
 */

import * as tokenManager from './tokenManager';

// Original fetch function
const originalFetch = window.fetch;

// Patch the global fetch function to automatically add the token and handle auth responses
window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
  // Only add authorization header for API calls to our backend
  const url = input.toString();
  const isApiCall = url.includes('incampus-backend.onrender.com') || 
                   url.includes('localhost:5000') ||
                   url.includes('/api/');
  
  if (isApiCall) {
    // Get the authorization header
    const authHeader = tokenManager.getAuthHeader();
    
    // If we have an auth header, add it to the request
    if (authHeader) {
      init = init || {};
      init.headers = {
        ...init.headers,
        'Authorization': authHeader
      };
      console.log('TokenPatch: Added authorization header to fetch request');
    } else {
      console.warn('TokenPatch: No authorization header available for API call');
    }
  }
  
  // Call the original fetch with our modified init
  const response = await originalFetch(input, init);
  
  // Check if this is an authentication response (login, register, verify-otp)
  const isAuthEndpoint = url.includes('/api/auth/login') || 
                         url.includes('/api/auth/register') || 
                         url.includes('/api/auth/verify-otp');
  
  // Only process successful responses from auth endpoints
  if (isApiCall && isAuthEndpoint && response.ok) {
    try {
      // Clone the response so we can read its body
      const clonedResponse = response.clone();
      const text = await clonedResponse.text();
      
      if (text) {
        const data = JSON.parse(text);
        
        // If the response contains a token, store it using tokenManager
        if (data && data.token) {
          console.log('TokenPatch: Intercepted authentication response with token');
          tokenManager.saveToken(data.token);
          console.log('TokenPatch: Token saved securely');
        }
      }
    } catch (error) {
      console.error('TokenPatch: Error processing authentication response:', error);
    }
  }
  
  return response;
};

// Patch localStorage to ensure token consistency
const originalSetItem = Storage.prototype.setItem;
Storage.prototype.setItem = function(key: string, value: string) {
  // Call the original setItem
  originalSetItem.call(this, key, value);
  
  // If this is a token-related key, ensure it's saved in all locations
  if (key === 'token' || key === 'authToken' || key === 'userToken') {
    console.log('TokenPatch: Detected token update in storage, ensuring consistency');
    tokenManager.saveToken(value);
  } else if (key === 'authState') {
    try {
      const authState = JSON.parse(value);
      if (authState && authState.token) {
        console.log('TokenPatch: Detected token in authState, ensuring consistency');
        tokenManager.saveToken(authState.token);
      }
    } catch (e) {
      console.error('TokenPatch: Error parsing authState:', e);
    }
  }
};

// Initialize the patch
console.log('TokenPatch: Initializing token patch to fix User not authenticated issue');
tokenManager.refreshTokenStorage();

// Export a function to manually refresh tokens if needed
export const refreshTokens = () => {
  console.log('TokenPatch: Manually refreshing tokens');
  tokenManager.refreshTokenStorage();
};

// Export a function to check if a user is authenticated
export const isAuthenticated = () => {
  return tokenManager.hasToken();
};

// Apply the patch immediately
refreshTokens();
