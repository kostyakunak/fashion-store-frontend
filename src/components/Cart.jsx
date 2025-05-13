import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
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
    
    // Используем контекст аутентификации
    const auth = useContext(AuthContext);

    // Состояние для хранения сообщений о недоступных размерах
    const [sizeWarnings, setSizeWarnings] = useState({});

    // Проверяем доступность выбранных размеров при загрузке и изменении корзины
    useEffect(() => {
        if (!loading && cartItems.length > 0) {
            const warnings = {};
            
            cartItems.forEach(item => {
                const availableSizes = getAvailableSizesForProduct(item.productId);
                const sizeExists = availableSizes.some(size => size.id === item.sizeId);
                
                if (!sizeExists) {
                    warnings[item.id] = true;
                }
            });
            
            setSizeWarnings(warnings);
        }
    }, [cartItems, loading, getAvailableSizesForProduct]);
    
    // Объединяем корзину при входе пользователя в систему
    useEffect(() => {
        if (auth.isAuthenticated()) {
            mergeCart();
        }
    }, [auth.isAuthenticated()]);

    // Функция для отображения размеров товара
    const renderSizeSelect = (item) => {
        const availableSizes = getAvailableSizesForProduct(item.productId);
        const currentSizeExists = availableSizes.some(size => size.id === item.sizeId);
        
        return (
            <div className="cart-item-size">
                {sizeWarnings[item.id] && (
                    <div className="size-warning">
                        Выбранный размер недоступен. Пожалуйста, выберите другой размер.
                    </div>
                )}
                
                <select
                    value={currentSizeExists ? item.sizeId : ''}
                    onChange={(e) => updateSize(item.id, parseInt(e.target.value))}
                    className={`size-select ${sizeWarnings[item.id] ? 'warning' : ''}`}
                >
                    {!currentSizeExists && (
                        <option value="" disabled>
                            Выберите размер
                        </option>
                    )}
                    {availableSizes.map(size => (
                        <option key={size.id} value={size.id}>
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
                <h1>Корзина</h1>
                
                {loading ? (
                    <div className="loading">Загрузка корзины...</div>
                ) : error ? (
                    <div className="error">Ошибка: {error}</div>
                ) : cartItems.length > 0 ? (
                    <div className="cart-container">
                        <div className="cart-headers">
                            <div className="cart-header-item">ТОВАР</div>
                            <div className="cart-header-price">ЦЕНА</div>
                            <div className="cart-header-size">РАЗМЕР</div>
                            <div className="cart-header-quantity">КОЛИЧЕСТВО</div>
                            <div className="cart-header-subtotal">СУММА</div>
                            <div className="cart-header-action"></div>
                        </div>
                        
                        <div className="cart-items">
                            {cartItems.map((item) => {
                                return (
                                    <div className="cart-item" key={item.id}>
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
                                            {item.price} руб.
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
                                            {(item.price * item.quantity).toFixed(2)} руб.
                                        </div>
                                        
                                        <div className="cart-item-remove">
                                            <button 
                                                className="remove-btn" 
                                                onClick={() => removeFromCart(item.id)}
                                                title="Удалить из корзины"
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
                                <h3>Итого:</h3>
                                <span className="cart-total-price">{total} руб.</span>
                            </div>
                            <div className="cart-actions">
                                <Link to="/catalog" className="continue-shopping">
                                    Продолжить покупки
                                </Link>
                                <button 
                                    className="checkout-btn"
                                    disabled={Object.keys(sizeWarnings).length > 0}
                                    title={Object.keys(sizeWarnings).length > 0 ? "Пожалуйста, выберите доступные размеры для всех товаров" : ""}
                                >
                                    Оформить заказ
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="cart-empty">
                        <p>Ваша корзина пуста</p>
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