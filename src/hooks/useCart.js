import { useState, useEffect, useContext, useCallback, useRef } from "react";
import { getProductSizes } from "../api/productApi";
import axios from "axios";
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
    // Словник доступних розмірів для кожного товару
    const [productSizes, setProductSizes] = useState({});
    const [sizesLoading, setSizesLoading] = useState(false);
    
    // Ref для отслеживания процесса слияния корзины
    const mergingRef = useRef(false);
    
    // Використовуємо AuthContext для отримання даних про користувача
    const auth = useContext(AuthContext);

    // Встановлюємо токен в axios при ініціалізації (один раз)
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }, []);

    // Завантаження кошика при першому рендері або зміні статусу автентифікації
    useEffect(() => {
        loadCart();
    }, [auth.isAuthenticated()]);

    // Оптимізоване завантаження розмірів для товарів
    useEffect(() => {
        if (sizesLoading || loading || cartItems.length === 0) return;

        // Отримуємо id товарів, для яких ще немає розмірів
        const productIdsToLoad = [...new Set(
            cartItems
                .map(item => item.productId)
        )];

        setSizesLoading(true);

        // Завантажуємо розміри тільки для нових товарів
        const idsToFetch = productIdsToLoad.filter(productId => !productSizes[productId]);
        if (idsToFetch.length === 0) {
            setSizesLoading(false);
            return;
        }
        
        Promise.all(idsToFetch.map(productId =>
            getProductSizes(productId)
                .then(sizes => ({ productId, sizes }))
                .catch(error => {
                    console.error(`Помилка при запиті розмірів для продукту ${productId}:`, error);
                    return null;
                })
        )).then(results => {
            let updated = false;
            const newProductSizes = { ...productSizes };
            results.forEach(result => {
                if (result && result.sizes) {
                    console.log(`Завантажено розміри для продукту ${result.productId}:`, result.sizes);
                    newProductSizes[result.productId] = result.sizes;
                    updated = true;
                }
            });
            if (updated) {
                setProductSizes(newProductSizes);
            }
            setSizesLoading(false);
        });
    }, [cartItems, loading, productSizes]); // Включаем productSizes в зависимости

    // Завантаження кошика
    const loadCart = useCallback(() => {
        setLoading(true);
        
        if (auth.isAuthenticated()) {
            // Якщо користувач авторизований, завантажуємо кошик з сервера
            axios.get(`${API_URL}/my`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            .then(response => {
                console.log("Дані кошика:", response.data);
                setCartItems(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Помилка завантаження кошика:", error);
                setError(error.response?.data?.message || error.message);
                setLoading(false);
            });
        } else {
            // Якщо користувач не авторизований, завантажуємо з localStorage
            const localCart = JSON.parse(localStorage.getItem("cartItems") || "[]");
            
            if (localCart.length === 0) {
                setCartItems([]);
                setLoading(false);
                return;
            }
            
            // Перетворюємо дані з localStorage у формат для відображення
            setCartItems(localCart);
            setLoading(false);
        }
    }, [auth]);
    
    // Функція для об'єднання кошика після входу в систему
    const mergeCart = useCallback(async () => {
        if (!auth.isAuthenticated()) return;
        
        // Защита от множественных вызовов
        if (mergingRef.current) {
            console.log("Слияние корзины уже выполняется, игнорируем повторный вызов");
            return;
        }
        
        const localCart = JSON.parse(localStorage.getItem("cartItems") || "[]");
        if (localCart.length === 0) return;
        
        mergingRef.current = true;
        
        try {
            await axios.post(`${API_URL}/merge`, {
                guestCart: localCart
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            // Після успішного об'єднання очищаємо локальний кошик
            localStorage.removeItem("cartItems");
            
            // Перезавантажуємо кошик з сервера
            loadCart();
        } catch (error) {
            console.error("Помилка при об'єднанні кошика:", error);
            setError(error.response?.data?.message || error.message);
        } finally {
            mergingRef.current = false;
        }
    }, [auth, loadCart]);

    // Обновлення суми при зміні кошика
    useEffect(() => {
        setTotal(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2));
    }, [cartItems]);

    // Додати в кошик
    const addToCart = (item) => {
        if (auth.isAuthenticated()) {
            // Якщо користувач авторизований, відправляємо запит на сервер
            axios.post(API_URL, {
                productId: item.productId || item.id,
                sizeId: item.sizeId || 1, // Розмір за замовчуванням, якщо не вказаний
                quantity: 1
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            .then(response => {
                console.log("Товар доданий в кошик:", response.data);
                // Обновляємо кошик після додавання
                loadCart();
            })
            .catch(error => {
                console.error("Помилка додавання в кошик:", error);
                setError(error.response?.data?.message || error.message);
            });
        } else {
            // Якщо користувач не авторизований, зберігаємо в localStorage
            const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
            
            // Створюємо об'єкт товару для додавання в кошик
            const cartItem = {
                id: item.id || Math.random().toString(36).substr(2, 9),
                productId: item.productId || item.id,
                sizeId: item.sizeId || 1,
                quantity: 1,
                name: item.name || item.title,
                price: item.price,
                imageUrl: item.imageUrl || (item.images && item.images.length > 0 ? item.images[0].imageUrl : "https://via.placeholder.com/100")
            };
            
            // Перевіряємо, чи товар вже є в кошику
            const existingItemIndex = cartItems.findIndex(
                existingItem => existingItem.productId === cartItem.productId && existingItem.sizeId === cartItem.sizeId
            );
            
            if (existingItemIndex !== -1) {
                // Якщо товар вже є, збільшуємо кількість
                cartItems[existingItemIndex].quantity += 1;
            } else {
                // Якщо товару немає, додаємо його
                cartItems.push(cartItem);
            }
            
            // Зберігаємо оновлений кошик
            localStorage.setItem("cartItems", JSON.stringify(cartItems));
            setCartItems(cartItems);
        }
    };

    // Видалити з кошика
    const removeFromCart = (itemId) => {
        if (auth.isAuthenticated()) {
            // Якщо користувач авторизований, видаляємо з сервера
            axios.delete(`${API_URL}/${itemId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            .then(response => {
                console.log("Товар видалений з кошика:", response.data);
                // Обновляємо стан, виключаючи видалений елемент
                setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
            })
            .catch(error => {
                console.error("Помилка видалення з кошика:", error);
                setError(error.response?.data?.message || error.message);
            });
        } else {
            // Якщо користувач не авторизований, видаляємо з localStorage
            const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
            const updatedCart = cartItems.filter(item => item.id !== itemId);
            
            localStorage.setItem("cartItems", JSON.stringify(updatedCart));
            setCartItems(updatedCart);
        }
    };

    // Змінити кількість
    const updateQuantity = (itemId, quantity) => {
        if (quantity < 1) return; // Не допускаємо від'ємну кількість
        
        if (auth.isAuthenticated()) {
            // Якщо користувач авторизований, оновлюємо на сервері
            axios.put(`${API_URL}/${itemId}`, {
                quantity: quantity
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            .then(response => {
                console.log("Кількість товару оновлено:", response.data);
                // Обновляємо стан
                setCartItems(prevItems =>
                    prevItems.map(item => item.id === itemId ? {...item, quantity: quantity} : item)
                );
            })
            .catch(error => {
                console.error("Помилка оновлення кількості:", error);
                setError(error.response?.data?.message || error.message);
            });
        } else {
            // Якщо користувач не авторизований, оновлюємо в localStorage
            const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
            const updatedCart = cartItems.map(item =>
                item.id === itemId ? {...item, quantity: quantity} : item
            );
            
            localStorage.setItem("cartItems", JSON.stringify(updatedCart));
            setCartItems(updatedCart);
        }
    };

    // Оновити розмір товару
    const updateSize = (itemId, sizeId) => {
        if (auth.isAuthenticated()) {
            // Якщо користувач авторизований, оновлюємо на сервері
            axios.put(`${API_URL}/${itemId}/size`, {
                sizeId: sizeId
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            .then(response => {
                console.log("Розмір товару оновлено:", response.data);
                // Обновляємо стан
                setCartItems(prevItems =>
                    prevItems.map(item => item.id === itemId ? {...item, sizeId: sizeId} : item)
                );
            })
            .catch(error => {
                console.error("Помилка оновлення розміру:", error);
                setError(error.response?.data?.message || error.message);
            });
        } else {
            // Якщо користувач не авторизований, оновлюємо в localStorage
            const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
            const updatedCart = cartItems.map(item =>
                item.id === itemId ? {...item, sizeId: sizeId} : item
            );
            
            localStorage.setItem("cartItems", JSON.stringify(updatedCart));
            setCartItems(updatedCart);
        }
    };
    
    // Очистити кошик при виході з системи
    const clearCart = () => {
        setCartItems([]);
        setError(null);
    };

    // Отримати доступні розміри для конкретного товару
    const getAvailableSizesForProduct = (productId) => {
        console.log(`Getting sizes for product ${productId}:`, productSizes[productId]);
        
        // Якщо розміри для продукту завантажені, возвращаем их
        if (productSizes[productId]) {
            console.log(`Found sizes for product ${productId}:`, productSizes[productId]);
            // Возвращаем все размеры с правильным статусом доступности
            return productSizes[productId].map(size => ({
                ...size,
                // Используем фактическую доступность размера из базы данных
                inStock: size.inStock !== undefined ? size.inStock : (size.quantity > 0)
            }));
        }
        
        console.log(`No sizes found for product ${productId}, using fallback`);
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
        clearCart,
        productSizes
    };
}