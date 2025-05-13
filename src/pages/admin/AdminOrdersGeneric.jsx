import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GenericTableManager from '../../components/generic/GenericTableManager';
import ErrorMessage from '../../components/common/ErrorMessage';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import { createAdminApiClient } from '../../utils/apiUtils';

// Создаём API-клиент для заказов
const API_URL = "http://localhost:8080/api/admin/orders";
const apiClient = createAdminApiClient({ baseURL: API_URL });

const AdminOrdersGeneric = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Clear errors when component mounts
        setError(null);
        
        // Load users for select dropdown
        const loadUsers = async () => {
            setLoading(true);
            try {
                // Создаём API-клиент для пользователей
                const usersClient = createAdminApiClient({ baseURL: "http://localhost:8080/api/admin/users" });
                const response = await usersClient.get("");
                setUsers(response.data);
            } catch (err) {
                setError(`Failed to load users: ${err.message}`);
                console.error('Error loading users:', err);
            } finally {
                setLoading(false);
            }
        };
        loadUsers();
    }, []);

    const orderApiClient = {
        getAll: async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await apiClient.get("");
                return response.data;
            } catch (err) {
                setError(`Failed to load orders: ${err.message}`);
                console.error('Error loading orders:', err);
                return [];
            } finally {
                setLoading(false);
            }
        },
        create: async (data) => {
            setLoading(true);
            setError(null);
            try {
                // Remove id to allow server-side auto-generation
                const { id, ...dataWithoutId } = data;
                
                // Ensure user is properly formatted
                const orderData = {
                    ...dataWithoutId,
                    user: { id: parseInt(data.userId) }
                };
                
                // Remove the temporary userId field
                delete orderData.userId;
                
                const response = await apiClient.post("", orderData);
                return response.data;
            } catch (err) {
                setError(`Failed to create order: ${err.message}`);
                console.error('Error creating order:', err);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        update: async (id, data) => {
            setLoading(true);
            setError(null);
            try {
                // Ensure user is properly formatted
                const orderData = {
                    ...data,
                    user: { id: parseInt(data.userId) }
                };
                
                // Remove the temporary userId field
                delete orderData.userId;
                
                const response = await apiClient.put(`/${id}`, orderData);
                return response.data;
            } catch (err) {
                setError(`Failed to update order: ${err.message}`);
                console.error('Error updating order:', err);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        delete: async (id) => {
            setLoading(true);
            setError(null);
            try {
                await apiClient.delete(`/${id}`);
                return true;
            } catch (err) {
                setError(`Failed to delete order: ${err.message}`);
                console.error('Error deleting order:', err);
                throw err;
            } finally {
                setLoading(false);
            }
        }
    };

    // Handler for transforming data during editing
    const handleOnEdit = (item) => {
        if (item.user && item.user.id) {
            return {
                ...item,
                userId: item.user.id.toString()
            };
        }
        return item;
    };

    const fields = [
        {
            name: "id",
            label: "ID",
            type: "number",
            readOnly: true
        },
        {
            name: "userId",
            label: "Customer",
            required: true,
            render: (item, onChange) => (
                <select
                    value={item.userId || (item.user ? item.user.id : '')}
                    onChange={(e) => onChange('userId', e.target.value)}
                >
                    <option value="">Select customer</option>
                    {users.map(user => (
                        <option key={user.id} value={user.id}>
                            {user.firstName} {user.lastName} ({user.email})
                        </option>
                    ))}
                </select>
            ),
            display: (item) => {
                if (!item.user) return '';
                const user = users.find(u => u.id === item.user.id);
                return user ? `${user.firstName} ${user.lastName}` : `User ${item.user.id}`;
            }
        },
        {
            name: "orderDate",
            label: "Order Date",
            type: "date",
            display: (item) => {
                if (!item.orderDate) return '';
                return new Date(item.orderDate).toLocaleDateString();
            }
        },
        {
            name: "status",
            label: "Status",
            render: (item, onChange) => (
                <select
                    value={item.status || ''}
                    onChange={(e) => onChange('status', e.target.value)}
                >
                    <option value="">Select status</option>
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
            )
        },
        {
            name: "totalAmount",
            label: "Total Amount",
            type: "number",
            step: "0.01"
        },
        {
            name: "shippingAddress",
            label: "Shipping Address",
            type: "text"
        },
        {
            name: "paymentMethod",
            label: "Payment Method",
            render: (item, onChange) => (
                <select
                    value={item.paymentMethod || ''}
                    onChange={(e) => onChange('paymentMethod', e.target.value)}
                >
                    <option value="">Select payment method</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="PAYPAL">PayPal</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CASH_ON_DELIVERY">Cash on Delivery</option>
                </select>
            )
        }
    ];

    const validators = {
        userId: (value) => {
            if (!value) return "Customer is required";
            return true;
        },
        status: (value) => {
            if (!value) return "Status is required";
            return true;
        },
        totalAmount: (value) => {
            if (value && isNaN(parseFloat(value))) return "Total amount must be a number";
            return true;
        }
    };

    // If authentication fails, redirect to login
    useEffect(() => {
        if (error && error.includes('Authentication')) {
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        }
    }, [error, navigate]);

    // Временный вывод заказов для диагностики
    useEffect(() => {
        (async () => {
            const orders = await orderApiClient.getAll();
            console.log('orders from API:', orders);
        })();
    }, []);

    return (
        <div className="admin-orders-container">
            {error && <ErrorMessage message={error} />}
            <LoadingIndicator isLoading={loading} />
            
            <GenericTableManager
                title="Order Management"
                apiClient={orderApiClient}
                fields={fields}
                validators={validators}
                customHandlers={{
                    onEdit: handleOnEdit
                }}
                styles={{
                    container: {
                        padding: '20px',
                        maxWidth: '1200px',
                        margin: '0 auto'
                    }
                }}
            />
        </div>
    );
};

export default AdminOrdersGeneric;