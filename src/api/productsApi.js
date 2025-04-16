import axios from "axios";

const API_URL = "http://localhost:8080/api/admin/products";

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export const getProducts = async () => {
    try {
        const response = await axiosInstance.get("");
        return response.data;
    } catch (error) {
        console.error("Ошибка при получении списка товаров:", error);
        return [];
    }
};

export const createProduct = async (productData) => {
    try {
        const response = await axiosInstance.post("", productData);
        return response.data;
    } catch (error) {
        console.error("Ошибка при создании товара:", error);
        throw error;
    }
};

export const updateProduct = async (id, productData) => {
    try {
        const response = await axiosInstance.put(`/${id}`, productData);
        return response.data;
    } catch (error) {
        console.error("Ошибка при обновлении товара:", error);
        throw error;
    }
};

export const deleteProduct = async (id, force = false) => {
    try {
        const response = await axiosInstance.delete(`/${id}?force=${force}`);
        return response.data;
    } catch (error) {
        // Если ошибка содержит сообщение от сервера, возвращаем его
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
        }
        console.error("Ошибка при удалении товара:", error);
        throw error;
    }
};