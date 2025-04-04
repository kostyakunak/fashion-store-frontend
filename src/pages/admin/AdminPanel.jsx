import React from "react";
import { Link } from "react-router-dom";
import "../../styles/AdminPanel.css";

const AdminPanel = () => {
    return (
        <div className="admin-panel">
            <h1>Панель администратора</h1>
            <div className="admin-menu">
                <Link to="/admin/add-product-page" className="admin-menu-item">
                    <h2>Управление товарами</h2>
                    <p>Добавление, редактирование и удаление товаров</p>
                </Link>
                <Link to="/admin/add-order-page" className="admin-menu-item">
                    <h2>Управление заказами</h2>
                    <p>Просмотр и обработка заказов</p>
                </Link>
                <Link to="/admin/add-user-page" className="admin-menu-item">
                    <h2>Управление пользователями</h2>
                    <p>Управление пользователями и их адресами</p>
                </Link>
                <Link to="/admin/specific-tables" className="admin-menu-item">
                    <h2>Специфические таблицы</h2>
                    <p>Управление ценами, складом и заказами</p>
                </Link>
            </div>
        </div>
    );
};

export default AdminPanel; 