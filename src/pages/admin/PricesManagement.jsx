import React, { useState, useEffect } from "react";
import "../../styles/AdminTables.css";

const PricesManagement = () => {
    const [prices, setPrices] = useState([]);
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingPrice, setEditingPrice] = useState(null);
    const [newItem, setNewItem] = useState({
        id: "",
        productId: "",
        original_price: "",
        present_price: ""
    });

    useEffect(() => {
        fetchPrices();
        fetchProducts();
    }, []);

    const fetchPrices = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/admin/prices");
            if (!response.ok) {
                throw new Error('Failed to fetch prices');
            }
            const data = await response.json();
            setPrices(data);
        } catch (error) {
            console.error("Error fetching prices:", error);
            alert("Error fetching prices: " + error.message);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/admin/products");
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error("Error fetching products:", error);
            alert("Error fetching products: " + error.message);
        }
    };

    const findNextFreeId = () => {
        const existingIds = prices.map(price => price.id);
        let nextId = 1;
        while (existingIds.includes(nextId)) {
            nextId++;
        }
        return nextId;
    };

    const handleEdit = (price) => {
        setEditingPrice({
            oldId: price.id,
            id: price.id,
            productId: price.product.id.toString(),
            original_price: price.original_price?.toString() || "",
            present_price: price.present_price?.toString() || ""
        });
        setShowAddForm(true);
    };

    const handleUpdate = async () => {
        try {
            if (!editingPrice) return;

            const originalId = parseInt(editingPrice.oldId);
            const newId = parseInt(editingPrice.id);
            const idChanged = originalId !== newId;

            const duplicatePrice = idChanged ? prices.find(p => p.id === newId) : null;
            if (duplicatePrice) {
                throw new Error(`Цена с ID ${newId} уже существует`);
            }

            const requestData = {
                product: {
                    id: parseInt(editingPrice.productId)
                },
                original_price: editingPrice.original_price ? parseFloat(editingPrice.original_price) : null,
                present_price: parseFloat(editingPrice.present_price)
            };

            console.log("Отправляемые данные для обновления:", requestData);

            let response;
            if (idChanged) {
                try {
                    await fetch(`http://localhost:8080/api/admin/prices/${originalId}`, {
                        method: 'DELETE'
                    });
                    
                    response = await fetch("http://localhost:8080/api/admin/prices", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ ...requestData, id: newId }),
                    });
                } catch (error) {
                    console.error('Error deleting old record:', error);
                    throw new Error('Failed to delete old record: ' + error.message);
                }
            } else {
                response = await fetch(`http://localhost:8080/api/admin/prices/${originalId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestData),
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Ответ сервера:", errorData);
                throw new Error("Failed to update price");
            }

            const updatedPrice = await response.json();
            
            // Получаем обновленную информацию о продукте
            const productResponse = await fetch(`http://localhost:8080/api/admin/products/${updatedPrice.product.id}`);
            if (productResponse.ok) {
                const updatedProduct = await productResponse.json();
                updatedPrice.product = updatedProduct;
            }

            if (idChanged) {
                setPrices(prices.filter(p => p.id !== originalId).concat(updatedPrice).sort((a, b) => a.id - b.id));
            } else {
                setPrices(prices.map(p => p.id === originalId ? updatedPrice : p).sort((a, b) => a.id - b.id));
            }

            setShowAddForm(false);
            setEditingPrice(null);
            setNewItem({
                productId: "",
                original_price: "",
                present_price: "",
            });
        } catch (error) {
            console.error("Error updating price:", error);
            alert("Ошибка при обновлении цены: " + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this price?')) return;

        try {
            const response = await fetch(`http://localhost:8080/api/admin/prices/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete price');
            }

            await fetchPrices();
        } catch (error) {
            console.error('Error deleting price:', error);
            alert('Error deleting price: ' + error.message);
        }
    };

    const handleAdd = async () => {
        try {
            if (!newItem.productId || !newItem.present_price) {
                alert("Пожалуйста, заполните все обязательные поля");
                return;
            }

            const requestData = {
                id: parseInt(newItem.id),
                product: {
                    id: parseInt(newItem.productId)
                },
                original_price: newItem.original_price ? parseFloat(newItem.original_price) : null,
                present_price: parseFloat(newItem.present_price)
            };

            console.log("Отправляемые данные:", requestData);

            const response = await fetch("http://localhost:8080/api/admin/prices", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Ответ сервера:", errorData);
                throw new Error("Failed to add price");
            }

            const addedPrice = await response.json();
            
            // Получаем обновленную информацию о продукте
            const productResponse = await fetch(`http://localhost:8080/api/admin/products/${addedPrice.product.id}`);
            if (productResponse.ok) {
                const updatedProduct = await productResponse.json();
                addedPrice.product = updatedProduct;
            }

            setPrices([...prices, addedPrice].sort((a, b) => a.id - b.id));
            setShowAddForm(false);
            setNewItem({
                id: findNextFreeId().toString(),
                productId: "",
                original_price: "",
                present_price: "",
            });
        } catch (error) {
            console.error("Error adding price:", error);
            alert("Ошибка при добавлении цены: " + error.message);
        }
    };

    const filteredPrices = prices.filter(price => {
        const searchLower = searchTerm.toLowerCase();
        return (
            price.id.toString().includes(searchLower) ||
            price.product.name.toLowerCase().includes(searchLower) ||
            price.original_price.toString().includes(searchLower) ||
            price.present_price.toString().includes(searchLower)
        );
    });

    return (
        <div className="admin-page">
            <h1>Управление ценами</h1>
            
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Поиск по продукту..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <button className="add-button" onClick={() => {
                setShowAddForm(true);
                setEditingPrice(null);
                setNewItem({
                    id: findNextFreeId().toString(),
                    productId: "",
                    original_price: "",
                    present_price: "",
                });
            }}>
                Добавить цену
            </button>

            {showAddForm && (
                <div className="form-container">
                    <h2>{editingPrice ? "Редактировать цену" : "Добавить новую цену"}</h2>
                    <div className="form-group">
                        <label>ID:</label>
                        <input
                            type="number"
                            value={editingPrice ? editingPrice.id : newItem.id}
                            onChange={(e) => {
                                if (editingPrice) {
                                    setEditingPrice({ ...editingPrice, id: e.target.value });
                                } else {
                                    setNewItem({ ...newItem, id: e.target.value });
                                }
                            }}
                            min="1"
                        />
                    </div>
                    <div className="form-group">
                        <label>Продукт:</label>
                        <select
                            value={editingPrice ? editingPrice.productId : newItem.productId}
                            onChange={(e) => {
                                if (editingPrice) {
                                    setEditingPrice({ ...editingPrice, productId: e.target.value });
                                } else {
                                    setNewItem({ ...newItem, productId: e.target.value });
                                }
                            }}
                        >
                            <option value="">Выберите продукт</option>
                            {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Оригинальная цена:</label>
                        <input
                            type="number"
                            step="0.01"
                            value={editingPrice ? editingPrice.original_price : newItem.original_price}
                            onChange={(e) => {
                                if (editingPrice) {
                                    setEditingPrice({ ...editingPrice, original_price: e.target.value });
                                } else {
                                    setNewItem({ ...newItem, original_price: e.target.value });
                                }
                            }}
                        />
                    </div>
                    <div className="form-group">
                        <label>Текущая цена:</label>
                        <input
                            type="number"
                            step="0.01"
                            value={editingPrice ? editingPrice.present_price : newItem.present_price}
                            onChange={(e) => {
                                if (editingPrice) {
                                    setEditingPrice({ ...editingPrice, present_price: e.target.value });
                                } else {
                                    setNewItem({ ...newItem, present_price: e.target.value });
                                }
                            }}
                        />
                    </div>
                    <div className="form-actions">
                        <button onClick={editingPrice ? handleUpdate : handleAdd}>
                            {editingPrice ? "Сохранить" : "Добавить"}
                        </button>
                        <button onClick={() => {
                            setShowAddForm(false);
                            setEditingPrice(null);
                            setNewItem({
                                id: "",
                                productId: "",
                                original_price: "",
                                present_price: "",
                            });
                        }}>
                            Отмена
                        </button>
                    </div>
                </div>
            )}

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Product</th>
                        <th>Original Price</th>
                        <th>Present Price</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredPrices.map((price) => (
                        <tr key={price.id}>
                            <td>{price.id}</td>
                            <td>{price.product.name}</td>
                            <td>{price.original_price}</td>
                            <td>{price.present_price}</td>
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