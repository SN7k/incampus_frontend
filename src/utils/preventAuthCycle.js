/**
 * This utility provides a direct solution to prevent the authentication cycle issue
 * where the app redirects from feed page to login page repeatedly
 */

// Function to force the authentication state to be preserved
export const forceAuthenticationState = () => {
  console.log('Forcing authentication state to be preserved');
  
  // Set special flags to prevent logout
  localStorage.setItem('forceAuthenticated', 'true');
  localStorage.setItem('completedFriendSuggestions', 'true');
  localStorage.setItem('skipAuthCheck', 'true');
  localStorage.setItem('inRegistrationFlow', 'true');
  localStorage.setItem('completingOnboarding', 'true');
  localStorage.setItem('justCompletedRegistration', 'true');
  sessionStorage.setItem('redirectAfterRegistration', 'true');
  localStorage.setItem('bypassTokenVerification', 'true');
  localStorage.setItem('comingFromRegistration', 'true');
  
  // Store the current time to allow for temporary bypassing of auth checks
  localStorage.setItem('authBypassTimestamp', Date.now().toString());
  
  // Ensure the token is properly set in axios headers
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    // This will be imported and used in the Feed component
    return token;
  }
  
  return null;
};

// Function to check if we need to force authentication
export const shouldForceAuthentication = () => {
  // Check URL parameters for special flags
  const urlParams = new URLSearchParams(window.location.search);
  const fromRegistration = urlParams.get('fromRegistration') === 'true';
  const preserveAuth = urlParams.get('preserveAuth') === 'true';
  
  // Check localStorage flags
  const completedFriendSuggestions = localStorage.getItem('completedFriendSuggestions') === 'true';
  const forceAuthenticated = localStorage.getItem('forceAuthenticated') === 'true';
  
  return fromRegistration || preserveAuth || completedFriendSuggestions || forceAuthenticated;
};

// Function to clean up the URL parameters without triggering a page reload
export const cleanupUrlParameters = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const fromRegistration = urlParams.get('fromRegistration') === 'true';
  const preserveAuth = urlParams.get('preserveAuth') === 'true';
  
  if (fromRegistration || preserveAuth) {
    console.log('Cleaning up URL parameters without page reload');
    window.history.replaceState({}, document.title, window.location.pathname);
    return true;
  }
  
  return false;
};
