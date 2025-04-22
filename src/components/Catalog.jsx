import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/Catalog.css";
import { Header } from "../scripts/Header";
import { Footer } from "../scripts/Footer";

function Catalog() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    // Разделяем товары на три колонки
    const splitProductsByColumns = () => {
        if (!products || products.length === 0) return [[], [], []];

        // Распределяем товары по колонкам с сохранением пропорций оригинального макета
        const totalProducts = products.length;
        const column1Count = Math.max(Math.floor(totalProducts * 0.15), 1); // ~15% в первой колонке
        const column3Count = Math.max(Math.floor(totalProducts * 0.35), 1); // ~35% в третьей колонке
        const column2Count = totalProducts - column1Count - column3Count; // остальные во второй колонке

        return [
            products.slice(0, column1Count),
            products.slice(column1Count, column1Count + column2Count),
            products.slice(column1Count + column2Count)
        ];
    };

    const [column1Products, column2Products, column3Products] = splitProductsByColumns();

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
                    <div className="product-card column-1">
                        {column1Products.map(product => (
                            <div key={product.id} className="card-sizing-type-1">
                                <Link to={`/item?id=${product.id}`}>
                                    <img 
                                        className="image-source" 
                                        src={getImageSrc(product)} 
                                        alt={product.name} 
                                        loading="lazy"
                                    />
                                </Link>
                            </div>
                        ))}
                    </div>

                    <div className="product-card column-2">
                        {column2Products.map(product => (
                            <div key={product.id} className="card-sizing-type-2">
                                <Link to={`/item?id=${product.id}`}>
                                    <img 
                                        className="image-source" 
                                        src={getImageSrc(product)} 
                                        alt={product.name} 
                                        loading="lazy"
                                    />
                                </Link>
                            </div>
                        ))}
                    </div>

                    <div className="product-card column-3">
                        {column3Products.map(product => (
                            <div key={product.id} className="card-sizing-type-3">
                                <Link to={`/item?id=${product.id}`}>
                                    <img 
                                        className="image-source" 
                                        src={getImageSrc(product)} 
                                        alt={product.name} 
                                        loading="lazy"
                                    />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default Catalog;