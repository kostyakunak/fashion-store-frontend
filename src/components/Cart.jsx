import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Cart.css";
import { Header } from "../scripts/Header";
import { Footer } from "../scripts/Footer";
import useCart from "../hooks/useCart";
import { AuthContext } from "../context/AuthContext";

function Cart() {
    const {
        cartItems,
        loading,
        error,
        removeFromCart,
        updateQuantity,
        updateSize,
        getAvailableSizesForProduct,
        total,
        mergeCart
    } = useCart();
    
    // Використовуємо контекст автентифікації
    const auth = useContext(AuthContext);

    // Стан для зберігання повідомлень про недоступні розміри
    const [sizeWarnings, setSizeWarnings] = useState({});

    const navigate = useNavigate();

    // Перевіряємо доступність обраних розмірів при завантаженні та зміні кошика
    useEffect(() => {
        if (!loading && cartItems.length > 0) {
            const warnings = {};
            cartItems.forEach(item => {
                // getAvailableSizesForProduct — только чистая функция, не вызывает setState!
                const availableSizes = getAvailableSizesForProduct(item.productId);
                const sizeExists = availableSizes.some(size => size.id === item.sizeId);
                if (!sizeExists) {
                    warnings[item.id] = true;
                }
            });
            setSizeWarnings(warnings);
        }
    }, [cartItems, loading]); // убираем getAvailableSizesForProduct из зависимостей
    
    // Об'єднуємо кошик при вході користувача в систему
    useEffect(() => {
        if (auth.isAuthenticated()) {
            mergeCart();
        }
    }, [auth.isAuthenticated, mergeCart]);

    // Функція для відображення розмірів товару
    const renderSizeSelect = (item) => {
        const availableSizes = getAvailableSizesForProduct(item.productId);
        // Фильтруем дубликаты по id-name
        const uniqueSizes = [];
        const seen = new Set();
        for (const size of availableSizes) {
            const key = `${size.id}-${size.name}`;
            if (!seen.has(key)) {
                uniqueSizes.push(size);
                seen.add(key);
            }
        }
        const currentSizeExists = uniqueSizes.some(size => size.id === item.sizeId);
        
        return (
            <div className="cart-item-size">
                {sizeWarnings[item.id] && (
                    <div className="size-warning">
                        Обраний розмір недоступний. Будь ласка, виберіть інший розмір.
                    </div>
                )}
                
                <select
                    value={currentSizeExists ? item.sizeId : ''}
                    onChange={(e) => updateSize(item.id, parseInt(e.target.value))}
                    className={`size-select ${sizeWarnings[item.id] ? 'warning' : ''}`}
                >
                    {!currentSizeExists && (
                        <option value="" disabled>
                            Виберіть розмір
                        </option>
                    )}
                    {uniqueSizes.map(size => (
                        <option key={`${size.id}-${size.name}`} value={size.id}>
                            {size.name}
                        </option>
                    ))}
                </select>
            </div>
        );
    };

    return (
        <div className="cart">
            <Header />
            <main>
                <h1>Кошик</h1>
                
                {loading ? (
                    <div className="loading">Завантаження кошика...</div>
                ) : error ? (
                    <div className="error">Помилка: {error}</div>
                ) : cartItems.length > 0 ? (
                    <div className="cart-container">
                        <div className="cart-headers">
                            <div className="cart-header-item">ТОВАР</div>
                            <div className="cart-header-price">ЦІНА</div>
                            <div className="cart-header-size">РОЗМІР</div>
                            <div className="cart-header-quantity">КІЛЬКІСТЬ</div>
                            <div className="cart-header-subtotal">СУМА</div>
                            <div className="cart-header-action"></div>
                        </div>
                        
                        <div className="cart-items">
                            {cartItems.map((item) => {
                                return (
                                    <div className="cart-item" key={`${item.id}-${item.sizeId}`}>
                                        <div className="cart-item-info">
                                            <div className="cart-item-image">
                                                <Link to={`/item?id=${item.productId}`}>
                                                    <img 
                                                        src={item.imageUrl || "https://via.placeholder.com/100"} 
                                                        alt={item.name} 
                                                        loading="lazy"
                                                    />
                                                </Link>
                                            </div>
                                            <div className="cart-item-details">
                                                <h3>{item.name}</h3>
                                            </div>
                                        </div>
                                        
                                        <div className="cart-item-price">
                                            {item.price} грн.
                                        </div>
                                        
                                        {renderSizeSelect(item)}
                                        
                                        <div className="cart-item-quantity">
                                            <button 
                                                className="quantity-btn decrease" 
                                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                disabled={item.quantity <= 1}
                                            >
                                                -
                                            </button>
                                            <input 
                                                type="number" 
                                                min="1" 
                                                value={item.quantity} 
                                                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                                                className="quantity-input"
                                            />
                                            <button 
                                                className="quantity-btn increase" 
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            >
                                                +
                                            </button>
                                        </div>
                                        
                                        <div className="cart-item-subtotal">
                                            {(item.price * item.quantity).toFixed(2)} грн.
                                        </div>
                                        
                                        <div className="cart-item-remove">
                                            <button 
                                                className="remove-btn" 
                                                onClick={() => removeFromCart(item.id)}
                                                title="Видалити з кошика"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                                    <path fill="none" d="M0 0h24v24H0z"/>
                                                    <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="cart-summary">
                            <div className="cart-total">
                                <h3>Разом:</h3>
                                <span className="cart-total-price">{total} грн.</span>
                            </div>
                            <div className="cart-actions">
                                <Link to="/catalog" className="continue-shopping">
                                    Продовжити покупки
                                </Link>
                                <button 
                                    className="checkout-btn"
                                    disabled={Object.keys(sizeWarnings).length > 0}
                                    title={Object.keys(sizeWarnings).length > 0 ? "Будь ласка, виберіть доступні розміри для всіх товарів" : ""}
                                    onClick={() => navigate('/checkout')}
                                >
                                    Оформити замовлення
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="cart-empty">
                        <p>Ваш кошик порожній</p>
                        <Link to="/catalog" className="continue-shopping">
                            Перейти в каталог
                        </Link>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}

export default Cart;