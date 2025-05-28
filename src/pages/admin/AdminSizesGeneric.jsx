import React from 'react';
import GenericTableManager from '../../components/generic/GenericTableManager';
import { getSizes, createSize, updateSize, deleteSize } from '../../api/sizesApi';

const AdminSizesGeneric = () => {
    const apiClient = {
        getAll: getSizes,
        create: async (data) => {
            // Видаляємо id з даних, щоб серверна автогенерація працювала коректно
            const { id, ...dataWithoutId } = data;
            return createSize(dataWithoutId);
        },
        update: updateSize,
        delete: deleteSize
    };

    const fields = [
        {
            name: "id",
            label: "ID",
            type: "number",
            readOnly: true,
            display: (item) => item.id,
            hint: "ID генерується автоматично системою"
        },
        {
            name: "name",
            label: "Назва розміру",
            type: "text",
            required: true
        }
    ];

    const validators = {
        name: (value) => value && value.trim().length > 0
    };

    return (
        <GenericTableManager
            title="Управління розмірами"
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

export default AdminSizesGeneric; 