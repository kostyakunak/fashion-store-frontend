import React, { useState, useEffect } from 'react';
import GenericTableManager from '../../components/generic/GenericTableManager';
import { getPayments, createPayment, updatePayment, deletePayment } from '../../api/paymentsApi';
import { getOrders } from '../../api/ordersApi';
import { getUsers } from '../../api/usersApi';

const AdminPaymentsGeneric = () => {
    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [usersData, ordersData] = await Promise.all([
                    getUsers(),
                    getOrders()
                ]);
                // Сортируем данные для предсказуемого отображения
                setUsers(usersData.sort((a, b) => a.id - b.id));
                setOrders(ordersData.sort((a, b) => a.id - b.id));
            } catch (error) {
                console.error("Ошибка при загрузке данных:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Форматирование даты для отображения в таблице
    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleString();
        } catch (error) {
            console.error("Ошибка форматирования даты:", error);
            return dateString;
        }
    };

    // Форматирование даты для поля datetime-local
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try {
            // Преобразуем дату в формат YYYY-MM-DDTHH:MM, который требуется для input type="datetime-local"
            const date = new Date(dateString);
            // Учитываем смещение локальной временной зоны
            const offset = date.getTimezoneOffset() * 60000;
            const localISOTime = (new Date(date.getTime() - offset)).toISOString().substring(0, 16);
            return localISOTime;
        } catch (error) {
            console.error("Ошибка форматирования даты для ввода:", error);
            return '';
        }
    };

    // Преобразование строки в формат DateTime для отправки на сервер
    const parseDate = (dateString) => {
        if (!dateString) return null;
        try {
            // При создании даты из строки datetime-local, JavaScript интерпретирует её как локальную
            // Но нам нужно сохранить её "как есть", без автоматического перевода в UTC
            
            // Создаем дату из строки ввода (она будет в локальном времени)
            const localDate = new Date(dateString);
            
            // Получаем компоненты даты в локальном времени
            const year = localDate.getFullYear();
            const month = localDate.getMonth();
            const day = localDate.getDate();
            const hours = localDate.getHours();
            const minutes = localDate.getMinutes();
            
            // Создаем новую дату в UTC с теми же компонентами
            const utcDate = new Date(Date.UTC(year, month, day, hours, minutes));
            
            // Преобразуем в ISO строку
            return utcDate.toISOString();
        } catch (error) {
            console.error("Ошибка парсинга даты:", error);
            throw new Error("Некорректный формат даты. Используйте формат YYYY-MM-DDTHH:MM");
        }
    };

    const apiClient = {
        getAll: async () => {
            try {
                const data = await getPayments();
                // Сортируем данные для предсказуемого отображения
                return data.sort((a, b) => a.id - b.id);
            } catch (error) {
                console.error("Ошибка при получении платежей:", error);
                throw error;
            }
        },
        create: async (data) => {
            try {
                // Удаляем id из данных, чтобы серверная автогенерация работала корректно
                const { id, ...dataWithoutId } = data;
                
                // Валидация данных перед отправкой
                if (!dataWithoutId.userId) {
                    throw new Error("Выберите пользователя");
                }
                
                if (!dataWithoutId.orderId) {
                    throw new Error("Выберите заказ");
                }
                
                if (!dataWithoutId.amount || isNaN(parseFloat(dataWithoutId.amount)) || parseFloat(dataWithoutId.amount) <= 0) {
                    throw new Error("Сумма должна быть положительным числом");
                }
                
                // Преобразуем данные для отправки на сервер
                const paymentData = {
                    user: { id: parseInt(dataWithoutId.userId) },
                    order: { id: parseInt(dataWithoutId.orderId) },
                    amount: parseFloat(dataWithoutId.amount),
                    paymentDate: dataWithoutId.paymentDate ? parseDate(dataWithoutId.paymentDate) : new Date().toISOString()
                };
                
                const result = await createPayment(paymentData);
                return result;
            } catch (error) {
                console.error("Ошибка при создании платежа:", error);
                throw new Error(error.response?.data?.message || error.message || "Ошибка при создании платежа");
            }
        },
        update: async (id, data) => {
            try {
                // Валидация данных перед отправкой
                if (!data.userId) {
                    throw new Error("Выберите пользователя");
                }
                
                if (!data.orderId) {
                    throw new Error("Выберите заказ");
                }
                
                if (!data.amount || isNaN(parseFloat(data.amount)) || parseFloat(data.amount) <= 0) {
                    throw new Error("Сумма должна быть положительным числом");
                }
                
                // Преобразуем данные для отправки на сервер
                const paymentData = {
                    user: { id: parseInt(data.userId) },
                    order: { id: parseInt(data.orderId) },
                    amount: parseFloat(data.amount),
                    paymentDate: data.paymentDate ? parseDate(data.paymentDate) : null
                };
                
                const result = await updatePayment(id, paymentData);
                return result;
            } catch (error) {
                console.error("Ошибка при обновлении платежа:", error);
                throw new Error(error.response?.data?.message || error.message || "Ошибка при обновлении платежа");
            }
        },
        delete: async (id) => {
            try {
                await deletePayment(id);
                return true;
            } catch (error) {
                console.error("Ошибка при удалении платежа:", error);
                throw new Error(error.response?.data?.message || error.message || "Ошибка при удалении платежа");
            }
        }
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
            label: "Пользователь",
            required: true,
            render: (item, onChange, mode) => {
                // Определяем режим на основе наличия item.id и наличия originalId
                // В режиме создания item.id обычно null или временный ID
                // В режиме редактирования у item есть свойство originalId - ID оригинального элемента
                const isEditMode = item.originalId !== undefined;
                
                if (isEditMode) {
                    // Режим редактирования существующего платежа
                    const userId = item.userId || (item.user ? item.user.id : null);
                    const user = users.find(u => u.id === userId);
                    return (
                        <div>
                            <input 
                                type="text" 
                                value={user ? `${user.firstName} ${user.lastName} (${user.email})` : 'Не указан'} 
                                disabled={true}
                                className="form-control disabled"
                            />
                        </div>
                    );
                } 
                
                // Режим создания нового платежа
                return (
                    <select
                        value={item.userId || ''}
                        onChange={(e) => {
                            const value = e.target.value ? parseInt(e.target.value, 10) : '';
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
                const userId = item.userId || (item.user ? item.user.id : null);
                const user = users.find(u => u.id === userId);
                return user ? `${user.firstName} ${user.lastName}` : 'Не указан';
            }
        },
        {
            name: "orderId",
            label: "Заказ",
            required: true,
            render: (item, onChange, mode) => {
                // Определяем режим на основе наличия item.id и наличия originalId
                // В режиме создания item.id обычно null или временный ID
                // В режиме редактирования у item есть свойство originalId - ID оригинального элемента
                const isEditMode = item.originalId !== undefined;
                
                if (isEditMode) {
                    // Режим редактирования существующего платежа
                    const orderId = item.orderId || (item.order ? item.order.id : null);
                    const order = orders.find(o => o.id === orderId);
                    return (
                        <input 
                            type="text" 
                            value={order ? `Заказ #${order.id} (${order.status})` : 'Не указан'} 
                            disabled={true}
                            className="form-control disabled"
                        />
                    );
                }
                
                // Режим создания нового платежа
                return (
                    <select
                        value={item.orderId || ''}
                        onChange={(e) => {
                            const value = e.target.value ? parseInt(e.target.value, 10) : '';
                            onChange('orderId', value);
                        }}
                    >
                        <option value="">Выберите заказ</option>
                        {orders.map(order => (
                            <option key={order.id} value={order.id}>
                                Заказ #{order.id} ({order.status})
                            </option>
                        ))}
                    </select>
                );
            },
            display: (item) => {
                const orderId = item.orderId || (item.order ? item.order.id : null);
                const order = orders.find(o => o.id === orderId);
                return order ? `Заказ #${order.id} (${order.status})` : 'Не указан';
            }
        },
        {
            name: "amount",
            label: "Сумма",
            type: "number",
            required: true,
            display: (item) => `${item.amount} руб.`
        },
        {
            name: "paymentDate",
            label: "Дата платежа",
            type: "datetime-local",
            hint: "Внимание: изменение даты платежа может повлиять на финансовую отчетность!",
            render: (item, onChange) => (
                <input
                    type="datetime-local"
                    value={item.paymentDate || ''}
                    onChange={(e) => onChange('paymentDate', e.target.value)}
                    className="form-control"
                />
            ),
            display: (item) => formatDate(item.paymentDate)
        }
    ];

    // Отключаем валидацию "на лету", все проверки выполняются при отправке
    const validators = {
        userId: () => true,
        orderId: () => true,
        amount: () => true,
        paymentDate: () => true
    };

    // Кастомные обработчики для корректной работы с вложенными объектами
    const customHandlers = {
        onEdit: (item) => {
            // Преобразуем вложенные объекты в идентификаторы для формы редактирования
            return {
                ...item,
                userId: item.user ? item.user.id : null,
                orderId: item.order ? item.order.id : null,
                // Форматируем дату для поля datetime-local
                paymentDate: item.paymentDate ? formatDateForInput(item.paymentDate) : null
            };
        }
    };

    if (loading) {
        return <div className="loading-container">Загрузка данных...</div>;
    }

    return (
        <div>
            <GenericTableManager
                title="Управление платежами"
                apiClient={apiClient}
                fields={fields}
                validators={validators}
                customHandlers={customHandlers}
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

export default AdminPaymentsGeneric; 