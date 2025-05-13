import { createAdminApiClient, handleApiError } from '../utils/apiUtils';

// Create API client for addresses
const addressesClient = createAdminApiClient(
  { baseURL: 'http://localhost:8080/api/admin' },
  (error) => console.error('Address API Auth Error:', error)
);

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
    const response = await addressesClient.get(`/addresses/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при получении адресов пользователя ${userId}:`, error);
    throw new Error(handleApiError(error, `Не удалось загрузить адреса пользователя`));
  }
};

/**
 * Creates a new address
 * @param {Object} addressData - Address data
 * @returns {Promise<Object>} Created address
 */
export const createAddress = async (addressData) => {
  try {
    // Remove ID for auto-generation on server
    const { id, ...dataWithoutId } = addressData;
    
    const response = await addressesClient.post('/addresses', dataWithoutId);
    return response.data;
  } catch (error) {
    console.error('Ошибка при создании адреса:', error);
    throw new Error(handleApiError(error, 'Не удалось создать новый адрес'));
  }
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