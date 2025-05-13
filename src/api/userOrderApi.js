import axios from "axios";

const API_URL = "http://localhost:8080/api/orders";

// Create an axios instance with necessary configuration
const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Get authenticated user's orders
export const getUserOrders = async () => {
    try {
        const response = await axiosInstance.get("", {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching user orders:", error);
        throw error;
    }
};

// Get a specific order by ID
export const getOrderById = async (orderId) => {
    try {
        const response = await axiosInstance.get(`/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching order with ID ${orderId}:`, error);
        throw error;
    }
};

// Get order details for a specific order
export const getOrderDetails = async (orderId) => {
    try {
        const response = await axiosInstance.get(`/${orderId}/details`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching order details for order ID ${orderId}:`, error);
        throw error;
    }
};

// Create a new order
export const createOrder = async (orderData) => {
    try {
        const response = await axiosInstance.post("", orderData, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error creating order:", error);
        throw error;
    }
};

// Cancel an order
export const cancelOrder = async (orderId) => {
    try {
        const response = await axiosInstance.put(`/${orderId}/cancel`, {}, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error cancelling order with ID ${orderId}:`, error);
        throw error;
    }
};