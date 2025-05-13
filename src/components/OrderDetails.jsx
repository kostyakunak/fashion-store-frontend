import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from '../context/AuthContext';
import useOrders from '../hooks/useOrders';
import "../styles/OrderDetails.css";
import { Footer } from "../scripts/Footer";
import { Header } from "../scripts/Header";

function OrderDetails() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useContext(AuthContext);
    const { 
        selectedOrder, 
        orderDetails, 
        loading, 
        error, 
        loadOrderById, 
        cancelOrder, 
        canBeCancelled 
    } = useOrders();

    useEffect(() => {
        // Redirect if not authenticated
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }

        // Load order details when component mounts or orderId changes
        if (orderId) {
            loadOrderById(orderId);
        }
    }, [isAuthenticated, navigate, orderId, loadOrderById]);

    const handleCancelOrder = async () => {
        if (window.confirm('Вы уверены, что хотите отменить этот заказ?')) {
            const success = await cancelOrder(orderId);
            if (success) {
                // Order was successfully cancelled
                // Reload the order to show updated status
                loadOrderById(orderId);
            }
        }
    };

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
            <div className="order-details">
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
            <div className="order-details">
                <Header />
                <main>
                    <div className="error">{error}</div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!selectedOrder) {
        return (
            <div className="order-details">
                <Header />
                <main>
                    <div className="error">Заказ не найден</div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="order-details">
            <Header />
            <main>
                <div className="order-details-container">
                    <div className="back-link">
                        <Link to="/orders">← Вернуться к списку заказов</Link>
                    </div>
                    
                    <div className="order-details-header">
                        <h2>Детали заказа #{selectedOrder.id}</h2>
                        <span className={`status-badge ${selectedOrder.status.toLowerCase()}`}>
                            {getStatusText(selectedOrder.status)}
                        </span>
                    </div>
                    
                    <div className="order-info">
                        <div className="order-info-section">
                            <h3>Информация о заказе</h3>
                            <p><strong>Дата создания:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                            <p><strong>Статус:</strong> {getStatusText(selectedOrder.status)}</p>
                            <p><strong>Сумма заказа:</strong> ${selectedOrder.totalPrice}</p>
                        </div>
                    </div>
                    
                    <div className="order-items-section">
                        <h3>Товары в заказе</h3>
                        <div className="order-items-list">
                            {orderDetails.map((item) => (
                                <div key={item.id} className="order-item-detail">
                                    <div className="item-image">
                                        <img 
                                            src={item.product.imageUrl || "Images/default-product.png"} 
                                            alt={item.product.name} 
                                        />
                                    </div>
                                    <div className="item-info">
                                        <h4>{item.product.name}</h4>
                                        <p>Размер: {item.size.name}</p>
                                        <p>Количество: {item.quantity}</p>
                                        <p>Цена за единицу: ${item.priceAtPurchase}</p>
                                        <p>Итого: ${(item.priceAtPurchase * item.quantity).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="order-summary">
                        <h3>Итого</h3>
                        <p className="total-price">${selectedOrder.totalPrice}</p>
                        
                        {canBeCancelled(selectedOrder) && (
                            <div className="order-actions">
                                <button 
                                    className="cancel-button" 
                                    onClick={handleCancelOrder}
                                >
                                    Отменить заказ
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default OrderDetails;