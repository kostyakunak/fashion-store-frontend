import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../../styles/AdminTables.css';

/**
 * Компонент для стилизованного отображения ошибок
 * @param {Object} props - Свойства компонента
 * @param {string} props.message - Сообщение об ошибке
 */
const ErrorAlert = ({ message }) => {
    if (!message) return null;
    
    // Преобразуем сообщение об ошибке в более понятный формат
    let displayMessage = message;
    if (typeof message === 'string') {
        if (message.startsWith('Invalid') || message.startsWith('Неверное значение поля')) {
            const fieldName = message.split(' ').pop();
            displayMessage = `Пожалуйста, проверьте поле "${fieldName}"`;
        }
    }
    
    return (
        <div style={{
            backgroundColor: '#ffebee',
            border: '1px solid #f44336',
            color: '#d32f2f',
            borderRadius: '4px',
            padding: '8px 12px',
            margin: '4px 0',
            fontSize: '13px',
            lineHeight: '1.4',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        }}>
            <span style={{ fontSize: '16px' }}>⚠️</span>
            {displayMessage}
        </div>
    );
};

/**
 * Универсальный компонент для управления данными в таблице (CRUD-операции)
 * 
 * @param {Object} props - Свойства компонента
 * @param {string} props.title - Заголовок таблицы
 * @param {Object} props.apiClient - Клиент API для работы с данными
 * @param {Function} props.apiClient.getAll - Функция для получения всех элементов
 * @param {Function} props.apiClient.create - Функция для создания элемента
 * @param {Function} props.apiClient.update - Функция для обновления элемента
 * @param {Function} props.apiClient.delete - Функция для удаления элемента
 * @param {Array} props.fields - Описание полей для отображения и редактирования
 * @param {Object} props.customHandlers - Пользовательские обработчики событий
 * @param {Function} props.customHandlers.onCreate - Пользовательский обработчик создания
 * @param {Function} props.customHandlers.onUpdate - Пользовательский обработчик обновления
 * @param {Function} props.customHandlers.onDelete - Пользовательский обработчик удаления
 * @param {Function} props.customHandlers.onEdit - Пользовательский обработчик начала редактирования
 * @param {Object} props.validators - Объект с функциями валидации для полей
 * @param {Object} props.additionalComponents - Дополнительные компоненты для отображения
 * @param {React.Component} props.additionalComponents.beforeTable - Компонент перед таблицей
 * @param {React.Component} props.additionalComponents.afterTable - Компонент после таблицы
 * @param {Object} props.styles - Стили для компонентов
 * 
 * @returns {JSX.Element} Компонент для управления данными
 */
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
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchItems();
    }, []);

    /**
     * Получает данные с сервера и обновляет состояние
     * 
     * @returns {Promise<void>}
     */
    const fetchItems = async () => {
        setLoading(true);
        try {
            const data = await apiClient.getAll();
            // Сортируем элементы по ID по умолчанию, если не указан другой порядок сортировки
            const sortedData = sortConfig.key ? data : data.sort((a, b) => a.id - b.id);
            setItems(sortedData);
        } catch (error) {
            console.error("Error fetching items:", error);
            setErrors({ fetch: error.response?.data?.message || error.message });
        } finally {
            setLoading(false);
        }
    };

    /**
     * Обработчик сортировки по заголовку таблицы
     * 
     * @param {string} key - Ключ для сортировки
     */
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

    /**
     * Проверяет значение поля на соответствие правилам валидации
     * 
     * @param {string} name - Имя поля
     * @param {*} value - Значение поля
     * @returns {boolean} Результат валидации
     */
    const validateField = (name, value) => {
        if (validators && validators[name]) {
            return validators[name](value);
        }
        return true;
    };

    /**
     * Обработчик изменения значения поля ввода
     * 
     * @param {string} name - Имя поля
     * @param {*} value - Новое значение
     * @param {Object|null} item - Элемент для редактирования или null для нового элемента
     */
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
        
        // Обновляем значение поля
        if (item) {
            setEditingItem(prev => ({ ...prev, [name]: processedValue }));
        } else {
            setNewItem({ ...targetItem, [name]: processedValue });
        }

        // Проверяем валидность после обновления значения
        const isValid = validateField(name, processedValue);
        
        // Находим поле для получения его метки
        const field = fields.find(f => f.name === name);
        const fieldLabel = field ? field.label : name;
        
        if (!isValid) {
            let errorMessage = `Пожалуйста, проверьте поле "${fieldLabel}"`;
            if (!processedValue || processedValue.trim().length === 0) {
                errorMessage = `Поле "${fieldLabel}" не может быть пустым`;
            } else if (processedValue.trim().length < 2) {
                errorMessage = `Поле "${fieldLabel}" должно содержать минимум 2 символа`;
            }
            setErrors(prev => ({ ...prev, [name]: errorMessage }));
        } else {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    /**
     * Добавляет новый элемент
     * 
     * Примечание: При использовании таблиц с автоинкрементом ID на сервере
     * необходимо удалять поле id в пользовательском обработчике
     * 
     * @returns {Promise<void>}
     */
    const handleAdd = async () => {
        try {
            // Очистка ошибок перед отправкой
            setErrors({});
            
            // Проверка ID больше не требуется, так как ID генерируется сервером
            // Поле ID сохраняется для совместимости, но игнорируется сервером
            
            // Проверка обязательных полей
            let hasErrors = false;
            const newErrors = {};
            
            fields.forEach(field => {
                if (field.required && !newItem[field.name] && field.name !== 'id') { // Исключаем ID из проверки
                    newErrors[field.name] = `Поле ${field.label} обязательно`;
                    hasErrors = true;
                    console.log(`Поле '${field.name}' (${field.label}) не заполнено, текущее значение:`, newItem[field.name]);
                }
            });
            
            if (hasErrors) {
                console.log('Проверка формы выявила ошибки:', newErrors);
                console.log('Текущие данные формы:', newItem);
                setErrors(newErrors);
                return;
            }

            // Преобразуем все числовые поля
            const itemToSend = {
                ...newItem,
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
            setSuccessMessage('Элемент успешно добавлен');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error("Error adding item:", error);
            setErrors({ add: error.response?.data?.message || error.message || 'Произошла ошибка при добавлении' });
        }
    };

    /**
     * Открывает форму для добавления нового элемента
     * 
     * Примечание: Можно установить значения по умолчанию для полей
     * путем модификации объекта defaultValues
     */
    const handleOpenAddForm = () => {
        const nextId = getNextAvailableId();
        console.log('Opening form with next ID:', nextId);
        
        // Создаем объект с ID и значениями по умолчанию
        const defaultValues = { id: nextId };
        
        // Устанавливаем значения по умолчанию для известных полей
        fields.forEach(field => {
            // Если это поле роли, устанавливаем значение по умолчанию "USER"
            if (field.name === 'role') {
                defaultValues.role = 'USER';
            }
        });
        
        setNewItem(defaultValues);
        setShowAddForm(true);
    };

    /**
     * Начинает редактирование выбранного элемента
     * 
     * Примечание: Для правильной работы со связанными данными (например, товар-категория)
     * используйте пользовательский обработчик onEdit для преобразования данных
     * 
     * @param {Object} item - Элемент для редактирования
     */
    const handleEdit = (item) => {
        console.log('Начало редактирования элемента:', item);
        
        // Проверяем, есть ли у элемента все необходимые поля
        let itemWithDefaults = { ...item, originalId: item.id };
        
        // Если это пользователь и нет роли, установим её по умолчанию
        if ('role' in item && !item.role) {
            itemWithDefaults.role = 'USER';
        }
        
        // Если есть пользовательский обработчик onEdit, используем его
        if (customHandlers?.onEdit) {
            itemWithDefaults = customHandlers.onEdit(itemWithDefaults);
        }
        
        setEditingItem(itemWithDefaults);
    };

    /**
     * Обновляет существующий элемент
     * 
     * @returns {Promise<void>}
     */
    const handleUpdate = async () => {
        try {
            // Очистка ошибок перед отправкой
            setErrors({});
            
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

            // Проверка обязательных полей
            let hasErrors = false;
            const newErrors = {};
            
            fields.forEach(field => {
                if (field.required && !editingItem[field.name]) {
                    newErrors[field.name] = `Поле ${field.label} обязательно`;
                    hasErrors = true;
                    console.log(`Поле '${field.name}' (${field.label}) не заполнено, текущее значение:`, editingItem[field.name]);
                }
            });
            
            if (hasErrors) {
                console.log('Проверка формы редактирования выявила ошибки:', newErrors);
                console.log('Текущие данные формы редактирования:', editingItem);
                setErrors(newErrors);
                return;
            }

            const handler = customHandlers?.onUpdate || apiClient.update;
            
            // Проверка наличия обработчика обновления
            if (!handler) {
                setErrors({ update: 'Операция обновления не поддерживается' });
                return;
            }
            
            await handler(editingItem.originalId, editingItem);
            await fetchItems();
            setEditingItem(null);
            setSuccessMessage('Изменения успешно сохранены');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error("Error updating item:", error);
            setErrors({ update: error.response?.data?.message || error.message || 'Произошла ошибка при обновлении' });
        }
    };

    /**
     * Удаляет элемент
     * 
     * @param {number|string} id - Идентификатор элемента для удаления
     * @returns {Promise<void>}
     */
    const handleDelete = async (id) => {
        try {
            // Очистка ошибок перед отправкой
            setErrors({});
            
            const handler = customHandlers?.onDelete || apiClient.delete;
            await handler(id);
            await fetchItems();
        } catch (error) {
            console.error("Error deleting item:", error);
            setErrors({ delete: error.response?.data?.message || error.message || 'Произошла ошибка при удалении' });
        }
    };

    /**
     * Определяет следующий доступный ID на основе существующих элементов
     * 
     * @returns {number} Следующий доступный ID
     */
    const getNextAvailableId = () => {
        const maxId = Math.max(...items.map(item => item.id), 0);
        return maxId + 1;
    };

    /**
     * Возвращает компонент с сообщениями об ошибках валидации
     * 
     * @returns {JSX.Element|null} Компонент с ошибками или null, если ошибок нет
     */
    const getValidationErrorSummary = () => {
        const errorFields = Object.keys(errors).filter(key => 
            key !== 'fetch' && key !== 'add' && key !== 'update' && key !== 'delete'
        );
        
        if (errorFields.length === 0) return null;
        
        return (
            <ErrorAlert 
                message={
                    <div>
                        <div>Форма содержит ошибки:</div>
                        <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                            {errorFields.map(field => (
                                <li key={field}>{errors[field]}</li>
                            ))}
                        </ul>
                    </div>
                } 
            />
        );
    };

    // Добавить функцию для форматирования даты в YYYY-MM-DD
    function formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        const month = '' + (d.getMonth() + 1);
        const day = '' + d.getDate();
        const year = d.getFullYear();
        return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
    }

    return (
        <div className="admin-table-container" style={styles?.container}>
            <h1>{title}</h1>

            {getValidationErrorSummary()}

            {errors.fetch && (
                <ErrorAlert message={errors.fetch} />
            )}

            {errors.add && (
                <ErrorAlert message={errors.add} />
            )}

            {errors.update && (
                <ErrorAlert message={errors.update} />
            )}

            {errors.delete && (
                <ErrorAlert message={errors.delete} />
            )}

            {successMessage && (
                <div className="success-alert" style={{
                    backgroundColor: '#e8f5e9',
                    border: '1px solid #43a047',
                    color: '#2e7d32',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    margin: '8px 0',
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 500
                }}>
                    <span style={{ fontSize: '18px' }}>✔️</span>
                    {successMessage}
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
                            {fields.filter(field => !field.readOnly && !field.hideInForm && field.name !== 'id').map(field => (
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
                                        {field.hint && (
                                            <div className="field-hint" style={{ fontSize: '0.8rem', color: '#666', marginTop: '2px' }}>
                                                {field.hint}
                                            </div>
                        )}
                        {errors[field.name] && (
                                            <ErrorAlert message={errors[field.name]} />
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
                            {filteredItems.map((item, idx) => (
                                <tr key={`${item.id}-${idx}`}>
                                    {fields.map(field => {
                                        const isEditableField = !field.readOnly && !field.hideInForm && field.name !== 'id';
                                        if (editingItem && editingItem.originalId === item.id && isEditableField) {
                                            return (
                                        <td key={`${item.id}-${field.name}`}>
                                                    {field.render ? (
                                                    field.render(editingItem, (name, value) => handleInputChange(name, value, editingItem))
                                                ) : (
                                                    <input
                                                        type={field.type || 'text'}
                                                            value={field.type === 'date' ? (editingItem[field.name] ? formatDate(editingItem[field.name]) : '') : (editingItem[field.name] || '')}
                                                        onChange={(e) => handleInputChange(field.name, e.target.value, editingItem)}
                                                        className={errors[field.name] ? 'error' : ''}
                                                    />
                                            )}
                                                    {field.hint && (
                                                <div className="field-hint" style={{ fontSize: '0.8rem', color: '#666', marginTop: '2px' }}>
                                                    {field.hint}
                                </div>
                                            )}
                                                    {errors[field.name] && (
                                                <ErrorAlert message={errors[field.name]} />
                                            )}
                                        </td>
                                            );
                                        } else if (editingItem && editingItem.originalId === item.id && !isEditableField) {
                                            return null;
                                        } else {
                                            return (
                                                <td key={`${item.id}-${field.name}`}>
                                                    {field.display ? field.display(item) : item[field.name]}
                                                </td>
                                            );
                                        }
                                    })}
                                    <td>
                                        {editingItem && editingItem.originalId === item.id ? (
                                            <>
                                                <button onClick={handleUpdate}>Save</button>
                                                <button onClick={() => setEditingItem(null)}>Cancel</button>
                                            </>
                                        ) : (
                                            <>
                                                {apiClient.update !== null && (
                                                    <button onClick={() => handleEdit(item)}>Edit</button>
                                                )}
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
        onUpdate: PropTypes.func,
        onDelete: PropTypes.func,
        onEdit: PropTypes.func,
    }),
    validators: PropTypes.objectOf(PropTypes.func),
    additionalComponents: PropTypes.objectOf(PropTypes.elementType),
    styles: PropTypes.object,
};

export default GenericTableManager; 