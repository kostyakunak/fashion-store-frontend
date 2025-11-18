import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_CONFIG } from '../config/apiConfig';
import "../styles/Item.css";
import "../styles/image-modal.css";
import ImageRoller from "../hooks/ImageRoller";
import useImageModal from "../hooks/useImageModal";
import useWishlist from "../hooks/useWishlist";
import { Header } from "../scripts/Header";
import ProductWishlistButton from "./ProductWishlistButton";

function Item() {
    const [product, setProduct] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [availableSizes, setAvailableSizes] = useState([]);
    const [showSizeChart, setShowSizeChart] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);
    const addToCartRef = useRef(false);
    const { toggleWishlistItem } = useWishlist();
    
    const location = useLocation();
    const navigate = useNavigate();
    
    // Отримуємо id товару з URL параметрів
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

    // Отримуємо дані про товар при завантаженні сторінки
    useEffect(() => {
        if (!productId) {
            setError("Не вказано ID товару");
            setLoading(false);
            return;
        }
        // Завантажуємо дані про товар
        setLoading(true);
        fetch(`${API_CONFIG.PRODUCTS_URL}/${productId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP помилка! Статус: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Дані про товар:", data);
                setProduct(data);
                // Завантажуємо доступні розміри для товару (тепер публічний endpoint)
                return fetch(`${API_CONFIG.PUBLIC_API_URL}/warehouse/product/${productId}/sizes`);
            })
            .then(response => {
                if (!response.ok) {
                    // Якщо помилка при завантаженні розмірів, використовуємо тимчасові дані
                    console.error(`Помилка завантаження розмірів: ${response.status}`);
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
                if (!sizes) return; // Якщо використовували тимчасові дані, просто виходимо
                console.log("Доступні розміри:", sizes);
                setAvailableSizes(sizes);
                if (sizes.length > 0) {
                    setSelectedSize(sizes[0].id);
                }
                setLoading(false);
            })
            .catch(error => {
                console.error("Помилка завантаження товару:", error);
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
    
    // Функція додавання товару в кошик
    const addToCart = () => {
        if (!selectedSize) {
            alert("Будь ласка, оберіть розмір");
            return;
        }
        
        console.log(`Adding to cart: productId=${product.id}, sizeId=${selectedSize}, quantity=${quantity}`);
        
        // Захист від множинних викликів
        if (addToCartRef.current) {
            console.log("Додавання в корзину вже виконується, ігноруємо повторний виклик");
            return;
        }
        
        addToCartRef.current = true;
        setAddingToCart(true);
        
        // Отримуємо userId з localStorage (передбачається, що користувач авторизований)
        const userId = localStorage.getItem("userId");
        if (!userId) {
            // Якщо користувач не авторизований, зберігаємо в localStorage
            const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
            const cartItem = {
                productId: product.id,
                sizeId: selectedSize,
                quantity: quantity,
                name: product.name,
                price: product.price,
                imageUrl: product.images && product.images.length > 0 ? product.images[0].imageUrl : null
            };
            // Перевіряємо, чи є вже такий товар у кошику
            const existingItemIndex = cartItems.findIndex(
                item => item.productId === product.id && item.sizeId === selectedSize
            );
            if (existingItemIndex !== -1) {
                // Якщо товар вже є, збільшуємо кількість
                cartItems[existingItemIndex].quantity += quantity;
            } else {
                // Якщо товару немає, додаємо його
                cartItems.push(cartItem);
            }
            localStorage.setItem("cartItems", JSON.stringify(cartItems));
            alert("Товар додано до кошика");
            // Після додавання переходимо в кошик
            navigate("/cart");
            addToCartRef.current = false;
            setAddingToCart(false);
            return;
        }
        // Якщо користувач авторизований, надсилаємо запит на сервер
        fetch(`${API_CONFIG.API_URL}/cart`, {
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
                throw new Error(`HTTP помилка! Статус: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Товар додано до кошика:", data);
            alert("Товар додано до кошика");
            navigate("/cart");
        })
        .catch(error => {
            console.error("Помилка додавання до кошика:", error);
            alert(`Помилка: ${error.message}`);
        })
        .finally(() => {
            addToCartRef.current = false;
            setAddingToCart(false);
        });
    };

    return (
        <div className="item">
            <Header />
            <main>
                {loading ? (
                    <div className="loading">Завантаження товару...</div>
                ) : error ? (
                    <div className="error">Помилка: {error}</div>
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
                                                alt="Немає зображення"
                                                className="thumbnail"
                                            />
                                        </div>
                                    )
                                }
                            </div>

                            {/* Модальне вікно */}
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
                                <div className="cost">{product.price} грн.</div>
                                {console.log('Product для wishlist:', product)}
                                <ProductWishlistButton product={product} size="md" />
                            </div>

                            <div className="details-container">
                                <div className="details-left">
                                    <div className="product-details">
                                        <h3>Опис товару</h3>
                                        <div style={{ whiteSpace: 'pre-line', textAlign: 'left' }}>
                                            {product.description || 'Опис товару не вказаний'}
                                        </div>
                                    </div>
                                </div>
                                <div className="details-right">
                                    <div className="measurements-container">
                                        <h3>Деталі товару</h3>
                                        <div style={{ whiteSpace: 'pre-line', textAlign: 'right' }}>
                                            {product.productDetails || 'Деталі не вказані'}
                                        </div>
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
                                        <h3>Оберіть розмір</h3>
                                        <button
                                            className="size-chart-button"
                                            onClick={() => setShowSizeChart(true)}
                                        >
                                            Таблиця розмірів
                                        </button>
                                    </div>
                                    
                                    <div className="size-buttons">
                                        {availableSizes.map(size => {
                                            console.log(`Size for product ${product.id}:`, size);
                                            // Проверяем наличие товара по полю inStock или quantity
                                            const isAvailable = size.inStock === true || (size.quantity != null && size.quantity > 0);
                                            
                                            return (
                                                <button
                                                    key={size.id}
                                                    className={`size-button ${selectedSize === size.id ? "active" : ""} ${!isAvailable ? "disabled" : ""}`}
                                                    onClick={() => {
                                                        console.log(`Selecting size ${size.id} (${size.name}) for product ${product.id}`);
                                                        isAvailable && setSelectedSize(size.id);
                                                    }}
                                                    disabled={!isAvailable}
                                                    title={!isAvailable ? "Розмір відсутній на складі" : ""}
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
                                                <h2>Таблиця розмірів</h2>
                                                <button className="close-button" onClick={() => setShowSizeChart(false)}>×</button>
                                            </div>
                                            <div className="size-chart-content">
                                                <table className="size-chart-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Розмір</th>
                                                            <th>Груди (см)</th>
                                                            <th>Талія (см)</th>
                                                            <th>Стегна (см)</th>
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
                                <button 
                                    className="add-to-bag" 
                                    onClick={addToCart}
                                    disabled={addingToCart}
                                >
                                    {addingToCart ? "Додавання..." : "Додати до кошика"}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="not-found">Товар не знайдено</div>
                )}
            </main>
        </div>
    );
}

export default Item;
