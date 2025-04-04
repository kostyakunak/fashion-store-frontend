import React, { useState, useEffect } from "react";
import "../../styles/AdminTables.css";

const OrdersManagement = () => {
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingOrder, setEditingOrder] = useState(null);
    const [editingField, setEditingField] = useState(null);
    const [newOrder, setNewOrder] = useState({
        userId: "",
        status: "",
        totalAmount: ""
    });
    const [editingValue, setEditingValue] = useState("");

    useEffect(() => {
        fetchOrders();
        fetchUsers();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/admin/orders");
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching orders:", error);
            setOrders([]);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/admin/users");
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching users:", error);
            setUsers([]);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleEdit = (order) => {
        setEditingOrder(order);
        setNewOrder({
            userId: order.user.id,
            status: order.status,
            totalAmount: order.totalAmount
        });
    };

    const handleFieldEdit = (field) => {
        setEditingField(field);
    };

    const handleFieldSave = async (orderId, field, value) => {
        try {
            const updatedOrder = {
                ...orders.find(o => o.id === orderId),
                [field]: value
            };

            const response = await fetch(`http://localhost:8080/api/admin/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedOrder),
            });

            if (!response.ok) {
                throw new Error('Failed to update order');
            }

            // Получаем обновленные данные заказа
            const updatedOrderResponse = await fetch(`http://localhost:8080/api/admin/orders/${orderId}`);
            if (!updatedOrderResponse.ok) {
                throw new Error('Failed to fetch updated order');
            }
            const updatedOrderData = await updatedOrderResponse.json();

            // Обновляем локальное состояние
            setOrders(orders.map(order => 
                order.id === orderId ? updatedOrderData : order
            ));
            setEditingField(null);
        } catch (error) {
            console.error('Error updating order:', error);
            alert('Failed to update order');
        }
    };

    const handleFieldCancel = () => {
        setEditingField(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this order?")) {
            try {
                const response = await fetch(`http://localhost:8080/api/admin/orders/${id}`, {
                    method: "DELETE",
                });
                if (response.ok) {
                    fetchOrders();
                }
            } catch (error) {
                console.error("Error deleting order:", error);
            }
        }
    };

    const handleAdd = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/admin/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newOrder),
            });
            if (response.ok) {
                fetchOrders();
                setNewOrder({
                    userId: "",
                    status: "",
                    totalAmount: ""
                });
            }
        } catch (error) {
            console.error("Error adding order:", error);
        }
    };

    const filteredOrders = Array.isArray(orders) ? orders.filter((order) =>
        order?.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    return (
        <div className="admin-table-container">
            <h1>Orders Management</h1>
            
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search by user email..."
                    value={searchTerm}
                    onChange={handleSearch}
                />
            </div>

            <div className="form-container">
                <h2>{editingOrder ? "Edit Order" : "Add New Order"}</h2>
                {editingOrder ? (
                    <>
                        <div className="edit-field">
                            <label>User:</label>
                            <span>{editingOrder.user?.email || 'N/A'}</span>
                        </div>
                        <div className="edit-field">
                            <label>Status:</label>
                            {editingField === 'status' ? (
                                <>
                                    <select
                                        value={newOrder.status}
                                        onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value })}
                                    >
                                        <option value="PENDING">Pending</option>
                                        <option value="PROCESSING">Processing</option>
                                        <option value="SHIPPED">Shipped</option>
                                        <option value="DELIVERED">Delivered</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                    <button onClick={() => handleFieldSave(editingOrder.id, 'status', newOrder.status)}>Save</button>
                                    <button onClick={handleFieldCancel}>Cancel</button>
                                </>
                            ) : (
                                <>
                                    <span>{editingOrder.status}</span>
                                    <button onClick={() => handleFieldEdit('status')}>Edit</button>
                                </>
                            )}
                        </div>
                        <div className="edit-field">
                            <label>Total Amount:</label>
                            <span>${editingOrder.total_amount || editingOrder.totalAmount || '0.00'}</span>
                        </div>
                    </>
                ) : (
                    <>
                        <select
                            value={newOrder.userId}
                            onChange={(e) => setNewOrder({ ...newOrder, userId: e.target.value })}
                        >
                            <option value="">Select User</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.email}
                                </option>
                            ))}
                        </select>
                        <select
                            value={newOrder.status}
                            onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value })}
                        >
                            <option value="">Select Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                        <input
                            type="number"
                            placeholder="Total Amount"
                            value={newOrder.totalAmount}
                            onChange={(e) => setNewOrder({ ...newOrder, totalAmount: e.target.value })}
                        />
                        <button onClick={handleAdd}>Add Order</button>
                    </>
                )}
            </div>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Status</th>
                        <th>Total Amount</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredOrders.map((order) => (
                        <tr key={order.id}>
                            <td>{order.user?.email || 'N/A'}</td>
                            <td>{order.status}</td>
                            <td>
                                {editingField === 'total_price' ? (
                                    <div className="edit-field">
                                        <input
                                            type="number"
                                            value={editingValue}
                                            onChange={(e) => setEditingValue(e.target.value)}
                                            step="0.01"
                                            min="0"
                                        />
                                        <button onClick={() => handleFieldSave(order.id, 'total_price', parseFloat(editingValue))}>Save</button>
                                        <button onClick={() => handleFieldCancel()}>Cancel</button>
                                    </div>
                                ) : (
                                    <span onClick={() => handleFieldEdit('total_price', order.total_price)}>
                                        ${order.total_price || '0.00'}
                                    </span>
                                )}
                            </td>
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