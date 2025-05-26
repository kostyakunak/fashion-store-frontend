import React, { useState, useEffect } from 'react';
import GenericTableManager from '../../components/generic/GenericTableManager';
import { getAllWishlists, createWishlistItem, deleteWishlistItem, updateWishlistItem } from '../../api/wishlistApi';
import { getUsers } from '../../api/usersApi';
import { getProducts } from '../../api/productsApi';

const AdminWishlistGeneric = () => {
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [wishlists, setWishlists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Загрузка данных при монтировании компонента
        const loadData = async () => {
            try {
                setLoading(true);
                // Получаем пользователей и товары
                const [usersData, productsData] = await Promise.all([
                    getUsers(),
                    getProducts()
                ]);
                
                setUsers(usersData);
                setProducts(productsData);
                
                if (usersData.length > 0) {
                    // Получаем списки желаний для всех пользователей
                    const userIds = usersData.map(user => user.id);
                    const wishlistsData = await getAllWishlists(userIds);
                    // Сортируем по ID перед установкой в состояние
                    setWishlists(wishlistsData.sort((a, b) => a.id - b.id));
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

    // Метод для получения всех списков желаний
    const getAllWishlistsData = async () => {
        if (users.length === 0) {
            return [];
        }
        
        const userIds = users.map(user => user.id);
        const wishlistsData = await getAllWishlists(userIds);
        
        // Сортируем по ID
        return wishlistsData.sort((a, b) => a.id - b.id);
    };

    const apiClient = {
        getAll: getAllWishlistsData,
        create: (data) => {
            // Валидация перед отправкой на сервер
            if (!data.userId || !data.productId) {
                throw new Error('Поля "Пользователь" и "Товар" обязательны для заполнения');
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
            
            // Проверка на дубликаты - один товар может быть только один раз в списке желаний пользователя
            const isItemExists = wishlists.some(item => 
                item.user.id === parseInt(data.userId) && 
                item.product.id === parseInt(data.productId)
            );
            
            if (isItemExists) {
                throw new Error('Этот товар уже есть в списке желаний пользователя');
            }
            
            // Создаем правильный объект для отправки
            const wishlistItemToSend = {
                user: { id: parseInt(data.userId) },
                product: { id: parseInt(data.productId) }
            };
            
            // Удаляем поле id при создании нового элемента 
            // (т.к. на сервере используется автоинкремент)
            delete wishlistItemToSend.id;
            
            return createWishlistItem(wishlistItemToSend)
                .then(newItem => {
                    // Обновляем список и сортируем по ID
                    const updatedWishlists = [...wishlists, newItem].sort((a, b) => a.id - b.id);
                    setWishlists(updatedWishlists);
                    return newItem;
                });
        },
        update: (id, data) => {
            // Валидация перед отправкой на сервер
            if (!data.userId || !data.productId) {
                throw new Error('Поля "Пользователь" и "Товар" обязательны для заполнения');
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
            
            // Проверка на дубликаты - один товар может быть только один раз в списке желаний пользователя
            const isItemExists = wishlists.some(item => 
                item.id !== id && // Исключаем текущую запись из проверки
                item.user.id === parseInt(data.userId) && 
                item.product.id === parseInt(data.productId)
            );
            
            if (isItemExists) {
                throw new Error('Этот товар уже есть в списке желаний данного пользователя');
            }
            
            // Создаем правильный объект для отправки
            const wishlistItemToSend = {
                user: { id: parseInt(data.userId) },
                product: { id: parseInt(data.productId) }
            };
            
            // Используем метод обновления из API
            return updateWishlistItem(id, wishlistItemToSend)
                .then(updatedItem => {
                    // Обновляем список в состоянии компонента и сортируем по ID
                    const updatedWishlists = wishlists
                        .map(item => item.id === id ? updatedItem : item)
                        .sort((a, b) => a.id - b.id);
                    setWishlists(updatedWishlists);
                    return updatedItem;
                });
        },
        delete: (id) => {
            return deleteWishlistItem(id)
                .then(() => {
                    // Удаляем элемент из списка и сортируем
                    const updatedWishlists = wishlists
                        .filter(item => item.id !== id)
                        .sort((a, b) => a.id - b.id);
                    setWishlists(updatedWishlists);
                });
        }
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
        }
    ];

    // Отключаем валидацию "на лету" - она будет происходить только при отправке
    const validators = {
        userId: () => true,
        productId: () => true
    };

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Загрузка данных...</div>;
    }

    if (error) {
        return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;
    }

    return (
        <GenericTableManager
            title="Управление списками желаний"
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

export default AdminWishlistGeneric; 