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
        const token = localStorage.getItem('token');
        const response = await axiosInstance.get("", {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Ошибка при получении пользователей:", error);
        return [];
    }
};

export const createUser = async (userData) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axiosInstance.post("", userData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Ошибка при создании пользователя:", error);
        throw error;
    }
};

export const updateUser = async (id, userData) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axiosInstance.put(`/${id}`, userData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Ошибка при обновлении пользователя:", error);
        throw error;
    }
};

export const deleteUser = async (id) => {
    try {
        const token = localStorage.getItem('token');
        await axiosInstance.delete(`/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error("Ошибка при удалении пользователя:", error);
        throw error;
    }
};