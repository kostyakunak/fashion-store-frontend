import { createAdminApiClient } from "../utils/apiUtils";
import { API_CONFIG } from '../config/apiConfig';

const apiClient = createAdminApiClient({
  baseURL: API_CONFIG.ADMIN_API_URL + "/sizes"
});

export const getSizes = async () => {
    try {
        const response = await apiClient.get("");
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
        const response = await apiClient.post("", sizeData);
        return response.data;
    } catch (error) {
        console.error("Ошибка при создании размера:", error);
        throw error;
    }
};

// Стандартный метод обновления через PUT запрос
export const updateSize = async (id, sizeData) => {
    try {
        const response = await apiClient.put(`${id}`, sizeData);
        return response.data;
    } catch (error) {
        console.error(`Ошибка при обновлении размера с ID ${id}:`, error);
        throw error;
    }
};

export const deleteSize = async (id) => {
    try {
        await apiClient.delete(`/${id}`);
        return true;
    } catch (error) {
        console.error(`Ошибка при удалении размера с ID ${id}:`, error);
        throw error;
    }
};