import axios from "axios";
import { API_CONFIG } from '../config/apiConfig';
const API_URL = API_CONFIG.ADMIN_API_URL + "/images";

export const getAllImages = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error("Ошибка при получении изображений:", error);
        return [];
    }
};

export const getImagesByProductId = async (productId) => {
    try {
        const response = await axios.get(`${API_URL}/${productId}`);
        return response.data;
    } catch (error) {
        console.error(`Ошибка при получении изображений для товара ${productId}:`, error);
        return [];
    }
};

export const createImage = async (imageData) => {
    try {
        const response = await axios.post(API_URL, imageData);
        return response.data;
    } catch (error) {
        console.error("Ошибка при добавлении изображения:", error);
        throw error;
    }
};

export const updateImage = async (id, imageData) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, imageData);
        return response.data;
    } catch (error) {
        console.error("Ошибка при обновлении изображения:", error);
        throw error;
    }
};

export const deleteImage = async (id) => {
    try {
        await axios.delete(`${API_URL}/${id}`);
    } catch (error) {
        console.error("Ошибка при удалении изображения:", error);
        throw error;
    }
};

export const getProducts = async () => {
    try {
        const response = await axios.get(`${API_CONFIG.ADMIN_API_URL}/products`);
        return response.data;
    } catch (error) {
        console.error("Ошибка при получении товаров:", error);
        return [];
    }
};