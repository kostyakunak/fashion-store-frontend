import axios from "axios";
const API_URL = "http://localhost:8080/api/admin/warehouse";

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