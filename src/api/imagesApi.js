import axios from "axios";
const API_URL = "http://localhost:8080/api/admin/images";

export const createImage = async (imageData) => {
    try {
        const response = await axios.post(API_URL, imageData);
        return response.data;
    } catch (error) {
        console.error("Ошибка при добавлении изображения:", error);
        throw error;
    }
};