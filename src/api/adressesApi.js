import axios from "axios";
const API_URL = "http://localhost:8080/api/admin/addresses";

export const createAddress = async (addressData) => {
    try {
        const response = await axios.post(API_URL, addressData);
        return response.data;
    } catch (error) {
        console.error("Ошибка при создании адреса:", error);
        throw error;
    }
};