import axios from "axios";
import { API_CONFIG } from '../config/apiConfig';

const API_URL = API_CONFIG.ADMIN_API_URL + "/reviews";

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export const getReviews = async () => {
    try {
        const response = await axiosInstance.get("");
        return response.data;
    } catch (error) {
        console.error("Ошибка при получении списка отзывов:", error);
        return [];
    }
}; 