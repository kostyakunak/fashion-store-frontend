import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../styles/MyOrders.css"; // Подключаем стили
import {Header} from "../scripts/Header";
import {Footer} from "../scripts/Footer";

function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('');

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8080/api/admin/orders');
            setOrders(response.data);
            setError(null);
        } catch (err) {
            setError('Ошибка при загрузке заказов: ' + err.message);
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await axios.put(`http://localhost:8080/api/admin/orders/${orderId}`, {
                status: newStatus
            });
            fetchOrders(); // Обновляем список заказов после изменения статуса
        } catch (err) {
            setError('Ошибка при обновлении статуса заказа: ' + err.message);
            console.error('Error updating order status:', err);
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (window.confirm('Вы уверены, что хотите удалить этот заказ?')) {
            try {
                await axios.delete(`http://localhost:8080/api/admin/orders/${orderId}`);
                fetchOrders(); // Обновляем список заказов после удаления
            } catch (err) {
                setError('Ошибка при удалении заказа: ' + err.message);
                console.error('Error deleting order:', err);
            }
        }
    };

    const filteredOrders = selectedStatus
        ? orders.filter(order => order.status === selectedStatus)
        : orders;

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
                                        {order.status}
                                    </span>
                                </div>
                                
                                <div className="order-items">
                                    {order.items && order.items.map((item, index) => (
                                        <div key={index} className="order-item-details">
                                            <img 
                                                className="order-image" 
                                                src={item.product.imageUrl || "Images/default-product.png"} 
                                                alt={item.product.name} 
                                            />
                                            <div className="order-details">
                                                <h4>{item.product.name}</h4>
                                                <p>Размер: {item.size.name}</p>
                                                <p>Количество: {item.quantity}</p>
                                                <p>Цена: ${item.product.price}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="order-footer">
                                    <div className="order-total">
                                        <strong>Итого: ${order.totalPrice}</strong>
                                    </div>
                                    <div className="order-actions">
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            className="status-select"
                                        >
                                            <option value="AWAITING_PAYMENT">Ожидает оплаты</option>
                                            <option value="PAID">Оплачен</option>
                                            <option value="SHIPPED">Отправлен</option>
                                            <option value="DELIVERED">Доставлен</option>
                                            <option value="CANCELLED">Отменен</option>
                                        </select>
                                        <button 
                                            className="delete-button"
                                            onClick={() => handleDeleteOrder(order.id)}
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}

export default MyOrders;