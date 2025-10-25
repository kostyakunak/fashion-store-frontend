import React from 'react';
import BaseTable from '../generic/BaseTable';
import { getOrders, updateOrderStatus } from '../../api/ordersApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import './OrdersTable.css';

const OrdersTable = () => {
    const queryClient = useQueryClient();

    const { data: orders, isLoading, error } = useQuery({
        queryKey: ['orders'],
        queryFn: getOrders
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ orderId, status }) => updateOrderStatus(orderId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        }
    });

    const columns = [
        {
            key: 'id',
            title: 'ID',
            sortable: true
        },
        {
            key: 'userId',
            title: 'Пользователь',
            sortable: true,
            render: (order) => `${order.user?.firstName} ${order.user?.lastName}`
        },
        {
            key: 'status',
            title: 'Статус',
            sortable: true,
            render: (order) => {
                const statusMap = {
                    'AWAITING_PAYMENT': 'Ожидает оплаты',
                    'PENDING': 'Подтвержден',
                    'SHIPPED': 'Отправлен',
                    'DELIVERED': 'Доставлен',
                    'CANCELLED': 'Отменен'
                };
                return (
                    <select
                        value={order.status}
                        onChange={(e) => updateStatusMutation.mutate({
                            orderId: order.id,
                            status: e.target.value
                        })}
                        className="status-select"
                    >
                        {Object.entries(statusMap).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                );
            }
        },
        {
            key: 'createdAt',
            title: 'Дата создания',
            sortable: true,
            render: (order) => new Date(order.createdAt).toLocaleString()
        },
        {
            key: 'totalAmount',
            title: 'Сумма',
            sortable: true,
            render: (order) => `${order.totalAmount} ₽`
        }
    ];

    const handleRowClick = (order) => {
        // Здесь можно добавить логику для просмотра деталей заказа
        console.log('Selected order:', order);
    };

    return (
        <div className="orders-table-container">
            <h2>Заказы</h2>
            <BaseTable
                data={orders || []}
                columns={columns}
                onRowClick={handleRowClick}
                isLoading={isLoading}
                error={error?.message}
            />
        </div>
    );
};

export default OrdersTable; 