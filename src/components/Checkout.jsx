import React, { useContext, useEffect, useState } from "react";
import "../styles/AccountDetails.css";
import { Header } from "../scripts/Header";
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
    const { user, loading: authLoading } = auth;
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
        if (!authLoading && !user) {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login', { state: { message: 'Будь ласка, увійдіть для оформлення замовлення' } });
            }
        }
    }, [authLoading, user, navigate]);

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

    // Показываем загрузку пока аутентификация не загрузилась
    if (authLoading) {
        return (
            <div className="account-details">
                <Header />
                <div className="layout-container">
                    <main>
                        <p>Завантаження профілю...</p>
                    </main>
                </div>
            </div>
        );
    }

    // Перенаправляем на страницу входа если не авторизован
    if (!user) {
        return null; // useEffect уже перенаправит на /login
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
                                        <div key={idx} className="checkout-item" style={{ 
                                            display: 'flex', 
                                            alignItems: 'flex-start', 
                                            marginBottom: 16,
                                            padding: 12,
                                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                            borderRadius: 8
                                        }}>
                                            <img 
                                                src={item.imageUrl} 
                                                alt={item.name} 
                                                style={{ 
                                                    width: 64, 
                                                    height: 64, 
                                                    objectFit: 'cover', 
                                                    borderRadius: 6, 
                                                    marginRight: 16,
                                                    flexShrink: 0
                                                }} 
                                            />
                                            <div style={{ flex: 1, minWidth: 0, marginRight: 16 }}>
                                                <div style={{ 
                                                    fontWeight: 500, 
                                                    marginBottom: 6,
                                                    fontSize: 15,
                                                    lineHeight: 1.4,
                                                    wordWrap: 'break-word',
                                                    hyphens: 'auto'
                                                }}>
                                                    {item.name}
                                                </div>
                                                <div style={{ 
                                                    fontSize: 13, 
                                                    opacity: 0.7,
                                                    marginBottom: 4
                                                }}>
                                                    Розмір: {getSizeName(item)}
                                                </div>
                                            </div>
                                            <div style={{ 
                                                minWidth: 60, 
                                                textAlign: 'right',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'flex-end',
                                                justifyContent: 'flex-start',
                                                gap: 4
                                            }}>
                                                <div style={{ 
                                                    fontSize: 14, 
                                                    opacity: 0.7,
                                                    marginBottom: 4
                                                }}>
                                                    {item.quantity}x
                                                </div>
                                                <div style={{ 
                                                    fontWeight: 600, 
                                                    fontSize: 16,
                                                    color: '#fff'
                                                }}>
                                                    {(item.price * item.quantity).toFixed(2)} грн.
                                                </div>
                                            </div>
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
                            userId={user.id}
                            selectedAddressId={selectedAddressId}
                            onSelect={setSelectedAddressId}
                        />
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
                        
                        <button
                            className="checkout-btn"
                            style={{ width: '100%', marginTop: '20px' }}
                            disabled={isCartEmpty || loading || !selectedAddressId || !selectedPayment || orderLoading}
                            onClick={handleOrder}
                        >
                            {orderLoading ? "Оформлення..." : "Оформити замовлення"}
                        </button>
                        {orderError && <p style={{ color: 'red', marginTop: 8 }}>{orderError}</p>}
                    </section>
                </main>
            </div>
        </div>
    );
};

export default Checkout; 