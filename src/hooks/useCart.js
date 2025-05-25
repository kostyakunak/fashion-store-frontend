import { useState, useEffect, useContext } from "react";
import { getProductSizes } from "../api/productApi";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "../context/AuthContext";

const API_URL = "http://localhost:8080/api/cart";

export default function useCart() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);
    const [availableSizes, setAvailableSizes] = useState([
        { id: 1, name: "XS" },
        { id: 2, name: "S" },
        { id: 3, name: "M" },
        { id: 4, name: "L" },
        { id: 5, name: "XL" },
        { id: 6, name: "XXL" }
    ]);
    // Словарь доступных размеров для каждого товара
    const [productSizes, setProductSizes] = useState({});
    const [sizesLoading, setSizesLoading] = useState(false);
    
    // Используем AuthContext для получения данных о пользователе
    const auth = useContext(AuthContext);

    // Устанавливаем токен в axios при инициализации (один раз)
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }, []);

    // Загрузка корзины при первом рендере или изменении статуса аутентификации
    useEffect(() => {
        loadCart();
    }, [auth.isAuthenticated()]);

    // Оптимизированная загрузка размеров для товаров
    useEffect(() => {
        if (sizesLoading || loading || cartItems.length === 0) return;

        // Получаем id товаров, для которых еще нет размеров
        const productIdsToLoad = [...new Set(
            cartItems
                .map(item => item.productId)
        )];

        setSizesLoading(true);

        // Загружаем размеры только для новых товаров
        setProductSizes(prevProductSizes => {
            const idsToFetch = productIdsToLoad.filter(productId => !prevProductSizes[productId]);
            if (idsToFetch.length === 0) {
                setSizesLoading(false);
                return prevProductSizes;
            }
            Promise.all(idsToFetch.map(productId =>
                getProductSizes(productId)
                    .then(sizes => ({ productId, sizes }))
                    .catch(error => {
                        console.error(`Ошибка при запросе размеров для продукта ${productId}:`, error);
                        return null;
                    })
            )).then(results => {
                let updated = false;
                const newProductSizes = { ...prevProductSizes };
            results.forEach(result => {
                if (result && result.sizes) {
                    newProductSizes[result.productId] = result.sizes;
                        updated = true;
                }
            });
                if (updated) {
            setProductSizes(newProductSizes);
                }
                setSizesLoading(false);
            });
            return prevProductSizes;
        });
    }, [cartItems, loading]); // productSizes и sizesLoading не в зависимостях

    // Загрузка корзины
    const loadCart = () => {
        setLoading(true);
        
        if (auth.isAuthenticated()) {
            // Если пользователь авторизован, загружаем корзину с сервера
            axios.get(`${API_URL}/my`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            .then(response => {
                console.log("Данные корзины:", response.data);
                setCartItems(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Ошибка загрузки корзины:", error);
                setError(error.response?.data?.message || error.message);
                setLoading(false);
            });
        } else {
            // Если пользователь не авторизован, загружаем из localStorage
            const localCart = JSON.parse(localStorage.getItem("cartItems") || "[]");
            
            if (localCart.length === 0) {
                setCartItems([]);
                setLoading(false);
                return;
            }
            
            // Преобразуем данные из localStorage в формат для отображения
            setCartItems(localCart);
            setLoading(false);
        }
    };
    
    // Функция для объединения корзины после входа в систему
    const mergeCart = async () => {
        if (!auth.isAuthenticated()) return;
        
        const localCart = JSON.parse(localStorage.getItem("cartItems") || "[]");
        if (localCart.length === 0) return;
        
        try {
            await axios.post(`${API_URL}/merge`, {
                guestCart: localCart
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            // После успешного объединения очищаем локальную корзину
            localStorage.removeItem("cartItems");
            
            // Перезагружаем корзину с сервера
            loadCart();
        } catch (error) {
            console.error("Ошибка при объединении корзины:", error);
            setError(error.response?.data?.message || error.message);
        }
    };

    // Обновление суммы при изменении корзины
    useEffect(() => {
        setTotal(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2));
    }, [cartItems]);

    // Добавить в корзину
    const addToCart = (item) => {
        if (auth.isAuthenticated()) {
            // Если пользователь авторизован, отправляем запрос на сервер
            axios.post(API_URL, {
                productId: item.productId || item.id,
                sizeId: item.sizeId || 1, // Размер по умолчанию если не указан
                quantity: 1
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            .then(response => {
                console.log("Товар добавлен в корзину:", response.data);
                // Обновляем корзину после добавления
                loadCart();
            })
            .catch(error => {
                console.error("Ошибка добавления в корзину:", error);
                setError(error.response?.data?.message || error.message);
            });
        } else {
            // Если пользователь не авторизован, сохраняем в localStorage
            const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
            
            // Создаем объект товара для добавления в корзину
            const cartItem = {
                id: item.id || Math.random().toString(36).substr(2, 9),
                productId: item.productId || item.id,
                sizeId: item.sizeId || 1,
                quantity: 1,
                name: item.name || item.title,
                price: item.price,
                imageUrl: item.imageUrl || (item.images && item.images.length > 0 ? item.images[0].imageUrl : "https://via.placeholder.com/100")
            };
            
            // Проверяем, есть ли уже такой товар в корзине
            const existingItemIndex = cartItems.findIndex(
                existingItem => existingItem.productId === cartItem.productId && existingItem.sizeId === cartItem.sizeId
            );
            
            if (existingItemIndex !== -1) {
                // Если товар уже есть, увеличиваем количество
                cartItems[existingItemIndex].quantity += 1;
            } else {
                // Если товара нет, добавляем его
                cartItems.push(cartItem);
            }
            
            // Сохраняем обновленную корзину
            localStorage.setItem("cartItems", JSON.stringify(cartItems));
            setCartItems(cartItems);
        }
    };

    // Удалить из корзины
    const removeFromCart = (itemId) => {
        if (auth.isAuthenticated()) {
            // Если пользователь авторизован, удаляем с сервера
            axios.delete(`${API_URL}/${itemId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            .then(response => {
                console.log("Товар удален из корзины:", response.data);
                // Обновляем состояние, исключая удаленный элемент
                setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
            })
            .catch(error => {
                console.error("Ошибка удаления из корзины:", error);
                setError(error.response?.data?.message || error.message);
            });
        } else {
            // Если пользователь не авторизован, удаляем из localStorage
            const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
            const updatedCart = cartItems.filter(item => item.id !== itemId);
            
            localStorage.setItem("cartItems", JSON.stringify(updatedCart));
            setCartItems(updatedCart);
        }
    };

    // Изменить количество
    const updateQuantity = (itemId, quantity) => {
        if (quantity < 1) return; // Не допускаем отрицательное количество
        
        if (auth.isAuthenticated()) {
            // Если пользователь авторизован, обновляем на сервере
            axios.put(`${API_URL}/${itemId}`, {
                quantity: quantity
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            .then(response => {
                console.log("Количество товара обновлено:", response.data);
                // Обновляем состояние
                setCartItems(prevItems =>
                    prevItems.map(item => item.id === itemId ? {...item, quantity: quantity} : item)
                );
            })
            .catch(error => {
                console.error("Ошибка обновления количества:", error);
                setError(error.response?.data?.message || error.message);
            });
        } else {
            // Если пользователь не авторизован, обновляем в localStorage
            const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
            const updatedCart = cartItems.map(item =>
                item.id === itemId ? {...item, quantity: quantity} : item
            );
            
            localStorage.setItem("cartItems", JSON.stringify(updatedCart));
            setCartItems(updatedCart);
        }
    };

    // Обновить размер товара
    const updateSize = (itemId, sizeId) => {
        if (auth.isAuthenticated()) {
            // Если пользователь авторизован, обновляем на сервере
            axios.put(`${API_URL}/${itemId}/size`, {
                sizeId: sizeId
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            .then(response => {
                console.log("Размер товара обновлен:", response.data);
                // Обновляем состояние
                setCartItems(prevItems =>
                    prevItems.map(item => item.id === itemId ? {...item, sizeId: sizeId} : item)
                );
            })
            .catch(error => {
                console.error("Ошибка обновления размера:", error);
                setError(error.response?.data?.message || error.message);
            });
        } else {
            // Если пользователь не авторизован, обновляем в localStorage
            const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
            const updatedCart = cartItems.map(item =>
                item.id === itemId ? {...item, sizeId: sizeId} : item
            );
            
            localStorage.setItem("cartItems", JSON.stringify(updatedCart));
            setCartItems(updatedCart);
        }
    };
    
    // Очистить корзину при выходе из системы
    const clearCart = () => {
        setCartItems([]);
        setError(null);
    };

    // Получить доступные размеры для конкретного товара
    const getAvailableSizesForProduct = (productId) => {
        // Если размеры для продукта загружены, возвращаем их
        if (productSizes[productId]) {
            // Возвращаем все размеры с правильным статусом доступности
            return productSizes[productId].map(size => ({
                ...size,
                // Используем фактическую доступность размера из базы данных
                inStock: size.inStock !== undefined ? size.inStock : (size.quantity > 0)
            }));
        }
        
        // В случае, если размеры еще не загружены, возвращаем временные данные
        return availableSizes;
    };

    return {
        cartItems,
        loading,
        error,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateSize,
        availableSizes,
        getAvailableSizesForProduct,
        total,
        loadCart,
        mergeCart,
        clearCart
    };
}