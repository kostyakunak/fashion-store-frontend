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

const ProductWishlistButton = ({ product, size = 'md', className = '' }) => {
    const { isInWishlist, toggleWishlistItem } = useWishlist();
    const auth = useContext(AuthContext);
    const navigate = useNavigate();
    
    const productId = product.productId || product.id;
    const inWishlist = isInWishlist(productId);
    
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
    
    return (
        <button
            className={`wishlist-button${inWishlist ? ' in-wishlist' : ''} ${className}`}
            onClick={handleWishlistClick}
            aria-label={inWishlist ? "Видалити з обраного" : "Додати до обраного"}
            type="button"
        >
            <span className="wishlist-heart" aria-hidden="true">
                ♥
            </span>
        </button>
    );
};

export default ProductWishlistButton;