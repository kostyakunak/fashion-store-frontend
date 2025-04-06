import React, { useState, useEffect, useMemo } from "react";
import "../../styles/AdminTables.css";
import { getUsers } from "../../api/usersApi";

const OrdersManagement = () => {
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingOrder, setEditingOrder] = useState(null);
    const [editingField, setEditingField] = useState(null);
    const [newOrder, setNewOrder] = useState({
        id: "",
        userId: "",
        status: "AWAITING_PAYMENT"
    });
    const [editingValue, setEditingValue] = useState("");
    const [sortConfig, setSortConfig] = useState({
        key: 'id',
        direction: 'asc'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            await Promise.all([
                fetchOrders(),
                fetchUsers(),
                fetchProducts()
            ]);
        } catch (error) {
            setError("Ошибка при загрузке данных. Пожалуйста, попробуйте позже.");
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/admin/orders");
            if (!response.ok) {
                throw new Error(`Ошибка сервера: ${response.status}`);
            }
            const data = await response.json();
            setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching orders:", error);
            throw error;
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/admin/users");
            if (!response.ok) {
                throw new Error(`Ошибка сервера: ${response.status}`);
            }
            const data = await response.json();
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching users:", error);
            throw error;
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/admin/products");
            if (!response.ok) {
                throw new Error(`Ошибка сервера: ${response.status}`);
            }
            const data = await response.json();
            setProducts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching products:", error);
            throw error;
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleEdit = (order) => {
        setEditingOrder({
            oldId: order.id,
            ...order
        });
        setNewOrder({
            id: order.id,
            userId: order.user.id,
            status: order.status
        });
    };

    const handleFieldEdit = (field, value) => {
        setEditingField(field);
        setEditingValue(value);
    };

    const handleSave = async () => {
        setLoading(true);
        setError(null);
        try {
            if (!editingOrder || !editingOrder.id) {
                throw new Error("Нет заказа для обновления");
            }

            if (!newOrder.status || !["AWAITING_PAYMENT", "PENDING", "SHIPPED", "DELIVERED", "CANCELLED"].includes(newOrder.status)) {
                throw new Error("Неверный статус заказа");
            }

            const response = await fetch(`http://localhost:8080/api/admin/orders/${editingOrder.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: newOrder.id,
                    status: newOrder.status,
                    userId: newOrder.userId
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ошибка обновления заказа: ${errorText}`);
            }

            const updatedOrder = await response.json();
            setOrders(prevOrders => {
                const updatedOrders = prevOrders.map(order => {
                    if (order.id === editingOrder.id) {
                        return {
                            ...order,
                            id: updatedOrder.id,
                            status: updatedOrder.status,
                            totalPrice: updatedOrder.totalPrice,
                            items: updatedOrder.items,
                            user: updatedOrder.user
                        };
                    }
                    return order;
                });
                return updatedOrders;
            });

            setEditingField(null);
            setEditingValue("");
            setEditingOrder(null);
            setNewOrder({
                id: "",
                userId: "",
                status: "AWAITING_PAYMENT"
            });
        } catch (error) {
            setError(error.message);
            console.error("Ошибка обновления заказа:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFieldCancel = () => {
        setEditingField(null);
        setEditingValue("");
        setEditingOrder(null);
        setNewOrder({
            id: "",
            userId: "",
            status: "AWAITING_PAYMENT"
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Вы уверены, что хотите удалить этот заказ?")) {
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:8080/api/admin/orders/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ошибка удаления заказа: ${errorText}`);
            }

            await fetchOrders();
        } catch (error) {
            setError(error.message);
            console.error("Ошибка удаления заказа:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        setLoading(true);
        setError(null);
        try {
            if (!newOrder.userId) {
                throw new Error("Пожалуйста, выберите пользователя");
            }

            if (!newOrder.id) {
                throw new Error("Пожалуйста, введите ID заказа");
            }

            if (!newOrder.status || !["AWAITING_PAYMENT", "PENDING", "SHIPPED", "DELIVERED", "CANCELLED"].includes(newOrder.status)) {
                throw new Error("Неверный статус заказа");
            }

            const response = await fetch("http://localhost:8080/api/admin/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: newOrder.id,
                    userId: newOrder.userId,
                    status: newOrder.status,
                    items: []
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ошибка добавления заказа: ${errorText}`);
            }

            await fetchOrders();
            setNewOrder({
                id: "",
                userId: "",
                status: "AWAITING_PAYMENT"
            });
        } catch (error) {
            setError(error.message);
            console.error("Ошибка добавления заказа:", error);
        } finally {
            setLoading(false);
        }
    };

    const sortedOrders = useMemo(() => {
        let sortableOrders = [...orders];
        if (sortConfig.key) {
            sortableOrders.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (aValue === null || aValue === undefined) return 1;
                if (bValue === null || bValue === undefined) return -1;

                if (typeof aValue === 'string') {
                    return sortConfig.direction === 'asc' 
                        ? aValue.localeCompare(bValue)
                        : bValue.localeCompare(aValue);
                }

                return sortConfig.direction === 'asc' 
                    ? aValue - bValue 
                    : bValue - aValue;
            });
        }
        return sortableOrders;
    }, [orders, sortConfig]);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getClassNamesFor = (name) => {
        if (!sortConfig) {
            return;
        }
        return sortConfig.key === name ? sortConfig.direction : undefined;
    };

    // Добавляем эффект для логирования изменений в orders
    useEffect(() => {
        console.log("Orders state updated:", orders);
    }, [orders]);

    return (
        <div className="admin-table-container">
            <h1>Управление заказами</h1>
            
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {loading && (
                <div className="loading-indicator">
                    Загрузка...
                </div>
            )}

            <div className="search-container">
                <input
                    type="text"
                    placeholder="Поиск по ID заказа..."
                    value={searchTerm}
                    onChange={handleSearch}
                    disabled={loading}
                />
            </div>

            {editingOrder ? (
                <div className="form-container">
                    <h2>Редактировать заказ</h2>
                    <div className="edit-field">
                        <label>ID заказа:</label>
                        <input
                            type="text"
                            value={newOrder.id}
                            onChange={(e) => setNewOrder({ ...newOrder, id: e.target.value })}
                            disabled={loading}
                        />
                    </div>
                    <div className="edit-field">
                        <label>Пользователь:</label>
                        <select
                            value={newOrder.userId}
                            onChange={(e) => setNewOrder({ ...newOrder, userId: e.target.value })}
                            disabled={loading}
                        >
                            <option value="">Выберите пользователя</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.id}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="edit-field">
                        <label>Статус:</label>
                        <select
                            value={newOrder.status}
                            onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value })}
                            disabled={loading}
                        >
                            <option value="AWAITING_PAYMENT">Ожидает оплаты</option>
                            <option value="PENDING">В обработке</option>
                            <option value="SHIPPED">Отправлен</option>
                            <option value="DELIVERED">Доставлен</option>
                            <option value="CANCELLED">Отменен</option>
                        </select>
                    </div>
                    <div className="button-group">
                        <button onClick={handleSave} disabled={loading}>
                            {loading ? 'Сохранение...' : 'Сохранить'}
                        </button>
                        <button onClick={handleFieldCancel} disabled={loading}>
                            Отмена
                        </button>
                    </div>
                </div>
            ) : (
                <div className="form-container">
                    <h2>Добавить новый заказ</h2>
                    <div className="edit-field">
                        <label>ID заказа:</label>
                        <input
                            type="text"
                            value={newOrder.id}
                            onChange={(e) => setNewOrder({ ...newOrder, id: e.target.value })}
                            placeholder="Введите ID заказа"
                            disabled={loading}
                        />
                    </div>
                    <div className="edit-field">
                        <label>Пользователь:</label>
                        <select
                            value={newOrder.userId}
                            onChange={(e) => setNewOrder({ ...newOrder, userId: e.target.value })}
                            disabled={loading}
                        >
                            <option value="">Выберите пользователя</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.id}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="edit-field">
                        <label>Статус:</label>
                        <select
                            value={newOrder.status}
                            onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value })}
                            disabled={loading}
                        >
                            <option value="AWAITING_PAYMENT">Ожидает оплаты</option>
                            <option value="PENDING">В обработке</option>
                            <option value="SHIPPED">Отправлен</option>
                            <option value="DELIVERED">Доставлен</option>
                            <option value="CANCELLED">Отменен</option>
                        </select>
                    </div>
                    <button onClick={handleAdd} disabled={loading}>
                        {loading ? 'Добавление...' : 'Добавить заказ'}
                    </button>
                </div>
            )}

            <table className="admin-table">
                <thead>
                    <tr>
                        <th 
                            className={getClassNamesFor('id')}
                            onClick={() => requestSort('id')}
                        >
                            ID
                        </th>
                        <th>ID пользователя</th>
                        <th>Статус</th>
                        <th>Общая сумма</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedOrders.filter((order) =>
                        order?.id?.toString().includes(searchTerm)
                    ).map((order) => (
                        <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>{order.user?.id || 'N/A'}</td>
                            <td>{order.status}</td>
                            <td>{order.totalPrice || '0.00'}</td>
                            <td>
                                <button 
                                    onClick={() => handleEdit(order)} 
                                    disabled={loading}
                                >
                                    Редактировать
                                </button>
                                <button 
                                    onClick={() => handleDelete(order.id)} 
                                    disabled={loading}
                                >
                                    Удалить
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrdersManagement; 