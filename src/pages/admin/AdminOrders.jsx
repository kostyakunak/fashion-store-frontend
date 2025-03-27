import React, { useEffect, useState } from "react";
import {
    createOrder, getOrders, updateOrderStatus, deleteOrder
} from "../../api/ordersApi";
import { getProducts } from "../../api/productsApi";
import { getUsers } from "../../api/usersApi";
import { createPayment } from "../../api/paymentsApi";
import { getSizes } from "../../api/sizesApi";

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [newOrder, setNewOrder] = useState({
        userId: "",
        items: [],
        status: "AWAITING_PAYMENT",
        paymentMethod: "card",
        paymentStatus: "success"
    });

    useEffect(() => {
        fetchOrders();
        fetchUsers();
        fetchProducts();
        fetchSizes();
    }, []);

    const fetchOrders = async () => {
        const data = await getOrders();
        setOrders(data);
    };

    const fetchUsers = async () => {
        const data = await getUsers();
        setUsers(data);
    };

    const fetchProducts = async () => {
        const data = await getProducts();
        setProducts(data);
    };

    const fetchSizes = async () => {
        const data = await getSizes();
        setSizes(data);
    };

    const handleAddItem = () => {
        setNewOrder({
            ...newOrder,
            items: [...newOrder.items, { productId: "", sizeId: "", quantity: 1 }]
        });
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...newOrder.items];
        updatedItems[index][field] = value;
        setNewOrder({ ...newOrder, items: updatedItems });
    };

    const handleCreateOrder = async () => {
        console.log("Создаем заказ с данными:", newOrder);

        if (!newOrder.userId || newOrder.items.length === 0) {
            alert("Выберите пользователя и добавьте товары в заказ.");
            return;
        }

        try {
            // ✅ 1. Создаем заказ
            const createdOrder = await createOrder({
                userId: newOrder.userId,
                status: newOrder.status,
                items: newOrder.items
            });

            console.log("Ответ от createOrder:", createdOrder);

            if (!createdOrder.id) {
                throw new Error("Ошибка: createdOrder не содержит ID");
            }

            // ✅ 2. Создаем объект платежа
            const paymentData = {
                userId: newOrder.userId,
                order: { id: createdOrder.id }, // <-- ПОПРАВЛЕННАЯ СТРОКА
                amount: newOrder.items.reduce((total, item) => {
                    const product = products.find(p => p.id === item.productId);
                    return total + (product ? product.currentPrice * item.quantity : 0);
                }, 0),
                paymentMethod: newOrder.paymentMethod,
                status: newOrder.paymentStatus
            };

            console.log("Отправляем платеж с данными:", paymentData);

            // ✅ 3. Отправляем платеж
            await createPayment(paymentData);

            // ✅ 4. Очищаем форму
            setNewOrder({
                userId: "",
                items: [],
                status: "AWAITING_PAYMENT",
                paymentMethod: "card",
                paymentStatus: "success"
            });

            // ✅ 5. Обновляем заказы
            fetchOrders();
        } catch (error) {
            console.error("Ошибка при создании заказа:", error);
        }
    };

    const handleDeleteOrder = async (id) => {
        await deleteOrder(id);
        fetchOrders();
    };

    return (
        <div>
            <h2>Админка - Заказы</h2>

            <div>
                <h3>Добавить новый заказ</h3>
                <select
                    value={newOrder.userId}
                    onChange={(e) => setNewOrder({ ...newOrder, userId: e.target.value })}
                >
                    <option value="">Выберите пользователя</option>
                    {users.map(user => (
                        <option key={user.id} value={user.id}>
                            {user.first_name} {user.last_name} ({user.email})
                        </option>
                    ))}
                </select>

                {newOrder.items.map((item, index) => (
                    <div key={index}>
                        <select
                            value={item.productId}
                            onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                        >
                            <option value="">Выберите товар</option>
                            {products.map(product => (
                                <option key={product.id} value={product.id}>
                                    {product.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={item.sizeId}
                            onChange={(e) => handleItemChange(index, "sizeId", e.target.value)}
                        >
                            <option value="">Выберите размер</option>
                            {sizes.map(size => (
                                <option key={size.id} value={size.id}>
                                    {size.name}
                                </option>
                            ))}
                        </select>

                        <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                            placeholder="Количество"
                        />
                    </div>
                ))}
                <button onClick={handleAddItem}>Добавить товар в заказ</button>

                <select
                    value={newOrder.status}
                    onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value })}
                >
                    <option value="AWAITING_PAYMENT">Ожидает оплаты</option>
                    <option value="PENDING">Подтвержден</option>
                    <option value="SHIPPED">Отправлен</option>
                    <option value="DELIVERED">Доставлен</option>
                    <option value="CANCELLED">Отменен</option>
                </select>

                <select
                    value={newOrder.paymentMethod}
                    onChange={(e) => setNewOrder({ ...newOrder, paymentMethod: e.target.value })}
                >
                    <option value="card">Карта</option>
                    <option value="paypal">PayPal</option>
                    <option value="crypto">Криптовалюта</option>
                </select>

                <select
                    value={newOrder.paymentStatus}
                    onChange={(e) => setNewOrder({ ...newOrder, paymentStatus: e.target.value })}
                >
                    <option value="success">Успешно</option>
                    <option value="failed">Неуспешно</option>
                </select>

                <button onClick={handleCreateOrder}>Добавить заказ</button>
            </div>
        </div>
    );
};

export default AdminOrders;
