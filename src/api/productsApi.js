import { createAdminApiClient, handleApiError } from "../utils/apiUtils";

const apiClient = createAdminApiClient({
  baseURL: "http://localhost:8080/api/admin/products"
});

export const getProducts = async () => {
    try {
        const response = await apiClient.get("");
        return response.data;
    } catch (error) {
        console.error("Error fetching products:", error);
        throw handleApiError(error);
    }
};

export const getProductById = async (id) => {
    try {
        const response = await apiClient.get(`/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching product with ID ${id}:`, error);
        throw handleApiError(error);
    }
};

export const createProduct = async (productData) => {
    try {
        const response = await apiClient.post("", productData);
        return response.data;
    } catch (error) {
        console.error("Error creating product:", error);
        throw handleApiError(error);
    }
};

export const updateProduct = async (id, productData) => {
    try {
        const response = await apiClient.put(`/${id}`, productData);
        return response.data;
    } catch (error) {
        console.error(`Error updating product with ID ${id}:`, error);
        throw handleApiError(error);
    }
};

export const deleteProduct = async (id, force = false) => {
    try {
        const response = await apiClient.delete(`/${id}?force=${force}`);
        return response.data;
    } catch (error) {
        // If error contains a message from server, return it
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
        }
        console.error(`Error deleting product with ID ${id}:`, error);
        throw handleApiError(error);
    }
};

export const getProductsByCategory = async (categoryId) => {
    try {
        const response = await apiClient.get(`/category/${categoryId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching products for category ${categoryId}:`, error);
        throw handleApiError(error);
    }
};