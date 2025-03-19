import React, { useState, useEffect } from "react";
import { Header } from "../scripts/Header";
import { Footer } from "../scripts/Footer";
import "../styles/Wishlist.css";

function Wishlist() {
    const [wishlist, setWishlist] = useState([]);

    useEffect(() => {
        fetch("http://localhost:8080/products") // Запрос к backend'у
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setWishlist(data);
                } else {
                    console.error("Ошибка: сервер вернул некорректные данные", data);
                    setWishlist([]);
                }
            })
            .catch(error => console.error("Ошибка загрузки вишлиста:", error));
    }, []);

    return (
        <div className="wishlist">
            <Header />
            <main>
                <h1>Wishlist</h1>
                <div className="item-grid">
                    {wishlist.length > 0 ? (
                        wishlist.map(item => (
                            <a key={item.id} href={`/item/${item.id}`}>
                                <img src={item.images.length > 0 ? item.images[0].imageUrl : ""} alt="Wishlist item" loading="lazy" />
                            </a>
                        ))
                    ) : (
                        <p>Ваш вишлист пуст</p>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default Wishlist;