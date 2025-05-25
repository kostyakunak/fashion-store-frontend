import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useWishlist from '../hooks/useWishlist';
import useCart from '../hooks/useCart';
import './Wishlist.css';

function Wishlist() {
    const { wishlistItems, loading, error, removeFromWishlist, loadWishlist } = useWishlist();
    const { addToCart } = useCart();
    // Состояние для размеров и выбранных размеров по каждому товару
    const [sizesMap, setSizesMap] = useState({}); // { [productId]: [sizes] }
    const [selectedSizes, setSelectedSizes] = useState({}); // { [productId]: sizeId }
    const [warning, setWarning] = useState({}); // { [productId]: true }

    useEffect(() => {
        // Load wishlist items when component mounts
        loadWishlist();
    }, [loadWishlist]);

    // Загружаем размеры для всех товаров из wishlist
    useEffect(() => {
        async function fetchSizes() {
            const newSizesMap = {};
            for (const item of wishlistItems) {
                try {
                    const res = await fetch(`http://localhost:8080/api/public/warehouse/product/${item.productId}/sizes`);
                    if (res.ok) {
                        const sizes = await res.json();
                        newSizesMap[item.productId] = sizes;
                    } else {
                        newSizesMap[item.productId] = [];
                    }
                } catch {
                    newSizesMap[item.productId] = [];
                }
            }
            setSizesMap(newSizesMap);
        }
        if (wishlistItems.length > 0) fetchSizes();
    }, [wishlistItems]);

    const handleSizeChange = (productId, sizeId) => {
        setSelectedSizes(prev => ({ ...prev, [productId]: sizeId }));
        setWarning(prev => ({ ...prev, [productId]: false }));
    };

    const handleMoveToCart = (item) => {
        const sizeId = selectedSizes[item.productId];
        if (!sizeId) {
            setWarning(prev => ({ ...prev, [item.productId]: true }));
            return;
        }
        const cartItem = {
            id: item.id,
            productId: item.productId,
            name: item.name,
            price: item.price,
            sizeId,
            quantity: 1,
            images: item.images
        };
        addToCart(cartItem);
        removeFromWishlist(item.id);
    };

    if (loading) {
        return (
            <div className="wishlist-container" style={{textAlign: 'center', marginTop: '3rem'}}>
                <div className="spinner-border" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="wishlist-container" style={{textAlign: 'center', marginTop: '3rem'}}>
                <h3>Произошла ошибка</h3>
                <p>{error}</p>
                <button className="wishlist-move-btn" onClick={loadWishlist}>
                    Попробовать снова
                </button>
            </div>
        );
    }

    if (wishlistItems.length === 0) {
        return (
            <div className="wishlist-container" style={{marginTop: '3rem'}}>
                <h2 style={{textAlign: 'center', marginBottom: '1.5rem'}}>Мой список желаний</h2>
                <div className="wishlist-item" style={{textAlign: 'center', padding: '3rem'}}>
                    <h3>Ваш список желаний пуст</h3>
                    <p>Добавьте товары, которые вам нравятся, в список желаний</p>
                    <Link to="/products">
                        <button className="wishlist-move-btn">
                            Перейти к товарам
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="wishlist-container" style={{marginTop: '3rem'}}>
            <h2 style={{textAlign: 'center', marginBottom: '1.5rem'}}>Мой список желаний</h2>
            <div className="wishlist-row">
                {wishlistItems.map(item => (
                    <div key={item.id} className="wishlist-col">
                        <div className="wishlist-item">
                            <button className="wishlist-remove-btn" onClick={() => removeFromWishlist(item.id)} title="Удалить из избранного">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                                </svg>
                            </button>
                            <div className="image-container">
                                <Link to={`/item?id=${item.productId}`}>
                                    {item.images && item.images.length > 0 ? (
                                        <img src={item.images[0].imageUrl} alt={item.name} className="product-image" />
                                    ) : (
                                        <img src="https://via.placeholder.com/300" alt="Placeholder" className="product-image" />
                                    )}
                                </Link>
                            </div>
                            <div style={{padding: '0 18px'}}>
                                <Link to={`/product/${item.productId}`} style={{textDecoration: 'none'}}>
                                    <div className="wishlist-title">{item.name}</div>
                                </Link>
                                <div className="price">{item.price ? `${item.price.toFixed(2)} ₽` : 'Цена недоступна'}</div>
                                {/* Селектор размеров */}
                                {sizesMap[item.productId] && (
                                    <div style={{margin: '12px 0'}}>
                                        <select
                                            className={`wishlist-size-select${warning[item.productId] ? ' warning' : ''}`}
                                            value={selectedSizes[item.productId] || ''}
                                            onChange={e => handleSizeChange(item.productId, e.target.value)}
                                            disabled={!sizesMap[item.productId] || sizesMap[item.productId].length === 0}
                                        >
                                            {sizesMap[item.productId].length === 0 ? (
                                                <option value="" disabled>Нет доступных размеров</option>
                                            ) : (
                                                <>
                                                    <option value="" disabled>Выберите размер</option>
                                                    {sizesMap[item.productId].map(size => (
                                                        <option key={size.id} value={size.id}>{size.name}</option>
                                                    ))}
                                                </>
                                            )}
                                        </select>
                                        {warning[item.productId] && (
                                            <div style={{color: '#e04848', fontSize: 13, marginTop: 4}}>Пожалуйста, выберите размер</div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <button
                                className="wishlist-move-btn"
                                style={{border: 'none'}}
                                onClick={() => handleMoveToCart(item)}
                                disabled={
                                    (sizesMap[item.productId] && sizesMap[item.productId].length > 0 && !selectedSizes[item.productId]) ||
                                    (sizesMap[item.productId] && sizesMap[item.productId].length === 0)
                                }
                            >
                                MOVE TO BAG
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Wishlist;