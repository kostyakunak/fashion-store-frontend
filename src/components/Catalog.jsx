import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "../styles/Catalog.css";
import { Header } from "../scripts/Header";
import { Footer } from "../scripts/Footer";
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
        fetch("http://localhost:8080/products")
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Загружено товаров:", data.length);
                setProducts(data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Ошибка загрузки товаров:", error);
                setError(error.message);
                setLoading(false);
            });
    }, []);

    // Функция для получения URL изображения товара
    const getImageSrc = (product) => {
        if (product && product.images && product.images.length > 0) {
            return product.images[0].imageUrl || "https://via.placeholder.com/300x400";
        }
        return "https://via.placeholder.com/300x400";
    };

    // Пагинация
    const totalPages = Math.ceil(products.length / CARDS_PER_PAGE);
    const paginatedProducts = products.slice((page - 1) * CARDS_PER_PAGE, page * CARDS_PER_PAGE);

    // Распределяем карточки по колонкам
    const column1Products = paginatedProducts.slice(0, LEFT_COUNT);
    const column2Products = paginatedProducts.slice(LEFT_COUNT, LEFT_COUNT + MIDDLE_COUNT);
    const column3Products = paginatedProducts.slice(LEFT_COUNT + MIDDLE_COUNT, CARDS_PER_PAGE);

    // Выравнивание низов колонок
    useEffect(() => {
        if (!leftRef.current || !middleRef.current || !rightRef.current) return;
        const h1 = leftRef.current.offsetHeight;
        const h2 = middleRef.current.offsetHeight;
        const h3 = rightRef.current.offsetHeight;
        const max = Math.max(h1, h2, h3);
        setFillers({
            left: max - h1,
            middle: max - h2,
            right: max - h3
        });
    }, [column1Products, column2Products, column3Products]);

    if (loading) {
        return (
            <div className="catalog">
                <Header />
                <main>
                    <div className="loading">Загрузка товаров...</div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="catalog">
                <Header />
                <main>
                    <div className="error">Ошибка: {error}</div>
                </main>
                <Footer />
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="catalog">
                <Header />
                <main>
                    <div className="empty-catalog">В каталоге пока нет товаров</div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="catalog">
            <Header />
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
                {/* Пагинация */}
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
            <Footer />
        </div>
    );
}

export default Catalog;