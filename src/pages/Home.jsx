import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
    return (
        <div className="home">
            <h1>Welcome to Fashion Store</h1>
            <p>Discover our latest collection of fashionable items</p>
            <Link to="/products" className="cta-button">
                Browse Products
            </Link>
        </div>
    );
};

export default Home; 