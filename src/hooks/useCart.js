import { useState, useEffect } from "react";
import { getProductSizes } from "../api/productApi";

// Определение базового URL для API
const API_URL = "http://localhost:8080";

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

    // Функция для проверки авторизации
    const checkAuth = () => {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        
        // Если userId не найден, но есть данные пользователя, используем id из объекта user
        const effectiveUserId = userId || (user && user.id);
        
        // Проверяем наличие всех необходимых данных для авторизации
        const isAuth = !!(effectiveUserId && token);
        
        console.log("checkAuth детальный результат:", {
            userId: effectiveUserId,
            hasToken: !!token,
            tokenValue: token ? token.substring(0, 10) + "..." : "отсутствует",
            userObject: user ? JSON.stringify(user).substring(0, 50) + "..." : "отсутствует",
            isAuthenticated: isAuth
        });
        
        return {
            userId: effectiveUserId,
            token,
            isAuthenticated: isAuth
        };
    };

    // Загрузка корзины при первом рендере и при изменении userId
    useEffect(() => {
        const authStatus = checkAuth();
        console.log("Auth status:", authStatus);
        
        if (authStatus.isAuthenticated) {
            loadCart();
        } else {
            console.log("Пользователь не авторизован, корзина недоступна");
            setLoading(false);
            setCartItems([]);
        }
    }, []);

    // Отслеживание изменения статуса авторизации
    useEffect(() => {
        const handleAuthChange = async () => {
            const userId = localStorage.getItem("userId");
            const previousAuthState = localStorage.getItem("previousAuthState");
            
            console.log("Auth state changed:", { userId, previousAuthState });
            
            // Если пользователь только что авторизовался
            if (userId && previousAuthState === "false") {
                console.log("User just logged in, checking local cart...");
                // Проверяем наличие локальной корзины для миграции
                const localCart = JSON.parse(localStorage.getItem("cartItems") || "[]");
                if (localCart.length > 0) {
                    console.log("Found local cart with items:", localCart);
                    // Мигрируем товары и затем загружаем корзину из БД
                    await migrateCartToServer(userId);
                } else {
                    console.log("No local cart found, loading from server...");
                    // Просто загружаем корзину с сервера
                    loadCart();
                }
            }
            
            // Если пользователь вышел из аккаунта
            if (!userId && previousAuthState === "true") {
                console.log("User logged out, loading local cart...");
                // Загружаем корзину из localStorage
                loadCart();
            }
            
            // Обновляем предыдущее состояние авторизации
            localStorage.setItem("previousAuthState", userId ? "true" : "false");
        };
        
        // Устанавливаем начальное состояние, если его нет
        if (!localStorage.getItem("previousAuthState")) {
            localStorage.setItem("previousAuthState", localStorage.getItem("userId") ? "true" : "false");
        }
        
        // Проверяем при монтировании компонента
        handleAuthChange();
        
        // Подписываемся на событие хранилища
        window.addEventListener("storage", handleAuthChange);
        
        // Отписываемся при размонтировании
        return () => {
            window.removeEventListener("storage", handleAuthChange);
        };
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
    
    // Функция для миграции корзины из localStorage на сервер
    const migrateCartToServer = async (userId) => {
        try {
            setLoading(true);
            console.log("Starting cart migration to server...");
            const localCart = JSON.parse(localStorage.getItem("cartItems") || "[]");
            const token = localStorage.getItem("token");
            
            if (localCart.length === 0) {
                console.log("No items to migrate");
                setLoading(false);
                return;
            }
            
            console.log(`Миграция корзины для пользователя ${userId}`);
            console.log(`Локальная корзина:`, localCart);
            console.log(`Токен авторизации: ${token ? 'Присутствует' : 'Отсутствует'}`);
            
            // Отправляем локальную корзину на сервер
            // Исправляем URL с /cart/migrate на /api/cart/migrate
            const response = await fetch(`${API_URL}/api/cart/migrate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId,
                    items: localCart
                }),
            });
            
            console.log(`Статус ответа миграции: ${response.status} ${response.statusText}`);
            
            if (!response.ok) {
                if (response.status === 401) {
                    console.log("Unauthorized during migration, clearing auth data");
                    localStorage.removeItem("token");
                    localStorage.removeItem("userId");
                    localStorage.removeItem("user");
                    setCartItems(localCart);
                    setLoading(false);
                    return;
                }
                throw new Error(`Failed to migrate cart: ${response.status}`);
            }
            
            console.log("Cart migration successful");
            
            // Очищаем локальную корзину после успешной миграции
            localStorage.setItem("cartItems", "[]");
            
            // Загружаем обновленную корзину с сервера
            await loadCart();
        } catch (error) {
            console.error("Error during cart migration:", error);
            // В случае ошибки сохраняем локальную корзину
            const localCart = JSON.parse(localStorage.getItem("cartItems") || "[]");
            setCartItems(localCart);
        } finally {
            setLoading(false);
        }
    };

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
    const loadCart = async () => {
        try {
            setLoading(true);
            console.log("=== НАЧАЛО ЗАГРУЗКИ КОРЗИНЫ ===");
            
            const authStatus = checkAuth();
            console.log("Проверка данных авторизации:", authStatus);
            
            if (!authStatus.isAuthenticated) {
                console.log("Пользователь не авторизован");
                setCartItems([]);
                setLoading(false);
                return;
            }
            
            console.log(`Запрос корзины для пользователя ${authStatus.userId}`);
            
            // Добавляем подробное логирование запроса
            console.log(`Отправка запроса на: ${API_URL}/api/cart/user/${authStatus.userId}`);
            console.log(`Токен авторизации: ${authStatus.token ? 'Присутствует' : 'Отсутствует'}`);
            
            // Убедимся, что заголовок Authorization правильно форматирован
            const headers = new Headers();
            if (authStatus.token) {
                headers.append('Authorization', `Bearer ${authStatus.token}`);
                console.log("Заголовок Authorization добавлен: Bearer " + authStatus.token.substring(0, 10) + "...");
            }
            
            const response = await fetch(`${API_URL}/api/cart/user/${authStatus.userId}`, {
                headers: headers
            });
            
            // Логируем детали ответа
            console.log(`Статус ответа: ${response.status} ${response.statusText}`);
            console.log(`Заголовки ответа:`, Object.fromEntries([...response.headers.entries()]));
            
            console.log(`Ответ сервера: ${response.status} ${response.statusText}`);
            
            if (!response.ok) {
                throw new Error(`Ошибка загрузки корзины: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("Получены данные корзины:", data);
            
            // Обогащаем данные корзины параллельно
            const enrichedCartItems = await Promise.all(data.map(async (item) => {
                try {
                    console.log(`Обогащение данных для товара ${item.product.id}`);
                    
                    // Параллельно запрашиваем все необходимые данные
                    const [productResponse, imagesResponse, priceResponse] = await Promise.all([
                        fetch(`${API_URL}/api/products/${item.product.id}`),
                        fetch(`${API_URL}/api/products/${item.product.id}/images`),
                        fetch(`${API_URL}/api/products/${item.product.id}/price`)
                    ]);
                    
                    if (!productResponse.ok) {
                        console.error(`Ошибка получения данных товара ${item.product.id}`);
                        return null;
                    }
                    
                    const [productData, images, price] = await Promise.all([
                        productResponse.json(),
                        imagesResponse.ok ? imagesResponse.json() : [],
                        priceResponse.ok ? priceResponse.json() : { presentPrice: 0 }
                    ]);
                    
                    console.log(`Данные обогащены для товара ${item.product.id}:`, {
                        name: productData.name,
                        imageUrl: images.length > 0 ? images[0].imageUrl : "https://via.placeholder.com/100",
                        price: price.presentPrice
                    });
                    
                    return {
                        ...item,
                        name: productData.name,
                        imageUrl: images.length > 0 ? images[0].imageUrl : "https://via.placeholder.com/100",
                        price: price.presentPrice
                    };
                } catch (error) {
                    console.error(`Ошибка обогащения данных для товара ${item.product.id}:`, error);
                    return null;
                }
            }));
            
            // Фильтруем null значения и обновляем состояние
            const validItems = enrichedCartItems.filter(item => item !== null);
            console.log("Обогащенные данные корзины:", validItems);
            
            setCartItems(validItems);
        } catch (error) {
            console.error("Ошибка загрузки корзины:", error);
            setError(error.message);
            setCartItems([]);
        } finally {
            setLoading(false);
            console.log("=== ЗАВЕРШЕНИЕ ЗАГРУЗКИ КОРЗИНЫ ===");
        }
    };

    // Обновление суммы при изменении корзины
    useEffect(() => {
        setTotal(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2));
    }, [cartItems]);

    // Добавить в корзину
    const addToCart = async (item) => {
        try {
            setLoading(true);
            
            // Проверяем авторизацию
            const authStatus = checkAuth();
            console.log("Auth status before adding to cart:", authStatus);
            
            // Проверяем, авторизован ли пользователь
            if (!authStatus.isAuthenticated) {
                console.error("Unauthorized. Cart is only available for authenticated users.");
                throw new Error("Необходимо авторизоваться для добавления товара в корзину");
            }
            
            const { userId, token } = authStatus;
            
            console.log("Adding to cart:", {
                userId,
                productId: item.productId || item.id,
                sizeId: item.sizeId || 1,
                quantity: item.quantity || 1
            });
            
            console.log(`Отправка запроса на добавление в корзину: ${API_URL}/api/cart`);
            console.log(`Токен авторизации: ${token ? 'Присутствует' : 'Отсутствует'}`);
            
            // Убедимся, что заголовок Authorization правильно форматирован
            const headers = new Headers();
            headers.append('Content-Type', 'application/json');
            if (token) {
                headers.append('Authorization', `Bearer ${token}`);
                console.log("Заголовок Authorization добавлен: Bearer " + token.substring(0, 10) + "...");
            }
            
            const response = await fetch(`${API_URL}/api/cart`, {
                method: "POST",
                headers: headers,
                body: JSON.stringify({
                    userId: userId,
                    productId: item.productId || item.id,
                    sizeId: item.sizeId || 1,
                    quantity: item.quantity || 1
                })
            });
            
            console.log(`Статус ответа: ${response.status} ${response.statusText}`);
            
            if (!response.ok) {
                throw new Error(`Failed to add to cart: ${response.status}`);
            }
            
            // После успешного добавления обновляем корзину
            await loadCart();
            
            return await response.json();
        } catch (error) {
            console.error("Error adding to cart:", error);
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Удалить из корзины
    const removeFromCart = async (itemId) => {
        try {
            setLoading(true);
            const userId = localStorage.getItem("userId");
            const token = localStorage.getItem("token");
            
            if (!userId || !token) {
                throw new Error("Пользователь не авторизован");
            }
            
            console.log(`Удаление товара ${itemId} из корзины`);
            console.log(`Токен авторизации: ${token ? 'Присутствует' : 'Отсутствует'}`);
            
            // Исправляем URL с /cart/ на /api/cart/
            const response = await fetch(`${API_URL}/api/cart/${itemId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            
            console.log(`Статус ответа удаления: ${response.status} ${response.statusText}`);
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Ошибка авторизации");
                }
                throw new Error(`Ошибка при удалении из корзины: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("Товар удален из корзины:", data);
            
            // Обновляем корзину после удаления
            await loadCart();
        } catch (error) {
            console.error("Ошибка удаления из корзины:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Изменить количество
    const updateQuantity = async (itemId, quantity) => {
        try {
            if (quantity < 1) return;
            
            setLoading(true);
            const userId = localStorage.getItem("userId");
            const token = localStorage.getItem("token");
            
            if (!userId || !token) {
                throw new Error("Пользователь не авторизован");
            }
            
            console.log(`Обновление количества товара ${itemId} на ${quantity}`);
            console.log(`Токен авторизации: ${token ? 'Присутствует' : 'Отсутствует'}`);
            
            // Исправляем URL с /cart/ на /api/cart/
            const response = await fetch(`${API_URL}/api/cart/${itemId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    quantity: quantity
                })
            });
            
            console.log(`Статус ответа обновления количества: ${response.status} ${response.statusText}`);
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Ошибка авторизации");
                }
                throw new Error(`Ошибка при обновлении количества: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("Количество товара обновлено:", data);
            
            // Обновляем корзину после изменения количества
            await loadCart();
        } catch (error) {
            console.error("Ошибка обновления количества:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Обновить размер товара
    const updateSize = async (itemId, sizeId) => {
        try {
            setLoading(true);
            const userId = localStorage.getItem("userId");
            const token = localStorage.getItem("token");
            
            if (!userId || !token) {
                throw new Error("Пользователь не авторизован");
            }
            
            console.log(`Обновление размера товара ${itemId} на ${sizeId}`);
            console.log(`Токен авторизации: ${token ? 'Присутствует' : 'Отсутствует'}`);
            
            // Исправляем URL с /cart/ на /api/cart/
            const response = await fetch(`${API_URL}/api/cart/${itemId}/size`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    sizeId: sizeId
                })
            });
            
            console.log(`Статус ответа обновления размера: ${response.status} ${response.statusText}`);
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Ошибка авторизации");
                }
                throw new Error(`Ошибка при обновлении размера: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("Размер товара обновлен:", data);
            
            // Обновляем корзину после изменения размера
            await loadCart();
        } catch (error) {
            console.error("Ошибка обновления размера:", error);
            setError(error.message);
        } finally {
            setLoading(false);
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
        loadCart,
        migrateCartToServer,  // Экспортируем новую функцию
        authStatus: checkAuth()  // Экспортируем текущий статус авторизации
    };
}