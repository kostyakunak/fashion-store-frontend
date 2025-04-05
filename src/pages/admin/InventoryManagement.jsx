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
        sizeId: "",
        quantity: ""
    });
    const [editingValue, setEditingValue] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [searchField, setSearchField] = useState('product');

    const searchFields = [
        { value: 'id', label: 'ID' },
        { value: 'product', label: 'Product Name' },
        { value: 'size', label: 'Size' },
        { value: 'quantity', label: 'Quantity' }
    ];

    useEffect(() => {
        fetchInventory();
        fetchProducts();
        fetchSizes();
    }, []);

    const fetchInventory = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/admin/warehouse");
            if (!response.ok) {
                throw new Error('Failed to fetch inventory');
            }
            const data = await response.json();
            setInventory(data);
        } catch (error) {
            console.error("Error fetching inventory:", error);
            alert("Error fetching inventory: " + error.message);
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

    const fetchSizes = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/admin/sizes");
            if (!response.ok) {
                throw new Error('Failed to fetch sizes');
            }
            const data = await response.json();
            setSizes(data);
        } catch (error) {
            console.error("Error fetching sizes:", error);
            alert("Error fetching sizes: " + error.message);
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

    const findNextFreeId = () => {
        const existingIds = inventory.map(item => item.id);
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

    const sortedInventory = React.useMemo(() => {
        let sortableInventory = [...inventory];
        if (sortConfig.key) {
            sortableInventory.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                if (sortConfig.key === 'product') {
                    aValue = a.product.name;
                    bValue = b.product.name;
                } else if (sortConfig.key === 'size') {
                    aValue = a.size.name;
                    bValue = b.size.name;
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
        return sortableInventory;
    }, [inventory, sortConfig]);

    const filteredInventory = sortedInventory.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        switch (searchField) {
            case 'id':
                return item.id.toString().includes(searchLower);
            case 'product':
                return item.product.name.toLowerCase().includes(searchLower);
            case 'size':
                return item.size.name.toLowerCase().includes(searchLower);
            case 'quantity':
                return item.quantity.toString().includes(searchLower);
            default:
                return true;
        }
    });

    return (
        <div className="admin-page">
            <h1>Управление инвентарем</h1>
            
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
                setEditingItem(null);
                setNewItem({
                    id: findNextFreeId().toString(),
                    productId: "",
                    sizeId: "",
                    quantity: "",
                });
            }}>
                Добавить запись
            </button>

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
                            onClick={() => handleSort('size')}
                            className="sortable-header"
                        >
                            Size {sortConfig.key === 'size' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th 
                            onClick={() => handleSort('quantity')}
                            className="sortable-header"
                        >
                            Quantity {sortConfig.key === 'quantity' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredInventory.map((item) => (
                        <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>{item.product.name}</td>
                            <td>{item.size.name}</td>
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