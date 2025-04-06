import axios from "axios";

const API_URL = "http://localhost:8080/api/admin/users";

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export const getUsers = async () => {
    try {
        const response = await axiosInstance.get("");
        return response.data;
    } catch (error) {
        console.error("Ошибка при получении пользователей:", error);
        return [];
    }
};

export const createUser = async (userData) => {
    try {
        const response = await axiosInstance.post("", userData);
        return response.data;
    } catch (error) {
        console.error("Ошибка при создании пользователя:", error);
        throw error;
    }
};

export const updateUser = async (id, userData) => {
    try {
        const response = await axiosInstance.put(`/${id}`, userData);
        return response.data;
    } catch (error) {
        console.error("Ошибка при обновлении пользователя:", error);
        throw error;
    }
};

export const deleteUser = async (id) => {
    try {
        await axiosInstance.delete(`/${id}`);
    } catch (error) {
        console.error("Ошибка при удалении пользователя:", error);
        throw error;
    }
};