import { useState, useEffect, useContext, useCallback } from "react";
import { getMyWishlist, addToWishlist, removeFromWishlist, removeProductFromWishlist } from "../api/wishlistApi";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const API_URL = "http://localhost:8080/api/wishlist";

export default function useWishlist() {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Используем AuthContext для получения данных о пользователе
    const auth = useContext(AuthContext);

    // Загрузка списка желаний
    const loadWishlist = useCallback(() => {
        setLoading(true);
        
        if (auth.isAuthenticated()) {
            // Если пользователь авторизован, загружаем список желаний с сервера
            axios.get(`${API_URL}/my`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            .then(response => {
                console.log("Данные списка желаний:", response.data);
                setWishlistItems(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Ошибка загрузки списка желаний:", error);
                setError(error.response?.data?.message || error.message);
                setLoading(false);
            });
        } else {
            // Если пользователь не авторизован, устанавливаем пустой список
            setWishlistItems([]);
            setLoading(false);
        }
    }, [auth]);

    // Загрузка списка желаний при первом рендере или изменении статуса аутентификации
    useEffect(() => {
        loadWishlist();
    }, [auth.isAuthenticated, loadWishlist]);

    // Проверка, находится ли продукт в списке желаний
    const isInWishlist = (productId) => {
        return wishlistItems.some(item => item.productId === productId);
    };

    // Добавить в список желаний
    const addToWishlistHandler = (product) => {
        if (auth.isAuthenticated()) {
            // Если пользователь авторизован, отправляем запрос на сервер
            axios.post(API_URL, {
                productId: product.productId || product.id
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            .then(response => {
                console.log("Товар добавлен в список желаний:", response.data);
                // Обновляем список желаний после добавления
                loadWishlist();
            })
            .catch(error => {
                console.error("Ошибка добавления в список желаний:", error);
                setError(error.response?.data?.message || error.message);
            });
        } else {
            // Если пользователь не авторизован, перенаправляем на страницу входа
            // или показываем модальное окно с предложением войти в систему
            setError("Чтобы добавить товар в список желаний, необходимо войти в систему");
        }
    };

    // Удалить из списка желаний по ID элемента
    const removeFromWishlistHandler = (itemId) => {
        if (auth.isAuthenticated()) {
            // Если пользователь авторизован, удаляем с сервера
            axios.delete(`${API_URL}/${itemId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            .then(response => {
                console.log("Товар удален из списка желаний:", response.data);
                // Обновляем состояние, исключая удаленный элемент
                setWishlistItems(prevItems => prevItems.filter(item => item.id !== itemId));
            })
            .catch(error => {
                console.error("Ошибка удаления из списка желаний:", error);
                setError(error.response?.data?.message || error.message);
            });
        }
    };

    // Удалить из списка желаний по ID продукта
    const removeProductFromWishlistHandler = (productId) => {
        if (auth.isAuthenticated()) {
            // Если пользователь авторизован, удаляем с сервера
            axios.delete(`${API_URL}/product/${productId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            .then(response => {
                console.log("Продукт удален из списка желаний:", response.data);
                // Обновляем состояние, исключая удаленный элемент
                setWishlistItems(prevItems => prevItems.filter(item => item.productId !== productId));
            })
            .catch(error => {
                console.error("Ошибка удаления из списка желаний:", error);
                setError(error.response?.data?.message || error.message);
            });
        }
    };

    // Переместить товар из списка желаний в корзину
    const moveToCart = (item, addToCartFn) => {
        // Добавляем в корзину
        addToCartFn(item);
        
        // Удаляем из списка желаний
        removeFromWishlistHandler(item.id);
    };
    
    // Очистить список желаний при выходе из системы
    const clearWishlist = () => {
        setWishlistItems([]);
        setError(null);
    };

    // Переключатель состояния (добавить/удалить)
    const toggleWishlistItem = (product) => {
        const productId = product.productId || product.id;
        if (isInWishlist(productId)) {
            // Если продукт уже в списке желаний, удаляем его
            const item = wishlistItems.find(item => item.productId === productId);
            if (item) {
                removeFromWishlistHandler(item.id);
            } else {
                removeProductFromWishlistHandler(productId);
            }
        } else {
            // Если продукта нет в списке желаний, добавляем его
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