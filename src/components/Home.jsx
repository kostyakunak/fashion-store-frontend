import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import "../styles/Home.css";

function Home() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetch("http://localhost:8080/products")
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    const shuffled = data.sort(() => 0.5 - Math.random()).slice(0, 6);
                    setProducts(shuffled);
                } else {
                    console.error("Ошибка: сервер вернул некорректные данные", data);
                    setProducts([]);
                }
            })
            .catch(error => console.error("Ошибка загрузки товаров:", error));
    }, []);

    return (
        <div className="home">
            <main>
                <h1>Welcome to our store. Pablo</h1>
                <nav>
                    <ul>
                        <li><Link to="/catalog">Catalog</Link></li>
                        <li><Link to="/account">My account</Link></li>
                        <li><Link to="/cart">Cart</Link></li>
                        <li><Link to="/wishlist">Wishlist</Link></li>
                        <li><Link to="/contacts">Contacts</Link></li>
                    </ul>
                </nav>

                <h2>Some products</h2>
                <div className="product-grid">
                    {products.length > 0 ? (
                        products.map(product => (
                            <div key={product.id} className="product-card">
                                <a href={`/item/${product.id}`}>
                                    <img
                                        className="image-source"
                                        src={product.images?.[0]?.imageUrl || "https://via.placeholder.com/150"}
                                        alt={product.name}
                                    />
                                </a>
                                <h3>{product.name}</h3>
                            </div>
                        ))
                    ) : (
                        <p>Loading products...</p>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Home;