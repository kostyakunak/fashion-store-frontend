import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import "../styles/Home.css";

function Home() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        fetch("http://localhost:8080/products")
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ошибка! Статус: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Полученные данные о продуктах:", data);
                if (Array.isArray(data) && data.length > 0) {
                    // Перемешиваем и берем первые 6 товаров
                    const shuffled = [...data].sort(() => 0.5 - Math.random()).slice(0, 6);
                    setProducts(shuffled);
                } else {
                    console.error("Сервер вернул пустой массив или некорректные данные", data);
                    setProducts([]);
                }
                setLoading(false);
            })
            .catch(error => {
                console.error("Ошибка загрузки товаров:", error);
                setError(error.message);
                setLoading(false);
            });
    }, []);

    return (
        <div className="home">
            <main>
                <h1>Добро пожаловать в наш магазин</h1>
                <nav>
                    <ul>
                        <li><Link to="/catalog">Каталог</Link></li>
                        <li><Link to="/account">Личный кабинет</Link></li>
                        <li><Link to="/cart">Корзина</Link></li>
                        <li><Link to="/wishlist">Избранное</Link></li>
                        <li><Link to="/contacts">Контакты</Link></li>
                        <li><Link to="/admin">Панель администратора</Link></li>
                    </ul>
                </nav>

                <h2>Рекомендуемые товары</h2>
                <div className="product-grid">
                    {loading ? (
                        <p>Загрузка товаров...</p>
                    ) : error ? (
                        <p>Ошибка: {error}</p>
                    ) : products.length > 0 ? (
                        products.map(product => (
                            <div key={product.id} className="product-card">
                                <Link to={`/item?id=${product.id}`}>
                                    <img
                                        className="image-source"
                                        src={product.images && product.images.length > 0 
                                            ? product.images[0].imageUrl 
                                            : "https://via.placeholder.com/150"}
                                        alt={product.name}
                                    />
                                    <h3>{product.name}</h3>
                                    <p className="price">{product.price} руб.</p>
                                </Link>
                            </div>
                        ))
                    ) : (
                        <p>Товары не найдены</p>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Home;