import axios from "axios";

const API_URL = "http://localhost:8080/api/admin/categories";

export const getAllCategories = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error("Ошибка при получении категорий:", error);
        throw error;
    }
};

// Алиас для совместимости с существующим кодом
export const getCategories = getAllCategories;

export const createCategory = async (categoryData) => {
    try {
        const response = await axios.post(API_URL, categoryData);
        return response.data;
    } catch (error) {
        console.error("Ошибка при создании категории:", error);
        throw error;
    }
};

export const updateCategory = async (id, categoryData) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, categoryData);
        return response.data;
    } catch (error) {
        console.error(`Ошибка при обновлении категории с ID ${id}:`, error);
        throw error;
    }
};

export const deleteCategory = async (id) => {
    try {
        await axios.delete(`${API_URL}/${id}`);
        return true;
    } catch (error) {
        console.error(`Ошибка при удалении категории с ID ${id}:`, error);
        throw error;
    }
};