import axiosInstance from './axios';

/**
 * Helper functions for managing auth state during registration flow
 */

/**
 * Set all registration flags to ensure authentication is preserved
 * across different stages of the registration flow
 */
export const setRegistrationFlags = () => {
  console.log('Setting all registration flags to preserve authentication state');
  
  // Set all possible flags in both localStorage and sessionStorage
  localStorage.setItem('inRegistrationFlow', 'true');
  localStorage.setItem('completingOnboarding', 'true');
  localStorage.setItem('justCompletedRegistration', 'true');
  sessionStorage.setItem('redirectAfterRegistration', 'true');
  localStorage.setItem('bypassTokenVerification', 'true');
  localStorage.setItem('comingFromRegistration', 'true');
  localStorage.setItem('fromProfileSetup', 'true');
};

/**
 * Clear all registration flags when they are no longer needed
 */
export const clearRegistrationFlags = () => {
  console.log('Clearing all registration flags');
  
  // Clear all flags from both localStorage and sessionStorage
  localStorage.removeItem('inRegistrationFlow');
  localStorage.removeItem('completingOnboarding');
  localStorage.removeItem('justCompletedRegistration');
  sessionStorage.removeItem('redirectAfterRegistration');
  localStorage.removeItem('bypassTokenVerification');
  localStorage.removeItem('comingFromRegistration');
  localStorage.removeItem('fromProfileSetup');
  localStorage.removeItem('registrationStep');
};

/**
 * Check if any registration flags are set
 */
export const hasRegistrationFlags = (): boolean => {
  const flags = [
    localStorage.getItem('inRegistrationFlow') === 'true',
    localStorage.getItem('completingOnboarding') === 'true',
    localStorage.getItem('justCompletedRegistration') === 'true',
    sessionStorage.getItem('redirectAfterRegistration') === 'true',
    localStorage.getItem('bypassTokenVerification') === 'true',
    localStorage.getItem('comingFromRegistration') === 'true',
    localStorage.getItem('fromProfileSetup') === 'true'
  ];
  
  return flags.some(flag => flag === true);
};

/**
 * Ensure the token is saved in all storage mechanisms
 */
export const saveToken = (token: string) => {
  console.log('Saving token to all storage mechanisms');
  
  // Save to localStorage
  localStorage.setItem('token', token);
  
  // Save to sessionStorage
  sessionStorage.setItem('token', token);
  
  // Save to cookies
  document.cookie = `authToken=${token}; path=/; max-age=86400`; // 1 day
  
  // Set in axios headers
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

/**
 * Save user data to all storage mechanisms
 */
export const saveUserData = (userData: any) => {
  console.log('Saving user data to all storage mechanisms');
  
  const userStr = JSON.stringify(userData);
  
  // Save to localStorage
  localStorage.setItem('user', userStr);
  
  // Save to sessionStorage
  sessionStorage.setItem('user', userStr);
};

/**
 * Navigate to a URL without the forceLogout parameter
 */
export const navigateWithoutForceLogout = (url: string = '/') => {
  console.log('Navigating to', url, 'without forceLogout parameter');
  
  // Ensure we're navigating to a clean URL without any query parameters
  const cleanUrl = url.split('?')[0];
  
  // Set registration flags before navigating
  setRegistrationFlags();
  
  // Set a special flag to indicate we're forcing authentication
  localStorage.setItem('forceAuthenticated', 'true');
  
  // Remove any existing forceLogout parameter
  window.history.replaceState(null, '', cleanUrl);
  
  // Use direct assignment to avoid adding query parameters
  window.location.replace(cleanUrl + '?fromRegistration=true');
};

/**
 * Special function to handle the transition from friend suggestions to feed
 * This is a critical transition that needs extra care to maintain authentication
 */
export const handleFriendSuggestionsToFeedTransition = () => {
  console.log('Handling critical transition from friend suggestions to feed');
  
  // Set ALL possible flags to ensure authentication is preserved
  setRegistrationFlags();
  
  // Set additional special flags for this specific transition
  localStorage.setItem('forceAuthenticated', 'true');
  localStorage.setItem('completedFriendSuggestions', 'true');
  localStorage.setItem('skipAuthCheck', 'true');
  
  // Store the current time to allow for temporary bypassing of auth checks
  localStorage.setItem('authBypassTimestamp', Date.now().toString());
  
  // Navigate to the feed with a special parameter
  window.location.href = '/?fromRegistration=true&preserveAuth=true';
};

/**
 * Handle the transition after completing a registration step
 */
export const handleRegistrationStepComplete = (nextStep: string, token?: string, userData?: any) => {
  console.log('Completing registration step, moving to', nextStep);
  
  // Set registration flags
  setRegistrationFlags();
  
  // Save token if provided
  if (token) {
    saveToken(token);
  }
  
  // Save user data if provided
  if (userData) {
    saveUserData(userData);
  }
  
  // If next step is the feed, navigate there without forceLogout
  if (nextStep === 'feed') {
    navigateWithoutForceLogout('/');
  } else {
    // Otherwise, set the registration step
    localStorage.setItem('registrationStep', nextStep);
  }
};
