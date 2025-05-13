import React from 'react';
import PropTypes from 'prop-types';
import './LoadingIndicator.css';

/**
 * Reusable loading indicator component that can be used across the application
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isLoading - Whether the component should display loading state
 * @param {string} props.size - Size of the loading indicator (small, medium, large)
 * @param {string} props.message - Optional loading message
 * @param {boolean} props.overlay - Whether to show as full-screen overlay
 * @returns {JSX.Element|null} Loading indicator component or null if not loading
 */
const LoadingIndicator = ({ 
  isLoading, 
  size = 'medium', 
  message = 'Loading...', 
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