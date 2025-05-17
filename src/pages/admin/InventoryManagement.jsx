import React, { useState, useEffect } from "react";
import "../../styles/AdminTables.css";
import { getWarehouse } from "../../api/warehouseApi";
import { getProducts } from "../../api/productsApi";
import { getSizes } from "../../api/sizesApi";

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
            const data = await getWarehouse();
            setInventory(data);
        } catch (error) {
            console.error("Error fetching inventory:", error);
            alert("Ошибка при загрузке инвентаря: " + error.message);
        }
    };

    const fetchProducts = async () => {
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (error) {
            console.error("Error fetching products:", error);
            alert("Error fetching products: " + error.message);
        }
    };

    const fetchSizes = async () => {
        try {
            const data = await getSizes();
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

    const handleFieldSave = async (id, field, value) => {
        try {
            if (field === 'quantity' && value < 0) {
                throw new Error('Количество не может быть отрицательным');
            }
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/admin/warehouse/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ [field]: value }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ошибка обновления: ${errorText}`);
            }
            const updatedItem = await response.json();
            setInventory(inventory.map(item => 
                item.id === id ? updatedItem : item
            ));
            setEditingField(null);
            setEditingValue('');
        } catch (error) {
            console.error('Ошибка обновления:', error);
            alert('Ошибка обновления: ' + error.message);
        }
    };

    const handleFieldCancel = () => {
        setEditingField(null);
        setEditingValue('');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Вы уверены, что хотите удалить эту запись?')) {
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/admin/warehouse/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to delete item: ${errorText}`);
            }
            setInventory(inventory.filter(item => item.id !== id));
        } catch (error) {
            console.error("Error deleting item:", error);
            alert("Ошибка при удалении записи: " + error.message);
        }
    };

    const handleAdd = async () => {
        try {
            if (newItem.quantity < 0) {
                throw new Error('Количество не может быть отрицательным');
            }
            const token = localStorage.getItem('token');
            const response = await fetch("http://localhost:8080/api/admin/warehouse", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(newItem),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ошибка добавления: ${errorText}`);
            }
            await fetchInventory();
            setShowAddForm(false);
            setNewItem({
                id: "",
                productId: "",
                sizeId: "",
                quantity: ""
            });
        } catch (error) {
            console.error("Ошибка добавления:", error);
            alert('Ошибка добавления: ' + error.message);
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
        let sortableItems = [...inventory];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                if (sortConfig.key === 'product') {
                    return sortConfig.direction === 'asc' 
                        ? a.product.name.localeCompare(b.product.name)
                        : b.product.name.localeCompare(a.product.name);
                } else if (sortConfig.key === 'size') {
                    return sortConfig.direction === 'asc'
                        ? a.size.name.localeCompare(b.size.name)
                        : b.size.name.localeCompare(a.size.name);
                } else {
                    return sortConfig.direction === 'asc'
                        ? a[sortConfig.key] - b[sortConfig.key]
                        : b[sortConfig.key] - a[sortConfig.key];
                }
            });
        }
        return sortableItems;
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
                    <button onClick={() => handleFieldSave(editingItem.id, editingField, editingValue)}>Save</button>
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
                    {sortedInventory.map((item) => (
                        <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>{item.product.name}</td>
                            <td>{item.size.name}</td>
                            <td>
                                {editingField === 'quantity' && editingItem?.id === item.id ? (
                                    <div className="edit-field">
                                        <input
                                            type="number"
                                            value={editingValue}
                                            onChange={(e) => setEditingValue(e.target.value)}
                                            min="0"
                                        />
                                        <button onClick={() => handleFieldSave(item.id, 'quantity', parseInt(editingValue))}>Save</button>
                                        <button onClick={() => handleFieldCancel()}>Cancel</button>
                                    </div>
                                ) : (
                                    <span onClick={() => handleFieldEdit('quantity', item.quantity)}>
                                        {item.quantity}
                                    </span>
                                )}
                            </td>
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