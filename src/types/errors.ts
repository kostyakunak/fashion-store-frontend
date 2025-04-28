export enum ErrorType {
    NETWORK = 'NETWORK',
    VALIDATION = 'VALIDATION',
    AUTH = 'AUTH',
    NOT_FOUND = 'NOT_FOUND',
    SERVER = 'SERVER',
    CART = 'CART'
}

export interface AppError {
    type: ErrorType;
    message: string;
    code: string;
    details?: any;
    timestamp: number;
}

export interface ValidationError {
    field: string;
    message: string;
}

export interface ErrorResponse {
    type: ErrorType;
    message: string;
    code: string;
    timestamp: number;
    validationErrors?: ValidationError[];
} 