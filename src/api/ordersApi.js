import axios from "axios";

const API_URL = "http://localhost:8080/api/admin/orders";

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export const getOrders = async () => {
    try {
        const response = await axiosInstance.get("");
        return response.data;
    } catch (error) {
        console.error("Ошибка при получении заказов:", error);
        return [];
    }
};

export const createOrder = async (orderData) => {
    try {
        const response = await axiosInstance.post("", orderData);
        return response.data;
    } catch (error) {
        console.error("Ошибка при создании заказа:", error);
        throw error;
    }
};

export const updateOrderStatus = async (id, status) => {
    try {
        const response = await axiosInstance.put(`/${id}`, { status });
        return response.data;
    } catch (error) {
        console.error("Ошибка при обновлении статуса заказа:", error);
        throw error;
    }
};

export const deleteOrder = async (id) => {
    try {
        await axiosInstance.delete(`/${id}`);
    } catch (error) {
        console.error("Ошибка при удалении заказа:", error);
        throw error;
    }
};