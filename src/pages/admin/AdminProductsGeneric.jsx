import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import GenericTableManager from '../../components/generic/GenericTableManager';
import ErrorMessage from '../../components/common/ErrorMessage';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../api/productsApi';
import { getCategories } from '../../api/categoriesApi';
import { AuthContext } from '../../context/AuthContext';
import useAdmin from '../../hooks/useAdmin';
import { handleApiError } from '../../utils/apiUtils';

/**
 * Admin Products Management Component
 * Provides CRUD operations for products with category selection
 */
const AdminProductsGeneric = () => {
    const [categories, setCategories] = useState([]);
    const [categoryLoading, setCategoryLoading] = useState(false);
    const [categoryError, setCategoryError] = useState(null);
    const navigate = useNavigate();
    const { isAdmin, isAuthenticated } = useContext(AuthContext);
    
    // Use our custom admin hook for product operations
    const {
        loading, 
        error, 
        apiClient: productApiClient, 
        clearError
    } = useAdmin({
        fetchAll: getProducts,
        createEntity: createProduct,
        updateEntity: updateProduct,
        deleteEntity: deleteProduct,
        entityName: 'product'
    });

    const loadCategories = useCallback(async () => {
        setCategoryLoading(true);
        try {
            const categoriesData = await getCategories();
            setCategories(categoriesData);
        } catch (err) {
            const errorMessage = handleApiError(err, 'Failed to load categories');
            setCategoryError(errorMessage);
            console.error('Error loading categories:', err);
        } finally {
            setCategoryLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login', { state: { message: 'Please login to access admin pages' } });
            return;
        }
        if (!isAdmin()) {
            setCategoryError('You do not have permission to access this page');
            setTimeout(() => navigate('/'), 2000);
            return;
        }
        clearError();
        setCategoryError(null);
        loadCategories();
    }, [navigate]);

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
                    throw new Error('Name and Category fields are required');
                }
                
                // Check that category exists
                const categoryExists = categories.some(cat => cat.id === parseInt(data.categoryId));
                if (!categoryExists) {
                    throw new Error('Selected category does not exist');
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
                const errorMessage = handleApiError(err, 'Failed to create product');
                console.error('Error creating product:', err);
                throw new Error(errorMessage);
            }
        },
        update: async (id, data) => {
            try {
                // Validation before sending to server
                if (!data.name || !data.categoryId) {
                    throw new Error('Name and Category fields are required');
                }
                
                // Check that category exists
                const categoryExists = categories.some(cat => cat.id === parseInt(data.categoryId));
                if (!categoryExists) {
                    throw new Error('Selected category does not exist');
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
                const errorMessage = handleApiError(err, 'Failed to update product');
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
            label: 'Name',
            type: 'text',
            required: true,
            hint: 'Enter a unique product name'
        },
        {
            name: 'productDetails',
            label: 'Description',
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
            label: 'Measurements',
            type: 'text',
            hint: 'Size specification (e.g., S, M, L, XL)'
        },
        {
            name: 'categoryId',
            label: 'Category',
            required: true,
            render: (item, onChange) => (
                <select
                    value={item.categoryId || (item.category ? item.category.id : '')}
                    onChange={(e) => onChange('categoryId', e.target.value)}
                    disabled={categoryLoading}
                >
                    <option value="">Select category</option>
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
                return category ? category.name : `Category ${item.category.id}`;
            }
        }
    ];

    const validators = {
        name: (value) => {
            if (!value || value.trim().length === 0) {
                return "Product name is required";
            }
            if (value.trim().length < 2) {
                return "Product name must be at least 2 characters";
            }
            return true;
        },
        categoryId: (value) => {
            if (!value) {
                return "Category is required";
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
                <h1>Product Management</h1>
                <p>Create, update, and delete products</p>
            </div>
            
            <GenericTableManager
                title="Products"
                apiClient={wrappedApiClient}
                fields={fields}
                validators={validators}
                customHandlers={{
                    onEdit: handleOnEdit
                }}
                styles={styles}
            />
            
            <div style={styles.footer}>
                <p>Note: Product images can be managed through the Images section.</p>
            </div>
        </div>
    );
};

export default AdminProductsGeneric;