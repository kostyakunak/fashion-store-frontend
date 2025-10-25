import axios from "axios";

const API_URL = "http://localhost:8080/api";

const axiosInstance = axios.create({
    baseURL: API_URL,
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