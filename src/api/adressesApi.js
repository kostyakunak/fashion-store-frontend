import axios from "axios";
import { API_CONFIG } from '../config/apiConfig';
const API_URL = API_CONFIG.ADMIN_API_URL + "/addresses";

export const createAddress = async (addressData) => {
    try {
        const response = await axios.post(API_URL, addressData);
        return response.data;
    } catch (error) {
        console.error("Ошибка при создании адреса:", error);
        throw error;
    }
};