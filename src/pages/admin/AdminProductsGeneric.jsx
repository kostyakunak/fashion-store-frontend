import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import GenericTableManager from '../../components/generic/ProductTableWithArchive';
import ErrorMessage from '../../components/common/ErrorMessage';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import { createProduct, updateProduct, deleteProduct, getAllProductsIncludingArchived } from '../../api/productsApi';
import { getCategories } from '../../api/categoriesApi';
import { AuthContext } from '../../context/AuthContext';
import useAdmin from '../../hooks/useAdmin';
import { handleApiError } from '../../utils/apiUtils';

/**
 * Admin Products Management Component
 * Provides CRUD operations for products with category selection
 */
const AdminProductsGeneric = () => {
    console.log('🔄 AdminProductsGeneric render start', { timestamp: Date.now() });
    
    const [categories, setCategories] = useState([]);
    const [categoryLoading, setCategoryLoading] = useState(false);
    const [categoryError, setCategoryError] = useState(null);
    const [categoriesLoaded, setCategoriesLoaded] = useState(false);
    const navigate = useNavigate();
    const { isAdmin, isAuthenticated, user } = useContext(AuthContext);
    
    // Debug logging
    useEffect(() => {
        console.log('🔐 AdminProductsGeneric Auth status:', {
            isAuthenticated: isAuthenticated(),
            isAdmin: isAdmin(),
            user: user,
            timestamp: Date.now()
        });
    }, [isAuthenticated, isAdmin, user]);
    
    // Use our custom admin hook for product operations
    const {
        loading, 
        error, 
        apiClient: productApiClient, 
        clearError
    } = useAdmin({
        fetchAll: getAllProductsIncludingArchived,
        createEntity: createProduct,
        updateEntity: updateProduct,
        deleteEntity: deleteProduct,
        entityName: 'product'
    });
    
    console.log('🔧 AdminProductsGeneric useAdmin result:', {
        loading,
        hasError: !!error,
        hasApiClient: !!productApiClient,
        timestamp: Date.now()
    });

    const loadCategories = useCallback(async () => {
        console.log('📂 loadCategories called', { 
            categoryLoading, 
            categoriesLoaded, 
            timestamp: Date.now() 
        });
        
        if (categoryLoading || categoriesLoaded) {
            console.log('⏭️ loadCategories skipped - already loading or loaded');
            return;
        }
        
        setCategoryLoading(true);
        try {
            console.log('🌐 Loading categories...');
            const categoriesData = await getCategories();
            console.log('✅ Categories loaded:', { count: categoriesData?.length || 0 });
            setCategories(categoriesData);
            setCategoriesLoaded(true);
        } catch (err) {
            console.error('❌ Error loading categories:', err);
            const errorMessage = handleApiError(err, 'Не вдалося завантажити категорії');
            setCategoryError(errorMessage);
        } finally {
            setCategoryLoading(false);
        }
    }, [categoryLoading, categoriesLoaded]);

    // Authentication check useEffect
    useEffect(() => {
        console.log('🔐 AdminProductsGeneric auth useEffect triggered', {
            isAuthenticated: isAuthenticated(),
            isAdmin: isAdmin(),
            timestamp: Date.now()
        });
        
        if (!isAuthenticated()) {
            console.log('❌ Not authenticated, redirecting to login');
            navigate('/login', { state: { message: 'Будь ласка, увійдіть для доступу до адмін сторінок' } });
            return;
        }
        if (!isAdmin()) {
            console.log('❌ Not admin, setting error');
            setCategoryError('У вас немає дозволу на доступ до цієї сторінки');
            setTimeout(() => navigate('/'), 2000);
            return;
        }
        
        clearError();
        setCategoryError(null);
    }, [navigate, isAuthenticated, isAdmin, clearError]);

    // Categories loading useEffect - only runs after authentication
    useEffect(() => {
        console.log('📂 AdminProductsGeneric categories useEffect triggered', {
            isAuthenticated: isAuthenticated(),
            isAdmin: isAdmin(),
            categoriesLoaded,
            categoryLoading,
            timestamp: Date.now()
        });
        
        // Only load categories if user is authenticated and admin
        if (isAuthenticated() && isAdmin() && !categoriesLoaded && !categoryLoading) {
            console.log('🚀 Starting categories load...');
            loadCategories();
        } else {
            console.log('⏭️ Categories load skipped', {
                reason: !isAuthenticated() ? 'not authenticated' :
                        !isAdmin() ? 'not admin' :
                        categoriesLoaded ? 'already loaded' : 
                        categoryLoading ? 'already loading' : 'unknown'
            });
        }
    }, [isAuthenticated, isAdmin, loadCategories, categoriesLoaded, categoryLoading]);

    // Handler for transforming data during editing
    const handleOnEdit = (item) => {
        // If item has a category, add categoryId for form handling
        if (item.category && item.category.id) {
            return {
                ...item,
                categoryId: item.category.id.toString()
            };
        }
        return item;
    };

    // Create a wrapped API client that handles category relationships
    const wrappedApiClient = {
        getAll: productApiClient.getAll,
        create: async (data) => {
            try {
                // Validation before sending to server
                if (!data.name || !data.categoryId) {
                    throw new Error('Поля "Назва" та "Категорія" обов\'язкові');
                }
                
                // Check that category exists
                const categoryExists = categories.some(cat => cat.id === parseInt(data.categoryId));
                if (!categoryExists) {
                    throw new Error('Обрана категорія не існує');
                }
                
                // Create proper object for submission
                const productToSend = {
                    ...data,
                    category: {
                        id: parseInt(data.categoryId)
                    }
                };
                
                // Remove temporary categoryId field from submitted data
                delete productToSend.categoryId;
                
                // Remove id when creating new product,
                // since server uses auto-increment
                delete productToSend.id;
                
                return await productApiClient.create(productToSend);
            } catch (err) {
                const errorMessage = handleApiError(err, 'Не вдалося створити товар');
                console.error('Error creating product:', err);
                throw new Error(errorMessage);
            }
        },
        update: async (id, data) => {
            try {
                // Validation before sending to server
                if (!data.name || !data.categoryId) {
                    throw new Error('Поля "Назва" та "Категорія" обов\'язкові');
                }
                
                // Check that category exists
                const categoryExists = categories.some(cat => cat.id === parseInt(data.categoryId));
                if (!categoryExists) {
                    throw new Error('Обрана категорія не існує');
                }
                
                // Create proper object for submission
                const productToSend = {
                    ...data,
                    category: {
                        id: parseInt(data.categoryId)
                    }
                };
                
                // Remove temporary categoryId field from submitted data
                delete productToSend.categoryId;
                
                return await productApiClient.update(id, productToSend);
            } catch (err) {
                const errorMessage = handleApiError(err, 'Не вдалося оновити товар');
                console.error('Error updating product:', err);
                throw new Error(errorMessage);
            }
        },
        delete: productApiClient.delete
    };

    const fields = [
        {
            name: 'id',
            label: 'ID',
            type: 'number',
            readOnly: true,
            display: (item) => item.id
        },
        {
            name: 'name',
            label: 'Назва',
            type: 'text',
            required: true,
            hint: 'Введіть унікальну назву товару'
        },
        {
            name: 'productDetails',
            label: 'Опис',
            type: 'textarea',
            render: (item, onChange) => (
                <textarea
                    value={item.productDetails || ''}
                    onChange={(e) => onChange('productDetails', e.target.value)}
                    rows={4}
                    style={{ width: '100%', minWidth: '200px' }}
                />
            )
        },
        {
            name: 'measurements',
            label: 'Розміри',
            type: 'text',
            hint: 'Специфікація розмірів (наприклад, S, M, L, XL)'
        },
        {
            name: 'categoryId',
            label: 'Категорія',
            required: true,
            render: (item, onChange) => (
                <select
                    value={item.categoryId || (item.category ? item.category.id : '')}
                    onChange={(e) => onChange('categoryId', e.target.value)}
                    disabled={categoryLoading}
                >
                    <option value="">Оберіть категорію</option>
                    {categories.map(category => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
            ),
            display: (item) => {
                if (!item.category) return '';
                const category = categories.find(c => c.id === item.category.id);
                return category ? category.name : `Категорія ${item.category.id}`;
            }
        },
        {
            name: 'archived',
            label: 'Статус',
            type: 'text',
            readOnly: true,
            display: (item) => (
                <span 
                    style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        fontWeight: 'bold',
                        backgroundColor: item.archived ? '#dc3545' : '#28a745',
                        color: 'white'
                    }}
                >
                    {item.archived ? 'Заархівований' : 'Активний'}
                </span>
            )
        }
    ];

    const validators = {
        name: (value) => {
            if (!value || value.trim().length === 0) {
                return "Назва товару обов'язкова";
            }
            if (value.trim().length < 2) {
                return "Назва товару повинна містити мінімум 2 символи";
            }
            return true;
        },
        categoryId: (value) => {
            if (!value) {
                return "Категорія обов'язкова";
            }
            return true;
        },
        productDetails: () => true,
        measurements: () => true
    };

    // Admin panel specific styles
    const styles = {
        container: {
            padding: '20px',
            maxWidth: '1200px',
            margin: '0 auto'
        },
        header: {
            marginBottom: '20px'
        },
        footer: {
            marginTop: '20px',
            fontSize: '0.8rem',
            color: '#666'
        }
    };

    const isLoadingAny = loading || categoryLoading;
    const displayError = error || categoryError;

    return (
        <div className="admin-products-container">
            {displayError && <ErrorMessage message={displayError} />}
            <LoadingIndicator isLoading={isLoadingAny} />
            
            <div style={styles.header}>
                <h1>Управління товарами</h1>
                <p>Створюйте, оновлюйте та архівуйте товари</p>
            </div>
            
            <GenericTableManager
                title="Товари"
                apiClient={wrappedApiClient}
                fields={fields}
                validators={validators}
                customHandlers={{
                    onEdit: handleOnEdit
                }}
                styles={styles}
            />
            
            <div style={styles.footer}>
                <p>Примітка: Зображення товарів можна керувати через розділ "Зображення".</p>
            </div>
        </div>
    );
};

export default AdminProductsGeneric;