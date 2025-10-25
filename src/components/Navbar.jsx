import React, { useState, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const timeoutRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsDropdownOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsDropdownOpen(false);
        }, 300);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-logo">
                    <Link to="/">KOUNAK</Link>
                </div>
                
                <div className="navbar-links">
                    {/* <Link to="/catalog">Каталог</Link> */}
                </div>

                <div className="navbar-actions">
                <div 
                    className="navbar-account"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <div className="account-icon">
                        <i className="fas fa-user"></i>
                    </div>
                    {isDropdownOpen && (
                        <div className="account-dropdown">
                            {user ? (
                                <>
                                    <div className="user-info">
                                        <p>{user.firstName} {user.lastName}</p>
                                        <p className="user-email">{user.email}</p>
                                    </div>
                                    <div className="dropdown-links">
                                        <Link to="/orders">Мої замовлення</Link>
                                        <Link to="/account/details">Деталі акаунта</Link>
                                        <Link to="/contacts">Контакти</Link>
                                        <button onClick={handleLogout}>Вийти</button>
                                    </div>
                                </>
                            ) : (
                                <div className="dropdown-links">
                                    <Link to="/login">Увійти</Link>
                                    <Link to="/register">Реєстрація</Link>
                                </div>
                            )}
                        </div>
                    )}
                    </div>
                    <Link to="/wishlist" className="navbar-icon-link" aria-label="Обране">
                        <i className="fas fa-heart navbar-icon"></i>
                    </Link>
                    <Link to="/cart" className="navbar-icon-link" aria-label="Кошик">
                        <i className="fas fa-shopping-cart navbar-icon"></i>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 