import axios from 'axios';

// Centralized API configuration
export const API_URL = import.meta.env.VITE_API_URL || '';

// Helper function to build API URLs
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_URL}/${cleanEndpoint}`;
};

// Configure axios defaults
axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;

// Add axios interceptor to include token in all requests
axios.interceptors.request.use(
  (config) => {
    console.log('=== AXIOS INTERCEPTOR ===');
    console.log('Request URL:', config.url);
    console.log('Request method:', config.method);
    
    // Get token from cookies
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('access_token='))
      ?.split('=')[1];
    
    console.log('Token found in cookies:', token ? 'Yes' : 'No');
    if (token) {
      console.log('Token preview:', token.substring(0, 20) + '...');
    }
    
    // Add token to Authorization header if available
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header added');
    } else if (!token) {
      console.warn('No token found in cookies!');
    }
    
    console.log('Request headers:', config.headers);
    
    return config;
  },
  (error) => {
    console.error('Axios interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('=== AXIOS RESPONSE ERROR ===');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('URL:', error.config?.url);
    
    if (error.response?.status === 401) {
      console.error('Unauthorized! Token might be expired or invalid.');
    }
    
    return Promise.reject(error);
  }
);

// Fetch wrapper with better error handling
export const apiFetch = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  
  // Check if response is ok before parsing
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP error! status: ${response.status}`);
  }

  return response;
};

export default API_URL;
