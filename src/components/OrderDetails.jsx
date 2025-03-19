import React from "react";

import "../styles/OrderDetails.css";
import {Footer} from "../scripts/Footer";
import {Header} from "../scripts/Header"; // Подключаем стили

function OrderDetails() {
    return (
        <div className="order_details">
            <Header />
        <main>

            <div className="status">
                <h3>Status: Completed</h3>
                <p>Delivered on January 20th, 2024</p>
                <button
                    className="buttonclass"
                    onClick={() =>
                        window.location.href =
                            "https://parcelsapp.com/en/tracking/520125015802587010099746"
                    }
                >
                    Track your parcel
                </button>
            </div>

            <div className="delivery-item-container">
                <div className="item-images">
                    <a href="/item">
                        <img src="/images/image1.png" alt="Product" />
                    </a>
                    <a href="/item">
                        <img src="/images/image1.png" alt="Product" />
                    </a>
                    <a href="/item">
                        <img src="/images/image1.png" alt="Product" />
                    </a>
                </div>

                <div className="delivery-address">
                    <h3>Delivery address</h3>
                    <p>
                        Olena Kunak,<br />
                        ulica Wiktorska 13/15<br />
                        mieszkanie 16<br />
                        Warszawa, 02-587<br />
                        Mazowieckie<br />
                        Polska<br />
                        725499088
                    </p>
                </div>
            </div>

        </main>
            <Footer />
            </div>
    );
}

export default OrderDetails;