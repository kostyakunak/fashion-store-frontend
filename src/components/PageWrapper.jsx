import React from 'react';
import Navbar from './Navbar';
import { useLocation } from 'react-router-dom';

const PageWrapper = ({ children }) => {
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    return (
        <div className="page-wrapper">
            {!isHomePage && <Navbar />}
            <main className={!isHomePage ? 'content-with-navbar' : ''}>
                {children}
            </main>
        </div>
    );
};

export default PageWrapper; 