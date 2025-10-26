import { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { API_CONFIG } from '../config/apiConfig';

const API_URL = API_CONFIG.API_URL + "/wishlist";

export default function useWishlist() {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Використовуємо AuthContext для отримання даних про користувача
    const auth = useContext(AuthContext);

    // Завантаження списку бажань
    const loadWishlist = useCallback(() => {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (token && auth.user) {
            // Якщо користувач авторизований, завантажуємо список бажань з сервера
            axios.get(`${API_URL}/my`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            .then(response => {
                console.log("Дані списку бажань:", response.data);
                setWishlistItems(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Помилка завантаження списку бажань:", error);
                setError(error.response?.data?.message || error.message);
                setLoading(false);
            });
        } else {
            // Якщо користувач не авторизований, встановлюємо порожній список
            setWishlistItems([]);
            setLoading(false);
        }
    }, [auth]);

    // Завантаження списку бажань при першому рендері або зміні статусу автентифікації
    useEffect(() => {
        loadWishlist();
    }, [auth.user, loadWishlist]);

    // Перевірка, чи знаходиться продукт у списку бажань
    const isInWishlist = (productId) => {
        return wishlistItems.some(item => String(item.productId) === String(productId));
    };

    // Додати до списку бажань
    const addToWishlistHandler = (product) => {
        const token = localStorage.getItem('token');
        if (token && auth.user) {
            // Якщо користувач авторизований, відправляємо запит на сервер
            axios.post(API_URL, {
                productId: product.productId || product.id
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            .then(response => {
                console.log("Товар додано до списку бажань:", response.data);
                // Оновлюємо список бажань після додавання
                loadWishlist();
            })
            .catch(error => {
                console.error("Помилка додавання до списку бажань:", error);
                setError(error.response?.data?.message || error.message);
            });
        } else {
            // Якщо користувач не авторизований, перенаправляємо на сторінку входу
            // або показуємо модальне вікно з пропозицією увійти в систему
            setError("Щоб додати товар до списку бажань, необхідно увійти в систему");
        }
    };

    // Видалити зі списку бажань за ID елемента
    const removeFromWishlistHandler = (itemId) => {
        const token = localStorage.getItem('token');
        if (token && auth.user) {
            // Якщо користувач авторизований, видаляємо з сервера
            axios.delete(`${API_URL}/${itemId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            .then(response => {
                console.log("Товар видалено зі списку бажань:", response.data);
                // Оновлюємо стан, виключаючи видалений елемент
                setWishlistItems(prevItems => prevItems.filter(item => item.id !== itemId));
            })
            .catch(error => {
                console.error("Помилка видалення зі списку бажань:", error);
                setError(error.response?.data?.message || error.message);
            });
        }
    };

    // Видалити зі списку бажань за ID продукту
    const removeProductFromWishlistHandler = (productId) => {
        const token = localStorage.getItem('token');
        if (token && auth.user) {
            // Оптимістично прибираємо з локального стейту
            setWishlistItems(prevItems => prevItems.filter(item => item.productId !== productId));
            axios.delete(`${API_URL}/product/${productId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            .then(response => {
                console.log("Продукт видалено зі списку бажань:", response.data);
                // Серверна відповідь — нічого не робимо, локальний стейт вже оновлено
            })
            .catch(error => {
                console.error("Помилка видалення зі списку бажань:", error);
                setError(error.response?.data?.message || error.message);
                // (опціонально) повернути товар назад, якщо помилка
                // setWishlistItems(prevItems => [...prevItems, ...???]);
            });
        }
    };

    // Перемістити товар зі списку бажань у кошик
    const moveToCart = (item, addToCartFn) => {
        // Додаємо в кошик
        addToCartFn(item);
        
        // Видаляємо зі списку бажань
        removeFromWishlistHandler(item.id);
    };
    
    // Очистити список бажань при виході з системи
    const clearWishlist = () => {
        setWishlistItems([]);
        setError(null);
    };

    // Перемикач стану (додати/видалити)
    const toggleWishlistItem = (product) => {
        const productId = product.productId || product.id;
        if (isInWishlist(productId)) {
            // Завжди видаляємо за productId для надійності
                removeProductFromWishlistHandler(productId);
        } else {
            addToWishlistHandler(product);
        }
    };

    return {
        wishlistItems,
        loading,
        error,
        addToWishlist: addToWishlistHandler,
        removeFromWishlist: removeFromWishlistHandler,
        removeProductFromWishlist: removeProductFromWishlistHandler,
        isInWishlist,
        moveToCart,
        loadWishlist,
        clearWishlist,
        toggleWishlistItem
    };
}