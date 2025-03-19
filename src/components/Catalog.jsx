import React, { useState, useEffect } from "react";

import "../styles/Catalog.css";
import { Header } from "../scripts/Header";
import { Footer } from "../scripts/Footer";

function Catalog() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetch("http://localhost:8080/products") // Запрос к backend'у
            .then(response => response.json())
            .then(data => setProducts(data))
            .catch(error => console.error("Ошибка загрузки товаров:", error));
    }, []);

    const getImageSrc = (productId) => {
        const product = products.find(p => p.id === productId);
        return product && product.images.length > 0 ? product.images[0].imageUrl : "";
    };

    return (
        <div className="catalog">
            <Header />
            <main>
                <div className="product-grid">
                    <div className="product-card column-1">
                        {[1, 2, 3, 4].map(id => (
                            <div key={id} className="card-sizing-type-1">
                                <a href="/item">
                                    <img className="image-source" src={getImageSrc(id)} alt={`Product ${id}`} />
                                </a>
                            </div>
                        ))}
                    </div>

                    <div className="product-card column-2">
                        {[5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(id => (
                            <div key={id} className="card-sizing-type-2">
                                <a href="/item">
                                    <img className="image-source" src={getImageSrc(id)} alt={`Product ${id}`} />
                                </a>
                            </div>
                        ))}
                    </div>

                    <div className="product-card column-3">
                        {[19, 20, 21, 22, 23, 24, 25, 26, 27, 28].map(id => (
                            <div key={id} className="card-sizing-type-3">
                                <a href="/item">
                                    <img className="image-source" src={getImageSrc(id)} alt={`Product ${id}`} />
                                </a>
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