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
    // Get token from cookies
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('access_token='))
      ?.split('=')[1];
    
    // Add token to Authorization header if available
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Log errors in development
    if (import.meta.env.DEV) {
      console.error('API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
    }
    
    // Handle 401 errors globally
    if (error.response?.status === 401) {
      // Token expired or invalid - could redirect to login
      console.warn('Authentication failed. Please login again.');
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
