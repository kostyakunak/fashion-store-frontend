import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import useOrders from '../hooks/useOrders';
import "../styles/MyOrders.css";
import { Header } from "../scripts/Header";
import { Footer } from "../scripts/Footer";

function MyOrders() {
    const { isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();
    const { 
        orders, 
        loading, 
        error, 
        loadOrders, 
        cancelOrder, 
        canBeCancelled 
    } = useOrders();
    const [selectedStatus, setSelectedStatus] = useState('');

    useEffect(() => {
        // Redirect if not authenticated
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }
        // Load orders on component mount
        loadOrders();
    }, [isAuthenticated, navigate]);

    const handleCancelOrder = async (orderId) => {
        if (window.confirm('Ви впевнені, що хочете скасувати це замовлення?')) {
            const success = await cancelOrder(orderId);
            if (success) {
                // Order was successfully cancelled
                loadOrders(); // Refresh the orders list
            }
        }
    };

    const filteredOrders = selectedStatus
        ? orders.filter(order => order.status === selectedStatus)
        : orders;

    // Map status codes to readable Russian text
    const getStatusText = (status) => {
        const statusMap = {
            'AWAITING_PAYMENT': 'Очікує оплати',
            'PAID': 'Оплачено',
            'SHIPPED': 'Відправлено',
            'DELIVERED': 'Доставлено',
            'CANCELLED': 'Скасовано'
        };
        return statusMap[status] || status;
    };

    if (loading) {
        return (
            <div className="my_orders">
                <Header />
                <main>
                    <div className="loading">Завантаження...</div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="my_orders">
                <Header />
                <main>
                    <div className="error">{error}</div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="my_orders">
            <Header />
            <main>
                <section className="container content-section">
                    <h2>Мої замовлення</h2>
                    
                    {orders.length === 0 ? (
                        <div className="no-orders">
                            <p>У вас ще немає замовлень.</p>
                            <Link to="/catalog" className="shop-now-btn">Перейти до покупок</Link>
                        </div>
                    ) : (
                        <>
                            <div className="order-filters">
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="status-filter"
                                >
                                    <option value="">Всі статуси</option>
                                    <option value="AWAITING_PAYMENT">Очікує оплати</option>
                                    <option value="PAID">Оплачено</option>
                                    <option value="SHIPPED">Відправлено</option>
                                    <option value="DELIVERED">Доставлено</option>
                                    <option value="CANCELLED">Скасовано</option>
                                </select>
                            </div>

                            <div className="order-list">
                                {filteredOrders.map((order) => (
                                    <div key={order.id} className="order-item">
                                        <div className="order-header">
                                            <h3>Замовлення #{order.id}</h3>
                                            <span className={`status-badge ${order.status.toLowerCase()}`}>
                                                {getStatusText(order.status)}
                                            </span>
                                        </div>
                                        
                                        <div className="order-items">
                                            {order.items && order.items.map((item, index) => (
                                                <div key={index} className="order-item-details">
                                                    <img 
                                                        className="order-image" 
                                                        src={
                                                            (item.productMap && item.productMap.mainImageUrl) ||
                                                            (item.product && item.product.imageUrl) ||
                                                            "Images/default-product.png"
                                                        } 
                                                        alt={item.productMap?.name || item.product?.name || "Товар"} 
                                                    />
                                                    <div className="order-details">
                                                        <h4>{item.productMap?.name || item.product?.name}</h4>
                                                        <p>Розмір: {item.size.name}</p>
                                                        <p>Кількість: {item.quantity}</p>
                                                        <p>Ціна: {item.priceAtPurchase} грн.</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="order-footer">
                                            <div className="order-total">
                                                <strong>Разом: {order.totalPrice} грн.</strong>
                                            </div>
                                            <div className="order-actions">
                                                {canBeCancelled(order) && (
                                                    <button 
                                                        className="cancel-button"
                                                        onClick={() => handleCancelOrder(order.id)}
                                                    >
                                                        Скасувати
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </section>
            </main>
            <Footer />
        </div>
    );
}

export default MyOrders;