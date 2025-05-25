import React, { useEffect, useState } from "react";
import "../styles/Contacts.css"; // Подключаем стили
import { Header } from "../scripts/Header";
import { Footer } from "../scripts/Footer";

function Contacts() {
    const [randomImage, setRandomImage] = useState(null);

    useEffect(() => {
        fetch("http://localhost:8080/products")
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    // Выбираем один случайный товар
                    const randomProduct = data[Math.floor(Math.random() * data.length)];
                    setRandomImage(randomProduct.images.length > 0 ? randomProduct.images[0].imageUrl : null);
                } else {
                    console.error("Ошибка: сервер вернул некорректные данные", data);
                    setRandomImage(null);
                }
            })
            .catch(error => console.error("Ошибка загрузки товаров:", error));
    }, []);

    return (
        <div className="contacts">
            <div className="content">
                <div className="justify-container">
                    <p>E-MAIL:</p>
                    <p>
                        <a href="/item">
                            <img src="images/instagram.png" alt="Instagram" />
                        </a>
                        INSTAGRAM:
                    </p>
                    <p>
                        <a href="/item">
                            <img src="images/tiktok.png" alt="TikTok" />
                        </a>
                        TIKTOK:
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Contacts;