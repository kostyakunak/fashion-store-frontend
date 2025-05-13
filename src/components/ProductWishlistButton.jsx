import React from 'react';
import useWishlist from '../hooks/useWishlist';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Temporary styles to replace Bootstrap and FontAwesome
const buttonStyles = {
  sm: {
    padding: '0.25rem 0.5rem',
    fontSize: '0.875rem',
    lineHeight: '1.5',
    borderRadius: '0.2rem'
  },
  md: {
    padding: '0.375rem 0.75rem',
    fontSize: '1rem',
    lineHeight: '1.5',
    borderRadius: '0.25rem'
  },
  lg: {
    padding: '0.5rem 1rem',
    fontSize: '1.25rem',
    lineHeight: '1.5',
    borderRadius: '0.3rem'
  }
};

const ProductWishlistButton = ({ product, size = 'sm', className = '' }) => {
    const { isInWishlist, toggleWishlistItem } = useWishlist();
    const auth = useContext(AuthContext);
    const navigate = useNavigate();
    
    const inWishlist = isInWishlist(product.id);
    
    const handleWishlistClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!auth.isAuthenticated()) {
            // If the user is not logged in, redirect to login page
            navigate('/login', { state: { from: window.location.pathname } });
            return;
        }
        
        toggleWishlistItem(product);
    };
    
    const getButtonStyle = () => {
      const baseStyle = {
        ...buttonStyles[size],
        cursor: 'pointer',
        display: 'inline-block',
        fontWeight: '400',
        textAlign: 'center',
        verticalAlign: 'middle',
        userSelect: 'none',
        border: '1px solid transparent',
        transition: 'color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
      };
      
      if (inWishlist) {
        // Danger style (red)
        return {
          ...baseStyle,
          color: '#fff',
          backgroundColor: '#dc3545',
          borderColor: '#dc3545'
        };
      } else {
        // Outline danger style
        return {
          ...baseStyle,
          color: '#dc3545',
          backgroundColor: 'transparent',
          borderColor: '#dc3545'
        };
      }
    };
    
    return (
        <button
            style={getButtonStyle()}
            className={`wishlist-button ${className}`}
            onClick={handleWishlistClick}
            aria-label={inWishlist ? "Удалить из списка желаний" : "Добавить в список желаний"}
        >
            {/* Heart symbol instead of FontAwesome icon */}
            ♥
            {size !== 'sm' && (
                <span style={{ marginLeft: '0.5rem' }}>
                    {inWishlist ? 'В списке желаний' : 'В список желаний'}
                </span>
            )}
        </button>
    );
};

export default ProductWishlistButton;