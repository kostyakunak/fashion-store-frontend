import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import "../styles/Catalog.css";
import ProductWishlistButton from "./ProductWishlistButton";
import useWishlist from "../hooks/useWishlist";

const CARDS_PER_PAGE = 28;
const LEFT_COUNT = 4; // 2x2
const MIDDLE_COUNT = 14; // 7x2

function Catalog() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isInWishlist } = useWishlist();
    const [page, setPage] = useState(1);
    const leftRef = useRef(null);
    const middleRef = useRef(null);
    const rightRef = useRef(null);
    const [fillers, setFillers] = useState({ left: 0, middle: 0, right: 0 });

    useEffect(() => {
        setLoading(true);
        fetch(`${process.env.REACT_APP_API_URL || "http://localhost:8080"}/products`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Завантажено товарів:", data.length);
                setProducts(data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Помилка завантаження товарів:", error);
                setError(error.message);
                setLoading(false);
            });
    }, []);

    // Функція для отримання URL зображення товару
    const getImageSrc = (product) => {
        if (product && product.images && product.images.length > 0) {
            return product.images[0].imageUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=400&fit=crop&crop=center";
        }
        return "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=400&fit=crop&crop=center";
    };

    // Пагінація
    const totalPages = Math.ceil(products.length / CARDS_PER_PAGE);
    const paginatedProducts = products.slice((page - 1) * CARDS_PER_PAGE, page * CARDS_PER_PAGE);

    // Розподіляємо картки по колонках
    const column1Products = useMemo(() => paginatedProducts.slice(0, LEFT_COUNT), [paginatedProducts]);
    const column2Products = useMemo(() => paginatedProducts.slice(LEFT_COUNT, LEFT_COUNT + MIDDLE_COUNT), [paginatedProducts]);
    const column3Products = useMemo(() => paginatedProducts.slice(LEFT_COUNT + MIDDLE_COUNT, CARDS_PER_PAGE), [paginatedProducts]);

    // Вирівнювання низу колонок - тимчасово відключено
    // useEffect(() => {
    //     if (!leftRef.current || !middleRef.current || !rightRef.current) return;
    //     const h1 = leftRef.current.offsetHeight;
    //     const h2 = middleRef.current.offsetHeight;
    //     const h3 = rightRef.current.offsetHeight;
    //     const max = Math.max(h1, h2, h3);
    //     setFillers({
    //         left: max - h1,
    //         middle: max - h2,
    //         right: max - h3
    //     });
    // }, [column1Products, column2Products, column3Products]);

    if (loading) {
        return (
            <div className="catalog">
                <main>
                    <div className="loading">Завантаження товарів...</div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="catalog">
                <main>
                    <div className="error">Помилка: {error}</div>
                </main>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="catalog">
                <main>
                    <div className="empty-catalog">У каталозі поки що немає товарів</div>
                </main>
            </div>
        );
    }

    return (
        <div className="catalog">
            <main>
                <div className="product-grid">
                    <div className="product-card column-1" ref={leftRef}>
                        {column1Products.map(product => (
                            <div key={product.id} className="card-sizing-type-1">
                                <div className="product-card-content">
                                    <Link to={`/item?id=${product.id}`}>
                                        <img
                                            className="image-source"
                                            src={getImageSrc(product)}
                                            alt={product.name}
                                            loading="lazy"
                                        />
                                    </Link>
                                    <div className="product-card-actions">
                                        <ProductWishlistButton product={product} className={isInWishlist(product.id) ? "in-wishlist" : ""} />
                                    </div>
                                </div>
                            </div>
                        ))}
                        {fillers.left > 0 && <div style={{ height: fillers.left }} />}
                    </div>
                    <div className="product-card column-2" ref={middleRef}>
                        {column2Products.map(product => (
                            <div key={product.id} className="card-sizing-type-2">
                                <div className="product-card-content">
                                    <Link to={`/item?id=${product.id}`}>
                                        <img
                                            className="image-source"
                                            src={getImageSrc(product)}
                                            alt={product.name}
                                            loading="lazy"
                                        />
                                    </Link>
                                    <div className="product-card-actions">
                                        <ProductWishlistButton product={product} className={isInWishlist(product.id) ? "in-wishlist" : ""} />
                                    </div>
                                </div>
                            </div>
                        ))}
                        {fillers.middle > 0 && <div style={{ height: fillers.middle }} />}
                    </div>
                    <div className="product-card column-3" ref={rightRef}>
                        {column3Products.map(product => (
                            <div key={product.id} className="card-sizing-type-3">
                                <div className="product-card-content">
                                    <Link to={`/item?id=${product.id}`}>
                                        <img
                                            className="image-source"
                                            src={getImageSrc(product)}
                                            alt={product.name}
                                            loading="lazy"
                                        />
                                    </Link>
                                    <div className="product-card-actions">
                                        <ProductWishlistButton product={product} className={isInWishlist(product.id) ? "in-wishlist" : ""} />
                                    </div>
                                </div>
                            </div>
                        ))}
                        {fillers.right > 0 && <div style={{ height: fillers.right }} />}
                    </div>
                </div>
                {/* Пагінація */}
                {totalPages > 1 && (
                    <div className="pagination">
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i + 1}
                                className={page === i + 1 ? "active" : ""}
                                onClick={() => setPage(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default Catalog;