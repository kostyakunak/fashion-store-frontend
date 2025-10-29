import React, { useState, useEffect, useRef, useMemo } from "react";
import "../styles/Catalog.css";
import AnimatedColumn from "./AnimatedColumn";
import useResponsiveAnimation from "../hooks/useResponsiveAnimation";
import useInfiniteScroll from "../hooks/useInfiniteScroll";

function Catalog() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { deviceType, getAnimationConfig } = useResponsiveAnimation();

    // Minimum products per column for proper animation
    const MIN_PRODUCTS_PER_COLUMN = 5;

    // Use all products instead of pagination for infinite scroll
    const allProducts = products;

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

    // Column balancing logic: ensure each column has minimum products for proper animation
    const balancedColumns = useMemo(() => {
        const totalProducts = allProducts.length;

        if (totalProducts === 0) {
            return [[], [], []];
        }

        // If we don't have enough products for minimum per column, cycle through existing ones
        if (totalProducts < MIN_PRODUCTS_PER_COLUMN * 3) {
            const cyclesNeeded = Math.ceil((MIN_PRODUCTS_PER_COLUMN * 3) / totalProducts);
            const cycledProducts = Array.from({ length: cyclesNeeded }, () => allProducts).flat();

            return [
                cycledProducts.slice(0, MIN_PRODUCTS_PER_COLUMN),
                cycledProducts.slice(MIN_PRODUCTS_PER_COLUMN, MIN_PRODUCTS_PER_COLUMN * 2),
                cycledProducts.slice(MIN_PRODUCTS_PER_COLUMN * 2, MIN_PRODUCTS_PER_COLUMN * 3),
            ];
        }

        // Distribute evenly when we have enough products
        const productsPerColumn = Math.floor(totalProducts / 3);
        const remainder = totalProducts % 3;

        return [
            allProducts.slice(0, productsPerColumn + (remainder > 0 ? 1 : 0)),
            allProducts.slice(productsPerColumn + (remainder > 0 ? 1 : 0), productsPerColumn * 2 + (remainder > 1 ? 1 : 0)),
            allProducts.slice(productsPerColumn * 2 + (remainder > 1 ? 1 : 0)),
        ];
    }, [allProducts, MIN_PRODUCTS_PER_COLUMN]);

    const [column1Products, column2Products, column3Products] = balancedColumns;

    // Calculate the maximum height across all columns to ensure equal heights
    const maxColumnHeight = Math.max(
        column1Products.length * 200,
        column2Products.length * 200,
        column3Products.length * 200
    );

    if (loading) {
        return (
            <div className="catalog">
                <main>
                    <div className="loading">Завантаження товарів...</div>
                    <div className="product-grid loading">
                        <div className="product-card column-1 loading-skeleton">
                            <div className="loading-shimmer"></div>
                        </div>
                        <div className="product-card column-2 loading-skeleton">
                            <div className="loading-shimmer"></div>
                        </div>
                        <div className="product-card column-3 loading-skeleton">
                            <div className="loading-shimmer"></div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="catalog">
                <main>
                    <div className="error">
                        <div>Помилка завантаження товарів: {error}</div>
                        <button
                            onClick={() => {
                                setError(null);
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
                            }}
                            style={{
                                marginTop: '1rem',
                                padding: '0.5rem 1rem',
                                background: '#243047',
                                color: '#f7f7f7',
                                border: '1px solid rgba(36, 48, 71, 0.6)',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Спробувати знову
                        </button>
                    </div>
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
                    <AnimatedColumn
                        products={column1Products}
                        cardType="card-sizing-type-1"
                        speed={getAnimationConfig(1).speed}
                        direction={getAnimationConfig(1).direction}
                        height={maxColumnHeight}
                    />
                    <AnimatedColumn
                        products={column2Products}
                        cardType="card-sizing-type-2"
                        speed={getAnimationConfig(2).speed}
                        direction={getAnimationConfig(2).direction}
                        height={maxColumnHeight}
                    />
                    <AnimatedColumn
                        products={column3Products}
                        cardType="card-sizing-type-3"
                        speed={getAnimationConfig(3).speed}
                        direction={getAnimationConfig(3).direction}
                        height={maxColumnHeight}
                    />
                </div>
            </main>
        </div>
    );
}

export default Catalog;