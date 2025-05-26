import React, { useState, useEffect } from 'react';
import GenericTableManager from '../../components/generic/GenericTableManager';
import { getAllCarts, createCart, updateCart, deleteCart } from '../../api/cartApi';
import { getUsers } from '../../api/usersApi';
import { getProducts } from '../../api/productsApi';

const AdminCartGeneric = () => {
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Загрузка связанных данных при монтировании компонента
        const loadData = async () => {
            try {
                setLoading(true);
                // Сначала получаем пользователей и товары
                const [usersData, productsData] = await Promise.all([
                    getUsers(),
                    getProducts()
                ]);
                
                setUsers(usersData);
                setProducts(productsData);
                
                if (usersData.length > 0) {
                    // Затем получаем корзины для всех пользователей
                    const userIds = usersData.map(user => user.id);
                    const cartsData = await getAllCarts(userIds);
                }
                
                setLoading(false);
            } catch (error) {
                console.error("Ошибка при загрузке данных:", error);
                setError("Ошибка при загрузке данных: " + error.message);
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Обработчик для преобразования данных при редактировании
    const handleOnEdit = (item) => {
        // Добавляем userId и productId для работы с формой
        const editedItem = { ...item };
        
        if (item.user && item.user.id) {
            editedItem.userId = item.user.id.toString();
        }
        
        if (item.product && item.product.id) {
            editedItem.productId = item.product.id.toString();
        }
        
        return editedItem;
    };

    // Создаем собственный метод получения всех корзин
    const getAllCartsData = async () => {
        if (users.length === 0) {
            return [];
        }
        
        const userIds = users.map(user => user.id);
        const cartsData = await getAllCarts(userIds);
        return cartsData;
    };

    const apiClient = {
        getAll: getAllCartsData,
        create: (data) => {
            // Валидация перед отправкой на сервер
            if (!data.userId || !data.productId || !data.quantity) {
                throw new Error('Поля "Пользователь", "Товар" и "Количество" обязательны для заполнения');
            }
            
            // Проверка на существование пользователя и товара
            const userExists = users.some(user => user.id === parseInt(data.userId));
            const productExists = products.some(product => product.id === parseInt(data.productId));
            
            if (!userExists) {
                throw new Error('Выбранный пользователь не существует');
            }
            
            if (!productExists) {
                throw new Error('Выбранный товар не существует');
            }
            
            // Валидация количества
            if (data.quantity <= 0) {
                throw new Error('Количество должно быть положительным числом');
            }
            
            // Создаем правильный объект для отправки
            const cartToSend = {
                user: { id: parseInt(data.userId) },
                product: { id: parseInt(data.productId) },
                quantity: parseInt(data.quantity)
            };
            
            // Удаляем поле id при создании нового элемента корзины
            // (т.к. на сервере используется автоинкремент)
            delete cartToSend.id;
            
            return createCart(cartToSend);
        },
        update: (id, data) => {
            // Валидация перед отправкой на сервер
            if (!data.userId || !data.productId || !data.quantity) {
                throw new Error('Поля "Пользователь", "Товар" и "Количество" обязательны для заполнения');
            }
            
            // Проверка на существование пользователя и товара
            const userExists = users.some(user => user.id === parseInt(data.userId));
            const productExists = products.some(product => product.id === parseInt(data.productId));
            
            if (!userExists) {
                throw new Error('Выбранный пользователь не существует');
            }
            
            if (!productExists) {
                throw new Error('Выбранный товар не существует');
            }
            
            // Валидация количества
            if (data.quantity <= 0) {
                throw new Error('Количество должно быть положительным числом');
            }
            
            // Создаем правильный объект для отправки
            const cartToSend = {
                user: { id: parseInt(data.userId) },
                product: { id: parseInt(data.productId) },
                quantity: parseInt(data.quantity)
            };
            
            return updateCart(id, cartToSend);
        },
        delete: deleteCart
    };

    const fields = [
        {
            name: 'id',
            label: 'ID',
            type: 'number',
            readOnly: true,
            display: (item) => item.id // Отображать ID только в таблице
        },
        {
            name: 'userId',
            label: 'Пользователь',
            required: true,
            render: (item, onChange) => (
                <select
                    value={item.userId || (item.user ? item.user.id : '')}
                    onChange={(e) => onChange('userId', e.target.value)}
                >
                    <option value="">Выберите пользователя</option>
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
                return user ? `${user.firstName} ${user.lastName}` : `Пользователь ${item.user.id}`;
            }
        },
        {
            name: 'productId',
            label: 'Товар',
            required: true,
            render: (item, onChange) => (
                <select
                    value={item.productId || (item.product ? item.product.id : '')}
                    onChange={(e) => onChange('productId', e.target.value)}
                >
                    <option value="">Выберите товар</option>
                    {products.map(product => (
                        <option key={product.id} value={product.id}>
                            {product.name}
                        </option>
                    ))}
                </select>
            ),
            display: (item) => {
                if (!item.product) return '';
                const product = products.find(p => p.id === item.product.id);
                return product ? product.name : `Товар ${item.product.id}`;
            }
        },
        {
            name: 'quantity',
            label: 'Количество',
            type: 'number',
            required: true
        }
    ];

    // Отключаем валидацию "на лету" - она будет происходить только при отправке
    const validators = {
        userId: () => true,
        productId: () => true,
        quantity: () => true
    };

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Загрузка данных...</div>;
    }

    if (error) {
        return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;
    }

    return (
        <GenericTableManager
            title="Управление корзинами"
            apiClient={apiClient}
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
    );
};

export default AdminCartGeneric; 