import axios from "axios";

const API_URL = "http://localhost:8080/api/admin"; // Проверяем, что URL верный

export const getProducts = async () => {
    try {
        const response = await axios.get(`${API_URL}/products`);
        return response.data;
    } catch (error) {
        console.error("Ошибка при получении списка товаров:", error);
        return [];
    }
};

export const createProduct = async (productData) => {
    try {
        const response = await axios.post(`${API_URL}/products`, productData);
        return response.data;
    } catch (error) {
        console.error("Ошибка при создании товара:", error);
        throw error;
    }
};

// ✅ Добавляем создание цены
export const createPrice = async (priceData) => {
    try {
        const response = await axios.post(`${API_URL}/prices`, priceData);
        return response.data;
    } catch (error) {
        console.error("Ошибка при создании цены:", error);
        throw error;
    }
};

// ✅ Добавляем загрузку изображений
export const createImage = async (imageData) => {
    try {
        const response = await axios.post(`${API_URL}/images`, imageData);
        return response.data;
    } catch (error) {
        console.error("Ошибка при добавлении изображения:", error);
        throw error;
    }
};

// ✅ Добавляем запись в складскую таблицу
export const createWarehouse = async (warehouseData) => {
    try {
        const response = await axios.post(`${API_URL}/warehouse`, warehouseData);
        return response.data;
    } catch (error) {
        console.error("Ошибка при добавлении на склад:", error);
        throw error;
    }
};

export const updateProduct = async (id, productData) => {
    try {
        const response = await axios.put(`${API_URL}/products/${id}`, productData);
        return response.data;
    } catch (error) {
        console.error("Ошибка при обновлении товара:", error);
        throw error;
    }
};

export const deleteProduct = async (id) => {
    try {
        await axios.delete(`${API_URL}/products/${id}`);
    } catch (error) {
        console.error("Ошибка при удалении товара:", error);
        throw error;
    }
};

export const getCategories = async () => {
    try {
        const response = await axios.get(`${API_URL}/categories`);
        return response.data;
    } catch (error) {
        console.error("Ошибка при получении категорий:", error);
        return [];
    }
};

export const getSizes = async () => {
    try {
        const response = await axios.get(`${API_URL}/sizes`);
        return response.data;
    } catch (error) {
        console.error("Ошибка при получении списка размеров:", error);
        return [];
    }
};