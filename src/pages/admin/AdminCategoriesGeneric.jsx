import React, { useState, useEffect } from 'react';
import GenericTableManager from '../../components/generic/GenericTableManager';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/categoriesApi';

const AdminCategoriesGeneric = () => {
    const [loading, setLoading] = useState(false);

    const apiClient = {
        getAll: getCategories,
        create: async (data) => {
            // Удаляем id из данных, чтобы серверная автогенерация работала корректно
            const { id, ...dataWithoutId } = data;
            return createCategory(dataWithoutId);
        },
        update: updateCategory,
        delete: deleteCategory
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
            required: true
        }
    ];

    const validators = {
        name: (value) => value && value.trim().length > 0
    };

    return (
        <GenericTableManager
            title="Управление категориями"
            apiClient={apiClient}
            fields={fields}
            validators={validators}
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

export default AdminCategoriesGeneric; 