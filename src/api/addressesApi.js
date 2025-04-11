import axios from 'axios';

const API_URL = 'http://localhost:8080/api/admin/addresses';

// Получение всех адресов
export const getAddresses = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении адресов:', error);
    throw error;
  }
};

// Получение всех пользователей для селектора
export const getUsers = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/admin/users');
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении пользователей:', error);
    throw error;
  }
};

// Получение адресов пользователя
export const getAddressesByUser = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при получении адресов пользователя ${userId}:`, error);
    throw error;
  }
};

// Создание нового адреса
export const createAddress = async (addressData) => {
  try {
    // Удаляем id из данных, чтобы серверная автогенерация работала корректно
    const { id, ...dataWithoutId } = addressData;
    
    const response = await axios.post(API_URL, dataWithoutId);
    return response.data;
  } catch (error) {
    console.error('Ошибка при создании адреса:', error);
    throw error;
  }
};

// Обновление адреса
export const updateAddress = async (id, addressData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, addressData);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при обновлении адреса ${id}:`, error);
    throw error;
  }
};

// Удаление адреса
export const deleteAddress = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
    return true;
  } catch (error) {
    console.error(`Ошибка при удалении адреса ${id}:`, error);
    throw error;
  }
}; 