import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../../styles/AdminTables.css';

/**
 * Компонент для стилізованого відображення помилок
 * @param {Object} props - Властивості компонента
 * @param {string} props.message - Повідомлення про помилку
 */
const ErrorAlert = ({ message }) => {
    if (!message) return null;
    
    // Перетворюємо повідомлення про помилку у більш зрозумілий формат
    let displayMessage = message;
    if (typeof message === 'string') {
        if (message.startsWith('Invalid') || message.startsWith('Неверное значение поля')) {
            const fieldName = message.split(' ').pop();
            displayMessage = `Будь ласка, перевірте поле "${fieldName}"`;
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
 * Універсальний компонент для керування даними в таблиці (CRUD-операції)
 * 
 * @param {Object} props - Властивості компонента
 * @param {string} props.title - Заголовок таблиці
 * @param {Object} props.apiClient - API-клієнт для роботи з даними
 * @param {Function} props.apiClient.getAll - Функція для отримання всіх елементів
 * @param {Function} props.apiClient.create - Функція для створення елемента
 * @param {Function} props.apiClient.update - Функція для оновлення елемента
 * @param {Function} props.apiClient.delete - Функція для видалення елемента
 * @param {Array} props.fields - Опис полів для відображення та редагування
 * @param {Object} props.customHandlers - Користувацькі обробники подій
 * @param {Function} props.customHandlers.onCreate - Користувацький обробник створення
 * @param {Function} props.customHandlers.onUpdate - Користувацький обробник оновлення
 * @param {Function} props.customHandlers.onDelete - Користувацький обробник видалення
 * @param {Function} props.customHandlers.onEdit - Користувацький обробник початку редагування
 * @param {Object} props.validators - Об'єкт з функціями валідації для полів
 * @param {Object} props.additionalComponents - Додаткові компоненти для відображення
 * @param {React.Component} props.additionalComponents.beforeTable - Компонент перед таблицею
 * @param {React.Component} props.additionalComponents.afterTable - Компонент після таблиці
 * @param {Object} props.styles - Стилі для компонентів
 * 
 * @returns {JSX.Element} Компонент для керування даними
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
     * Отримує дані з сервера та оновлює стан
     * 
     * @returns {Promise<void>}
     */
    const fetchItems = async () => {
        setLoading(true);
        try {
            const data = await apiClient.getAll();
            // Сортуємо елементи за ID за замовчуванням, якщо не вказано інший порядок сортування
            const sortedData = sortConfig.key ? data : data.sort((a, b) => a.id - b.id);
            setItems(sortedData);
        } catch (error) {
            console.error("Помилка отримання елементів:", error);
            setErrors({ fetch: error.response?.data?.message || error.message });
        } finally {
            setLoading(false);
        }
    };

    /**
     * Обробник сортування за заголовком таблиці
     * 
     * @param {string} key - Ключ для сортування
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
     * Перевіряє значення поля на відповідність правилам валідації
     * 
     * @param {string} name - Ім'я поля
     * @param {*} value - Значення поля
     * @returns {boolean} Результат валідації
     */
    const validateField = (name, value) => {
        if (validators && validators[name]) {
            return validators[name](value);
        }
        return true;
    };

    /**
     * Обробник зміни значення поля вводу
     * 
     * @param {string} name - Ім'я поля
     * @param {*} value - Нове значення
     * @param {Object|null} item - Елемент для редагування або null для нового елемента
     */
    const handleInputChange = (name, value, item = null) => {
        const targetItem = item || newItem;
        
        // Для поля ID просто оновлюємо значення без валідації
        if (name === 'id') {
            if (item) {
                setEditingItem(prev => ({ ...prev, [name]: value }));
            } else {
                setNewItem({ ...targetItem, [name]: value });
            }
            return;
        }
        
        // Перетворюємо значення у число для числових полів
        let processedValue = value;
        if (name === 'orderId' || name === 'productId' || name === 'sizeId' || name === 'quantity') {
            processedValue = value === '' ? null : parseInt(value);
        }
        
        // Оновлюємо значення поля
        if (item) {
            setEditingItem(prev => ({ ...prev, [name]: processedValue }));
        } else {
            setNewItem({ ...targetItem, [name]: processedValue });
        }

        // Перевіряємо валідність після оновлення значення
        const isValid = validateField(name, processedValue);
        
        // Знаходимо поле для отримання його мітки
        const field = fields.find(f => f.name === name);
        const fieldLabel = field ? field.label : name;
        
        if (!isValid) {
            let errorMessage = `Будь ласка, перевірте поле "${fieldLabel}"`;
            if (!processedValue || (typeof processedValue === 'string' && processedValue.trim().length === 0)) {
                errorMessage = `Поле "${fieldLabel}" не може бути порожнім`;
            } else if (typeof processedValue === 'string' && processedValue.trim().length < 2) {
                errorMessage = `Поле "${fieldLabel}" має містити щонайменше 2 символи`;
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
     * Додає новий елемент
     * 
     * Примітка: При використанні таблиць з автоінкрементом ID на сервері
     * потрібно видаляти поле id у користувацькому обробнику
     * 
     * @returns {Promise<void>}
     */
    const handleAdd = async () => {
        try {
            // Очищення помилок перед відправкою
            setErrors({});
            
            // Перевірка ID більше не потрібна, оскільки ID генерується сервером
            // Поле ID зберігається для сумісності, але ігнорується сервером
            
            // Перевірка обов'язкових полів
            let hasErrors = false;
            const newErrors = {};
            
            fields.forEach(field => {
                if (field.required && !newItem[field.name] && field.name !== 'id') { // Виключаємо ID з перевірки
                    newErrors[field.name] = `Поле ${field.label} обов'язкове`;
                    hasErrors = true;
                    console.log(`Поле '${field.name}' (${field.label}) не заповнено, поточне значення:`, newItem[field.name]);
                }
            });
            
            if (hasErrors) {
                console.log('Перевірка форми виявила помилки:', newErrors);
                console.log('Поточні дані форми:', newItem);
                setErrors(newErrors);
                return;
            }

            // Перетворюємо всі числові поля
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
            setSuccessMessage('Елемент успішно додано');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error("Помилка додавання елемента:", error);
            setErrors({ add: error.response?.data?.message || error.message || 'Виникла помилка при додаванні' });
        }
    };

    /**
     * Відкриває форму для додавання нового елемента
     * 
     * Примітка: Можна встановити значення за замовчуванням для полів
     * шляхом модифікації об'єкта defaultValues
     */
    const handleOpenAddForm = () => {
        const nextId = getNextAvailableId();
        console.log('Відкриття форми з наступним ID:', nextId);
        
        // Створюємо об'єкт з ID та значеннями за замовчуванням
        const defaultValues = { id: nextId };
        
        // Встановлюємо значення за замовчуванням для відомих полів
        fields.forEach(field => {
            // Якщо це поле ролі, встановлюємо значення за замовчуванням "USER"
            if (field.name === 'role') {
                defaultValues.role = 'USER';
            }
        });
        
        setNewItem(defaultValues);
        setShowAddForm(true);
    };

    /**
     * Починає редагування вибраного елемента
     * 
     * Примітка: Для правильної роботи з пов'язаними даними (наприклад, товар-категорія)
     * використовуйте користувацький обробник onEdit для перетворення даних
     * 
     * @param {Object} item - Елемент для редагування
     */
    const handleEdit = (item) => {
        console.log('Початок редагування елемента:', item);
        
        // Перевіряємо, чи є у елемента всі необхідні поля
        let itemWithDefaults = { ...item, originalId: item.id };
        
        // Якщо це користувач і немає ролі, встановимо її за замовчуванням
        if ('role' in item && !item.role) {
            itemWithDefaults.role = 'USER';
        }
        
        // Якщо є користувацький обробник onEdit, використовуємо його
        if (customHandlers?.onEdit) {
            itemWithDefaults = customHandlers.onEdit(itemWithDefaults);
        }
        
        setEditingItem(itemWithDefaults);
    };

    /**
     * Оновлює існуючий елемент
     * 
     * @returns {Promise<void>}
     */
    const handleUpdate = async () => {
        try {
            // Очищення помилок перед відправкою
            setErrors({});
            
            // Перевірка ID при оновленні
            if (!editingItem.id || isNaN(editingItem.id)) {
                setErrors({ id: 'ID обовʼязковий і має бути числом' });
                return;
            }

            const id = parseInt(editingItem.id);
            if (id <= 0) {
                setErrors({ id: 'ID має бути додатнім числом' });
                return;
            }

            const existingItem = items.find(item => item.id === id && item.id !== editingItem.originalId);
            if (existingItem) {
                setErrors({ id: 'Цей ID вже існує. Будь ласка, виберіть інший.' });
                return;
            }

            // Перевірка обов'язкових полів
            let hasErrors = false;
            const newErrors = {};
            
            fields.forEach(field => {
                if (field.required && !editingItem[field.name]) {
                    newErrors[field.name] = `Поле ${field.label} обов'язкове`;
                    hasErrors = true;
                    console.log(`Поле '${field.name}' (${field.label}) не заповнено, поточне значення:`, editingItem[field.name]);
                }
            });
            
            if (hasErrors) {
                console.log('Перевірка форми редагування виявила помилки:', newErrors);
                console.log('Поточні дані форми редагування:', editingItem);
                setErrors(newErrors);
                return;
            }

            const handler = customHandlers?.onUpdate || apiClient.update;
            
            // Перевірка наявності обробника оновлення
            if (!handler) {
                setErrors({ update: 'Операція оновлення не підтримується' });
                return;
            }
            
            await handler(editingItem.originalId, editingItem);
            await fetchItems();
            setEditingItem(null);
            setSuccessMessage('Зміни успішно збережено');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error("Помилка оновлення елемента:", error);
            setErrors({ update: error.response?.data?.message || error.message || 'Виникла помилка при оновленні' });
        }
    };

    /**
     * Видаляє елемент
     * 
     * @param {number|string} id - Ідентифікатор елемента для видалення
     * @returns {Promise<void>}
     */
    const handleDelete = async (id) => {
        try {
            // Очищення помилок перед відправкою
            setErrors({});
            
            const handler = customHandlers?.onDelete || apiClient.delete;
            await handler(id);
            await fetchItems();
        } catch (error) {
            console.error("Помилка видалення елемента:", error);
            setErrors({ delete: error.response?.data?.message || error.message || 'Виникла помилка при видаленні' });
        }
    };

    /**
     * Визначає наступний доступний ID на основі існуючих елементів
     * 
     * @returns {number} Наступний доступний ID
     */
    const getNextAvailableId = () => {
        const maxId = Math.max(...items.map(item => item.id), 0);
        return maxId + 1;
    };

    /**
     * Повертає компонент з повідомленнями про помилки валідації
     * 
     * @returns {JSX.Element|null} Компонент з помилками або null, якщо помилок немає
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
                        <div>Форма містить помилки:</div>
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

    // Додаємо функцію для форматування дати у YYYY-MM-DD
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
                <div className="loading-indicator">Завантаження...</div>
            ) : (
                <>
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Пошук..."
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
                        Додати новий
                    </button>

                    {showAddForm && (
                        <div className="form-container">
                            <h2>Додати новий елемент</h2>
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
                                <button onClick={handleAdd}>Зберегти</button>
                                <button onClick={() => setShowAddForm(false)}>Скасувати</button>
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
                                <th>Дії</th>
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
                                                <button onClick={handleUpdate}>Зберегти</button>
                                                <button onClick={() => setEditingItem(null)}>Скасувати</button>
                                            </>
                                        ) : (
                                            <>
                                                {apiClient.update !== null && (
                                                    <button onClick={() => handleEdit(item)}>Редагувати</button>
                                                )}
                                                <button onClick={() => handleDelete(item.id)}>Видалити</button>
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