import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/AuthLayout.css';

const AuthLayout = ({ children, title }) => {
    return (
        <div className="auth-layout">
            <div className="auth-container">
                <h1 className="auth-title">{title}</h1>
                {children}
                <div className="auth-links">
                    <Link to="/login">Вхід</Link>
                    <Link to="/register">Реєстрація</Link>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout; 