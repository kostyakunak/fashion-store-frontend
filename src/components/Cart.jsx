import React from "react";
import "../styles/Cart.css";
import { Header } from "../scripts/Header";
import { Footer } from "../scripts/Footer";
import useCart from "../hooks/useCart"; // Импорт кастомного хука

function Cart() {
    const { cartItems, addToCart, removeFromCart, updateQuantity, total } = useCart(); // Используем хук

    const products = [
        { title: "Album 1", price: 12.99, image: "Images/image1.png" },
        { title: "Album 2", price: 14.99, image: "Images/image2.png" },
        { title: "Album 3", price: 9.99, image: "Images/image3.png" },
        { title: "Album 4", price: 19.99, image: "Images/image4.png" },
        { title: "T-Shirt", price: 19.99, image: "Images/image6.png" },
        { title: "Coffee Cup", price: 6.99, image: "Images/image7.png" },
    ];

    return (
        <div className="cart">
            <Header />
            <main>
                {/* Товары */}
                <section className="container content-section">
                    <h2 className="section-header">MUSIC & MERCH</h2>
                    <div className="shop-items">
                        {products.map((item, index) => (
                            <div className="shop-item" key={index}>
                                <span className="shop-item-title">{item.title}</span>
                                <a href="/item">
                                    <img className="shop-item-image" src={item.image} alt={item.title} />
                                </a>
                                <div className="shop-item-details">
                                    <span className="shop-item-price">${item.price}</span>
                                    <button className="btn shop-item-button" onClick={() => addToCart(item)}>
                                        ADD TO CART
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Корзина */}
                <section className="container content-section">
                    <h2 className="section-header">CART</h2>
                    <div className="cart-row">
                        <span className="cart-item cart-header cart-column">ITEM</span>
                        <span className="cart-price cart-header cart-column">PRICE</span>
                        <span className="cart-quantity cart-header cart-column">QUANTITY</span>
                    </div>
                    <div className="cart-items">
                        {cartItems.map((item, index) => (
                            <div className="cart-row" key={index}>
                                <div className="cart-item cart-column">
                                    <a href="/item">
                                        <img className="cart-item-image" src={item.image} width="100" height="100" alt={item.title} />
                                    </a>
                                    <span className="cart-item-title">{item.title}</span>
                                </div>
                                <span className="cart-price cart-column">${item.price}</span>
                                <div className="cart-quantity cart-column">
                                    <input
                                        className="cart-quantity-input"
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => updateQuantity(item.title, parseInt(e.target.value))}
                                    />
                                    <button className="btn btn-danger" onClick={() => removeFromCart(item.title)}>
                                        REMOVE
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="cart-total">
                        <strong className="cart-total-title">Total</strong>
                        <span className="cart-total-price">${total}</span>
                    </div>
                    <button className="btn btn-purchase">PURCHASE</button>
                </section>
            </main>
            <Footer />
        </div>
    );
}

export default Cart;