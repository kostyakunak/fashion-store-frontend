import React, { useState, useEffect } from 'react';
import GenericTableManager from '../../components/generic/GenericTableManager';
import { 
    getOrderDetails, 
    createOrderDetail, 
    updateOrderDetail, 
    deleteOrderDetail,
    getOrders,
    getProducts,
    getSizes
} from '../../api/orderDetailsApi';

const AdminOrderDetails = () => {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [sizes, setSizes] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log('Компонент: Начало загрузки данных');
                const [ordersData, productsData, sizesData] = await Promise.all([
                    getOrders(),
                    getProducts(),
                    getSizes()
                ]);
                console.log('Компонент: Получены данные заказов:', ordersData);
                console.log('Компонент: Получены данные товаров:', productsData);
                console.log('Компонент: Получены данные размеров:', sizesData);
                
                // Проверяем структуру данных
                if (ordersData && ordersData.length > 0) {
                    console.log('Компонент: Структура первого заказа:', {
                        id: ordersData[0].id,
                        user: ordersData[0].user,
                        items: ordersData[0].items
                    });
                }
                
                setOrders(ordersData);
                setProducts(productsData);
                setSizes(sizesData);
            } catch (error) {
                console.error('Компонент: Ошибка при загрузке данных:', error);
            }
        };
        fetchData();
    }, []);

    const apiClient = {
        getAll: getOrderDetails,
        create: (data) => {
            console.log('Создание детали заказа:', data);
            return createOrderDetail({
                ...data,
                orderId: data.orderId
            });
        },
        update: (id, data) => {
            console.log('Обновление детали заказа:', { id, data });
            return updateOrderDetail(id, {
                ...data,
                orderId: data.orderId
            });
        },
        delete: deleteOrderDetail
    };

    const fields = [
        {
            name: 'id',
            label: 'ID',
            type: 'number',
            render: (item, onChange) => (
                <input
                    type="number"
                    value={item.id || ''}
                    onChange={(e) => onChange('id', e.target.value)}
                    min="1"
                />
            ),
            display: (item) => item.id
        },
        {
            name: 'orderId',
            label: 'Заказ',
            render: (item, onChange) => {
                const currentValue = item.orderId || (item.order ? item.order.id : '');
                return (
                    <select
                        value={currentValue}
                        onChange={(e) => {
                            const value = e.target.value === '' ? null : parseInt(e.target.value);
                            onChange('orderId', value);
                        }}
                    >
                        <option value="">Выберите заказ</option>
                        {orders.map(order => (
                            <option key={order.id} value={order.id}>
                                Заказ #{order.id} - {order.user?.firstName} {order.user?.lastName}
                            </option>
                        ))}
                    </select>
                );
            },
            display: (item) => {
                const order = orders.find(o => o.id === (item.orderId || (item.order ? item.order.id : null)));
                return order ? `Заказ #${order.id}` : 'N/A';
            }
        },
        {
            name: 'productId',
            label: 'Товар',
            render: (item, onChange) => {
                const currentValue = item.productId || (item.product ? item.product.id : '');
                return (
                    <select
                        value={currentValue}
                        onChange={(e) => {
                            const value = e.target.value === '' ? null : parseInt(e.target.value);
                            onChange('productId', value);
                        }}
                    >
                        <option value="">Выберите товар</option>
                        {products.map(product => (
                            <option key={product.id} value={product.id}>
                                {product.name}
                            </option>
                        ))}
                    </select>
                );
            },
            display: (item) => {
                const product = products.find(p => p.id === (item.productId || (item.product ? item.product.id : null)));
                return product ? product.name : 'N/A';
            }
        },
        {
            name: 'sizeId',
            label: 'Размер',
            render: (item, onChange) => {
                const currentValue = item.sizeId || (item.size ? item.size.id : '');
                return (
                    <select
                        value={currentValue}
                        onChange={(e) => {
                            const value = e.target.value === '' ? null : parseInt(e.target.value);
                            onChange('sizeId', value);
                        }}
                    >
                        <option value="">Выберите размер</option>
                        {sizes.map(size => (
                            <option key={size.id} value={size.id}>
                                {size.name}
                            </option>
                        ))}
                    </select>
                );
            },
            display: (item) => {
                const size = sizes.find(s => s.id === (item.sizeId || (item.size ? item.size.id : null)));
                return size ? size.name : 'N/A';
            }
        },
        {
            name: 'quantity',
            label: 'Количество',
            type: 'number',
            validators: {
                quantity: (value) => value > 0
            }
        },
        {
            name: 'priceAtPurchase',
            label: 'Цена при покупке',
            type: 'number',
            step: '0.01',
            validators: {
                priceAtPurchase: (value) => value >= 0
            },
            display: (item) => `${item.priceAtPurchase} ₽`
        }
    ];

    const validators = {
        orderId: (value) => {
            console.log('Валидация orderId:', { value, orders });
            if (value === null) return false;
            const isValid = orders.some(o => o.id === value);
            console.log('Результат валидации orderId:', isValid);
            return isValid;
        },
        productId: (value) => {
            console.log('Валидация productId:', { value, products });
            if (value === null) return false;
            const isValid = products.some(p => p.id === value);
            console.log('Результат валидации productId:', isValid);
            return isValid;
        },
        sizeId: (value) => {
            console.log('Валидация sizeId:', { value, sizes });
            if (value === null) return false;
            const isValid = sizes.some(s => s.id === value);
            console.log('Результат валидации sizeId:', isValid);
            return isValid;
        },
        quantity: (value) => value > 0,
        priceAtPurchase: (value) => value >= 0
    };

    return (
        <GenericTableManager
            title="Управление деталями заказов"
            apiClient={apiClient}
            fields={fields}
            validators={validators}
            styles={{
                container: {
                    padding: '20px',
                    maxWidth: '1200px',
                    margin: '0 auto'
                }
            }}
        />
    );
};

export default AdminOrderDetails; 