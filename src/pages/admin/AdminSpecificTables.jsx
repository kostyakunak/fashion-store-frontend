import React from "react";
import { Link } from "react-router-dom";
import "../../styles/AdminSpecificTables.css";

const AdminSpecificTables = () => {
    return (
        <div className="admin-specific-tables">
            <h1>Database Tables Management</h1>
            <div className="tables-container">
                <Link to="/admin/prices-management" className="table-card">
                    <h2>Prices Table</h2>
                    <p>Manage product prices, discounts, and price history</p>
                </Link>
                <Link to="/admin/inventory-management" className="table-card">
                    <h2>Inventory Table</h2>
                    <p>Track product stock levels and warehouse management</p>
                </Link>
                <Link to="/admin/orders-management" className="table-card">
                    <h2>Orders Table</h2>
                    <p>View and manage customer orders and their status</p>
                </Link>
                <Link to="/admin/order-details" className="table-card">
                    <h2>Order Details Table</h2>
                    <p>Manage order items, quantities, and prices</p>
                </Link>
                <Link to="/admin/addresses" className="table-card">
                    <h2>Addresses Table</h2>
                    <p>Manage customer shipping and billing addresses</p>
                </Link>
            </div>
        </div>
    );
};

export default AdminSpecificTables; 