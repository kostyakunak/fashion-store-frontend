import React, { useState, useEffect } from 'react';
import GenericTableManager from '../../components/generic/GenericTableManager';
import { getAddresses, createAddress, updateAddress, deleteAddress, getUsers } from '../../api/addressesApi';

const AdminAddresses = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await getUsers();
            console.log('Получены пользователи:', data);
            setUsers(data);
        } catch (error) {
            console.error('Ошибка при загрузке пользователей:', error);
        }
    };

    const apiClient = {
        getAll: getAddresses,
        create: (data) => {
            // Преобразуем userId в объект user
            const userId = data.userId || data.user?.id;
            if (!userId) {
                throw new Error('ID пользователя обязателен');
            }

            // Удаляем id из данных, чтобы серверная автогенерация работала корректно
            const { id, ...dataWithoutId } = data;

            return createAddress({
                ...dataWithoutId,
                user: { id: userId }
            });
        },
        update: (id, data) => {
            // Преобразуем userId в объект user
            const userId = data.userId || data.user?.id;
            if (!userId) {
                throw new Error('ID пользователя обязателен');
            }

            return updateAddress(id, {
                ...data,
                user: { id: userId }
            });
        },
        delete: deleteAddress
    };

    const fields = [
        {
            name: 'id',
            label: 'ID',
            type: 'number',
            readOnly: true
        },
        {
            name: 'userId',
            label: 'Пользователь',
            render: (item, onChange) => {
                const currentValue = item.userId || (item.user ? item.user.id : '');
                return (
                    <select
                        value={currentValue}
                        onChange={(e) => {
                            const value = e.target.value === '' ? null : parseInt(e.target.value);
                            onChange('userId', value);
                        }}
                    >
                        <option value="">Выберите пользователя</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.firstName} {user.lastName} ({user.email})
                            </option>
                        ))}
                    </select>
                );
            },
            display: (item) => {
                const user = users.find(u => u.id === (item.userId || (item.user ? item.user.id : null)));
                return user ? `${user.firstName} ${user.lastName}` : 'N/A';
            }
        },
        {
            name: 'recipientFirstName',
            label: 'Имя получателя',
            type: 'text',
            required: true
        },
        {
            name: 'recipientLastName',
            label: 'Фамилия получателя',
            type: 'text',
            required: true
        },
        {
            name: 'street',
            label: 'Улица',
            type: 'text',
            required: true
        },
        {
            name: 'city',
            label: 'Город',
            type: 'text',
            required: true
        },
        {
            name: 'country',
            label: 'Страна',
            type: 'text',
            required: true
        },
        {
            name: 'postalCode',
            label: 'Почтовый индекс',
            type: 'text',
            required: true
        }
    ];

    const validators = {
        userId: (value) => {
            if (value === null) return false;
            return users.some(u => u.id === value);
        },
        recipientFirstName: (value) => value && value.trim().length > 0,
        recipientLastName: (value) => value && value.trim().length > 0,
        street: (value) => value && value.trim().length > 0,
        city: (value) => value && value.trim().length > 0,
        country: (value) => value && value.trim().length > 0,
        postalCode: (value) => value && value.trim().length > 0
    };

    return (
        <GenericTableManager
            title="Управление адресами"
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

export default AdminAddresses; 