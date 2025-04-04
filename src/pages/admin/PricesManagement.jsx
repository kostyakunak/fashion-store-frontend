import React, { useState, useEffect } from "react";
import "../../styles/AdminTables.css";

const PricesManagement = () => {
    const [prices, setPrices] = useState([]);
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingPrice, setEditingPrice] = useState(null);
    const [newPrice, setNewPrice] = useState({
        productId: "",
        originalPrice: "",
        price: "",
        discount: ""
    });
    const [editingField, setEditingField] = useState(null);
    const [editingValue, setEditingValue] = useState("");

    useEffect(() => {
        fetchPrices();
        fetchProducts();
    }, []);

    const fetchPrices = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/admin/prices");
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setPrices(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching prices:", error);
            setPrices([]);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/admin/products");
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setProducts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching products:", error);
            setProducts([]);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleEdit = (price) => {
        setEditingPrice(price);
        setNewPrice({
            productId: price.product.id,
            originalPrice: price.original_price,
            price: price.present_price,
            discount: price.discount
        });
    };

    const handleFieldEdit = (field, value) => {
        setEditingField(field);
        setEditingValue(value);
    };

    const handleFieldSave = async (priceId, field, value) => {
        try {
            const updatedPrice = {
                ...prices.find(p => p.id === priceId),
                [field]: value
            };

            const response = await fetch(`http://localhost:8080/api/admin/prices/${priceId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedPrice),
            });

            if (!response.ok) {
                throw new Error('Failed to update price');
            }

            // Обновляем локальное состояние
            setPrices(prices.map(price => 
                price.id === priceId ? { ...price, [field]: value } : price
            ));
            setEditingField(null);
        } catch (error) {
            console.error('Error updating price:', error);
            alert('Failed to update price');
        }
    };

    const handleFieldCancel = () => {
        setEditingField(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this price?")) {
            try {
                const response = await fetch(`http://localhost:8080/api/admin/prices/${id}`, {
                    method: "DELETE",
                });
                if (response.ok) {
                    fetchPrices();
                }
            } catch (error) {
                console.error("Error deleting price:", error);
            }
        }
    };

    const handleAdd = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/admin/prices", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newPrice),
            });
            if (response.ok) {
                fetchPrices();
                setNewPrice({
                    productId: "",
                    originalPrice: "",
                    price: "",
                    discount: ""
                });
            }
        } catch (error) {
            console.error("Error adding price:", error);
        }
    };

    const filteredPrices = Array.isArray(prices) ? prices.filter((price) =>
        price?.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    return (
        <div className="admin-table-container">
            <h1>Prices Management</h1>
            
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search by product name..."
                    value={searchTerm}
                    onChange={handleSearch}
                />
            </div>

            <div className="form-container">
                <h2>{editingPrice ? "Edit Price" : "Add New Price"}</h2>
                {editingPrice ? (
                    <>
                        <div className="edit-field">
                            <label>Product:</label>
                            <span>{editingPrice.product?.name || 'N/A'}</span>
                        </div>
                        <div className="edit-field">
                            <label>Original Price:</label>
                            {editingField === 'original_price' ? (
                                <>
                                    <input
                                        type="number"
                                        value={editingValue}
                                        onChange={(e) => setEditingValue(e.target.value)}
                                        step="0.01"
                                        min="0"
                                    />
                                    <button onClick={() => handleFieldSave(editingPrice.id, 'original_price', parseFloat(editingValue))}>Save</button>
                                    <button onClick={() => handleFieldCancel()}>Cancel</button>
                                </>
                            ) : (
                                <>
                                    <span onClick={() => handleFieldEdit('original_price', editingPrice.original_price)}>
                                        ${editingPrice.original_price || '0.00'}
                                    </span>
                                    <button onClick={() => handleFieldEdit('original_price', editingPrice.original_price)}>Edit</button>
                                </>
                            )}
                        </div>
                        <div className="edit-field">
                            <label>Current Price:</label>
                            {editingField === 'present_price' ? (
                                <>
                                    <input
                                        type="number"
                                        value={editingValue}
                                        onChange={(e) => setEditingValue(e.target.value)}
                                        step="0.01"
                                        min="0"
                                    />
                                    <button onClick={() => handleFieldSave(editingPrice.id, 'present_price', parseFloat(editingValue))}>Save</button>
                                    <button onClick={() => handleFieldCancel()}>Cancel</button>
                                </>
                            ) : (
                                <>
                                    <span onClick={() => handleFieldEdit('present_price', editingPrice.present_price)}>
                                        ${editingPrice.present_price || '0.00'}
                                    </span>
                                    <button onClick={() => handleFieldEdit('present_price', editingPrice.present_price)}>Edit</button>
                                </>
                            )}
                        </div>
                        <div className="edit-field">
                            <label>Discount:</label>
                            {editingField === 'discount' ? (
                                <>
                                    <input
                                        type="number"
                                        value={newPrice.discount}
                                        onChange={(e) => setNewPrice({ ...newPrice, discount: e.target.value })}
                                    />
                                    <button onClick={() => handleFieldSave(editingPrice.id, 'discount', newPrice.discount)}>Save</button>
                                    <button onClick={() => handleFieldCancel()}>Cancel</button>
                                </>
                            ) : (
                                <>
                                    <span>{editingPrice.discount}%</span>
                                    <button onClick={() => handleFieldEdit('discount', editingPrice.discount)}>Edit</button>
                                </>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <select
                            value={newPrice.productId}
                            onChange={(e) => setNewPrice({ ...newPrice, productId: e.target.value })}
                        >
                            <option value="">Select Product</option>
                            {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.name}
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            placeholder="Original Price"
                            value={newPrice.originalPrice}
                            onChange={(e) => setNewPrice({ ...newPrice, originalPrice: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Current Price"
                            value={newPrice.price}
                            onChange={(e) => setNewPrice({ ...newPrice, price: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Discount"
                            value={newPrice.discount}
                            onChange={(e) => setNewPrice({ ...newPrice, discount: e.target.value })}
                        />
                        <button onClick={handleAdd}>Add Price</button>
                    </>
                )}
            </div>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Original Price</th>
                        <th>Current Price</th>
                        <th>Discount</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredPrices.map((price) => (
                        <tr key={price.id}>
                            <td>{price.product?.name || 'N/A'}</td>
                            <td>
                                {editingField === 'original_price' ? (
                                    <div className="edit-field">
                                        <input
                                            type="number"
                                            value={editingValue}
                                            onChange={(e) => setEditingValue(e.target.value)}
                                            step="0.01"
                                            min="0"
                                        />
                                        <button onClick={() => handleFieldSave(price.id, 'original_price', parseFloat(editingValue))}>Save</button>
                                        <button onClick={() => handleFieldCancel()}>Cancel</button>
                                    </div>
                                ) : (
                                    <span onClick={() => handleFieldEdit('original_price', price.original_price)}>
                                        ${price.original_price || '0.00'}
                                    </span>
                                )}
                            </td>
                            <td>
                                {editingField === 'present_price' ? (
                                    <div className="edit-field">
                                        <input
                                            type="number"
                                            value={editingValue}
                                            onChange={(e) => setEditingValue(e.target.value)}
                                            step="0.01"
                                            min="0"
                                        />
                                        <button onClick={() => handleFieldSave(price.id, 'present_price', parseFloat(editingValue))}>Save</button>
                                        <button onClick={() => handleFieldCancel()}>Cancel</button>
                                    </div>
                                ) : (
                                    <span onClick={() => handleFieldEdit('present_price', price.present_price)}>
                                        ${price.present_price || '0.00'}
                                    </span>
                                )}
                            </td>
                            <td>{price.discount}%</td>
                            <td>
                                <button onClick={() => handleEdit(price)}>Edit</button>
                                <button onClick={() => handleDelete(price.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PricesManagement; 