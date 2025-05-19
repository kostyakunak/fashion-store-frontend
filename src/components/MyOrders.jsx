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
        if (window.confirm('Вы уверены, что хотите отменить этот заказ?')) {
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
            'AWAITING_PAYMENT': 'Ожидает оплаты',
            'PAID': 'Оплачен',
            'SHIPPED': 'Отправлен',
            'DELIVERED': 'Доставлен',
            'CANCELLED': 'Отменен'
        };
        return statusMap[status] || status;
    };

    if (loading) {
        return (
            <div className="my_orders">
                <Header />
                <main>
                    <div className="loading">Загрузка...</div>
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
                    <h2>Мои заказы</h2>
                    
                    {orders.length === 0 ? (
                        <div className="no-orders">
                            <p>У вас еще нет заказов.</p>
                            <Link to="/catalog" className="shop-now-btn">Перейти к покупкам</Link>
                        </div>
                    ) : (
                        <>
                            <div className="order-filters">
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="status-filter"
                                >
                                    <option value="">Все статусы</option>
                                    <option value="AWAITING_PAYMENT">Ожидает оплаты</option>
                                    <option value="PAID">Оплачен</option>
                                    <option value="SHIPPED">Отправлен</option>
                                    <option value="DELIVERED">Доставлен</option>
                                    <option value="CANCELLED">Отменен</option>
                                </select>
                            </div>

                            <div className="order-list">
                                {filteredOrders.map((order) => (
                                    <div key={order.id} className="order-item">
                                        <div className="order-header">
                                            <h3>Заказ #{order.id}</h3>
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
                                                        <p>Размер: {item.size.name}</p>
                                                        <p>Количество: {item.quantity}</p>
                                                        <p>Цена: ${item.priceAtPurchase}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="order-footer">
                                            <div className="order-total">
                                                <strong>Итого: ${order.totalPrice}</strong>
                                            </div>
                                            <div className="order-actions">
                                                {canBeCancelled(order) && (
                                                    <button 
                                                        className="cancel-button"
                                                        onClick={() => handleCancelOrder(order.id)}
                                                    >
                                                        Отменить
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