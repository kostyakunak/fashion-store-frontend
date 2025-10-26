import { createAdminApiClient, handleApiError } from '../utils/apiUtils';
import { API_CONFIG } from '../config/apiConfig';

// Create API client for categories
const categoriesClient = createAdminApiClient(
  { baseURL: API_CONFIG.ADMIN_API_URL },
  (error) => console.error('Categories API Auth Error:', error)
);

/**
 * Fetches all categories
 * @returns {Promise<Array>} List of categories
 */
export const getCategories = async () => {
  try {
    const response = await categoriesClient.get('/categories');
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении категорий:', error);
    throw new Error(handleApiError(error, 'Не удалось загрузить категории'));
  }
};

/**
 * Fetches a single category by ID
 * @param {number} id - Category ID
 * @returns {Promise<Object>} Category data
 */
export const getCategoryById = async (id) => {
  try {
    const response = await categoriesClient.get(`/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при получении категории с ID ${id}:`, error);
    throw new Error(handleApiError(error, 'Не удалось загрузить категорию'));
  }
};

/**
 * Creates a new category
 * @param {Object} categoryData - Category data
 * @returns {Promise<Object>} Created category
 */
export const createCategory = async (categoryData) => {
  try {
    // Remove ID for auto-generation on server
    const { id, ...dataWithoutId } = categoryData;
    
    const response = await categoriesClient.post('/categories', dataWithoutId);
    return response.data;
  } catch (error) {
    console.error('Ошибка при создании категории:', error);
    throw new Error(handleApiError(error, 'Не удалось создать новую категорию'));
  }
};

/**
 * Updates an existing category
 * @param {number} id - Category ID
 * @param {Object} categoryData - Updated category data
 * @returns {Promise<Object>} Updated category
 */
export const updateCategory = async (id, categoryData) => {
  try {
    const response = await categoriesClient.put(`/categories/${id}`, categoryData);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при обновлении категории ${id}:`, error);
    throw new Error(handleApiError(error, 'Не удалось обновить категорию'));
  }
};

/**
 * Deletes a category
 * @param {number} id - Category ID to delete
 * @returns {Promise<boolean>} Success indicator
 */
export const deleteCategory = async (id) => {
  try {
    await categoriesClient.delete(`/categories/${id}`);
    return true;
  } catch (error) {
    console.error(`Ошибка при удалении категории ${id}:`, error);
    throw new Error(handleApiError(error, 'Не удалось удалить категорию'));
  }
};