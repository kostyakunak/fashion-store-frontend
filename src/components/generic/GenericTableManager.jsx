import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../../styles/AdminTables.css';

const GenericTableManager = ({
    title,
    apiClient,
    fields,
    customHandlers,
    validators,
    additionalComponents,
    styles
}) => {
    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [newItem, setNewItem] = useState({});
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const data = await apiClient.getAll();
            setItems(data);
        } catch (error) {
            console.error("Error fetching items:", error);
            setErrors({ fetch: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedItems = React.useMemo(() => {
        let sortableItems = [...items];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [items, sortConfig]);

    const filteredItems = sortedItems.filter(item =>
        Object.values(item).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const validateField = (name, value) => {
        if (validators && validators[name]) {
            return validators[name](value);
        }
        return true;
    };

    const handleInputChange = (name, value, item = null) => {
        const targetItem = item || newItem;
        
        // Для поля ID просто обновляем значение без валидации
        if (name === 'id') {
            if (item) {
                setEditingItem(prev => ({ ...prev, [name]: value }));
            } else {
                setNewItem({ ...targetItem, [name]: value });
            }
            return;
        }
        
        // Преобразуем значение в число для числовых полей
        let processedValue = value;
        if (name === 'orderId' || name === 'productId' || name === 'sizeId' || name === 'quantity') {
            processedValue = value === '' ? null : parseInt(value);
        }
        
        const isValid = validateField(name, processedValue);
        
        if (!isValid) {
            setErrors(prev => ({ ...prev, [name]: `Invalid ${name}` }));
            return;
        }

        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
        });

        if (item) {
            setEditingItem(prev => ({ ...prev, [name]: processedValue }));
        } else {
            setNewItem({ ...targetItem, [name]: processedValue });
        }
    };

    const handleAdd = async () => {
        try {
            // Проверка ID при сохранении
            if (!newItem.id || isNaN(newItem.id)) {
                setErrors({ id: 'ID обязателен и должен быть числом' });
                return;
            }

            const id = parseInt(newItem.id);
            if (id <= 0) {
                setErrors({ id: 'ID должен быть положительным числом' });
                return;
            }

            const existingItem = items.find(item => item.id === id);
            if (existingItem) {
                setErrors({ id: 'Этот ID уже существует. Пожалуйста, выберите другой.' });
                return;
            }

            // Преобразуем все числовые поля
            const itemToSend = {
                ...newItem,
                id: id,
                orderId: newItem.orderId ? parseInt(newItem.orderId) : null,
                productId: newItem.productId ? parseInt(newItem.productId) : null,
                sizeId: newItem.sizeId ? parseInt(newItem.sizeId) : null,
                quantity: newItem.quantity ? parseInt(newItem.quantity) : null,
                priceAtPurchase: newItem.priceAtPurchase ? parseFloat(newItem.priceAtPurchase) : null
            };

            const handler = customHandlers?.onCreate || apiClient.create;
            await handler(itemToSend);
            await fetchItems();
            setShowAddForm(false);
            setNewItem({});
        } catch (error) {
            console.error("Error adding item:", error);
            setErrors({ add: error.message });
        }
    };

    const handleOpenAddForm = () => {
        const nextId = getNextAvailableId();
        console.log('Opening form with next ID:', nextId);
        setNewItem({ id: nextId });
        setShowAddForm(true);
    };

    const handleEdit = (item) => {
        setEditingItem({ ...item, originalId: item.id });
    };

    const handleUpdate = async () => {
        try {
            // Проверка ID при обновлении
            if (!editingItem.id || isNaN(editingItem.id)) {
                setErrors({ id: 'ID обязателен и должен быть числом' });
                return;
            }

            const id = parseInt(editingItem.id);
            if (id <= 0) {
                setErrors({ id: 'ID должен быть положительным числом' });
                return;
            }

            const existingItem = items.find(item => item.id === id && item.id !== editingItem.originalId);
            if (existingItem) {
                setErrors({ id: 'Этот ID уже существует. Пожалуйста, выберите другой.' });
                return;
            }

            const handler = customHandlers?.onUpdate || apiClient.update;
            await handler(editingItem.originalId, editingItem);
            await fetchItems();
            setEditingItem(null);
        } catch (error) {
            console.error("Error updating item:", error);
            setErrors({ update: error.message });
        }
    };

    const handleDelete = async (id) => {
        try {
            const handler = customHandlers?.onDelete || apiClient.delete;
            await handler(id);
            await fetchItems();
        } catch (error) {
            console.error("Error deleting item:", error);
            setErrors({ delete: error.message });
        }
    };

    const getNextAvailableId = () => {
        const maxId = Math.max(...items.map(item => item.id), 0);
        return maxId + 1;
    };

    return (
        <div className="admin-table-container" style={styles?.container}>
            <h1>{title}</h1>

            {errors.fetch && (
                <div className="error-message">
                    Error loading data: {errors.fetch}
                </div>
            )}

            {loading ? (
                <div className="loading-indicator">Loading...</div>
            ) : (
                <>
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {additionalComponents?.beforeTable}

                    <button 
                        className="add-button" 
                        onClick={handleOpenAddForm}
                        style={styles?.addButton}
                    >
                        Add New
                    </button>

                    {showAddForm && (
                        <div className="form-container">
                            <h2>Add New Item</h2>
                            <p className="next-id-hint">Следующий доступный ID: {getNextAvailableId()}</p>
                            {fields.map(field => (
                                <div key={field.name} className="edit-field">
                                    <label>{field.label}</label>
                                    {field.render ? (
                                        field.render(newItem, (name, value) => handleInputChange(name, value))
                                    ) : (
                                        <input
                                            type={field.type || 'text'}
                                            value={newItem[field.name] || ''}
                                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                                            className={errors[field.name] ? 'error' : ''}
                                        />
                                    )}
                                    {errors[field.name] && (
                                        <div className="error-message">{errors[field.name]}</div>
                                    )}
                                </div>
                            ))}
                            <div className="button-group">
                                <button onClick={handleAdd}>Save</button>
                                <button onClick={() => setShowAddForm(false)}>Cancel</button>
                            </div>
                        </div>
                    )}

                    <table className="admin-table">
                        <thead>
                            <tr>
                                {fields.map(field => (
                                    <th
                                        key={field.name}
                                        onClick={() => handleSort(field.name)}
                                        className={`sortable-header ${
                                            sortConfig.key === field.name ? sortConfig.direction : ''
                                        }`}
                                    >
                                        {field.label}
                                    </th>
                                ))}
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map(item => (
                                <tr key={item.id}>
                                    {fields.map(field => (
                                        <td key={`${item.id}-${field.name}`}>
                                            {editingItem && editingItem.originalId === item.id ? (
                                                field.render ? (
                                                    field.render(editingItem, (name, value) => handleInputChange(name, value, editingItem))
                                                ) : (
                                                    <input
                                                        type={field.type || 'text'}
                                                        value={editingItem[field.name] || ''}
                                                        onChange={(e) => handleInputChange(field.name, e.target.value, editingItem)}
                                                        className={errors[field.name] ? 'error' : ''}
                                                    />
                                                )
                                            ) : (
                                                field.display ? field.display(item) : item[field.name]
                                            )}
                                        </td>
                                    ))}
                                    <td>
                                        {editingItem && editingItem.originalId === item.id ? (
                                            <>
                                                <button onClick={handleUpdate}>Save</button>
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
                            ))}
                        </tbody>
                    </table>

                    {additionalComponents?.afterTable}
                </>
            )}
        </div>
    );
};

GenericTableManager.propTypes = {
    title: PropTypes.string.isRequired,
    apiClient: PropTypes.shape({
        getAll: PropTypes.func.isRequired,
        create: PropTypes.func.isRequired,
        delete: PropTypes.func.isRequired,
    }).isRequired,
    fields: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        type: PropTypes.string,
        render: PropTypes.func,
        display: PropTypes.func,
    })).isRequired,
    customHandlers: PropTypes.shape({
        onCreate: PropTypes.func,
        onDelete: PropTypes.func,
    }),
    validators: PropTypes.objectOf(PropTypes.func),
    additionalComponents: PropTypes.objectOf(PropTypes.elementType),
    styles: PropTypes.object,
};

export default GenericTableManager; 