import React from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable error message component that displays error messages with optional close functionality
 * 
 * @param {Object} props - Component props
 * @param {string} props.message - The error message to display
 * @param {string} props.type - Type of message (error, warning, info, success)
 * @param {Function} props.onClose - Optional function to call when close button is clicked
 * @param {number} props.autoCloseDelay - Optional auto-close delay in milliseconds
 * @returns {JSX.Element} Error message component
 */
const ErrorMessage = ({ message }) => {
    if (!message) return null;

    return (
        <div
            style={{
                backgroundColor: '#ffebee',
                border: '1px solid #f44336',
                color: '#d32f2f',
                borderRadius: '4px',
                padding: '12px 16px',
                margin: '12px 0',
                fontSize: '14px',
                lineHeight: '1.5',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
            }}
        >
            <span role="img" aria-label="warning" style={{ fontSize: '18px' }}>
                ⚠️
            </span>
            <div>
                <strong style={{ display: 'block', marginBottom: '4px' }}>
                    Произошла ошибка
                </strong>
                <span>{message}</span>
            </div>
        </div>
    );
};

ErrorMessage.propTypes = {
    message: PropTypes.string
};

export default ErrorMessage;