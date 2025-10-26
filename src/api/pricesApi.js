import axios from "axios";
import { API_CONFIG } from '../config/apiConfig';
const API_URL = API_CONFIG.ADMIN_API_URL + "/prices";

export const createPrice = async (priceData) => {
    try {
        const response = await axios.post(API_URL, priceData);
        return response.data;
    } catch (error) {
        console.error("Ошибка при создании цены:", error);
        throw error;
    }
};

export const getLatestPrice = async (productId) => {
    try {
        const response = await axios.get(`${API_URL}/latest/${productId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching latest price:', error);
        throw error;
    }
};