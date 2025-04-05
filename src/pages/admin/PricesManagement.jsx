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
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [searchField, setSearchField] = useState('product');

    const searchFields = [
        { value: 'id', label: 'ID' },
        { value: 'product', label: 'Product Name' },
        { value: 'original_price', label: 'Original Price' },
        { value: 'present_price', label: 'Present Price' }
    ];

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

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedPrices = React.useMemo(() => {
        let sortablePrices = [...prices];
        if (sortConfig.key) {
            sortablePrices.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                if (sortConfig.key === 'product') {
                    aValue = a.product.name;
                    bValue = b.product.name;
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortablePrices;
    }, [prices, sortConfig]);

    const filteredPrices = sortedPrices.filter(price => {
        const searchLower = searchTerm.toLowerCase();
        switch (searchField) {
            case 'id':
                return price.id.toString().includes(searchLower);
            case 'product':
                return price.product.name.toLowerCase().includes(searchLower);
            case 'original_price':
                return price.original_price?.toString().includes(searchLower);
            case 'present_price':
                return price.present_price?.toString().includes(searchLower);
            default:
                return true;
        }
    });

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

    return (
        <div className="admin-page">
            <h1>Управление ценами</h1>
            
            <div className="search-container">
                <select 
                    value={searchField} 
                    onChange={(e) => setSearchField(e.target.value)}
                    className="search-field-select"
                >
                    {searchFields.map(field => (
                        <option key={field.value} value={field.value}>
                            {field.label}
                        </option>
                    ))}
                </select>
                <input
                    type="text"
                    placeholder={`Поиск по ${searchFields.find(f => f.value === searchField)?.label.toLowerCase()}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
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
                        <th 
                            onClick={() => handleSort('id')}
                            className="sortable-header"
                        >
                            ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th 
                            onClick={() => handleSort('product')}
                            className="sortable-header"
                        >
                            Product {sortConfig.key === 'product' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th 
                            onClick={() => handleSort('original_price')}
                            className="sortable-header"
                        >
                            Original Price {sortConfig.key === 'original_price' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th 
                            onClick={() => handleSort('present_price')}
                            className="sortable-header"
                        >
                            Present Price {sortConfig.key === 'present_price' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
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