import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://localhost:8080/api/auth';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

const handleError = (error) => {
    console.error('Ошибка авторизации:', error);
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

// Проверка формата токена
const isValidTokenFormat = (token) => {
    if (!token) return false;
    return token.startsWith('Bearer ') || /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/.test(token);
};

// Нормализация токена (добавление Bearer если нужно)
const normalizeToken = (token) => {
    if (!token) return null;
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};

const setAuthData = (data) => {
    if (data.token && isValidTokenFormat(data.token)) {
        const normalizedToken = normalizeToken(data.token);
        localStorage.setItem(TOKEN_KEY, normalizedToken);
        
        // Сохраняем данные пользователя без токена
        const { token, ...userData } = data;
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        
        // Устанавливаем заголовок авторизации
        axios.defaults.headers.common['Authorization'] = normalizedToken;
        
        console.log('Данные авторизации успешно сохранены');
    } else {
        console.error('Неверный формат токена');
        throw new Error('Неверный формат токена');
    }
};

// Проверка валидности токена
const isTokenValid = (token) => {
    try {
        if (!token) return false;
        
        const normalizedToken = normalizeToken(token);
        const decoded = jwtDecode(normalizedToken.replace('Bearer ', ''));
        const currentTime = Date.now() / 1000;
        
        return decoded.exp > currentTime;
    } catch (error) {
        console.error('Ошибка при проверке токена:', error);
        return false;
    }
};

// Обновление токена
const refreshToken = async () => {
    try {
        console.log('Попытка обновления токена...');
        const response = await axios.post(`${API_URL}/refresh-token`);
        
        if (response.data.token) {
            console.log('Токен успешно обновлен');
            setAuthData(response.data);
            return response.data.token;
        }
        return null;
    } catch (error) {
        console.error('Ошибка при обновлении токена:', error);
        return null;
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
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            delete axios.defaults.headers.common['Authorization'];
        }
    },

    getCurrentUser() {
        try {
            const userData = localStorage.getItem(USER_KEY);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Ошибка при получении данных пользователя:', error);
            return null;
        }
    },

    isAuthenticated() {
        try {
            const token = localStorage.getItem(TOKEN_KEY);
            return !!token && isTokenValid(token);
        } catch (error) {
            console.error('Ошибка при проверке авторизации:', error);
            return false;
        }
    },
    
    getToken() {
        return localStorage.getItem(TOKEN_KEY);
    },
    
    setupAuthInterceptor(logoutCallback) {
        axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                
                if (error.response && error.response.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    
                    try {
                        const newToken = await refreshToken();
                        if (newToken) {
                            originalRequest.headers['Authorization'] = normalizeToken(newToken);
                            return axios(originalRequest);
                        }
                    } catch (refreshError) {
                        console.error('Ошибка при обновлении токена:', refreshError);
                    }
                    
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