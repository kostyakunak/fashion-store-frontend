import axios from "axios";

const API_URL = "http://localhost:8080/api/cart";

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Получить корзину текущего пользователя
export const getCurrentUserCart = async () => {
    try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            console.error("User ID not found in localStorage");
            return [];
        }
        
        const response = await axiosInstance.get(`/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Ошибка при получении корзины пользователя:", error);
        return [];
    }
};

// Добавить товар в корзину
export const addToCart = async (productId, quantity) => {
    try {
        const response = await axiosInstance.post("", {
            productId,
            quantity
        });
        return response.data;
    } catch (error) {
        console.error("Ошибка при добавлении товара в корзину:", error);
        throw error;
    }
};

// Обновить количество товара в корзине
export const updateCartItem = async (cartItemId, quantity) => {
    try {
        const response = await axiosInstance.put(`/${cartItemId}`, {
            quantity
        });
        return response.data;
    } catch (error) {
        console.error("Ошибка при обновлении товара в корзине:", error);
        throw error;
    }
};

// Удалить товар из корзины
export const removeFromCart = async (cartItemId) => {
    try {
        await axiosInstance.delete(`/${cartItemId}`);
    } catch (error) {
        console.error("Ошибка при удалении товара из корзины:", error);
        throw error;
    }
};

// Очистить корзину
export const clearCart = async () => {
    try {
        await axiosInstance.delete("/clear");
    } catch (error) {
        console.error("Ошибка при очистке корзины:", error);
        throw error;
    }
}; 