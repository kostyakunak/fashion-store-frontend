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