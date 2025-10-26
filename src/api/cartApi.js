import axios from "axios";
import { API_CONFIG } from '../config/apiConfig';

// Admin API endpoint for backend management
const ADMIN_API_URL = API_CONFIG.ADMIN_API_URL + "/cart";
// Public API endpoint for frontend user interactions
const PUBLIC_API_URL = API_CONFIG.API_URL + "/cart";

// Create admin axios instance
const adminAxiosInstance = axios.create({
    baseURL: ADMIN_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Create public axios instance
const publicAxiosInstance = axios.create({
    baseURL: PUBLIC_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Helper to set auth token for requests
export const setCartAuthHeader = (token) => {
    if (token) {
        publicAxiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        adminAxiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete publicAxiosInstance.defaults.headers.common['Authorization'];
        delete adminAxiosInstance.defaults.headers.common['Authorization'];
    }
};

// Admin methods

// Получение корзины пользователя (для админа)
export const getCartForUser = async (userId) => {
    try {
        const response = await adminAxiosInstance.get(`/${userId}`);
        return response.data;
    } catch (error) {
        console.error(`Ошибка при получении корзины пользователя ${userId}:`, error);
        return [];
    }
};

// Вспомогательная функция для объединения корзин всех пользователей (для админа)
export const getAllCarts = async (userIds) => {
    try {
        const cartPromises = userIds.map(userId => getCartForUser(userId));
        const cartsArrays = await Promise.all(cartPromises);
        
        // Объединяем массивы корзин всех пользователей в один массив
        return cartsArrays.flat();
    } catch (error) {
        console.error("Ошибка при получении всех корзин:", error);
        return [];
    }
};

// Создание записи корзины (для админа)
export const createCart = async (cartData) => {
    try {
        const response = await adminAxiosInstance.post("", cartData);
        return response.data;
    } catch (error) {
        console.error("Ошибка при создании записи корзины:", error);
        throw error;
    }
};

// Обновление записи корзины (для админа)
export const updateCart = async (id, cartData) => {
    try {
        const response = await adminAxiosInstance.put(`/${id}`, cartData);
        return response.data;
    } catch (error) {
        console.error("Ошибка при обновлении записи корзины:", error);
        throw error;
    }
};

// Удаление записи корзины (для админа)
export const deleteCart = async (id) => {
    try {
        await adminAxiosInstance.delete(`/${id}`);
    } catch (error) {
        console.error("Ошибка при удалении записи корзины:", error);
        throw error;
    }
};

// Public methods (for frontend users)

// Получение корзины текущего пользователя
export const getMyCart = async () => {
    try {
        const response = await publicAxiosInstance.get('/my');
        return response.data;
    } catch (error) {
        console.error("Ошибка при получении корзины:", error);
        throw error;
    }
};

// Добавление товара в корзину
export const addToCart = async (productId, sizeId, quantity) => {
    try {
        const response = await publicAxiosInstance.post('', {
            productId,
            sizeId,
            quantity
        });
        return response.data;
    } catch (error) {
        console.error("Ошибка при добавлении товара в корзину:", error);
        throw error;
    }
};

// Удаление товара из корзины
export const removeItemFromCart = async (cartItemId) => {
    try {
        const response = await publicAxiosInstance.delete(`/${cartItemId}`);
        return response.data;
    } catch (error) {
        console.error("Ошибка при удалении товара из корзины:", error);
        throw error;
    }
};

// Обновление количества товара в корзине
export const updateCartItemQuantity = async (cartItemId, quantity) => {
    try {
        const response = await publicAxiosInstance.put(`/${cartItemId}`, { quantity });
        return response.data;
    } catch (error) {
        console.error("Ошибка при обновлении количества товара:", error);
        throw error;
    }
};

// Обновление размера товара в корзине
export const updateCartItemSize = async (cartItemId, sizeId) => {
    try {
        const response = await publicAxiosInstance.put(`/${cartItemId}/size`, { sizeId });
        return response.data;
    } catch (error) {
        console.error("Ошибка при обновлении размера товара:", error);
        throw error;
    }
};

// Объединение гостевой корзины с корзиной пользователя
export const mergeGuestCart = async (guestCart) => {
    try {
        const response = await publicAxiosInstance.post('/merge', { guestCart });
        return response.data;
    } catch (error) {
        console.error("Ошибка при объединении корзин:", error);
        throw error;
    }
};