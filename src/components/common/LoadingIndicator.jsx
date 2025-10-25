import React from 'react';
import PropTypes from 'prop-types';
import './LoadingIndicator.css';

/**
 * Багатократний компонент індикатора завантаження для використання у всьому застосунку
 * 
 * @param {Object} props - Пропси компонента
 * @param {boolean} props.isLoading - Чи показувати стан завантаження
 * @param {string} props.size - Розмір індикатора (small, medium, large)
 * @param {string} props.message - Необов'язкове повідомлення про завантаження
 * @param {boolean} props.overlay - Чи показувати як повноекранний оверлей
 * @returns {JSX.Element|null} Компонент індикатора завантаження або null, якщо не завантажується
 */
const LoadingIndicator = ({ 
  isLoading, 
  size = 'medium', 
  message = 'Завантаження...', 
  overlay = false 
}) => {
  // If not loading, don't render anything
  if (!isLoading) return null;
  
  // Determine spinner size class
  const spinnerSizeClass = `spinner-${size}`;
  
  // Content to render
  const loadingContent = (
    <>
      <div className={`spinner ${spinnerSizeClass}`}></div>
      {message && <p className="loading-message">{message}</p>}
    </>
  );
  
  // Render with or without overlay
  if (overlay) {
    return (
      <div className="loading-overlay" data-testid="loading-indicator">
        <div className="loading-content">
          {loadingContent}
        </div>
      </div>
    );
  }
  
  return (
    <div className="loading-container" data-testid="loading-indicator">
      {loadingContent}
    </div>
  );
};

LoadingIndicator.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  message: PropTypes.string,
  overlay: PropTypes.bool
};

export default LoadingIndicator;