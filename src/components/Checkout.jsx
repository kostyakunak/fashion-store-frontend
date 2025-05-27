import React, { useContext, useEffect, useState } from "react";
import "../styles/AccountDetails.css";
import { Header } from "../scripts/Header";
import { Footer } from "../scripts/Footer";
import useCart from "../hooks/useCart";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AddressSelector from "./AddressSelector";

const Checkout = () => {
    const { cartItems, total, loading, getAvailableSizesForProduct } = useCart();
    const isCartEmpty = !cartItems || cartItems.length === 0;

    const auth = useContext(AuthContext);
    const userId = auth?.getUserId ? auth.getUserId() : null;
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState('CARD');
    const paymentOptions = [
        { value: 'CARD', label: 'Карта' },
        { value: 'CASH_ON_DELIVERY', label: 'Наложенный платёж' },
        { value: 'PICKUP', label: 'Самовывоз' }
    ];

    const navigate = useNavigate();
    const [orderLoading, setOrderLoading] = useState(false);
    const [orderError, setOrderError] = useState(null);
    const { clearCart } = useCart();

    useEffect(() => {
        // console.log('Checkout userId:', userId); // удалено
    }, [userId]);

    const handleOrder = async () => {
        setOrderLoading(true);
        setOrderError(null);
        try {
            const payload = {
                addressId: selectedAddressId,
                paymentMethod: selectedPayment,
                items: cartItems.map(item => ({
                    productId: item.productId,
                    sizeId: item.sizeId,
                    quantity: item.quantity,
                    price: item.price
                }))
            };
            const token = localStorage.getItem('token');
            await axios.post("http://localhost:8080/api/orders", payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            clearCart();
            navigate("/my-orders");
        } catch (e) {
            setOrderError(e.response?.data?.error || e.message || "Ошибка оформления заказа");
        } finally {
            setOrderLoading(false);
        }
    };

    // Функция для получения названия размера по id
    const getSizeName = (item) => {
        const sizes = getAvailableSizesForProduct(item.productId);
        const size = sizes.find(s => s.id === item.sizeId);
        return size ? size.name : item.sizeId;
    };

    if (!userId) {
        return (
            <div className="account-details">
                <Header />
                <div className="layout-container">
                    <main>
                        <p>Загрузка профиля...</p>
                    </main>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="account-details">
            <Header />
            <div className="layout-container">
                <main>
                    <section className="account-section">
                        <h2>Оформление заказа</h2>
                        {/* Список товаров */}
                        <div className="field">
                            <label>Товары в заказе</label>
                            <div className="checkout-items-list">
                                {loading ? (
                                    <p style={{ opacity: 0.7 }}>Загрузка...</p>
                                ) : isCartEmpty ? (
                                    <p style={{ opacity: 0.7 }}>Корзина пуста</p>
                                ) : (
                                    cartItems.map((item, idx) => (
                                        <div key={idx} className="checkout-item" style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                                            <img src={item.imageUrl} alt={item.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, marginRight: 12 }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 500 }}>{item.name}</div>
                                                <div style={{ fontSize: 13, opacity: 0.7 }}>Размер: {getSizeName(item)}</div>
                                            </div>
                                            <div style={{ minWidth: 60, textAlign: 'right' }}>{item.quantity} × {item.price} ₽</div>
                                            <div style={{ minWidth: 70, textAlign: 'right', marginLeft: 16, fontWeight: 500 }}>{(item.price * item.quantity).toFixed(2)} ₽</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="account-section">
                        <h2>Адрес доставки</h2>
                        <div className="field">
                            <AddressSelector
                                userId={userId}
                                selectedAddressId={selectedAddressId}
                                onSelect={setSelectedAddressId}
                            />
                        </div>
                    </section>

                    <section className="account-section">
                        <h2>Способ оплаты</h2>
                        <div className="field">
                            {paymentOptions.map(opt => (
                                <label key={opt.value} style={{ display: 'block', marginBottom: 8, cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value={opt.value}
                                        checked={selectedPayment === opt.value}
                                        onChange={() => setSelectedPayment(opt.value)}
                                        style={{ marginRight: 8 }}
                                    />
                                    {opt.label}
                                </label>
                            ))}
                        </div>
                    </section>

                    <section className="account-section">
                        <div className="field">
                            <label>Итого</label>
                            <p className="checkout-total" style={{ fontWeight: 'bold', fontSize: '18px' }}>{total} ₽</p>
                        </div>
                        <button
                            className="checkout-btn"
                            style={{ width: '100%', marginTop: '20px' }}
                            disabled={isCartEmpty || loading || !selectedAddressId || !selectedPayment || orderLoading}
                            onClick={handleOrder}
                        >
                            {orderLoading ? "Оформление..." : "Оформить заказ"}
                        </button>
                        {orderError && <p style={{ color: 'red', marginTop: 8 }}>{orderError}</p>}
                    </section>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default Checkout; 