import axios from "axios";
import { API_CONFIG } from '../config/apiConfig';

const FULL_API_URL = API_CONFIG.API_URL;

const axiosInstance = axios.create({
    baseURL: FULL_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export const getProductSizes = async (productId) => {
    try {
        const response = await axiosInstance.get(`/public/warehouse/product/${productId}/sizes`);
        return response.data;
    } catch (error) {
        console.error(`Ошибка при получении размеров для продукта ${productId}:`, error);
        throw error;
    }
};

export const getChunkedProducts = async (page = 0, direction = 'down', limit = 20) => {
    try {
        const response = await axios.get(`${API_CONFIG.PRODUCTS_URL}/chunked`, {
            params: { page, direction, limit },
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Ошибка при получении chunked продуктов (page: ${page}, direction: ${direction}):`, error);
        throw error;
    }
};