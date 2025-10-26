import React, { useContext, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from '../context/AuthContext';
import useOrders from '../hooks/useOrders';
import "../styles/OrderDetails.css";
import { Footer } from "../scripts/Footer";
import { Header } from "../scripts/Header";

function OrderDetails() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useContext(AuthContext);
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
    }, [user, navigate, orderId, loadOrderById]);

    const handleCancelOrder = async () => {
        if (window.confirm('Ви впевнені, що хочете скасувати це замовлення?')) {
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
            <div className="order-details">
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
                    <div className="error">Замовлення не знайдено</div>
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
                        <Link to="/orders">← Повернутися до списку замовлень</Link>
                    </div>
                    
                    <div className="order-details-header">
                        <h2>Деталі замовлення #{selectedOrder.id}</h2>
                        <span className={`status-badge ${selectedOrder.status.toLowerCase()}`}>
                            {getStatusText(selectedOrder.status)}
                        </span>
                    </div>
                    
                    <div className="order-info">
                        <div className="order-info-section">
                            <h3>Інформація про замовлення</h3>
                            <p><strong>Дата створення:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                            <p><strong>Статус:</strong> {getStatusText(selectedOrder.status)}</p>
                            <p><strong>Сума замовлення:</strong> ${selectedOrder.totalPrice}</p>
                        </div>
                    </div>
                    
                    <div className="order-items-section">
                        <h3>Товари у замовленні</h3>
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
                                        <p>Розмір: {item.size.name}</p>
                                        <p>Кількість: {item.quantity}</p>
                                        <p>Ціна за одиницю: ${item.priceAtPurchase}</p>
                                        <p>Разом: ${(item.priceAtPurchase * item.quantity).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="order-summary">
                        <h3>Разом</h3>
                        <p className="total-price">${selectedOrder.totalPrice}</p>
                        
                        {canBeCancelled(selectedOrder) && (
                            <div className="order-actions">
                                <button 
                                    className="cancel-button" 
                                    onClick={handleCancelOrder}
                                >
                                    Скасувати замовлення
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