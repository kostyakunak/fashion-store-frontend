import axios from "axios";
const API_URL = "http://localhost:8080/api/admin/warehouse";

export const createWarehouse = async (warehouseData) => {
    try {
        const response = await axios.post(API_URL, warehouseData);
        return response.data;
    } catch (error) {
        console.error("Ошибка при добавлении на склад:", error);
        throw error;
    }
};