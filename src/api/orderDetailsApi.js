import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';

const API_URL = API_CONFIG.ADMIN_API_URL + '/order-details';

export const getOrderDetails = async () => {
    console.log('API: Запрос деталей заказов');
    const response = await axios.get(API_URL);
    console.log('API: Получены детали заказов:', response.data);
    return response.data;
};

export const createOrderDetail = async (orderDetail) => {
    const response = await axios.post(API_URL, orderDetail);
    return response.data;
};

export const updateOrderDetail = async (id, orderDetail) => {
    const response = await axios.put(`${API_URL}/${id}`, orderDetail);
    return response.data;
};

export const deleteOrderDetail = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
};

// Вспомогательные функции для получения связанных данных
export const getOrders = async () => {
    console.log('API: Запрос списка заказов');
    const response = await axios.get(`${API_CONFIG.ADMIN_API_URL}/orders`);
    console.log('API: Получены заказы:', response.data);
    return response.data;
};

export const getProducts = async () => {
    console.log('API: Запрос списка товаров');
    const response = await axios.get(`${API_CONFIG.ADMIN_API_URL}/products`);
    console.log('API: Получены товары:', response.data);
    return response.data;
};

export const getSizes = async () => {
    console.log('API: Запрос списка размеров');
    const response = await axios.get(`${API_CONFIG.ADMIN_API_URL}/sizes`);
    console.log('API: Получены размеры:', response.data);
    return response.data;
}; 