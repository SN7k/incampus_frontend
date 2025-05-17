/**
 * Environment helper for InCampus application
 * This file provides utility functions to detect the environment
 * and configure the application accordingly
 */

// Detect environment based on URL and import.meta.env
const detectEnvironment = (): { isProd: boolean; isDev: boolean } => {
  // Check if we're running on a production domain
  const isProductionDomain = window.location.hostname.includes('incampus') || 
                            window.location.hostname.includes('netlify.app') ||
                            window.location.hostname.includes('render.com');
  
  // Check if we're running in development mode according to Vite
  const isDevBuild = import.meta.env.DEV === true;
  
  // Check if we have a localStorage override
  const hasDevOverride = localStorage.getItem('forceDevMode') === 'true';
  const hasProdOverride = localStorage.getItem('forceProdMode') === 'true';
  
  // Determine final environment state
  const isProd = hasProdOverride || (isProductionDomain && !hasDevOverride);
  const isDev = hasDevOverride || (isDevBuild && !hasProdOverride);
  
  return { isProd, isDev };
};

// Get environment state
const env = detectEnvironment();

// Export environment variables
export const isProduction = env.isProd;
export const isDevelopment = env.isDev;

// Helper to check if we should use real API
export const useRealApi = (): boolean => {
  // Check if we have a localStorage override for API
  const apiPreference = localStorage.getItem('useRealApi');
  
  if (apiPreference === 'true') return true;
  if (apiPreference === 'false') return false;
  
  // Default behavior: use real API in production, configurable in development
  return isProduction || localStorage.getItem('devUseRealApi') === 'true';
};

// Helper to configure development mode
export const configureDevMode = (useReal: boolean): void => {
  localStorage.setItem('devUseRealApi', useReal ? 'true' : 'false');
  console.log(`Development mode configured to use ${useReal ? 'real' : 'mock'} API`);
};

// Export a function to check if we're in dev mode
export const isDevMode = (): boolean => {
  return isDevelopment;
};
