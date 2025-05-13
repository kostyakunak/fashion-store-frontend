import React from 'react';
import PropTypes from 'prop-types';
import './ErrorMessage.css';

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
const ErrorMessage = ({ 
  message, 
  type = 'error', 
  onClose,
  autoCloseDelay = 0 
}) => {
  const [visible, setVisible] = React.useState(true);

  // Auto-close functionality if delay is provided
  React.useEffect(() => {
    if (autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [autoCloseDelay, onClose]);
  
  // Handle close button click
  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };
  
  // If not visible, don't render anything
  if (!visible) return null;
  
  // Get the appropriate icon based on message type
  const getIcon = () => {
    switch(type) {
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✅';
      case 'error':
      default:
        return '❌';
    }
  };
  
  return (
    <div className={`message-container ${type}`} role="alert">
      <div className="message-icon">
        {getIcon()}
      </div>
      <div className="message-content">
        {message}
      </div>
      {onClose && (
        <button 
          className="close-button" 
          onClick={handleClose}
          aria-label="Close message"
        >
          ×
        </button>
      )}
    </div>
  );
};

ErrorMessage.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['error', 'warning', 'info', 'success']),
  onClose: PropTypes.func,
  autoCloseDelay: PropTypes.number
};

export default ErrorMessage;