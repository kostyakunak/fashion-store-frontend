import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/Item.css";
import "../styles/image-modal.css";
import ImageRoller from "../hooks/ImageRoller";
import useImageModal from "../hooks/useImageModal";
import { Header } from "../scripts/Header";
import { Footer } from "../scripts/Footer";

function Item() {
    const [product, setProduct] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [availableSizes, setAvailableSizes] = useState([]);
    const [addingToCart, setAddingToCart] = useState(false);
    
    const location = useLocation();
    const navigate = useNavigate();
    const { getAuthData } = useContext(AuthContext);
    
    // Получаем id товара из URL параметров
    const params = new URLSearchParams(location.search);
    const productId = params.get("id");
    
    const {
        imagesRowRef
    } = ImageRoller();

    const {
        isOpen,
        imageSrc,
        modalRef,
        openModal,
        closeModal,
        zoomBox,
        zoomPosition,
        toggleZoomBox,
        updateZoomPosition
    } = useImageModal();

    // Получаем данные о товаре при загрузке страницы
    useEffect(() => {
        if (!productId) {
            setError("Не указан ID товара");
            setLoading(false);
            return;
        }
        
        // Загружаем данные о товаре
        setLoading(true);
        fetch(`http://localhost:8080/products/${productId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ошибка! Статус: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Данные о товаре:", data);
                setProduct(data);
                
                // Загружаем доступные размеры для товара
                return fetch(`http://localhost:8080/warehouse/product/${productId}/sizes`);
            })
            .then(response => {
                if (!response.ok) {
                    // Если ошибка при загрузке размеров, используем временные данные
                    console.error(`Ошибка загрузки размеров: ${response.status}`);
                    const dummySizes = [
                        { id: 2, name: "S" },
                        { id: 3, name: "M" },
                        { id: 4, name: "L" },
                        { id: 5, name: "XL" }
                    ];
                    setAvailableSizes(dummySizes);
                    if (dummySizes.length > 0) {
                        setSelectedSize(dummySizes[0].id);
                    }
                    setLoading(false);
                    return;
                }
                return response.json();
            })
            .then(sizes => {
                if (!sizes) return; // Если использовали временные данные, просто выходим
                
                console.log("Доступные размеры:", sizes);
                setAvailableSizes(sizes);
                if (sizes.length > 0) {
                    // Выбираем первый доступный размер
                    const availableSize = sizes.find(size => size.inStock || size.quantity > 0);
                    if (availableSize) {
                        setSelectedSize(availableSize.id);
                    } else {
                        setSelectedSize(sizes[0].id);
                    }
                }
                setLoading(false);
            })
            .catch(error => {
                console.error("Ошибка загрузки товара:", error);
                setError(error.message);
                setLoading(false);
            });
    }, [productId]);

    const handleMouseMove = (e) => {
        if (!modalRef.current) return;
        const rect = modalRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
            updateZoomPosition(e);
        }
    };
    
    // Функция проверки наличия товара на складе
    const checkAvailability = async (productId, sizeId, quantity) => {
        try {
            const response = await fetch(`http://localhost:8080/warehouse/check?productId=${productId}&sizeId=${sizeId}`);
            if (!response.ok) {
                throw new Error(`HTTP ошибка! Статус: ${response.status}`);
            }
            const data = await response.json();
            return {
                available: data.available,
                quantity: data.quantity,
                hasEnough: data.quantity >= quantity
            };
        } catch (error) {
            console.error("Ошибка проверки наличия товара:", error);
            return { available: false, quantity: 0, hasEnough: false };
        }
    };

    // Функция добавления товара в корзину
    const addToCart = async (product, selectedSize, quantity) => {
        try {
            setAddingToCart(true);
            
            // Проверяем авторизацию через AuthContext
            const authData = getAuthData();
            console.log("Auth status before adding to cart:", authData);
            
            // Проверяем, авторизован ли пользователь
            if (!authData.isAuthenticated) {
                console.log("Пользователь не авторизован, перенаправление на страницу входа");
                alert("Необходимо авторизоваться для добавления товара в корзину");
                setAddingToCart(false);
                navigate("/login");
                return;
            }
            
            // Если пользователь авторизован, отправляем запрос на сервер
            console.log("Пользователь авторизован, отправляем запрос на сервер");
            const requestBody = {
                userId: authData.userId,
                productId: product.id,
                sizeId: selectedSize,
                quantity: quantity
            };
            console.log("Данные запроса:", requestBody);
            
            const response = await fetch("http://localhost:8080/api/cart", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authData.token}`
                },
                body: JSON.stringify(requestBody)
            });
            
            console.log(`Получен ответ: ${response.status} ${response.statusText}`);
            
            if (!response.ok) {
                if (response.status === 401) {
                    console.log("Ошибка авторизации, перенаправление на страницу входа");
                    localStorage.removeItem("token");
                    localStorage.removeItem("userId");
                    localStorage.removeItem("user");
                    navigate("/login");
                    return;
                }
                throw new Error(`Ошибка при добавлении в корзину: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("Товар добавлен в корзину:", data);
            
            // Показываем уведомление об успешном добавлении
            alert("Товар успешно добавлен в корзину!");
            navigate("/cart");
        } catch (error) {
            console.error("Ошибка добавления в корзину:", error);
            alert(`Ошибка: ${error.message}`);
        } finally {
            console.log("=== ЗАВЕРШЕНИЕ ДОБАВЛЕНИЯ В КОРЗИНУ ===");
            setAddingToCart(false);
        }
    };

    // Функция добавления товара в избранное
    const addToWishlist = () => {
        if (!product) return;
        
        // Получаем userId из localStorage (предполагаем что пользователь авторизован)
        const userId = localStorage.getItem("userId");
        if (!userId) {
            // Если пользователь не авторизован, сохраняем в localStorage
            const wishlistItems = JSON.parse(localStorage.getItem("wishlistItems") || "[]");
            const wishlistItem = {
                productId: product.id,
                addedAt: new Date().toISOString()
            };
            
            // Проверяем, есть ли уже такой товар в избранном
            const existingItemIndex = wishlistItems.findIndex(
                item => item.productId === product.id
            );
            
            if (existingItemIndex !== -1) {
                alert("Товар уже есть в избранном");
                return;
            }
            
            // Добавляем товар в избранное
            wishlistItems.push(wishlistItem);
            localStorage.setItem("wishlistItems", JSON.stringify(wishlistItems));
            alert("Товар добавлен в избранное");
            return;
        }
        
        // Если пользователь авторизован, отправляем запрос на сервер
        fetch("http://localhost:8080/wishlist", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId: userId,
                productId: product.id
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ошибка! Статус: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Ответ сервера:", data);
            if (data.success) {
                alert(data.message);
            } else {
                alert("Ошибка при добавлении товара в избранное");
            }
        })
        .catch(error => {
            console.error("Ошибка добавления в избранное:", error);
            alert(`Ошибка: ${error.message}`);
        });
    };

    // После useEffect, который загружает данные о товаре, добавляем функцию для фильтрации размеров
    const getAvailableSizes = () => {
        if (!availableSizes) return [];
        // Фильтруем только те размеры, которые доступны на складе
        return availableSizes.filter(size => size.inStock || size.quantity > 0);
    };

    return (
        <div className="item">
            <Header />
            <main>
                {loading ? (
                    <div className="loading">Загрузка товара...</div>
                ) : error ? (
                    <div className="error">Ошибка: {error}</div>
                ) : product ? (
                    <div className="product-item">
                        <div className="product-card">
                            <h1>{product.name}</h1>

                            <div className="images-row" ref={imagesRowRef}>
                                {product.images && product.images.length > 0 ? 
                                    product.images.map((img, index) => (
                                        <div className={`card-sizing ${index === 0 ? "active" : "inactive"}`} key={index}>
                                            <img
                                                src={img.imageUrl}
                                                alt={product.name}
                                                className="thumbnail"
                                                onClick={() => openModal(img.imageUrl)}
                                            />
                                        </div>
                                    )) : (
                                        <div className="card-sizing active">
                                            <img
                                                src="https://via.placeholder.com/400"
                                                alt="Нет изображения"
                                                className="thumbnail"
                                            />
                                        </div>
                                    )
                                }
                            </div>

                            {/* Модальное окно */}
                            {isOpen && (
                                <div className="image-modal-overlay" onClick={closeModal}>
                                    <div className="image-modal-content" ref={modalRef} onClick={(e) => e.stopPropagation()}>
                                        <span className="close" onClick={closeModal}>&times;</span>
                                        <img
                                            src={imageSrc}
                                            alt="Full Size"
                                            onClick={toggleZoomBox}
                                            onMouseMove={handleMouseMove}
                                        />
                                        {zoomBox && (
                                            <div
                                                className="zoom-box"
                                                style={{
                                                    width: "50%",
                                                    height: "50vh",
                                                    position: "absolute",
                                                    top: `${Math.min(Math.max(zoomPosition.y - 100, 0), modalRef.current.clientHeight - 100)}px`,
                                                    left: `${Math.min(Math.max(zoomPosition.x - 100, 0), modalRef.current.clientWidth - 100)}px`,
                                                    backgroundImage: `url(${imageSrc})`,
                                                    backgroundSize: "200%",
                                                    backgroundPosition: `${-zoomPosition.x * 2}px ${-zoomPosition.y * 2}px`,
                                                    pointerEvents: "none"
                                                }}
                                            ></div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="price-wishlist-container">
                                <div className="cost">{product.price} руб.</div>
                                <button className="wishlist-button" onClick={addToWishlist}>♥</button>
                            </div>

                            <div className="details-container">
                                <div className="details-left">
                                    <div className="product-details">
                                        <h3>Описание товара</h3>
                                        <p>{product.productDetails}</p>
                                    </div>
                                </div>
                                <div className="details-right">
                                    <div className="measurements-container">
                                        <h3>Параметры</h3>
                                        <p>{product.measurements}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="purchase-container">
                                <div className="quantity-controls">
                                    <button onClick={() => quantity > 1 && setQuantity(quantity - 1)}>-</button>
                                    <span>{quantity}</span>
                                    <button onClick={() => setQuantity(quantity + 1)}>+</button>
                                </div>
                                
                                <div className="size-buttons">
                                    {availableSizes.map(size => {
                                        // Исправляем проверку наличия товара
                                        const isAvailable = size.inStock || (size.quantity > 0);
                                        
                                        return (
                                            <button 
                                                key={size.id}
                                                className={`size-button ${selectedSize === size.id ? "active" : ""} ${!isAvailable ? "disabled" : ""}`}
                                                onClick={() => isAvailable && setSelectedSize(size.id)}
                                                disabled={!isAvailable}
                                                title={!isAvailable ? "Размер отсутствует на складе" : `В наличии: ${size.quantity} шт.`}
                                            >
                                                {size.name}
                                                {!isAvailable && <span className="out-of-stock-label">❌</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button 
                                    className="add-to-bag" 
                                    onClick={() => addToCart(product, selectedSize, quantity)} 
                                    disabled={addingToCart || !selectedSize}
                                >
                                    {addingToCart ? "Добавление..." : "Добавить в корзину"}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="not-found">Товар не найден</div>
                )}
            </main>
            <Footer />
        </div>
    );
}

export default Item;
