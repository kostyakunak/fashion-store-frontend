import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useWishlist from '../hooks/useWishlist';
import useCart from '../hooks/useCart';
import './Wishlist.css';

// Temporary styles to replace Bootstrap
const styles = {
  container: {
    width: '100%',
    paddingRight: '15px',
    paddingLeft: '15px',
    marginRight: 'auto',
    marginLeft: 'auto',
    maxWidth: '1140px',
  },
  spinner: {
    display: 'inline-block',
    width: '2rem',
    height: '2rem',
    border: '0.25em solid currentColor',
    borderRightColor: 'transparent',
    borderRadius: '50%',
    animation: 'spinner-border .75s linear infinite',
  },
  row: undefined,
  col: undefined,
  card: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    wordWrap: 'break-word',
    backgroundColor: '#fff',
    backgroundClip: 'border-box',
    border: '1px solid rgba(0,0,0,.125)',
    borderRadius: '.25rem',
    marginBottom: '1rem',
    height: '100%',
  },
  cardBody: {
    flex: '1 1 auto',
    padding: '1.25rem',
  },
  cardFooter: {
    padding: '0.75rem 1.25rem',
    borderTop: '1px solid rgba(0,0,0,.125)',
  },
  button: {
    display: 'inline-block',
    fontWeight: 400,
    textAlign: 'center',
    verticalAlign: 'middle',
    userSelect: 'none',
    border: '1px solid transparent',
    padding: '.375rem .75rem',
    fontSize: '1rem',
    lineHeight: 1.5,
    borderRadius: '.25rem',
    cursor: 'pointer',
    transition: 'color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out',
  },
  primaryButton: {
    color: '#fff',
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  dangerOutlineButton: {
    color: '#dc3545',
    backgroundColor: 'transparent',
    borderColor: '#dc3545',
  },
  flexContainer: {
    display: 'flex',
    justifyContent: 'space-between',
  }
};

function Wishlist() {
    const { wishlistItems, loading, error, removeFromWishlist, loadWishlist } = useWishlist();
    const { addToCart } = useCart();

    useEffect(() => {
        // Load wishlist items when component mounts
        loadWishlist();
    }, [loadWishlist]);

    const handleMoveToCart = (item) => {
        // Create cart item from wishlist item
        const cartItem = {
            id: item.id,
            productId: item.productId,
            name: item.name,
            price: item.price,
            sizeId: 1, // Default size ID
            quantity: 1, // Default quantity
            images: item.images
        };
        
        // Add to cart and remove from wishlist
        addToCart(cartItem);
        removeFromWishlist(item.id);
    };

    if (loading) {
        return (
            <div style={{...styles.container, textAlign: 'center', marginTop: '3rem'}}>
                <div style={styles.spinner}>
                    <span style={{display: 'none'}}>Загрузка...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{...styles.container, textAlign: 'center', marginTop: '3rem'}}>
                <h3>Произошла ошибка</h3>
                <p>{error}</p>
                <button 
                    style={{...styles.button, ...styles.primaryButton}}
                    onClick={loadWishlist}
                >
                    Попробовать снова
                </button>
            </div>
        );
    }

    if (wishlistItems.length === 0) {
        return (
            <div style={{...styles.container, marginTop: '3rem'}}>
                <h2 style={{textAlign: 'center', marginBottom: '1.5rem'}}>Мой список желаний</h2>
                <div style={{
                    ...styles.card,
                    textAlign: 'center',
                    padding: '3rem'
                }}>
                    <div style={styles.cardBody}>
                        <h3>Ваш список желаний пуст</h3>
                        <p>Добавьте товары, которые вам нравятся, в список желаний</p>
                        <Link to="/products">
                            <button style={{...styles.button, ...styles.primaryButton}}>
                                Перейти к товарам
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{...styles.container, marginTop: '3rem'}} className="wishlist-container">
            <h2 style={{textAlign: 'center', marginBottom: '1.5rem'}}>Мой список желаний</h2>
            
            <div className="wishlist-row">
                {wishlistItems.map(item => (
                    <div key={item.id} className="wishlist-col">
                        <div style={{...styles.card, height: '100%'}} className="wishlist-item">
                            <div className="image-container">
                                <Link to={`/product/${item.productId}`}>
                                    {item.images && item.images.length > 0 ? (
                                        <img 
                                            style={{
                                                width: '100%',
                                                borderTopLeftRadius: 'calc(.25rem - 1px)',
                                                borderTopRightRadius: 'calc(.25rem - 1px)'
                                            }}
                                            src={item.images[0].imageUrl} 
                                            alt={item.name}
                                            className="product-image"
                                        />
                                    ) : (
                                        <img 
                                            style={{
                                                width: '100%',
                                                borderTopLeftRadius: 'calc(.25rem - 1px)',
                                                borderTopRightRadius: 'calc(.25rem - 1px)'
                                            }}
                                            src="https://via.placeholder.com/300" 
                                            alt="Placeholder"
                                            className="product-image"
                                        />
                                    )}
                                </Link>
                            </div>
                            
                            <div style={styles.cardBody}>
                                <Link to={`/product/${item.productId}`} style={{textDecoration: 'none'}}>
                                    <h5>{item.name}</h5>
                                </Link>
                                <p className="price">
                                    {item.price ? `${item.price.toFixed(2)} ₽` : 'Цена недоступна'}
                                </p>
                            </div>
                            
                            <div style={{
                                ...styles.cardFooter,
                                backgroundColor: '#fff',
                                borderTop: 'none'
                            }}>
                                <div style={styles.flexContainer}>
                                    <button 
                                        style={{...styles.button, ...styles.dangerOutlineButton}}
                                        onClick={() => removeFromWishlist(item.id)}
                                    >
                                        🗑️ Удалить
                                    </button>
                                    <button 
                                        style={{...styles.button, ...styles.primaryButton}}
                                        onClick={() => handleMoveToCart(item)}
                                    >
                                        🛒 В корзину
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Wishlist;