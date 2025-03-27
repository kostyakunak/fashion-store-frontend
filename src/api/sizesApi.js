import axios from "axios";
const API_URL = "http://localhost:8080/api/admin/sizes";

export const getSizes = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error("Ошибка при получении списка размеров:", error);
        return [];
    }
};