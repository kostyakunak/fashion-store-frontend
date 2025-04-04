import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">Fashion Store</Link>
            </div>
            <div className="navbar-links">
                <Link to="/products">Products</Link>
                <Link to="/cart">Cart</Link>
                <Link to="/admin">Admin Panel</Link>
            </div>
        </nav>
    );
};

export default Navbar; 