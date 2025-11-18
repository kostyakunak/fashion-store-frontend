import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import { AuthContext } from "../context/AuthContext";

import "../styles/Home.css";

function Home() {
    const { user, isAdmin } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        fetch(`${process.env.REACT_APP_API_URL || "http://localhost:8080"}/products`)
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
                <Navbar />
                
                <div className="content-wrapper">
                    <div className="product-grid">
                        {loading ? (
                            <p>Завантаження товарів...</p>
                        ) : error ? (
                            <p>Помилка: {error}</p>
                        ) : products.length > 0 ? (
                            products.map(product => (
                                <div key={product.id} className="product-card">
                                    <Link to={`/item?id=${product.id}`}>
                                        <img
                                            className="image-source"
                                            src={product.images && product.images.length > 0 
                                                ? product.images[0].imageUrl 
                                                : "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=150&h=150&fit=crop&crop=center"}
                                            alt={product.name}
                                        />
                                        <h3>{product.name}</h3>
                                        <p className="price">{product.price} руб.</p>
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <p>Товари не знайдені</p>
                        )}
                    </div>

                    <nav>
                        <ul>
                            <li><Link to="/catalog">Каталог</Link></li>
                            <li><Link to="/account">Особистий кабінет</Link></li>
                            <li><Link to="/cart">Кошик</Link></li>
                            <li><Link to="/wishlist">Обране</Link></li>
                            <li><Link to="/contacts">Контакти</Link></li>
                            {user && isAdmin() && (
                                <li><Link to="/admin">Панель адміністратора</Link></li>
                            )}
                        </ul>
                    </nav>
                </div>
            </main>
        </div>
    );
}

export default Home;