import React, { useState, useEffect } from "react";
import "../../styles/AdminTables.css";

const OrdersManagement = () => {
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [newOrder, setNewOrder] = useState({
        id: "",
        userId: "",
        status: "AWAITING_PAYMENT"
    });
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [searchField, setSearchField] = useState('id');

    const searchFields = [
        { value: 'id', label: 'ID' },
        { value: 'userId', label: 'User ID' },
        { value: 'status', label: 'Status' },
        { value: 'totalPrice', label: 'Total Price' }
    ];

    useEffect(() => {
        fetchOrders();
        fetchUsers();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/admin/orders");
            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }
            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.error("Error fetching orders:", error);
            alert("Error fetching orders: " + error.message);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/admin/users");
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
            alert("Error fetching users: " + error.message);
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedOrders = React.useMemo(() => {
        let sortableOrders = [...orders];
        if (sortConfig.key) {
            sortableOrders.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Специальная обработка для userId
                if (sortConfig.key === 'userId') {
                    aValue = a.user?.id;
                    bValue = b.user?.id;
                }

                // Если значения равны null или undefined, они должны идти в конец
                if (aValue == null && bValue == null) return 0;
                if (aValue == null) return 1;
                if (bValue == null) return -1;

                // Сравнение чисел
                if (typeof aValue === 'number' || typeof bValue === 'number') {
                    return sortConfig.direction === 'asc' 
                        ? (aValue - bValue)
                        : (bValue - aValue);
                }

                // Сравнение строк
                const aString = String(aValue).toLowerCase();
                const bString = String(bValue).toLowerCase();
                
                if (aString < bString) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aString > bString) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableOrders;
    }, [orders, sortConfig]);

    const filteredOrders = sortedOrders.filter(order => {
        const searchLower = searchTerm.toLowerCase();
        switch (searchField) {
            case 'id':
                return order.id.toString().includes(searchLower);
            case 'userId':
                return order.user?.id?.toString().includes(searchLower);
            case 'status':
                return order.status.toLowerCase().includes(searchLower);
            case 'totalPrice':
                return order.totalPrice?.toString().includes(searchLower);
            default:
                return true;
        }
    });

    const handleEdit = (order) => {
        setEditingOrder({
            oldId: order.id,
            id: order.id,
            userId: order.user.id.toString(),
            status: order.status,
            totalPrice: order.totalPrice?.toString() || ""
        });
        setShowAddForm(true);
    };

    const handleUpdate = async () => {
        try {
            if (!editingOrder) return;

            const originalId = parseInt(editingOrder.oldId);
            const newId = parseInt(editingOrder.id);
            const idChanged = originalId !== newId;

            const duplicateOrder = idChanged ? orders.find(o => o.id === newId) : null;
            if (duplicateOrder) {
                throw new Error(`Заказ с ID ${newId} уже существует`);
            }

            const requestData = {
                id: newId,
                userId: parseInt(editingOrder.userId),
                status: editingOrder.status,
                totalPrice: editingOrder.totalPrice ? parseFloat(editingOrder.totalPrice) : 0
            };

            let response;
            if (idChanged) {
                try {
                    await fetch(`http://localhost:8080/api/admin/orders/${originalId}`, {
                        method: 'DELETE'
                    });
                    
                    response = await fetch("http://localhost:8080/api/admin/orders", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(requestData),
                    });
                } catch (error) {
                    console.error('Error deleting old record:', error);
                    throw new Error('Failed to delete old record: ' + error.message);
                }
            } else {
                response = await fetch(`http://localhost:8080/api/admin/orders/${originalId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestData),
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Ответ сервера:", errorData);
                throw new Error(errorData.message || "Failed to update order");
            }

            const updatedOrder = await response.json();
            
            if (idChanged) {
                setOrders(orders.filter(o => o.id !== originalId).concat(updatedOrder).sort((a, b) => a.id - b.id));
            } else {
                setOrders(orders.map(o => o.id === originalId ? updatedOrder : o).sort((a, b) => a.id - b.id));
            }

            setShowAddForm(false);
            setEditingOrder(null);
            setNewOrder({
                userId: "",
                status: "AWAITING_PAYMENT",
                totalPrice: ""
            });
        } catch (error) {
            console.error("Error updating order:", error);
            alert("Ошибка при обновлении заказа: " + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this order?')) return;

        try {
            const response = await fetch(`http://localhost:8080/api/admin/orders/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete order');
            }

            setOrders(orders.filter(order => order.id !== id));
        } catch (error) {
            console.error('Error deleting order:', error);
            alert('Error deleting order: ' + error.message);
        }
    };

    const handleAdd = async () => {
        try {
            if (!newOrder.userId) {
                throw new Error("Пожалуйста, выберите пользователя");
            }

            if (!newOrder.id) {
                throw new Error("Пожалуйста, введите ID заказа");
            }

            const requestData = {
                id: parseInt(newOrder.id),
                userId: parseInt(newOrder.userId),
                status: newOrder.status
            };

            const response = await fetch("http://localhost:8080/api/admin/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to add order");
            }

            const addedOrder = await response.json();
            setOrders([...orders, addedOrder].sort((a, b) => a.id - b.id));
            setShowAddForm(false);
            setNewOrder({
                id: "",
                userId: "",
                status: "AWAITING_PAYMENT"
            });
        } catch (error) {
            console.error("Error adding order:", error);
            alert("Error adding order: " + error.message);
        }
    };

    return (
        <div className="admin-page">
            <h1>Управление заказами</h1>
            
            <div className="search-container">
                <select 
                    value={searchField} 
                    onChange={(e) => setSearchField(e.target.value)}
                    className="search-field-select"
                >
                    {searchFields.map(field => (
                        <option key={field.value} value={field.value}>
                            {field.label}
                        </option>
                    ))}
                </select>
                <input
                    type="text"
                    placeholder={`Поиск по ${searchFields.find(f => f.value === searchField)?.label.toLowerCase()}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <button className="add-button" onClick={() => {
                setShowAddForm(true);
                setEditingOrder(null);
                setNewOrder({
                    id: "",
                    userId: "",
                    status: "AWAITING_PAYMENT"
                });
            }}>
                Добавить заказ
            </button>

            {showAddForm && (
                <div className="form-container">
                    <h2>{editingOrder ? "Редактировать заказ" : "Добавить новый заказ"}</h2>
                    <div className="form-group">
                        <label>ID:</label>
                        <input
                            type="number"
                            value={editingOrder ? editingOrder.id : newOrder.id}
                            onChange={(e) => {
                                if (editingOrder) {
                                    setEditingOrder({ ...editingOrder, id: e.target.value });
                                } else {
                                    setNewOrder({ ...newOrder, id: e.target.value });
                                }
                            }}
                            min="1"
                        />
                    </div>
                    <div className="form-group">
                        <label>Пользователь:</label>
                        <select
                            value={editingOrder ? editingOrder.userId : newOrder.userId}
                            onChange={(e) => {
                                if (editingOrder) {
                                    setEditingOrder({ ...editingOrder, userId: e.target.value });
                                } else {
                                    setNewOrder({ ...newOrder, userId: e.target.value });
                                }
                            }}
                        >
                            <option value="">Выберите пользователя</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.email}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Статус:</label>
                        <select
                            value={editingOrder ? editingOrder.status : newOrder.status}
                            onChange={(e) => {
                                if (editingOrder) {
                                    setEditingOrder({ ...editingOrder, status: e.target.value });
                                } else {
                                    setNewOrder({ ...newOrder, status: e.target.value });
                                }
                            }}
                        >
                            <option value="AWAITING_PAYMENT">Ожидает оплаты</option>
                            <option value="PENDING">В обработке</option>
                            <option value="SHIPPED">Отправлен</option>
                            <option value="DELIVERED">Доставлен</option>
                            <option value="CANCELLED">Отменен</option>
                        </select>
                    </div>
                    <div className="form-actions">
                        <button onClick={editingOrder ? handleUpdate : handleAdd}>
                            {editingOrder ? "Сохранить" : "Добавить"}
                        </button>
                        <button onClick={() => {
                            setShowAddForm(false);
                            setEditingOrder(null);
                            setNewOrder({
                                id: "",
                                userId: "",
                                status: "AWAITING_PAYMENT"
                            });
                        }}>
                            Отмена
                        </button>
                    </div>
                </div>
            )}

            <table className="admin-table">
                <thead>
                    <tr>
                        <th 
                            onClick={() => handleSort('id')}
                            className="sortable-header"
                        >
                            ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th 
                            onClick={() => handleSort('userId')}
                            className="sortable-header"
                        >
                            User ID {sortConfig.key === 'userId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th 
                            onClick={() => handleSort('status')}
                            className="sortable-header"
                        >
                            Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredOrders.map((order) => (
                        <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>{order.user?.id || 'N/A'}</td>
                            <td>{order.status}</td>
                            <td>
                                <button onClick={() => handleEdit(order)}>Edit</button>
                                <button onClick={() => handleDelete(order.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrdersManagement; 