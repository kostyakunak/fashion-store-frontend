import React, { useState, useContext, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
    const location = useLocation();
    const isHomePage = location.pathname === '/';
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const { user, logout, isAdmin } = useContext(AuthContext);
    const navigate = useNavigate();
    const timeoutRef = useRef(null);

    const toggleSideMenu = () => {
        setIsSideMenuOpen(!isSideMenuOpen);
    };

    const closeSideMenu = useCallback(() => {
        setIsSideMenuOpen(false);
    }, []);

    const handleMenuLinkClick = () => {
        closeSideMenu();
    };

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

    // Проверка размера экрана для мобильных устройств
    useEffect(() => {
        const checkMobile = () => {
            const width = window.innerWidth;
            const mobile = width <= 768;
            setIsMobile(mobile);
            console.log('Navbar: isMobile =', mobile, 'width =', width);
        };
        
        // Проверяем сразу при монтировании
        checkMobile();
        
        // Также проверяем после небольшой задержки на случай, если размер еще не установлен
        const timeoutId = setTimeout(checkMobile, 100);
        
        window.addEventListener('resize', checkMobile);
        return () => {
            window.removeEventListener('resize', checkMobile);
            clearTimeout(timeoutId);
        };
    }, []);

    // Закрытие меню при изменении маршрута
    useEffect(() => {
        closeSideMenu();
    }, [location.pathname]);

    // Закрытие меню при нажатии Escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isSideMenuOpen) {
                closeSideMenu();
            }
        };

        if (isSideMenuOpen) {
            document.addEventListener('keydown', handleEscape);
            // Блокируем скролл body при открытом меню
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isSideMenuOpen, closeSideMenu]);

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-logo">
                    <Link to="/">KOUNAK</Link>
                </div>
                
                <div className="navbar-links">
                    {/* <Link to="/catalog">Каталог</Link> */}
                </div>

                <div className={`navbar-actions ${isHomePage && !isMobile ? 'hide-on-desktop-home' : ''}`}>
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
                                        <Link to="/wishlist">Мій список бажань</Link>
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
                    <Link to="/cart" className="navbar-icon-link" aria-label="Кошик">
                        <i className="fas fa-shopping-cart navbar-icon"></i>
                    </Link>
                    <button 
                        className={`navbar-icon-link hamburger-menu-btn ${isHomePage && !isMobile ? 'hide-on-desktop-home' : ''}`}
                        aria-label="Меню"
                        onClick={toggleSideMenu}
                    >
                        <i className="fas fa-bars navbar-icon"></i>
                    </button>
                </div>
            </div>
            
            {/* Выдвигающееся меню справа - показываем только на мобильных или когда не на главной странице */}
            {(!isHomePage || isMobile) && (
                <>
                    <div className={`side-menu-overlay ${isSideMenuOpen ? 'active' : ''}`} onClick={closeSideMenu}></div>
                    <div className={`side-menu ${isSideMenuOpen ? 'open' : ''}`}>
                        <div className="side-menu-header">
                            <button className="side-menu-close" onClick={closeSideMenu} aria-label="Закрыть меню">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <nav className="side-menu-nav">
                            <Link to="/catalog" onClick={handleMenuLinkClick} className="side-menu-link">
                                <span>Каталог</span>
                            </Link>
                            <Link to="/account" onClick={handleMenuLinkClick} className="side-menu-link">
                                <span>Особистий кабінет</span>
                            </Link>
                            <Link to="/cart" onClick={handleMenuLinkClick} className="side-menu-link">
                                <span>Кошик</span>
                            </Link>
                            <Link to="/wishlist" onClick={handleMenuLinkClick} className="side-menu-link">
                                <span>Список бажань</span>
                            </Link>
                            <Link to="/contacts" onClick={handleMenuLinkClick} className="side-menu-link">
                                <span>Контакти</span>
                            </Link>
                            {user && isAdmin() && (
                                <Link to="/admin" onClick={handleMenuLinkClick} className="side-menu-link">
                                    <span>Панель адміністратора</span>
                                </Link>
                            )}
                        </nav>
                    </div>
                </>
            )}
        </nav>
    );
};

export default Navbar; 