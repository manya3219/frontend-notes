// API utility for handling requests in both development and production

const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Make an API request
 * @param {string} endpoint - API endpoint (e.g., '/api/auth/login')
 * @param {object} options - Fetch options
 * @returns {Promise} - Response data
 */
export const apiRequest = async (endpoint, options = {}) => {
  const url = API_URL + endpoint;
  
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  
  // Check if response is JSON
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  // If not JSON, throw error with response text
  const text = await response.text();
  throw new Error(text || 'Server returned non-JSON response');
};

export default apiRequest;
