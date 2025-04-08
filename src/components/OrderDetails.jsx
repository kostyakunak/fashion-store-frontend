import React, { useState, useEffect } from "react";
import "../styles/OrderDetails.css";
import { Footer } from "../scripts/Footer";
import { Header } from "../scripts/Header";
import axios from "axios";

function OrderDetails() {
    const [orderDetails, setOrderDetails] = useState([]);
    const [products, setProducts] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [orders, setOrders] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState("");
    const [selectedSize, setSelectedSize] = useState("");
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        fetchOrderDetails();
        fetchProducts();
        fetchSizes();
        fetchOrders();
    }, []);

    const fetchOrderDetails = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/order-details");
            setOrderDetails(response.data);
        } catch (error) {
            console.error("Error fetching order details:", error);
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/orders");
            setOrders(response.data);
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/products");
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const fetchSizes = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/sizes");
            setSizes(response.data);
        } catch (error) {
            console.error("Error fetching sizes:", error);
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setSelectedProduct(item.product_id);
        setSelectedSize(item.size_id);
        setQuantity(item.quantity);
    };

    const handleSave = async () => {
        try {
            await axios.put(`http://localhost:8080/api/order-details/${editingItem.id}`, {
                product_id: selectedProduct,
                size_id: selectedSize,
                quantity: quantity
            });
            setEditingItem(null);
            fetchOrderDetails();
        } catch (error) {
            console.error("Error updating order detail:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/api/order-details/${id}`);
            fetchOrderDetails();
        } catch (error) {
            console.error("Error deleting order detail:", error);
        }
    };

    return (
        <div className="order_details">
            <Header />
            <main>
                <div className="order-details-container">
                    <h2>Order Details</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Order ID</th>
                                <th>Product</th>
                                <th>Size</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orderDetails.map((item) => {
                                const order = orders.find(o => o.id === item.order_id);
                                return (
                                    <tr key={item.id}>
                                        <td>{item.id}</td>
                                        <td>{order ? order.id : 'N/A'}</td>
                                        <td>
                                            {editingItem?.id === item.id ? (
                                                <select
                                                    value={selectedProduct}
                                                    onChange={(e) => setSelectedProduct(e.target.value)}
                                                >
                                                    <option value="">Select Product</option>
                                                    {products.map((product) => (
                                                        <option key={product.id} value={product.id}>
                                                            {product.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                products.find(p => p.id === item.product_id)?.name
                                            )}
                                        </td>
                                        <td>
                                            {editingItem?.id === item.id ? (
                                                <select
                                                    value={selectedSize}
                                                    onChange={(e) => setSelectedSize(e.target.value)}
                                                >
                                                    <option value="">Select Size</option>
                                                    {sizes.map((size) => (
                                                        <option key={size.id} value={size.id}>
                                                            {size.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                sizes.find(s => s.id === item.size_id)?.name
                                            )}
                                        </td>
                                        <td>
                                            {editingItem?.id === item.id ? (
                                                <input
                                                    type="number"
                                                    value={quantity}
                                                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                                                    min="1"
                                                />
                                            ) : (
                                                item.quantity
                                            )}
                                        </td>
                                        <td>${item.price_at_purchase}</td>
                                        <td>
                                            {editingItem?.id === item.id ? (
                                                <>
                                                    <button onClick={handleSave}>Save</button>
                                                    <button onClick={() => setEditingItem(null)}>Cancel</button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => handleEdit(item)}>Edit</button>
                                                    <button onClick={() => handleDelete(item.id)}>Delete</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default OrderDetails;