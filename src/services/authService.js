/**
 * Authentication Service
 * Connects to Node.js backend API
 */
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ott_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Register a new user
 */
export const register = async (userData) => {
  try {
    const response = await authApi.post('/auth/register', userData);
    
    if (response.data.success) {
      return {
        user: response.data.data.user,
        token: response.data.data.token
      };
    } else {
      throw new Error(response.data.message || 'Registration failed');
    }
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    if (error.response?.data?.errors && error.response.data.errors.length > 0) {
      throw new Error(error.response.data.errors[0].msg || 'Validation failed');
    }
    throw new Error(error.message || 'Registration failed');
  }
};

/**
 * Login user
 */
export const login = async (credentials) => {
  try {
    const response = await authApi.post('/auth/login', credentials);
    
    if (response.data.success) {
      return {
        user: response.data.data.user,
        token: response.data.data.token
      };
    } else {
      throw new Error(response.data.message || 'Login failed');
    }
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    if (error.response?.data?.errors && error.response.data.errors.length > 0) {
      throw new Error(error.response.data.errors[0].msg || 'Validation failed');
    }
    throw new Error(error.message || 'Login failed');
  }
};

/**
 * Verify token
 */
export const verifyToken = async (token) => {
  try {
    const response = await authApi.post('/auth/verify', { token });
    
    if (response.data.success) {
      return {
        user: response.data.data.user,
        token: response.data.data.token
      };
    } else {
      throw new Error(response.data.message || 'Token verification failed');
    }
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(error.message || 'Token verification failed');
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  try {
    const response = await authApi.get('/auth/me');
    
    if (response.data.success) {
      return response.data.data.user;
    } else {
      throw new Error(response.data.message || 'Failed to get user');
    }
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(error.message || 'Failed to get user');
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    const response = await authApi.put(`/auth/profile/${userId}`, updates);
    
    if (response.data.success) {
      return response.data.data.user;
    } else {
      throw new Error(response.data.message || 'Profile update failed');
    }
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(error.message || 'Profile update failed');
  }
};

/**
 * Get user preferences
 */
export const getUserPreferences = async () => {
  try {
    const response = await authApi.get('/auth/preferences');
    
    if (response.data.success) {
      return response.data.data.preferences;
    } else {
      throw new Error(response.data.message || 'Failed to get preferences');
    }
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(error.message || 'Failed to get preferences');
  }
};

export const getCollaborativeRecommendations = async () => {
  try {
    const response = await authApi.get('/recommendations/collaborative');
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to get recommendations');
    }
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(error.message || 'Failed to get recommendations');
  }
};
