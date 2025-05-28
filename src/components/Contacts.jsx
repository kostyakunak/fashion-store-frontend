import React, { useEffect } from "react";
import "../styles/Contacts.css"; // Підключаємо стилі

function Contacts() {
    useEffect(() => {
        fetch("http://localhost:8080/products")
            .then(response => response.json())
            // .then(data => { }) // видалено, блок нічого не робив
            .catch(error => console.error("Помилка завантаження товарів:", error));
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