import React, { useState } from 'react';
import GenericTableManager from '../../components/generic/GenericTableManager';
import { getUsers, createUser, updateUser, deleteUser } from '../../api/usersApi';

const AdminUsersGeneric = () => {
    const [passwordVisible, setPasswordVisible] = useState({});

    const apiClient = {
        getAll: getUsers,
        create: (data) => {
            // Здесь выполняем полную валидацию перед отправкой на сервер
            if (!data.email || !data.firstName || !data.lastName || !data.phone || !data.password || !data.role) {
                throw new Error('Все поля обязательны для заполнения');
            }
            
            // Проверка формата email
            const emailRegex = /^[^\s@]+@[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                throw new Error('Некорректный формат email');
            }
            
            // Проверка длины пароля
            if (data.password.length < 6) {
                throw new Error('Пароль должен содержать минимум 6 символов');
            }
            
            return createUser(data);
        },
        update: (id, data) => {
            // Проверяем обязательные поля перед обновлением
            if (!data.email || !data.firstName || !data.lastName || !data.phone || !data.role) {
                throw new Error('Все поля кроме пароля обязательны для заполнения');
            }
            
            // Проверка формата email
            const emailRegex = /^[^\s@]+@[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                throw new Error('Некорректный формат email');
            }
            
            // Проверка длины пароля, если он был изменен
            if (data.password && data.password.length < 6) {
                throw new Error('Пароль должен содержать минимум 6 символов');
            }
            
            // Если пароль пустой, не отправляем его (сохраняем существующий)
            if (!data.password) {
                const { password, ...dataWithoutPassword } = data;
                return updateUser(id, dataWithoutPassword);
            }
            
            return updateUser(id, data);
        },
        delete: deleteUser
    };

    const togglePasswordVisibility = (itemId) => {
        setPasswordVisible(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    const fields = [
        {
            name: 'id',
            label: 'ID',
            type: 'number',
            readOnly: true
        },
        {
            name: 'firstName',
            label: 'Имя',
            type: 'text',
            required: true
        },
        {
            name: 'lastName',
            label: 'Фамилия',
            type: 'text',
            required: true
        },
        {
            name: 'email',
            label: 'Email',
            type: 'email',
            required: true
        },
        {
            name: 'phone',
            label: 'Телефон',
            type: 'tel',
            required: true
        },
        {
            name: 'password',
            label: 'Пароль',
            render: (item, onChange) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                        type={passwordVisible[item.id] ? 'text' : 'password'}
                        value={item.password || ''}
                        onChange={(e) => onChange('password', e.target.value)}
                        placeholder={item.id ? 'Оставьте пустым, чтобы не менять' : 'Введите пароль'}
                    />
                    <button
                        type="button"
                        onClick={() => togglePasswordVisibility(item.id)}
                        style={{ marginLeft: '5px', border: 'none', background: 'none', cursor: 'pointer' }}
                    >
                        {passwordVisible[item.id] ? '🙈' : '👁️'}
                    </button>
                </div>
            ),
            display: () => '••••••••'
        },
        {
            name: 'role',
            label: 'Роль',
            render: (item, onChange) => (
                <select
                    value={item.role || 'USER'}
                    onChange={(e) => onChange('role', e.target.value)}
                >
                    <option value="USER">Пользователь</option>
                    <option value="ADMIN">Администратор</option>
                </select>
            )
        }
    ];

    // Валидаторы, которые всегда возвращают true - отключаем валидацию "на лету"
    const validators = {
        firstName: () => true,
        lastName: () => true,
        email: () => true,
        phone: () => true,
        password: () => true,
        role: () => true
    };

    return (
        <GenericTableManager
            title="Управление пользователями"
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

export default AdminUsersGeneric; 