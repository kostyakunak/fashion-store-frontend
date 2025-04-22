import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "../scripts/Header";
import { Footer } from "../scripts/Footer";
import "../styles/Wishlist.css";

function Wishlist() {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Получаем ID пользователя из localStorage (если он авторизован)
        const userId = localStorage.getItem("userId");
        
        if (userId) {
            // Если пользователь авторизован, загружаем избранное с сервера
            fetchUserWishlist(userId);
        } else {
            // Если пользователь не авторизован, загружаем из localStorage
            loadLocalWishlist();
        }
    }, []);

    // Загрузка избранного авторизованного пользователя с сервера
    const fetchUserWishlist = (userId) => {
        setLoading(true);
        fetch(`http://localhost:8080/wishlist/user/${userId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ошибка! Статус: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Данные избранного:", data);
                setWishlistItems(data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Ошибка загрузки избранного:", error);
                setError(error.message);
                setLoading(false);
            });
    };

    // Загрузка избранного из локального хранилища
    const loadLocalWishlist = () => {
        const localWishlist = JSON.parse(localStorage.getItem("wishlistItems") || "[]");
        
        if (localWishlist.length === 0) {
            setWishlistItems([]);
            setLoading(false);
            return;
        }
        
        // Для каждого элемента из локального хранилища загружаем полную информацию
        const productPromises = localWishlist.map(item => 
            fetch(`http://localhost:8080/products/${item.productId}`)
                .then(response => response.json())
                .then(productData => ({
                    id: item.id || Math.random().toString(36).substr(2, 9),
                    productId: item.productId,
                    name: productData.name,
                    price: productData.price,
                    images: productData.images
                }))
                .catch(error => {
                    console.error(`Ошибка загрузки продукта ID ${item.productId}:`, error);
                    return null;
                })
        );
        
        Promise.all(productPromises)
            .then(products => {
                // Фильтруем null значения (если были ошибки загрузки)
                const validProducts = products.filter(product => product !== null);
                setWishlistItems(validProducts);
                setLoading(false);
            })
            .catch(error => {
                console.error("Ошибка загрузки локального избранного:", error);
                setError(error.message);
                setLoading(false);
            });
    };

    // Удаление товара из избранного
    const removeFromWishlist = (itemId, productId) => {
        const userId = localStorage.getItem("userId");
        
        if (userId) {
            // Если пользователь авторизован, удаляем с сервера
            fetch(`http://localhost:8080/wishlist/${itemId}`, {
                method: "DELETE"
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ошибка! Статус: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Обновляем состояние, исключая удаленный элемент
                setWishlistItems(prevItems => prevItems.filter(item => item.id !== itemId));
            })
            .catch(error => {
                console.error("Ошибка удаления из избранного:", error);
                alert(`Ошибка: ${error.message}`);
            });
        } else {
            // Если пользователь не авторизован, удаляем из localStorage
            const localWishlist = JSON.parse(localStorage.getItem("wishlistItems") || "[]");
            const updatedWishlist = localWishlist.filter(item => item.productId !== productId);
            
            localStorage.setItem("wishlistItems", JSON.stringify(updatedWishlist));
            
            // Обновляем состояние, исключая удаленный элемент
            setWishlistItems(prevItems => prevItems.filter(item => item.productId !== productId));
        }
    };

    return (
        <div className="wishlist">
            <Header />
            <main>
                <h1>Избранное</h1>
                
                {loading ? (
                    <div className="loading">Загрузка избранного...</div>
                ) : error ? (
                    <div className="error">Ошибка: {error}</div>
                ) : wishlistItems.length > 0 ? (
                    <div className="wishlist-grid">
                        {wishlistItems.map(item => (
                            <div className="wishlist-item" key={item.id}>
                                <div className="wishlist-image">
                                    <Link to={`/item?id=${item.productId}`}>
                                        <img 
                                            src={item.images && item.images.length > 0 
                                                ? item.images[0].imageUrl 
                                                : "https://via.placeholder.com/200"} 
                                            alt={item.name} 
                                            loading="lazy" 
                                        />
                                    </Link>
                                    <button 
                                        className="delete-button"
                                        onClick={() => removeFromWishlist(item.id, item.productId)}
                                        title="Удалить из избранного"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                            <path fill="none" d="M0 0h24v24H0z"/>
                                            <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                        </svg>
                                    </button>
                                </div>
                                <div className="wishlist-info">
                                    <h3>{item.name}</h3>
                                    <p className="price">{item.price} руб.</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-wishlist">
                        <p>Ваш список избранного пуст</p>
                        <Link to="/catalog" className="to-catalog-btn">
                            Перейти в каталог
                        </Link>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}

export default Wishlist;