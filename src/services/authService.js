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
        // Сохраняем данные пользователя без токена
        const { token, ...userData } = data;
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Устанавливаем заголовок авторизации для всех последующих запросов
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
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
            // Удаляем токен и данные пользователя
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Удаляем заголовок авторизации
            delete axios.defaults.headers.common['Authorization'];
        }
    },

    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
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