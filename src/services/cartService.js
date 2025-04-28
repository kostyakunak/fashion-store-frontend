import axios from 'axios';
import { ErrorType } from '../types/errors';

const API_URL = 'http://localhost:8080/api/cart';

class CartService {
    constructor() {
        this.retryConfig = {
            maxRetries: 3,
            retryDelay: 1000,
            retryOn: [ErrorType.NETWORK]
        };
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    shouldRetry(error) {
        const errorType = this.determineErrorType(error);
        return this.retryConfig.retryOn.includes(errorType);
    }

    determineErrorType(error) {
        if (error.response) {
            const status = error.response.status;
            if (status === 401 || status === 403) return ErrorType.AUTH;
            if (status === 404) return ErrorType.NOT_FOUND;
            if (status === 422) return ErrorType.VALIDATION;
            return ErrorType.SERVER;
        }
        if (error.request) return ErrorType.NETWORK;
        return ErrorType.SERVER;
    }

    normalizeError(error) {
        const errorType = this.determineErrorType(error);
        return {
            type: errorType,
            message: error.response?.data?.message || error.message,
            code: error.response?.data?.code || 'UNKNOWN_ERROR',
            details: error.response?.data?.details,
            timestamp: Date.now()
        };
    }

    async withRetry(operation) {
        let lastError;
        for (let i = 0; i < this.retryConfig.maxRetries; i++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                if (!this.shouldRetry(error)) {
                    throw this.normalizeError(error);
                }
                await this.delay(this.retryConfig.retryDelay);
            }
        }
        throw this.normalizeError(lastError);
    }

    async getCart() {
        return this.withRetry(async () => {
            const response = await axios.get(`${API_URL}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        });
    }

    async addToCart(productId, sizeId, quantity = 1) {
        return this.withRetry(async () => {
            const response = await axios.post(`${API_URL}`, {
                productId,
                sizeId,
                quantity
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        });
    }

    async updateCartItem(productId, sizeId, quantity) {
        return this.withRetry(async () => {
            const response = await axios.put(`${API_URL}/${productId}/${sizeId}`, {
                quantity
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        });
    }

    async removeFromCart(productId, sizeId) {
        return this.withRetry(async () => {
            const response = await axios.delete(`${API_URL}/${productId}/${sizeId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        });
    }

    async clearCart() {
        return this.withRetry(async () => {
            const response = await axios.delete(`${API_URL}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        });
    }
}

export const cartService = new CartService(); 