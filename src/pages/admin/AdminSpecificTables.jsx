import React from "react";
import { Link } from "react-router-dom";
import "../../styles/AdminSpecificTables.css";

const AdminSpecificTables = () => {
    return (
        <div className="admin-specific-tables">
            <h1>Специфические таблицы</h1>
            <div className="tables-container">
                {/* Стандартные ссылки для работы с базой данных */}
                <Link to="/admin/prices-management" className="table-card">
                    <h2>Таблица цен</h2>
                    <p>Управление ценами, скидками и историей цен</p>
                </Link>
                <Link to="/admin/inventory-management" className="table-card">
                    <h2>Таблица инвентаря</h2>
                    <p>Отслеживание уровней запасов и управление складом</p>
                </Link>
                <Link to="/admin/orders-management" className="table-card">
                    <h2>Таблица заказов</h2>
                    <p>Просмотр и управление заказами клиентов</p>
                </Link>
                <Link to="/admin/order-details" className="table-card">
                    <h2>Таблица деталей заказа</h2>
                    <p>Управление товарами, количеством и ценами в заказах</p>
                </Link>
                
                {/* Добавленные ссылки из админ-панели */}
                <Link to="/admin/products-generic" className="table-card">
                    <h2>Товары (Generic)</h2>
                    <p>Улучшенное управление товарами через GenericTableManager</p>
                </Link>
                <Link to="/admin/categories" className="table-card">
                    <h2>Категории</h2>
                    <p>Добавление, редактирование и удаление категорий товаров</p>
                </Link>
                <Link to="/admin/sizes" className="table-card">
                    <h2>Размеры</h2>
                    <p>Добавление и удаление размеров товаров</p>
                </Link>
                <Link to="/admin/payments" className="table-card">
                    <h2>Платежи</h2>
                    <p>Мониторинг и управление платежами пользователей</p>
                </Link>
                <Link to="/admin/users-generic" className="table-card">
                    <h2>Пользователи (Generic)</h2>
                    <p>Улучшенное управление пользователями</p>
                </Link>
                <Link to="/admin/addresses" className="table-card">
                    <h2>Адреса</h2>
                    <p>Управление адресами пользователей</p>
                </Link>
                <Link to="/admin/cart-generic" className="table-card">
                    <h2>Корзины</h2>
                    <p>Управление корзинами пользователей</p>
                </Link>
                <Link to="/admin/wishlist-generic" className="table-card">
                    <h2>Списки желаний</h2>
                    <p>Управление избранными товарами пользователей</p>
                </Link>
            </div>
        </div>
    );
};

export default AdminSpecificTables; 