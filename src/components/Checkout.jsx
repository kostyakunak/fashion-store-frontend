import React, { useContext, useEffect, useState } from "react";
import "../styles/AccountDetails.css";
import { Header } from "../scripts/Header";
import { Footer } from "../scripts/Footer";
import useCart from "../hooks/useCart";
import { AuthContext } from "../context/AuthContext";
import { API_CONFIG } from '../config/apiConfig';
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
        { value: 'CARD', label: 'Картка' },
        { value: 'CASH_ON_DELIVERY', label: 'Післяплата' },
        { value: 'PICKUP', label: 'Самовивіз' }
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
            await axios.post(`${API_CONFIG.API_URL}/orders`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            clearCart();
            navigate("/my-orders");
        } catch (e) {
            setOrderError(e.response?.data?.error || e.message || "Помилка оформлення замовлення");
        } finally {
            setOrderLoading(false);
        }
    };

    // Функція для отримання назви розміру за id
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
                        <p>Завантаження профілю...</p>
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
                        <h2>Оформлення замовлення</h2>
                        {/* Список товаров */}
                        <div className="field">
                            <label>Товари у замовленні</label>
                            <div className="checkout-items-list">
                                {loading ? (
                                    <p style={{ opacity: 0.7 }}>Завантаження...</p>
                                ) : isCartEmpty ? (
                                    <p style={{ opacity: 0.7 }}>Кошик порожній</p>
                                ) : (
                                    cartItems.map((item, idx) => (
                                        <div key={idx} className="checkout-item" style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                                            <img src={item.imageUrl} alt={item.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, marginRight: 12 }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 500 }}>{item.name}</div>
                                                <div style={{ fontSize: 13, opacity: 0.7 }}>Розмір: {getSizeName(item)}</div>
                                            </div>
                                            <div style={{ minWidth: 60, textAlign: 'right' }}>{item.quantity} × {item.price} грн.</div>
                                            <div style={{ minWidth: 70, textAlign: 'right', marginLeft: 16, fontWeight: 500 }}>{(item.price * item.quantity).toFixed(2)} грн.</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="account-section">
                        <h2>Адреса доставки</h2>
                        <div className="field">
                            <AddressSelector
                                userId={userId}
                                selectedAddressId={selectedAddressId}
                                onSelect={setSelectedAddressId}
                            />
                            {!selectedAddressId && (
                                <div style={{ 
                                    marginTop: 12, 
                                    padding: 12, 
                                    backgroundColor: '#ffebee', 
                                    border: '1px solid #f44336', 
                                    borderRadius: 4,
                                    color: '#d32f2f'
                                }}>
                                    ⚠️ <strong>Адресу не вибрано!</strong> Будь ласка, додайте або оберіть адресу доставки перед оформленням замовлення.
                                </div>
                            )}
                            {selectedAddressId && (
                                <div style={{ 
                                    marginTop: 8, 
                                    padding: 8, 
                                    backgroundColor: '#e8f5e9', 
                                    border: '1px solid #4caf50', 
                                    borderRadius: 4,
                                    color: '#2e7d32',
                                    fontSize: 14
                                }}>
                                    ✅ Адресу вибрано
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="account-section">
                        <h2>Спосіб оплати</h2>
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
                            <label>Разом</label>
                            <p className="checkout-total" style={{ fontWeight: 'bold', fontSize: '18px' }}>{total} грн.</p>
                        </div>
                        
                        {/* Показываем причину, почему кнопка неактивна */}
                        {!isCartEmpty && !loading && !selectedAddressId && (
                            <div style={{ 
                                marginTop: 12, 
                                padding: 12, 
                                backgroundColor: '#fff3e0', 
                                border: '1px solid #ff9800', 
                                borderRadius: 4,
                                color: '#e65100'
                            }}>
                                ℹ️ Для оформлення замовлення необхідно вибрати адресу доставки вище.
                            </div>
                        )}
                        
                        <button
                            className="checkout-btn"
                            style={{ 
                                width: '100%', 
                                marginTop: '20px',
                                opacity: (isCartEmpty || loading || !selectedAddressId || !selectedPayment || orderLoading) ? 0.5 : 1,
                                cursor: (isCartEmpty || loading || !selectedAddressId || !selectedPayment || orderLoading) ? 'not-allowed' : 'pointer'
                            }}
                            disabled={isCartEmpty || loading || !selectedAddressId || !selectedPayment || orderLoading}
                            onClick={handleOrder}
                        >
                            {orderLoading ? "Оформлення..." : "Оформити замовлення"}
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