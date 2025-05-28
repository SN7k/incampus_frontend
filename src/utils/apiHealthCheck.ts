import API from '../services/api';

/**
 * Checks if the API is reachable and returns a health status
 * @returns Promise with health status
 */
export const checkApiHealth = async (): Promise<{ status: string; message: string }> => {
  try {
    // Try to make a simple request to the API health endpoint
    await API.get('/health');
    return {
      status: 'success',
      message: 'Connected to InCampus API successfully'
    };
  } catch (error) {
    console.error('API Health Check Failed:', error);
    return {
      status: 'error',
      message: 'Could not connect to InCampus API. Some features may not work correctly.'
    };
  }
};

/**
 * Logs API connection status to console
 */
export const logApiStatus = async (): Promise<void> => {
  const health = await checkApiHealth();
  
  if (health.status === 'success') {
    console.log('%c' + health.message, 'color: green; font-weight: bold;');
    console.log('%cAPI URL: ' + import.meta.env.VITE_API_URL, 'color: blue;');
    console.log('%cMock Data: ' + (import.meta.env.VITE_USE_MOCK_DATA === 'true' ? 'Enabled' : 'Disabled'), 'color: blue;');
  } else {
    console.error(health.message);
    console.warn('Falling back to mock data where available');
  }
};
