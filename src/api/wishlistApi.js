import axios from "axios";

const API_URL = "http://localhost:8080/api/admin/wishlist";

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Получить список желаний конкретного пользователя
export const getWishlistForUser = async (userId) => {
    try {
        const response = await axiosInstance.get(`/${userId}`);
        return response.data;
    } catch (error) {
        console.error(`Ошибка при получении списка желаний пользователя ${userId}:`, error);
        return [];
    }
};

// Объединить списки желаний всех пользователей
export const getAllWishlists = async (userIds) => {
    try {
        const wishlistPromises = userIds.map(userId => getWishlistForUser(userId));
        const wishlistArrays = await Promise.all(wishlistPromises);
        
        // Объединяем все массивы в один
        return wishlistArrays.flat();
    } catch (error) {
        console.error("Ошибка при получении всех списков желаний:", error);
        return [];
    }
};

// Добавить товар в список желаний
export const createWishlistItem = async (wishlistData) => {
    try {
        const response = await axiosInstance.post("", wishlistData);
        return response.data;
    } catch (error) {
        console.error("Ошибка при добавлении в список желаний:", error);
        throw error;
    }
};

// Удалить элемент из списка желаний
export const deleteWishlistItem = async (id) => {
    try {
        await axiosInstance.delete(`/${id}`);
    } catch (error) {
        console.error("Ошибка при удалении из списка желаний:", error);
        throw error;
    }
};

// Обновить запись в списке желаний
// Так как нет прямого метода обновления в API, используем удаление и создание
export const updateWishlistItem = async (id, wishlistData) => {
    try {
        // Сначала удаляем существующую запись
        await deleteWishlistItem(id);
        
        // Затем создаем новую запись с теми же данными
        const response = await createWishlistItem(wishlistData);
        return response;
    } catch (error) {
        console.error("Ошибка при обновлении записи в списке желаний:", error);
        throw error;
    }
}; 