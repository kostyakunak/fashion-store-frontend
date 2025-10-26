import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { API_CONFIG } from '../config/apiConfig';

const API_URL = API_CONFIG.API_URL + '/auth';

const handleError = (error) => {
    if (error.response) {
        return {
            message: error.response.data.message || 'Помилка сервера',
            status: error.response.status,
            data: error.response.data
        };
    }
    if (error.request) {
        return {
            message: 'Помилка з’єднання з сервером',
            isNetworkError: true
        };
    }
    return {
        message: 'Помилка при відправці запиту',
        originalError: error
    };
};

const setAuthData = (data) => {
    if (data.token) {
        localStorage.setItem('token', data.token);
        
        // Встановлюємо заголовок авторизації для всіх наступних запитів
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    }
};

// Перевіряємо, чи не закінчився термін дії токена
const isTokenValid = (token) => {
    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        // Перевіряємо, не істек ли срок дії токена
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
            console.error('Помилка при виході:', error);
        } finally {
            // Очищаємо дані автентифікації
            this.clearAuthData();
        }
    },
    
    clearAuthData() {
        // Видаляємо токен
        localStorage.removeItem('token');
        
        // Видаляємо заголовок авторизації
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
                id: decoded.sub,   // ID користувача зберігається у полі 'sub'
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
            return decoded.sub; // ID користувача зберігається у полі 'sub'
        } catch (error) {
            console.error('Error getting user ID from token:', error);
            return null;
        }
    },

    isAuthenticated() {
        const token = localStorage.getItem('token');
        return !!token && isTokenValid(token);
    },
    
    // Отримання токена
    getToken() {
        return localStorage.getItem('token');
    },
    
    // Налаштування перехоплювача для обробки помилок авторизації
    setupAuthInterceptor(logoutCallback) {
        axios.interceptors.response.use(
            (response) => response,
            (error) => {
                // Якщо сервер повернув помилку 401 (Unauthorized), виконуємо вихід
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