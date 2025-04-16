import axios from "axios";

const API_URL = "http://localhost:8080/api/admin/sizes";
const DB_API_URL = "http://localhost:8080/api/admin/db"; // Эндпоинт для прямых запросов к БД

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export const getSizes = async () => {
    try {
        const response = await axiosInstance.get("");
        return response.data;
    } catch (error) {
        console.error("Ошибка при получении списка размеров:", error);
        throw error;
    }
};

// Алиас для совместимости с паттерном именования
export const getAllSizes = getSizes;

export const createSize = async (sizeData) => {
    try {
        const response = await axiosInstance.post("", sizeData);
        return response.data;
    } catch (error) {
        console.error("Ошибка при создании размера:", error);
        throw error;
    }
};

// Стандартный метод обновления через PUT запрос
export const updateSize = async (id, sizeData) => {
    try {
        const response = await axiosInstance.put(`${id}`, sizeData);
        return response.data;
    } catch (error) {
        console.error(`Ошибка при обновлении размера с ID ${id}:`, error);
        throw error;
    }
};

export const deleteSize = async (id) => {
    try {
        await axiosInstance.delete(`/${id}`);
        return true;
    } catch (error) {
        console.error(`Ошибка при удалении размера с ID ${id}:`, error);
        throw error;
    }
};