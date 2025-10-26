import axios from "axios";
import { API_CONFIG } from '../config/apiConfig';

const API_URL = API_CONFIG.API_URL + "/wishlist";

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Получить список желаний текущего пользователя
export const getCurrentUserWishlist = async () => {
    try {
        const response = await axiosInstance.get("");
        return response.data;
    } catch (error) {
        console.error("Ошибка при получении списка желаний:", error);
        return [];
    }
};

// Добавить товар в список желаний
export const addToWishlist = async (productId) => {
    try {
        const response = await axiosInstance.post("", {
            productId
        });
        return response.data;
    } catch (error) {
        console.error("Ошибка при добавлении товара в список желаний:", error);
        throw error;
    }
};

// Удалить товар из списка желаний
export const removeFromWishlist = async (wishlistItemId) => {
    try {
        await axiosInstance.delete(`/${wishlistItemId}`);
    } catch (error) {
        console.error("Ошибка при удалении товара из списка желаний:", error);
        throw error;
    }
};

// Проверить, есть ли товар в списке желаний пользователя
export const isProductInWishlist = async (productId) => {
    try {
        const response = await axiosInstance.get(`/check/${productId}`);
        return response.data;
    } catch (error) {
        console.error("Ошибка при проверке товара в списке желаний:", error);
        return false;
    }
}; 