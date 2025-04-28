import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { ErrorType } from '../types/errors';

const determineErrorType = (error) => {
    if (error.response) {
        const status = error.response.status;
        if (status === 401 || status === 403) return ErrorType.AUTH;
        if (status === 404) return ErrorType.NOT_FOUND;
        if (status === 422) return ErrorType.VALIDATION;
        return ErrorType.SERVER;
    }
    if (error.request) return ErrorType.NETWORK;
    return ErrorType.SERVER;
};

const handleNetworkError = (error, context) => {
    console.error('Network error:', error, context);
    toast.error('Проблемы с подключением к серверу. Пожалуйста, проверьте ваше интернет-соединение.');
};

const handleAuthError = (error, context) => {
    console.error('Auth error:', error, context);
    toast.error('Ошибка авторизации. Пожалуйста, войдите снова.');
    // Можно добавить автоматический редирект на страницу входа
};

const handleCartError = (error, context) => {
    console.error('Cart error:', error, context);
    toast.error(error.message || 'Ошибка при работе с корзиной');
};

const handleGenericError = (error, context) => {
    console.error('Generic error:', error, context);
    toast.error('Произошла ошибка. Пожалуйста, попробуйте позже.');
};

export const useErrorHandler = () => {
    const handleError = useCallback((error, context) => {
        const errorType = determineErrorType(error);
        
        switch (errorType) {
            case ErrorType.NETWORK:
                return handleNetworkError(error, context);
            case ErrorType.AUTH:
                return handleAuthError(error, context);
            case ErrorType.CART:
                return handleCartError(error, context);
            default:
                return handleGenericError(error, context);
        }
    }, []);

    return { handleError };
}; 