import axios from "axios";
const API_URL = "http://localhost:8080/api/admin/categories";

export const getCategories = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error("Ошибка при получении категорий:", error);
        return [];
    }
};