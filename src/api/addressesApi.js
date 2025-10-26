import { createAdminApiClient, handleApiError } from '../utils/apiUtils';
import { API_CONFIG } from '../config/apiConfig';
import axios from 'axios';

// Create API client for addresses
const addressesClient = createAdminApiClient(
  { baseURL: API_CONFIG.ADMIN_API_URL },
  (error) => console.error('Address API Auth Error:', error)
);

// Добавляю интерцептор для подстановки токена в addressesClient
addressesClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

/**
 * Fetches all addresses
 * @returns {Promise<Array>} List of addresses
 */
export const getAddresses = async () => {
  try {
    const response = await addressesClient.get('/addresses');
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении адресов:', error);
    throw new Error(handleApiError(error, 'Не удалось загрузить адреса'));
  }
};

/**
 * Fetches all users for the selector
 * @returns {Promise<Array>} List of users
 */
export const getUsers = async () => {
  try {
    const response = await addressesClient.get('/users');
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении пользователей:', error);
    throw new Error(handleApiError(error, 'Не удалось загрузить список пользователей'));
  }
};

/**
 * Fetches addresses for a specific user
 * @param {number} userId - User ID
 * @returns {Promise<Array>} List of addresses for the user
 */
export const getAddressesByUser = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await addressesClient.get(`/addresses/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Ошибка при получении адресов пользователя ${userId}:`, error);
    throw new Error(handleApiError(error, `Не удалось загрузить адреса пользователя`));
  }
};

/**
 * Creates a new address
 * @param {Object} address - Address data
 * @returns {Promise<Object>} Created address
 */
export const createAddress = async (address) => {
  const token = localStorage.getItem('token');
  if (!address.user || !address.user.id) {
    console.error('[createAddress] user.id отсутствует!', address);
    throw new Error('Не определён пользователь для адреса');
  }
  console.log('[createAddress] user.id:', address.user.id, 'payload:', address);
  const response = await axios.post(
    `${API_CONFIG.ADMIN_API_URL}/addresses`,
    address,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
};

/**
 * Updates an existing address
 * @param {number} id - Address ID
 * @param {Object} addressData - Updated address data
 * @returns {Promise<Object>} Updated address
 */
export const updateAddress = async (id, addressData) => {
  try {
    const response = await addressesClient.put(`/addresses/${id}`, addressData);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при обновлении адреса ${id}:`, error);
    throw new Error(handleApiError(error, 'Не удалось обновить адрес'));
  }
};

/**
 * Deletes an address
 * @param {number} id - Address ID to delete
 * @returns {Promise<boolean>} Success indicator
 */
export const deleteAddress = async (id) => {
  try {
    await addressesClient.delete(`/addresses/${id}`);
    return true;
  } catch (error) {
    console.error(`Ошибка при удалении адреса ${id}:`, error);
    throw new Error(handleApiError(error, 'Не удалось удалить адрес'));
  }
};