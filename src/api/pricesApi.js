import axios from "axios";
const API_URL = "http://localhost:8080/api/admin/prices";

export const createPrice = async (priceData) => {
    try {
        const response = await axios.post(API_URL, priceData);
        return response.data;
    } catch (error) {
        console.error("Ошибка при создании цены:", error);
        throw error;
    }
};