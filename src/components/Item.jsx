import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/Item.css";
import "../styles/image-modal.css";
import ImageRoller from "../hooks/ImageRoller";
import useImageModal from "../hooks/useImageModal";
import useWishlist from "../hooks/useWishlist";
import { Header } from "../scripts/Header";
import { Footer } from "../scripts/Footer";
import ProductWishlistButton from "./ProductWishlistButton";

function Item() {
    const [product, setProduct] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [availableSizes, setAvailableSizes] = useState([]);
    const [showSizeChart, setShowSizeChart] = useState(false);
    const { toggleWishlistItem } = useWishlist();
    
    const location = useLocation();
    const navigate = useNavigate();
    
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
                
                // Загружаем доступные размеры для товара (теперь публичный endpoint)
                return fetch(`http://localhost:8080/api/public/warehouse/product/${productId}/sizes`);
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
                    setSelectedSize(sizes[0].id);
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
    
    // Функция добавления товара в корзину
    const addToCart = () => {
        if (!selectedSize) {
            alert("Пожалуйста, выберите размер");
            return;
        }
        
        // Получаем userId из localStorage (предполагаем что пользователь авторизован)
        const userId = localStorage.getItem("userId");
        if (!userId) {
            // Если пользователь не авторизован, сохраняем в localStorage
            const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
            const cartItem = {
                productId: product.id,
                sizeId: selectedSize,
                quantity: quantity,
                name: product.name,
                price: product.price,
                imageUrl: product.images && product.images.length > 0 ? product.images[0].imageUrl : null
            };
            
            // Проверяем, есть ли уже такой товар в корзине
            const existingItemIndex = cartItems.findIndex(
                item => item.productId === product.id && item.sizeId === selectedSize
            );
            
            if (existingItemIndex !== -1) {
                // Если товар уже есть, увеличиваем количество
                cartItems[existingItemIndex].quantity += quantity;
            } else {
                // Если товара нет, добавляем его
                cartItems.push(cartItem);
            }
            
            localStorage.setItem("cartItems", JSON.stringify(cartItems));
            alert("Товар добавлен в корзину");
            
            // После добавления переходим в корзину
            navigate("/cart");
            return;
        }
        
        // Если пользователь авторизован, отправляем запрос на сервер
        fetch("http://localhost:8080/api/cart", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            body: JSON.stringify({
                userId: userId,
                productId: product.id,
                sizeId: selectedSize,
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
            console.log("Товар добавлен в корзину:", data);
            alert("Товар добавлен в корзину");
            navigate("/cart");
        })
        .catch(error => {
            console.error("Ошибка добавления в корзину:", error);
            alert(`Ошибка: ${error.message}`);
        });
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
                                {console.log('Product для wishlist:', product)}
                                <ProductWishlistButton product={product} size="md" />
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
                                
                                <div className="size-selection-container">
                                    <div className="size-header">
                                        <h3>Выберите размер</h3>
                                        <button
                                            className="size-chart-button"
                                            onClick={() => setShowSizeChart(true)}
                                        >
                                            Таблица размеров
                                        </button>
                                    </div>
                                    
                                    <div className="size-buttons">
                                        {availableSizes.map(size => {
                                            // Проверяем наличие товара по полю inStock или quantity
                                            const isAvailable = size.inStock === true || (size.quantity != null && size.quantity > 0);
                                            
                                            return (
                                                <button
                                                    key={size.id}
                                                    className={`size-button ${selectedSize === size.id ? "active" : ""} ${!isAvailable ? "disabled" : ""}`}
                                                    onClick={() => isAvailable && setSelectedSize(size.id)}
                                                    disabled={!isAvailable}
                                                    title={!isAvailable ? "Размер отсутствует на складе" : ""}
                                                >
                                                    {size.name}
                                                    {!isAvailable && <span className="out-of-stock-label">❌</span>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                
                                {/* Size Chart Modal */}
                                {showSizeChart && (
                                    <div className="size-chart-modal-overlay" onClick={() => setShowSizeChart(false)}>
                                        <div className="size-chart-modal" onClick={(e) => e.stopPropagation()}>
                                            <div className="size-chart-header">
                                                <h2>Таблица размеров</h2>
                                                <button className="close-button" onClick={() => setShowSizeChart(false)}>×</button>
                                            </div>
                                            <div className="size-chart-content">
                                                <table className="size-chart-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Размер</th>
                                                            <th>Грудь (см)</th>
                                                            <th>Талия (см)</th>
                                                            <th>Бёдра (см)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>XS</td>
                                                            <td>82-85</td>
                                                            <td>65-68</td>
                                                            <td>89-92</td>
                                                        </tr>
                                                        <tr>
                                                            <td>S</td>
                                                            <td>86-89</td>
                                                            <td>69-72</td>
                                                            <td>93-96</td>
                                                        </tr>
                                                        <tr>
                                                            <td>M</td>
                                                            <td>90-93</td>
                                                            <td>73-76</td>
                                                            <td>97-100</td>
                                                        </tr>
                                                        <tr>
                                                            <td>L</td>
                                                            <td>94-97</td>
                                                            <td>77-81</td>
                                                            <td>101-104</td>
                                                        </tr>
                                                        <tr>
                                                            <td>XL</td>
                                                            <td>98-103</td>
                                                            <td>82-87</td>
                                                            <td>105-110</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <button className="add-to-bag" onClick={addToCart}>
                                    Добавить в корзину
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
