import axios from "axios";
import { API_CONFIG } from '../config/apiConfig';
const API_URL = API_CONFIG.ADMIN_API_URL + "/warehouse";

export const getWarehouse = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(API_URL, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Ошибка при получении склада:", error);
        throw error;
    }
};

export const createWarehouse = async (warehouseData) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(API_URL, warehouseData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Ошибка при добавлении на склад:", error);
        throw error;
    }
};