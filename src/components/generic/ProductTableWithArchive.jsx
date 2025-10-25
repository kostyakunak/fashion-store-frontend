import React, { useState, useEffect, useCallback } from 'react';
import { archiveProduct, unarchiveProduct } from '../../api/productsApi';

const ProductTableWithArchive = ({ 
    title, 
    apiClient, 
    fields, 
    validators, 
    customHandlers = {},
    styles = {},
    additionalComponents = {}
}) => {
    console.log('🔄 ProductTableWithArchive render', { 
        title, 
        hasApiClient: !!apiClient, 
        hasGetAll: !!apiClient?.getAll,
        timestamp: Date.now() 
    });
    
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [editingData, setEditingData] = useState({});
  const [hasLoaded, setHasLoaded] = useState(false); // Add flag to prevent multiple loads

    const fetchData = useCallback(async () => {
        console.log('📥 ProductTableWithArchive fetchData called', { 
            hasApiClient: !!apiClient, 
            hasGetAll: !!apiClient?.getAll,
            hasLoaded,
            timestamp: Date.now() 
        });
        
        if (!apiClient?.getAll || hasLoaded) {
            console.log('⏭️ fetchData skipped - no apiClient.getAll or already loaded');
            return;
        }
        
        setLoading(true);
        setError(null);
        try {
            console.log('🌐 ProductTableWithArchive calling apiClient.getAll...');
            const result = await apiClient.getAll();
            console.log('✅ ProductTableWithArchive fetchData result:', { 
                resultLength: result?.length || 0,
                timestamp: Date.now()
            });
            setData(result);
            setHasLoaded(true); // Mark as loaded
        } catch (err) {
            console.error('❌ ProductTableWithArchive fetchData error:', err);
            setError(err.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
            console.log('🏁 ProductTableWithArchive fetchData finished');
        }
    }, [apiClient, hasLoaded]); // Add hasLoaded to dependencies

    useEffect(() => {
        console.log('📊 ProductTableWithArchive useEffect triggered', {
            hasApiClient: !!apiClient,
            hasGetAll: !!apiClient?.getAll,
            timestamp: Date.now()
        });
        
        if (apiClient?.getAll) {
            console.log('🚀 ProductTableWithArchive starting fetchData...');
            fetchData();
        } else {
            console.log('⏭️ ProductTableWithArchive useEffect skipped - no apiClient.getAll');
        }
    }, [fetchData]);

    const handleArchive = async (id, productName) => {
        const confirmed = window.confirm(
            `Ви впевнені, що хочете заархівувати товар "${productName}"?\n\n` +
            `Товар буде прихований з каталогу для користувачів, але залишиться в базі даних та в історії замовлень. ` +
            `Його можна буде розархівувати в будь-який час.`
        );
        
        if (confirmed) {
            try {
                await archiveProduct(id);
                setHasLoaded(false); // Reset flag to allow reload
                await fetchData();
                alert("Товар успішно заархівований!");
            } catch (error) {
                console.error("Помилка при архівації товару:", error);
                alert("Помилка при архівації товару: " + error.message);
            }
        }
    };

    const handleUnarchive = async (id, productName) => {
        const confirmed = window.confirm(
            `Ви впевнені, що хочете розархівувати товар "${productName}"?\n\n` +
            `Товар знову з'явиться в каталозі для користувачів.`
        );
        
        if (confirmed) {
            try {
                await unarchiveProduct(id);
                setHasLoaded(false); // Reset flag to allow reload
                await fetchData();
                alert("Товар успішно розархівований!");
            } catch (error) {
                console.error("Помилка при розархівації товару:", error);
                alert("Помилка при розархівації товару: " + error.message);
            }
        }
    };

    const handleEdit = (item) => {
        const transformedItem = customHandlers.onEdit ? customHandlers.onEdit(item) : item;
        setEditingItem(transformedItem);
        setEditingData({ ...transformedItem });
    };

    const handleUpdate = async () => {
        try {
            await apiClient.update(editingItem.id, editingData);
            setEditingItem(null);
            setHasLoaded(false); // Reset flag to allow reload
            await fetchData();
        } catch (error) {
            alert("Помилка при оновленні: " + error.message);
        }
    };

    const filteredData = data.filter(item => {
        if (!searchTerm) return true;
        return Object.values(item).some(value => 
            value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    if (loading) {
        return <div>Завантаження...</div>;
    }

    if (error) {
        return <div style={{ color: 'red' }}>Помилка: {error}</div>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2>{title}</h2>
                <div style={{ marginBottom: '20px' }}>
                    <input
                        type="text"
                        placeholder="Пошук..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: '8px', marginRight: '10px' }}
                    />
                    <button 
                        onClick={() => setEditingItem({})}
                        style={{ 
                            backgroundColor: '#28a745', 
                            color: 'white', 
                            padding: '8px 16px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Додати новий
                    </button>
                </div>
            </div>

            {additionalComponents?.beforeTable}

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                        {fields.map(field => (
                            <th key={field.name} style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>
                                {field.label}
                            </th>
                        ))}
                        <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>
                            Дії
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map(item => (
                        <tr key={item.id}>
                            {fields.map(field => (
                                <td key={field.name} style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                                    {editingItem && editingItem.id === item.id ? (
                                        field.render ? field.render(editingData, (name, value) => 
                                            setEditingData(prev => ({ ...prev, [name]: value }))
                                        ) : (
                                            <input
                                                type={field.type || 'text'}
                                                value={editingData[field.name] || ''}
                                                onChange={(e) => setEditingData(prev => ({ 
                                                    ...prev, 
                                                    [field.name]: e.target.value 
                                                }))}
                                                disabled={field.readOnly}
                                                style={{ width: '100%', padding: '4px' }}
                                            />
                                        )
                                    ) : (
                                        field.display ? field.display(item) : item[field.name]
                                    )}
                                </td>
                            ))}
                            <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                                {editingItem && editingItem.id === item.id ? (
                                    <>
                                        <button 
                                            onClick={handleUpdate}
                                            style={{ 
                                                backgroundColor: '#007bff', 
                                                color: 'white', 
                                                padding: '4px 8px',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                marginRight: '8px'
                                            }}
                                        >
                                            Зберегти
                                        </button>
                                        <button 
                                            onClick={() => setEditingItem(null)}
                                            style={{ 
                                                backgroundColor: '#6c757d', 
                                                color: 'white', 
                                                padding: '4px 8px',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Скасувати
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button 
                                            onClick={() => handleEdit(item)}
                                            style={{ 
                                                backgroundColor: '#007bff', 
                                                color: 'white', 
                                                padding: '4px 8px',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                marginRight: '8px'
                                            }}
                                        >
                                            Редагувати
                                        </button>
                                        {item.archived ? (
                                            <button 
                                                onClick={() => handleUnarchive(item.id, item.name)}
                                                style={{ 
                                                    backgroundColor: '#28a745', 
                                                    color: 'white', 
                                                    padding: '4px 8px',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Розархівувати
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleArchive(item.id, item.name)}
                                                style={{ 
                                                    backgroundColor: '#ffc107', 
                                                    color: 'black', 
                                                    padding: '4px 8px',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Заархівувати
                                            </button>
                                        )}
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {additionalComponents?.afterTable}
        </div>
    );
};

export default ProductTableWithArchive;
