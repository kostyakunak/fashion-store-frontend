import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';

/**
 * Configuration for axios instances
 */
const defaultConfig = {
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
};

/**
 * Creates an Axios client instance with authentication, error handling, and request/response interceptors
 * 
 * @param {Object} options - Configuration options for the axios instance
 * @param {string} options.baseURL - Base URL for the API
 * @param {boolean} options.requireAuth - Whether authentication is required
 * @param {boolean} options.isAdmin - Whether admin-specific endpoints are being accessed
 * @param {Function} options.onAuthError - Callback for authentication errors
 * @returns {Object} Configured axios instance
 */
export const createApiClient = (options = {}) => {
  const config = {
    ...defaultConfig,
    ...options
  };

  // Create axios instance with config
  const instance = axios.create(config);

  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      // If authentication is required, add token to headers
      if (options.requireAuth || options.isAdmin) {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        // Логируем токен и заголовки для диагностики
        console.log('[apiUtils] Отправка запроса:', config.method?.toUpperCase(), config.url);
        console.log('[apiUtils] Токен:', token);
        console.log('[apiUtils] Заголовки:', config.headers);
      }
      return config;
    },
    (error) => {
      console.error('Request error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // Handle authentication errors
      if (error.response) {
        // Authentication errors
        if (error.response.status === 401 || error.response.status === 403) {
          console.error('Authentication error:', error.response.data);
          
          if (options.onAuthError) {
            options.onAuthError(error.response.data);
          }
          
          // Redirect to login for auth errors
          if (error.response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login?error=session_expired';
          }
        }
        
        // Generic API error handling
        console.error(`API Error (${error.response.status}):`, error.response.data);
      } else if (error.request) {
        // Network errors
        console.error('Network error - no response received:', error.request);
      } else {
        // Other errors
        console.error('Error:', error.message);
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

/**
 * Creates an API client specifically for admin endpoints
 * 
 * @param {Object} options - Additional configuration options
 * @param {Function} onAuthError - Callback for authentication errors
 * @returns {Object} Configured axios instance for admin API
 */
export const createAdminApiClient = (options = {}, onAuthError) => {
  return createApiClient({
    baseURL: API_CONFIG.ADMIN_API_URL,
    requireAuth: true,
    isAdmin: true,
    onAuthError,
    ...options
  });
};

/**
 * Formats error messages from API responses
 * 
 * @param {Error} error - Axios error object
 * @returns {string} Formatted error message
 */
export const formatErrorMessage = (error) => {
  if (error.response && error.response.data) {
    if (error.response.data.message) {
      return error.response.data.message;
    }
    if (typeof error.response.data === 'string') {
      return error.response.data;
    }
    return JSON.stringify(error.response.data);
  }
  return error.message || 'Произошла неизвестная ошибка';
};

/**
 * Handles errors from API calls in a consistent way
 * 
 * @param {Error} error - Error object
 * @param {string} defaultMessage - Default error message
 * @returns {string} User-friendly error message
 */
export const handleApiError = (error, defaultMessage = 'Произошла ошибка при обращении к серверу') => {
  console.error('API Error:', error);
  
  if (error.response) {
    // Server returned an error response
    const status = error.response.status;
    const data = error.response.data;
    
    switch (status) {
      case 400:
        return data.message || 'Неверный запрос. Проверьте введенные данные.';
      case 401:
        return 'Требуется авторизация. Пожалуйста, войдите снова.';
      case 403:
        return 'Доступ запрещен. У вас нет прав для выполнения этого действия.';
      case 404:
        return 'Запрашиваемый ресурс не найден.';
      case 500:
        return 'Внутренняя ошибка сервера. Пожалуйста, попробуйте позже.';
      default:
        return data.message || defaultMessage;
    }
  } else if (error.request) {
    // Request was made but no response received
    return 'Сервер не отвечает. Проверьте подключение к интернету.';
  } else {
    // Error setting up the request
    return error.message || defaultMessage;
  }
};

export default {
  createApiClient,
  createAdminApiClient,
  formatErrorMessage,
  handleApiError
};