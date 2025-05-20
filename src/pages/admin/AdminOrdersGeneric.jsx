import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GenericTableManager from '../../components/generic/GenericTableManager';
import ErrorMessage from '../../components/common/ErrorMessage';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import { createAdminApiClient } from '../../utils/apiUtils';
import { getAddressesByUser } from '../../api/addressesApi';

// Создаём API-клиент для заказов
const API_URL = "http://localhost:8080/api/admin/orders";
const apiClient = createAdminApiClient({ baseURL: API_URL });

const AdminOrdersGeneric = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [users, setUsers] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
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

    // Загружаем адреса при изменении пользователя
    useEffect(() => {
        if (selectedUserId) {
            getAddressesByUser(selectedUserId)
                .then(setAddresses)
                .catch((err) => {
                    setAddresses([]);
                    setError('Не удалось загрузить адреса пользователя');
                });
        } else {
            setAddresses([]);
        }
    }, [selectedUserId]);

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
                // Не отправляем id и totalAmount
                const { id, totalAmount, user, ...dataWithoutId } = data;
                const orderData = {
                    ...dataWithoutId,
                    userId: parseInt(data.userId),
                    addressId: parseInt(data.addressId)
                };
                delete orderData.user;
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
                // Не отправляем totalAmount
                const { totalAmount, user, ...dataWithoutTotal } = data;
                const orderData = {
                    ...dataWithoutTotal,
                    userId: parseInt(data.userId),
                    addressId: parseInt(data.addressId)
                };
                delete orderData.user;
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
        const userId = item.user ? String(item.user.id) : (item.userId ? String(item.userId) : '');
        if (userId && userId !== selectedUserId) setSelectedUserId(userId);
            return {
                ...item,
            userId,
            addressId: item.address ? String(item.address.id) : (item.addressId ? String(item.addressId) : ''),
            orderDate: item.orderDate
                ? new Date(item.orderDate).toISOString().slice(0, 10)
                : (item.createdAt ? new Date(item.createdAt).toISOString().slice(0, 10) : ''),
            status: item.status || ''
        };
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
                    value={item.userId || ''}
                    onChange={(e) => {
                        onChange('userId', e.target.value);
                        setSelectedUserId(e.target.value);
                    }}
                >
                    <option value="">Select customer</option>
                    {users.map(user => (
                        <option key={user.id} value={String(user.id)}>
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
            name: "addressId",
            label: "Адрес доставки",
            required: true,
            render: (item, onChange) => (
                <select
                    value={item.addressId || ''}
                    onChange={(e) => onChange('addressId', e.target.value)}
                    disabled={!selectedUserId || addresses.length === 0}
                >
                    <option value="">Выберите адрес</option>
                    {addresses.map(addr => (
                        <option key={addr.id} value={String(addr.id)}>
                            {addr.recipientFirstName} {addr.recipientLastName}, {addr.street}, {addr.city}
                        </option>
                    ))}
                </select>
            ),
            display: (item) => {
                return item.address && item.address.city ? item.address.city : '';
            }
        },
        {
            name: "orderDate",
            label: "Order Date",
            type: "date",
            render: (item, onChange) => {
                const dateValue = item.orderDate || (item.createdAt ? new Date(item.createdAt).toISOString().slice(0, 10) : '');
                return (
                    <input
                        type="date"
                        value={dateValue}
                        onChange={(e) => onChange('orderDate', e.target.value)}
                    />
                );
            },
            display: (item) => {
                const dateValue = item.orderDate || item.createdAt;
                if (!dateValue) return '';
                return new Date(dateValue).toLocaleDateString();
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
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="AWAITING_PAYMENT">Awaiting Payment</option>
                </select>
            )
        },
        {
            name: "totalAmount",
            label: "Total Amount",
            type: "number",
            step: "0.01",
            readOnly: true,
            hideInForm: true,
            display: (item) => item.totalAmount
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