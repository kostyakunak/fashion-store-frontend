import React from 'react';
import PropTypes from 'prop-types';

/**
 * Багатократний компонент повідомлення про помилку з можливістю закриття
 * 
 * @param {Object} props - Пропси компонента
 * @param {string} props.message - Текст помилки для відображення
 * @param {string} props.type - Тип повідомлення (error, warning, info, success)
 * @param {Function} props.onClose - Необов'язкова функція для закриття
 * @param {number} props.autoCloseDelay - Необов'язкова затримка автозакриття в мс
 * @returns {JSX.Element} Компонент повідомлення про помилку
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
                    Виникла помилка
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