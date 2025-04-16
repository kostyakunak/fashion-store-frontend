import axios from "axios";

const API_URL = "http://localhost:8080/api/admin/cart";

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Так как API не предоставляет метод для получения всех корзин,
// нам нужно сделать запрос для каждого пользователя
export const getCartForUser = async (userId) => {
    try {
        const response = await axiosInstance.get(`/${userId}`);
        return response.data;
    } catch (error) {
        console.error(`Ошибка при получении корзины пользователя ${userId}:`, error);
        return [];
    }
};

// Вспомогательная функция для объединения корзин всех пользователей
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

export const createCart = async (cartData) => {
    try {
        const response = await axiosInstance.post("", cartData);
        return response.data;
    } catch (error) {
        console.error("Ошибка при создании записи корзины:", error);
        throw error;
    }
};

export const updateCart = async (id, cartData) => {
    try {
        const response = await axiosInstance.put(`/${id}`, cartData);
        return response.data;
    } catch (error) {
        console.error("Ошибка при обновлении записи корзины:", error);
        throw error;
    }
};

export const deleteCart = async (id) => {
    try {
        await axiosInstance.delete(`/${id}`);
    } catch (error) {
        console.error("Ошибка при удалении записи корзины:", error);
        throw error;
    }
}; 