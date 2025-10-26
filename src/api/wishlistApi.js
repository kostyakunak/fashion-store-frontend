import axios from "axios";
import { API_CONFIG } from '../config/apiConfig';

// Admin API endpoint for backend management
const ADMIN_API_URL = API_CONFIG.ADMIN_API_URL + "/wishlist";
// Public API endpoint for frontend user interactions
const PUBLIC_API_URL = API_CONFIG.API_URL + "/wishlist";

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
export const setWishlistAuthHeader = (token) => {
    if (token) {
        publicAxiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        adminAxiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete publicAxiosInstance.defaults.headers.common['Authorization'];
        delete adminAxiosInstance.defaults.headers.common['Authorization'];
    }
};

// Admin methods

// Получить список желаний конкретного пользователя
export const getWishlistForUser = async (userId) => {
    try {
        const response = await adminAxiosInstance.get(`/${userId}`);
        return response.data;
    } catch (error) {
        console.error(`Ошибка при получении списка желаний пользователя ${userId}:`, error);
        return [];
    }
};

// Объединить списки желаний всех пользователей
export const getAllWishlists = async (userIds) => {
    try {
        const wishlistPromises = userIds.map(userId => getWishlistForUser(userId));
        const wishlistArrays = await Promise.all(wishlistPromises);
        
        // Объединяем все массивы в один
        return wishlistArrays.flat();
    } catch (error) {
        console.error("Ошибка при получении всех списков желаний:", error);
        return [];
    }
};

// Добавить товар в список желаний (для админа)
export const createWishlistItem = async (wishlistData) => {
    try {
        const response = await adminAxiosInstance.post("", wishlistData);
        return response.data;
    } catch (error) {
        console.error("Ошибка при добавлении в список желаний:", error);
        throw error;
    }
};

// Удалить элемент из списка желаний (для админа)
export const deleteWishlistItem = async (id) => {
    try {
        await adminAxiosInstance.delete(`/${id}`);
    } catch (error) {
        console.error("Ошибка при удалении из списка желаний:", error);
        throw error;
    }
};

// Обновить элемент списка желаний (для админа)
export const updateWishlistItem = async (id, wishlistData) => {
    try {
        const response = await adminAxiosInstance.put(`/${id}`, wishlistData);
        return response.data;
    } catch (error) {
        console.error("Ошибка при обновлении списка желаний:", error);
        throw error;
    }
};

// Public methods (for frontend users)

// Получение списка желаний текущего пользователя
export const getMyWishlist = async () => {
    try {
        const response = await publicAxiosInstance.get('/my');
        return response.data;
    } catch (error) {
        console.error("Ошибка при получении списка желаний:", error);
        throw error;
    }
};

// Добавление товара в список желаний
export const addToWishlist = async (productId) => {
    try {
        const response = await publicAxiosInstance.post('', {
            productId
        });
        return response.data;
    } catch (error) {
        console.error("Ошибка при добавлении товара в список желаний:", error);
        throw error;
    }
};

// Удаление товара из списка желаний по ID элемента
export const removeFromWishlist = async (wishlistItemId) => {
    try {
        const response = await publicAxiosInstance.delete(`/${wishlistItemId}`);
        return response.data;
    } catch (error) {
        console.error("Ошибка при удалении товара из списка желаний:", error);
        throw error;
    }
};

// Удаление товара из списка желаний по ID продукта
export const removeProductFromWishlist = async (productId) => {
    try {
        const response = await publicAxiosInstance.delete(`/product/${productId}`);
        return response.data;
    } catch (error) {
        console.error("Ошибка при удалении товара из списка желаний:", error);
        throw error;
    }
};

// Проверить, есть ли товар в списке желаний пользователя
export const isProductInWishlist = async (productId) => {
    try {
        const wishlist = await getMyWishlist();
        return wishlist.some(item => item.productId === productId);
    } catch (error) {
        console.error("Ошибка при проверке товара в списке желаний:", error);
        return false;
    }
};