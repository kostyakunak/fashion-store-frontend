import React, { useEffect } from "react";
import "../styles/Contacts.css"; // Подключаем стили

function Contacts() {
    useEffect(() => {
        fetch("http://localhost:8080/products")
            .then(response => response.json())
            // .then(data => { }) // удалено, блок ничего не делал
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