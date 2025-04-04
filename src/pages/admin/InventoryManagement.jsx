import React, { useState, useEffect } from "react";
import "../../styles/AdminTables.css";

const InventoryManagement = () => {
    const [inventory, setInventory] = useState([]);
    const [products, setProducts] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingItem, setEditingItem] = useState(null);
    const [editingField, setEditingField] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newItem, setNewItem] = useState({
        id: "",
        productId: "",
        quantity: "",
        sizeId: ""
    });
    const [editingValue, setEditingValue] = useState("");

    useEffect(() => {
        fetchInventory();
        fetchProducts();
        fetchSizes();
    }, []);

    const fetchInventory = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/admin/warehouse");
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setInventory(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching inventory:", error);
            setInventory([]);
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

    const fetchSizes = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/admin/sizes');
            if (!response.ok) {
                throw new Error('Failed to fetch sizes');
            }
            const data = await response.json();
            setSizes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching sizes:', error);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleEdit = (item) => {
        setShowAddForm(false);
        setEditingItem({
            oldId: item.id,
            id: item.id,
            productId: item.product.id,
            sizeId: item.size.id,
            quantity: item.quantity
        });
    };

    const handleFieldEdit = (field, value) => {
        setEditingField(field);
        setEditingValue(value.toString());
    };

    const handleFieldSave = async () => {
        try {
            if (!editingItem) return;

            const originalId = parseInt(editingItem.oldId);
            const newId = parseInt(editingItem.id);
            const idChanged = originalId !== newId;

            const duplicateItem = idChanged ? inventory.find(item => item.id === newId) : null;
            if (duplicateItem) {
                throw new Error(`Запись с ID ${newId} уже существует`);
            }

            const updatedData = {
                id: newId,
                productId: parseInt(editingItem.productId),
                sizeId: parseInt(editingItem.sizeId),
                quantity: parseInt(editingItem.quantity)
            };

            console.log('Sending update:', updatedData);

            let response;
            if (idChanged) {
                try {
                    await fetch(`http://localhost:8080/api/admin/warehouse/${originalId}`, {
                        method: 'DELETE'
                    });
                    
                    response = await fetch(`http://localhost:8080/api/admin/warehouse`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(updatedData),
                    });
                } catch (error) {
                    console.error('Error deleting old record:', error);
                    throw new Error('Failed to delete old record: ' + error.message);
                }
            } else {
                response = await fetch(`http://localhost:8080/api/admin/warehouse/${originalId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedData),
                });
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server response:', errorText);
                throw new Error('Failed to update inventory: ' + errorText);
            }

            const updatedDataFromServer = await response.json();
            console.log('Received update:', updatedDataFromServer);

            if (idChanged) {
                setInventory(inventory.filter(item => item.id !== originalId).concat(updatedDataFromServer));
            } else {
                setInventory(inventory.map(item => 
                    item.id === originalId ? updatedDataFromServer : item
                ));
            }
            
            fetchInventory();
            setEditingItem(null);
        } catch (error) {
            console.error('Error updating inventory:', error);
            alert('Failed to update inventory: ' + error.message);
        }
    };

    const handleFieldCancel = () => {
        setEditingField(null);
        setEditingValue("");
        setEditingItem(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this inventory item?")) {
            try {
                const response = await fetch(`http://localhost:8080/api/admin/warehouse/${id}`, {
                    method: "DELETE",
                });
                if (response.ok) {
                    fetchInventory();
                }
            } catch (error) {
                console.error("Error deleting inventory item:", error);
            }
        }
    };

    const handleAdd = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/admin/warehouse", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newItem),
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server response:', errorText);
                throw new Error('Failed to add inventory: ' + errorText);
            }
            
            await fetchInventory();
            setShowAddForm(false);
            setNewItem({
                id: "",
                productId: "",
                quantity: "",
                sizeId: ""
            });
        } catch (error) {
            console.error("Error adding inventory item:", error);
            alert('Failed to add inventory: ' + error.message);
        }
    };

    const filteredInventory = Array.isArray(inventory) ? inventory.filter((item) =>
        item?.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    // Функция для нахождения следующего свободного ID
    const findNextFreeId = () => {
        if (!inventory || inventory.length === 0) return 1;
        
        // Создаем отсортированный массив всех существующих ID
        const existingIds = inventory.map(item => item.id).sort((a, b) => a - b);
        
        // Ищем первый пропуск в последовательности
        let nextId = 1;
        for (const id of existingIds) {
            if (id > nextId) {
                // Нашли пропуск
                return nextId;
            }
            nextId = id + 1;
        }
        
        // Если пропусков нет, возвращаем следующий ID после последнего
        return nextId;
    };

    // Обновляем показ формы добавления, чтобы автоматически заполнять ID
    const handleShowAddForm = () => {
        setEditingItem(null);
        setNewItem({
            ...newItem,
            id: findNextFreeId()
        });
        setShowAddForm(true);
    };

    return (
        <div className="admin-table-container">
            <h1>Inventory Management</h1>
            
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search by product name..."
                    value={searchTerm}
                    onChange={handleSearch}
                />
                {!showAddForm && (
                    <button onClick={handleShowAddForm}>Add New Item</button>
                )}
            </div>

            {showAddForm && !editingItem && (
                <div className="form-container">
                    <h2>Add New Inventory Item</h2>
                    <div className="edit-field">
                        <label>ID:</label>
                        <input
                            type="number"
                            placeholder="ID"
                            value={newItem.id}
                            onChange={(e) => setNewItem({ ...newItem, id: e.target.value })}
                            min="1"
                        />
                    </div>
                    <select
                        value={newItem.productId}
                        onChange={(e) => setNewItem({ ...newItem, productId: e.target.value })}
                    >
                        <option value="">Select Product</option>
                        {products.map((product) => (
                            <option key={product.id} value={product.id}>
                                {product.name}
                            </option>
                        ))}
                    </select>
                    <select
                        value={newItem.sizeId}
                        onChange={(e) => setNewItem({ ...newItem, sizeId: e.target.value })}
                    >
                        <option value="">Select Size</option>
                        {sizes.map((size) => (
                            <option key={size.id} value={size.id}>
                                {size.name}
                            </option>
                        ))}
                    </select>
                    <input
                        type="number"
                        placeholder="Quantity"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                    />
                    <button onClick={handleAdd}>Add Item</button>
                    <button onClick={() => setShowAddForm(false)}>Cancel</button>
                </div>
            )}

            {editingItem && !showAddForm && (
                <div className="form-container">
                    <h2>Edit Inventory Item</h2>
                    <div className="edit-field">
                        <label>ID:</label>
                        <input
                            type="number"
                            value={editingItem.id}
                            onChange={(e) => setEditingItem({ ...editingItem, id: e.target.value })}
                            min="1"
                        />
                    </div>
                    <select
                        value={editingItem.productId}
                        onChange={(e) => setEditingItem({ ...editingItem, productId: e.target.value })}
                    >
                        <option value="">Select Product</option>
                        {products.map((product) => (
                            <option key={product.id} value={product.id}>
                                {product.name}
                            </option>
                        ))}
                    </select>
                    <select
                        value={editingItem.sizeId}
                        onChange={(e) => setEditingItem({ ...editingItem, sizeId: e.target.value })}
                    >
                        <option value="">Select Size</option>
                        {sizes.map((size) => (
                            <option key={size.id} value={size.id}>
                                {size.name}
                            </option>
                        ))}
                    </select>
                    <input
                        type="number"
                        value={editingItem.quantity}
                        onChange={(e) => setEditingItem({ ...editingItem, quantity: e.target.value })}
                    />
                    <button onClick={handleFieldSave}>Save</button>
                    <button onClick={() => setEditingItem(null)}>Cancel</button>
                </div>
            )}

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Product</th>
                        <th>Size</th>
                        <th>Quantity</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredInventory.map((item) => (
                        <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>{item.product?.name}</td>
                            <td>{item.size?.name}</td>
                            <td>{item.quantity}</td>
                            <td>
                                <button onClick={() => handleEdit(item)}>Edit</button>
                                <button onClick={() => handleDelete(item.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default InventoryManagement; 