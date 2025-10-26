import axios from "axios";
import { API_CONFIG } from '../config/apiConfig';

const API_URL = API_CONFIG.ADMIN_API_URL + "/payments"; // Проверяем, что URL верный

// ✅ Создать новый платеж
export const createPayment = async (paymentData) => {
    try {
        const response = await axios.post(`${API_URL}`, paymentData);
        return response.data;
    } catch (error) {
        console.error("Ошибка при создании платежа:", error);
        throw error;
    }
};

// ✅ Получить все платежи
export const getPayments = async () => {
    try {
        const response = await axios.get(`${API_URL}`);
        return response.data;
    } catch (error) {
        console.error("Ошибка при получении списка платежей:", error);
        throw error; // Выбрасываем ошибку вместо возврата пустого массива
    }
};

// ✅ Обновить платеж
export const updatePayment = async (id, paymentData) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, paymentData);
        return response.data;
    } catch (error) {
        console.error(`Ошибка при обновлении платежа с ID ${id}:`, error);
        throw error;
    }
};

// ✅ Удалить платеж
export const deletePayment = async (id) => {
    try {
        await axios.delete(`${API_URL}/${id}`);
        return true; // Добавляем возврат значения для консистентности
    } catch (error) {
        console.error("Ошибка при удалении платежа:", error);
        throw error;
    }
};