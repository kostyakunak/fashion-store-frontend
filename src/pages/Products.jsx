import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_CONFIG } from '../config/apiConfig';
import '../styles/Products.css';

const Products = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch(`${API_CONFIG.API_URL}/products`);
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    return (
        <div className="products">
            <h1>Our Products</h1>
            <div className="products-grid">
                {products.map((product) => (
                    <div key={product.id} className="product-card">
                        <h3>{product.name}</h3>
                        <p>{product.description}</p>
                        <Link to={`/products/${product.id}`} className="view-button">
                            View Details
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Products; 