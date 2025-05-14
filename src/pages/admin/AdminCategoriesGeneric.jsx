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
                const errorMessage = handleApiError(error, 'Не удалось загрузить категории');
                setError(errorMessage);
                console.error('Ошибка при загрузке категорий:', error);
                return [];
            } finally {
                setLoading(false);
            }
        },
        create: async (data) => {
            setLoading(true);
            setError(null);
            try {
                // Проверяем, что имя не пустое и имеет минимальную длину
                if (!data.name || data.name.trim().length < 2) {
                    throw new Error('Название категории должно содержать минимум 2 символа');
                }

                // Проверяем уникальность имени
                const existingCategories = await getCategories();
                const isDuplicate = existingCategories.some(
                    category => category.name.toLowerCase() === data.name.trim().toLowerCase()
                );
                if (isDuplicate) {
                    throw new Error('Категория с таким названием уже существует');
                }

                // Удаляем id для автогенерации на сервере
                const { id, ...dataWithoutId } = data;
                
                // Отправляем данные с очищенным именем
                const cleanData = {
                    ...dataWithoutId,
                    name: data.name.trim()
                };
                
                const result = await createCategory(cleanData);
                return result;
            } catch (error) {
                const errorMessage = handleApiError(error, 'Не удалось создать категорию');
                throw new Error(errorMessage);
            } finally {
                setLoading(false);
            }
        },
        update: async (id, data) => {
            setLoading(true);
            setError(null);
            try {
                // Проверяем, что имя не пустое и имеет минимальную длину
                if (!data.name || data.name.trim().length < 2) {
                    throw new Error('Название категории должно содержать минимум 2 символа');
                }

                // Проверяем уникальность имени
                const existingCategories = await getCategories();
                const isDuplicate = existingCategories.some(
                    category => category.id !== id && 
                    category.name.toLowerCase() === data.name.trim().toLowerCase()
                );
                if (isDuplicate) {
                    throw new Error('Категория с таким названием уже существует');
                }

                // Отправляем данные с очищенным именем
                const cleanData = {
                    ...data,
                    name: data.name.trim()
                };

                const result = await updateCategory(id, cleanData);
                return result;
            } catch (error) {
                const errorMessage = handleApiError(error, 'Не удалось обновить категорию');
                throw new Error(errorMessage);
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
                const errorMessage = handleApiError(error, 'Не удалось удалить категорию');
                throw new Error(errorMessage);
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
            label: "Название категории",
            type: "text",
            required: true,
            hint: "Введите уникальное название категории (минимум 2 символа)"
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
                <h1>Управление категориями</h1>
                <p>Создание, редактирование и удаление категорий товаров</p>
            </div>
            
            <GenericTableManager
                title="Категории"
                apiClient={apiClient}
                fields={fields}
                validators={validators}
                styles={styles}
            />
            
            <div style={styles.footer}>
                <p>Подсказка: Название категории должно быть уникальным и содержать минимум 2 символа</p>
            </div>
        </div>
    );
};

export default AdminCategoriesGeneric;