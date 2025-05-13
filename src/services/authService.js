import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://localhost:8080/api/auth';

const handleError = (error) => {
    if (error.response) {
        return {
            message: error.response.data.message || 'Ошибка сервера',
            status: error.response.status,
            data: error.response.data
        };
    }
    if (error.request) {
        return {
            message: 'Ошибка соединения с сервером',
            isNetworkError: true
        };
    }
    return {
        message: 'Ошибка при отправке запроса',
        originalError: error
    };
};

const setAuthData = (data) => {
    if (data.token) {
        localStorage.setItem('token', data.token);
        
        // Устанавливаем заголовок авторизации для всех последующих запросов
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    }
};

// Проверка валидности токена
const isTokenValid = (token) => {
    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        // Проверяем, не истек ли срок действия токена
        return decoded.exp > currentTime;
    } catch (error) {
        return false;
    }
};

export const authService = {
    async register(userData) {
        try {
            const response = await axios.post(`${API_URL}/register`, userData);
            setAuthData(response.data);
            return response.data;
        } catch (error) {
            throw handleError(error);
        }
    },

    async login(credentials) {
        try {
            const response = await axios.post(`${API_URL}/login`, credentials);
            setAuthData(response.data);
            return response.data;
        } catch (error) {
            throw handleError(error);
        }
    },

    async logout() {
        try {
            await axios.post(`${API_URL}/logout`);
        } catch (error) {
            console.error('Ошибка при выходе:', error);
        } finally {
            // Очищаем данные аутентификации
            this.clearAuthData();
        }
    },
    
    clearAuthData() {
        // Удаляем токен
        localStorage.removeItem('token');
        
        // Удаляем заголовок авторизации
        delete axios.defaults.headers.common['Authorization'];
    },

    getCurrentUser() {
        const token = localStorage.getItem('token');
        if (!token || !isTokenValid(token)) {
            return null;
        }
        
        try {
            const decoded = jwtDecode(token);
            return {
                id: decoded.sub,   // User ID is stored in the 'sub' claim
                email: decoded.email,
                roles: decoded.roles || []
            };
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    },
    
    getUserId() {
        const token = localStorage.getItem('token');
        if (!token || !isTokenValid(token)) {
            return null;
        }
        
        try {
            const decoded = jwtDecode(token);
            return decoded.sub; // User ID is stored in the 'sub' claim
        } catch (error) {
            console.error('Error getting user ID from token:', error);
            return null;
        }
    },

    isAuthenticated() {
        const token = localStorage.getItem('token');
        return !!token && isTokenValid(token);
    },
    
    // Получение токена
    getToken() {
        return localStorage.getItem('token');
    },
    
    // Настройка перехватчика для обработки ошибок авторизации
    setupAuthInterceptor(logoutCallback) {
        axios.interceptors.response.use(
            (response) => response,
            (error) => {
                // Если сервер вернул ошибку 401 (Unauthorized), выполняем выход
                if (error.response && error.response.status === 401) {
                    this.logout();
                    if (logoutCallback) {
                        logoutCallback();
                    }
                }
                return Promise.reject(error);
            }
        );
    }
}; 