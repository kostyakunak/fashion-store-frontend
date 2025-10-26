import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
const FULL_API_URL = `${API_URL}/api`;

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