import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import GenericTableManager from '../../components/generic/GenericTableManager';
import ErrorMessage from '../../components/common/ErrorMessage';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/categoriesApi';
import { AuthContext } from '../../context/AuthContext';
import { handleApiError } from '../../utils/apiUtils';

/**
 * Admin Categories Management Component
 * Provides CRUD operations for product categories
 */
const AdminCategoriesGeneric = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { isAdmin, isAuthenticated } = useContext(AuthContext);
    
    // Authentication & authorization check
    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login', { state: { message: 'Please login to access admin pages' } });
            return;
        }
        
        if (!isAdmin()) {
            setError('You do not have permission to access this page');
            setTimeout(() => navigate('/'), 2000);
            return;
        }
        
        // Clear errors when component mounts
        setError(null);
    }, [isAdmin, isAuthenticated, navigate]);

    const apiClient = {
        getAll: async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getCategories();
                return data;
            } catch (error) {
                const errorMessage = handleApiError(error, 'Failed to load categories');
                setError(errorMessage);
                console.error('Error fetching categories:', error);
                return [];
            } finally {
                setLoading(false);
            }
        },
        create: async (data) => {
            setLoading(true);
            setError(null);
            try {
                // Remove id from data to allow server-side auto-generation
                const { id, ...dataWithoutId } = data;
                const result = await createCategory(dataWithoutId);
                return result;
            } catch (error) {
                const errorMessage = handleApiError(error, 'Failed to create category');
                setError(errorMessage);
                console.error('Error creating category:', error);
                throw error;
            } finally {
                setLoading(false);
            }
        },
        update: async (id, data) => {
            setLoading(true);
            setError(null);
            try {
                const result = await updateCategory(id, data);
                return result;
            } catch (error) {
                const errorMessage = handleApiError(error, 'Failed to update category');
                setError(errorMessage);
                console.error('Error updating category:', error);
                throw error;
            } finally {
                setLoading(false);
            }
        },
        delete: async (id) => {
            setLoading(true);
            setError(null);
            try {
                await deleteCategory(id);
                return true;
            } catch (error) {
                const errorMessage = handleApiError(error, 'Failed to delete category');
                setError(errorMessage);
                console.error('Error deleting category:', error);
                throw error;
            } finally {
                setLoading(false);
            }
        }
    };

    const fields = [
        {
            name: "id",
            label: "ID",
            type: "number",
            readOnly: true
        },
        {
            name: "name",
            label: "Category Name",
            type: "text",
            required: true,
            hint: "Enter a unique category name"
        }
    ];

    const validators = {
        name: (value) => {
            if (!value || value.trim().length === 0) {
                return false;
            }
            if (value.trim().length < 2) {
                return false;
            }
            return true;
        }
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

    return (
        <div className="admin-categories-container">
            {error && <ErrorMessage message={error} />}
            <LoadingIndicator isLoading={loading} />
            
            <div style={styles.header}>
                <h1>Category Management</h1>
                <p>Create, update, and delete product categories</p>
            </div>
            
            <GenericTableManager
                title="Categories"
                apiClient={apiClient}
                fields={fields}
                validators={validators}
                styles={styles}
            />
            
            <div style={styles.footer}>
                <p>Note: Deleting categories may affect products that belong to those categories.</p>
            </div>
        </div>
    );
};

export default AdminCategoriesGeneric;