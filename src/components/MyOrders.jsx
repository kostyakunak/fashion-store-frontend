import React from "react";
import "../styles/MyOrders.css"; // Подключаем стили
import {Header} from "../scripts/Header";
import {Footer} from "../scripts/Footer";
function MyOrders() {
    return (
        <div className="my_orders">
            <Header />
            <main>
                <section className="container content-section">
                    <div className="order-list">
                        {/* Заказ 1 */}
                        <div className="order-item">
                            <a href="/item">
                                <img className="order-image" src="Images/image1.png" alt="Order" />
                            </a>
                            <div className="order-details">
                                <h3 className="order-title">Album 1</h3>
                                <p className="order-price">$12.99</p>
                                <p className="order-quantity">Quantity: 1</p>
                            </div>
                            <button className="order-button" onClick={() => window.location.href = '/order-details'}>
                                Order Details
                            </button>
                        </div>
                        <div className="order-divider"></div>

                        {/* Заказ 2 */}
                        <div className="order-item">
                            <a href="/item">
                                <img className="order-image" src="Images/image2.png" alt="Order" />
                            </a>
                            <div className="order-details">
                                <h3 className="order-title">Album 2</h3>
                                <p className="order-price">$14.99</p>
                                <p className="order-quantity">Quantity: 2</p>
                            </div>
                            <button className="order-button" onClick={() => window.location.href = '/order-details'}>
                                Order Details
                            </button>
                        </div>
                        <div className="order-divider"></div>

                        {/* Заказ 3 */}
                        <div className="order-item">
                            <a href="/item">
                                <img className="order-image" src="Images/image3.png" alt="Order" />
                            </a>
                            <div className="order-details">
                                <h3 className="order-title">Album 3</h3>
                                <p className="order-price">$9.99</p>
                                <p className="order-quantity">Quantity: 3</p>
                            </div>
                            <button className="order-button" onClick={() => window.location.href = '/order-details'}>
                                Order Details
                            </button>
                        </div>
                    </div>
                </section>
            </main>
                <Footer />
        </div>
    );
}

export default MyOrders;