import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/Cart.css";
import { Header } from "../scripts/Header";
import { Footer } from "../scripts/Footer";
import useCart from "../hooks/useCart";
import { debugAuth, fixAuthIssues } from "../utils/authDebugger";

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
        loadCart,
        authStatus
    } = useCart();

    // Состояние для хранения сообщений о недоступных размерах
    const [sizeWarnings, setSizeWarnings] = useState({});

    // Загружаем корзину при монтировании компонента и при изменении состояния
    useEffect(() => {
        console.log("=== МОНТИРОВАНИЕ КОМПОНЕНТА КОРЗИНЫ ===");
        
        // Используем утилиту отладки для проверки авторизации
        const authState = debugAuth();
        console.log("Полное состояние авторизации:", authState);
        
        // Пытаемся исправить проблемы с авторизацией
        const fixed = fixAuthIssues();
        if (fixed) {
            console.log("Были исправлены проблемы с авторизацией, повторная проверка:");
            debugAuth();
        }
        
        loadCart();
        
        // Добавляем слушатель для обновления корзины при изменении localStorage
        const handleStorageChange = (e) => {
            if (e.key === 'cartItems' || e.key === 'token' || e.key === 'userId' || e.key === 'user') {
                console.log(`Обнаружено изменение в localStorage: ${e.key}, обновляем корзину`);
                loadCart();
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // Проверяем доступность выбранных размеров при загрузке и изменении корзины
    useEffect(() => {
        if (!loading && cartItems.length > 0) {
            console.log("Проверка доступности размеров для товаров в корзине");
            const warnings = {};
            
            cartItems.forEach(item => {
                const availableSizes = getAvailableSizesForProduct(item.productId);
                const sizeExists = availableSizes.some(size => size.id === item.sizeId);
                
                if (!sizeExists) {
                    console.log(`Размер недоступен для товара ${item.productId}`);
                    warnings[item.id] = true;
                }
            });
            
            setSizeWarnings(warnings);
        }
    }, [cartItems, loading, getAvailableSizesForProduct]);

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
                    onChange={(e) => {
                        console.log(`Изменение размера для товара ${item.id} на ${e.target.value}`);
                        updateSize(item.id, parseInt(e.target.value));
                    }}
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

    // Добавляем эффект для логирования изменений в authStatus
    useEffect(() => {
        console.log("Изменение статуса авторизации в Cart.jsx:", authStatus);
    }, [authStatus]);

    return (
        <div className="cart">
            <Header />
            <main>
                <h1>Корзина</h1>
                
                {loading ? (
                    <div className="loading">
                        <div className="loading-spinner"></div>
                        <p>Загрузка корзины...</p>
                    </div>
                ) : error ? (
                    <div className="error">
                        <p>Ошибка: {error}</p>
                        <button onClick={loadCart} className="retry-button">
                            Повторить попытку
                        </button>
                    </div>
                ) : !authStatus?.isAuthenticated ? (
                    <div className="cart-empty">
                        <p>Для просмотра корзины необходимо авторизоваться</p>
                        <div className="auth-status-debug">
                            <p>Отладочная информация:</p>
                            <pre>{JSON.stringify(authStatus, null, 2)}</pre>
                            <p>localStorage:</p>
                            <pre>token: {localStorage.getItem('token') ? 'присутствует' : 'отсутствует'}</pre>
                            <pre>userId: {localStorage.getItem('userId')}</pre>
                            <pre>user: {localStorage.getItem('user') ? 'присутствует' : 'отсутствует'}</pre>
                            <button
                                onClick={() => {
                                    const fixed = fixAuthIssues();
                                    if (fixed) {
                                        alert("Исправлены проблемы с авторизацией. Перезагрузка корзины...");
                                        loadCart();
                                    } else {
                                        alert("Проблемы с авторизацией не обнаружены или не могут быть исправлены автоматически.");
                                    }
                                }}
                                className="retry-button"
                            >
                                Попытаться исправить авторизацию
                            </button>
                        </div>
                        <Link to="/login" className="continue-shopping">
                            Войти в аккаунт
                        </Link>
                    </div>
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
                                console.log("Рендеринг товара в корзине:", item);
                                return (
                                    <div className="cart-item" key={item.id}>
                                        <div className="cart-item-info">
                                            <div className="cart-item-image">
                                                <Link to={`/item?id=${item.product.id}`}>
                                                    <img 
                                                        src={item.imageUrl} 
                                                        alt={item.name} 
                                                        loading="lazy"
                                                    />
                                                </Link>
                                            </div>
                                            <div className="cart-item-details">
                                                <h3>{item.name}</h3>
                                                <p>Размер: {item.sizeId}</p>
                                                <p>Количество: {item.quantity}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="cart-item-price">
                                            {item.price} руб.
                                        </div>
                                        
                                        {renderSizeSelect(item)}
                                        
                                        <div className="cart-item-actions">
                                            <button 
                                                onClick={() => {
                                                    console.log(`Удаление товара ${item.id} из корзины`);
                                                    removeFromCart(item.id);
                                                }}
                                                className="remove-button"
                                            >
                                                Удалить
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