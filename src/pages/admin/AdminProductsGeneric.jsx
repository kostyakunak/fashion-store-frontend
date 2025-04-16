import React, { useState, useEffect } from 'react';
import GenericTableManager from '../../components/generic/GenericTableManager';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../api/productsApi';
import { getCategories } from '../../api/categoriesApi';

const AdminProductsGeneric = () => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        // Загрузка категорий при монтировании компонента
        const loadCategories = async () => {
            const categoriesData = await getCategories();
            setCategories(categoriesData);
        };
        loadCategories();
    }, []);

    // Обработчик для преобразования данных при редактировании
    const handleOnEdit = (item) => {
        // Если у элемента есть категория, добавляем categoryId для работы с формой
        if (item.category && item.category.id) {
            return {
                ...item,
                categoryId: item.category.id.toString()
            };
        }
        return item;
    };

    const apiClient = {
        getAll: getProducts,
        create: (data) => {
            // Валидация перед отправкой на сервер
            if (!data.name || !data.categoryId) {
                throw new Error('Поля "Название" и "Категория" обязательны для заполнения');
            }
            
            // Проверка на существование категории
            const categoryExists = categories.some(cat => cat.id === parseInt(data.categoryId));
            if (!categoryExists) {
                throw new Error('Выбранная категория не существует');
            }
            
            // Создаем правильный объект для отправки
            const productToSend = {
                ...data,
                category: {
                    id: parseInt(data.categoryId)
                }
            };
            
            // Удаляем временное поле categoryId из отправляемых данных
            delete productToSend.categoryId;
            
            // Удаляем поле id при создании нового продукта, 
            // т.к. на сервере используется автоинкремент
            delete productToSend.id;
            
            return createProduct(productToSend);
        },
        update: (id, data) => {
            // Валидация перед отправкой на сервер
            if (!data.name || !data.categoryId) {
                throw new Error('Поля "Название" и "Категория" обязательны для заполнения');
            }
            
            // Проверка на существование категории
            const categoryExists = categories.some(cat => cat.id === parseInt(data.categoryId));
            if (!categoryExists) {
                throw new Error('Выбранная категория не существует');
            }
            
            // Создаем правильный объект для отправки
            const productToSend = {
                ...data,
                category: {
                    id: parseInt(data.categoryId)
                }
            };
            
            // Удаляем временное поле categoryId из отправляемых данных
            delete productToSend.categoryId;
            
            return updateProduct(id, productToSend);
        },
        delete: deleteProduct
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
            label: 'Название',
            type: 'text',
            required: true
        },
        {
            name: 'productDetails',
            label: 'Описание',
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
            label: 'Размеры',
            type: 'text'
        },
        {
            name: 'categoryId',
            label: 'Категория',
            required: true,
            render: (item, onChange) => (
                <select
                    value={item.categoryId || (item.category ? item.category.id : '')}
                    onChange={(e) => onChange('categoryId', e.target.value)}
                >
                    <option value="">Выберите категорию</option>
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
                return category ? category.name : `Категория ${item.category.id}`;
            }
        }
    ];

    // Отключаем валидацию "на лету" - она будет происходить только при отправке
    const validators = {
        name: () => true,
        productDetails: () => true,
        measurements: () => true,
        categoryId: () => true
    };

    return (
        <GenericTableManager
            title="Управление товарами"
            apiClient={apiClient}
            fields={fields}
            validators={validators}
            customHandlers={{
                onEdit: handleOnEdit
            }}
            styles={{
                container: {
                    padding: '20px',
                    maxWidth: '1200px',
                    margin: '0 auto'
                }
            }}
        />
    );
};

export default AdminProductsGeneric; 