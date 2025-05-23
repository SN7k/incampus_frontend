/**
 * This utility provides a direct solution to prevent the authentication cycle issue
 * where users are redirected to the login page after completing friend suggestions
 */

import axiosInstance from './axios';

/**
 * Forces the authentication state to be maintained during critical transitions
 * This is specifically designed to prevent the login redirect cycle after completing friend suggestions
 */
export const forceAuthenticationState = (): void => {
  console.log('Forcing authentication state to be preserved');
  
  // Get token from all possible storage locations
  const token = localStorage.getItem('token') || 
                sessionStorage.getItem('token') || 
                document.cookie.split(';').find(c => c.trim().startsWith('authToken='))?.split('=')[1];
  
  if (!token) {
    console.error('No token found, cannot force authentication state');
    return;
  }
  
  // Set ALL possible flags to ensure we don't get logged out during the process
  localStorage.setItem('justCompletedRegistration', 'true');
  localStorage.setItem('completedFriendSuggestions', 'true');
  localStorage.setItem('skipAuthCheck', 'true');
  localStorage.setItem('forceAuthenticated', 'true');
  localStorage.setItem('authBypassTimestamp', Date.now().toString());
  localStorage.setItem('bypassTokenVerification', 'true');
  localStorage.setItem('comingFromRegistration', 'true');
  localStorage.setItem('inRegistrationFlow', 'true');
  sessionStorage.setItem('redirectAfterRegistration', 'true');
  
  // Force token into axios headers
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  console.log('Forced token into axios headers');
  
  // Also set a cookie with the token for extra redundancy
  document.cookie = `authToken=${token}; path=/; max-age=86400`; // 24 hours
};

/**
 * Modifies the navigation to include special parameters that will prevent logout
 * @param path The path to navigate to
 * @returns The path with added auth preservation parameters
 */
export const getAuthPreservingPath = (path: string): string => {
  // Add special parameters to the URL to indicate we're coming from registration
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}fromRegistration=true&preserveAuth=true`;
};

/**
 * Clears all authentication bypass flags after a successful transition
 * Call this after the user has successfully reached the feed page
 */
export const clearAuthBypassFlags = (): void => {
  console.log('Clearing auth bypass flags after successful transition');
  
  // Clear all the special flags we set
  localStorage.removeItem('justCompletedRegistration');
  localStorage.removeItem('completedFriendSuggestions');
  localStorage.removeItem('skipAuthCheck');
  localStorage.removeItem('forceAuthenticated');
  localStorage.removeItem('authBypassTimestamp');
  localStorage.removeItem('bypassTokenVerification');
  localStorage.removeItem('comingFromRegistration');
  localStorage.removeItem('inRegistrationFlow');
  sessionStorage.removeItem('redirectAfterRegistration');
};
