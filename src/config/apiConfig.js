// Центральная конфигурация API
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  API_URL: `${API_BASE_URL}/api`,
  ADMIN_API_URL: `${API_BASE_URL}/api/admin`,
  PUBLIC_API_URL: `${API_BASE_URL}/api/public`,
  PRODUCTS_URL: `${API_BASE_URL}/products`,
};

export default API_CONFIG;



