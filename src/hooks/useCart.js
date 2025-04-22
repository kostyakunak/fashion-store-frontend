import { useState, useEffect } from "react";
import { getProductSizes } from "../api/productApi";

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

    // Загрузка корзины при первом рендере
    useEffect(() => {
        loadCart();
    }, []);

    // Загрузка размеров для товаров после загрузки корзины
    useEffect(() => {
        if (cartItems.length > 0 && !loading) {
            const productIds = [...new Set(cartItems.map(item => item.productId))];
            const shouldLoadSizes = productIds.some(id => !productSizes[id]);
            
            if (shouldLoadSizes) {
                loadProductSizes();
            }
        }
    }, [cartItems, loading]);

    // Загрузка доступных размеров для товаров
    const loadProductSizes = async () => {
        const productIds = [...new Set(cartItems.map(item => item.productId))];
        
        try {
            const sizePromises = productIds.map(productId => 
                getProductSizes(productId)
                    .then(sizes => ({ productId, sizes }))
                    .catch(error => {
                        console.error(`Ошибка при запросе размеров для продукта ${productId}:`, error);
                        return null;
                    })
            );

            const results = await Promise.all(sizePromises);
            const newProductSizes = {};
            
            results.forEach(result => {
                if (result && result.sizes) {
                    newProductSizes[result.productId] = result.sizes;
                } else if (result) {
                    // Если не получили размеры с сервера, используем стандартные
                    newProductSizes[result.productId] = availableSizes;
                }
            });
            
            setProductSizes(newProductSizes);
        } catch (error) {
            console.error("Ошибка загрузки размеров:", error);
        }
    };

    // Загрузка корзины
    const loadCart = () => {
        setLoading(true);
        const userId = localStorage.getItem("userId");
        
        if (userId) {
            // Если пользователь авторизован, загружаем корзину с сервера
            fetch(`http://localhost:8080/cart/user/${userId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP ошибка! Статус: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("Данные корзины:", data);
                    setCartItems(data);
                    setLoading(false);
                })
                .catch(error => {
                    console.error("Ошибка загрузки корзины:", error);
                    setError(error.message);
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

    // Обновление суммы при изменении корзины
    useEffect(() => {
        setTotal(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2));
    }, [cartItems]);

    // Добавить в корзину
    const addToCart = (item) => {
        const userId = localStorage.getItem("userId");
        
        if (userId) {
            // Если пользователь авторизован, отправляем запрос на сервер
            fetch("http://localhost:8080/cart", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId: userId,
                    productId: item.productId || item.id,
                    sizeId: item.sizeId || 1, // Размер по умолчанию если не указан
                    quantity: 1
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ошибка! Статус: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Товар добавлен в корзину:", data);
                // Обновляем корзину после добавления
                loadCart();
            })
            .catch(error => {
                console.error("Ошибка добавления в корзину:", error);
                alert(`Ошибка: ${error.message}`);
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
        const userId = localStorage.getItem("userId");
        
        if (userId) {
            // Если пользователь авторизован, удаляем с сервера
            fetch(`http://localhost:8080/cart/${itemId}`, {
                method: "DELETE"
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ошибка! Статус: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Товар удален из корзины:", data);
                // Обновляем состояние, исключая удаленный элемент
                setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
            })
            .catch(error => {
                console.error("Ошибка удаления из корзины:", error);
                alert(`Ошибка: ${error.message}`);
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
        
        const userId = localStorage.getItem("userId");
        
        if (userId) {
            // Если пользователь авторизован, обновляем на сервере
            fetch(`http://localhost:8080/cart/${itemId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    quantity: quantity
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ошибка! Статус: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Количество товара обновлено:", data);
                // Обновляем состояние
                setCartItems(prevItems =>
                    prevItems.map(item => item.id === itemId ? {...item, quantity: quantity} : item)
                );
            })
            .catch(error => {
                console.error("Ошибка обновления количества:", error);
                alert(`Ошибка: ${error.message}`);
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
        const userId = localStorage.getItem("userId");
        
        if (userId) {
            // Если пользователь авторизован, обновляем на сервере
            fetch(`http://localhost:8080/cart/${itemId}/size`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    sizeId: sizeId
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ошибка! Статус: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Размер товара обновлен:", data);
                // Обновляем состояние
                setCartItems(prevItems =>
                    prevItems.map(item => item.id === itemId ? {...item, sizeId: sizeId} : item)
                );
            })
            .catch(error => {
                console.error("Ошибка обновления размера:", error);
                alert(`Ошибка: ${error.message}`);
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

    // Получить доступные размеры для конкретного товара
    const getAvailableSizesForProduct = (productId) => {
        // Если размеры для продукта загружены, возвращаем их
        if (productSizes[productId]) {
            // Фильтруем только те размеры, которые доступны на складе
            return productSizes[productId].filter(size => 
                size.inStock === true || (size.quantity != null && size.quantity > 0)
            );
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
        loadCart 
    };
}