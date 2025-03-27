import axios from "axios";
const API_URL = "http://localhost:8080/api/admin/orders";

export const getOrders = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error("Ошибка при получении заказов:", error);
        return [];
    }
};

export const createOrder = async (orderData) => {
    try {
        const response = await axios.post(API_URL, orderData);
        return response.data;
    } catch (error) {
        console.error("Ошибка при создании заказа:", error);
        throw error;
    }
};

export const updateOrderStatus = async (id, status) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, { status });
        return response.data;
    } catch (error) {
        console.error("Ошибка при обновлении статуса заказа:", error);
        throw error;
    }
};

export const deleteOrder = async (id) => {
    try {
        await axios.delete(`${API_URL}/${id}`);
    } catch (error) {
        console.error("Ошибка при удалении заказа:", error);
        throw error;
    }
};