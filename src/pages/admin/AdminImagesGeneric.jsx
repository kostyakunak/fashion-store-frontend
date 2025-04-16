import React, { useState, useEffect } from 'react';
import GenericTableManager from '../../components/generic/GenericTableManager';
import { getAllImages, createImage, updateImage, deleteImage, getProducts, getImagesByProductId } from '../../api/imagesApi';

const AdminImagesGeneric = () => {
    const [products, setProducts] = useState([]);
    const [productImages, setProductImages] = useState({});
    const [selectedProductId, setSelectedProductId] = useState(null);
    const MAX_IMAGES_PER_PRODUCT = 8;

    // Загружаем список товаров для связи
    useEffect(() => {
        const loadProducts = async () => {
            try {
                const productsData = await getProducts();
                setProducts(productsData);
                
                // Загрузка изображений для каждого товара
                const imagesMap = {};
                for (const product of productsData) {
                    const images = await getImagesByProductId(product.id);
                    imagesMap[product.id] = images;
                }
                setProductImages(imagesMap);
            } catch (error) {
                console.error("Ошибка при загрузке товаров:", error);
            }
        };
        loadProducts();
    }, []);

    // Проверка уникальности sortOrder для конкретного товара
    const isSortOrderUnique = (productId, sortOrder, currentImageId = null) => {
        const images = productImages[productId] || [];
        return !images.some(img => 
            img.sortOrder === sortOrder && 
            (currentImageId === null || img.id !== currentImageId)
        );
    };

    const getImagesCountForProduct = (productId) => {
        if (!productId) return 0;
        return (productImages[productId] || []).length;
    };

    const handleProductChange = (productId) => {
        setSelectedProductId(productId ? parseInt(productId) : null);
    };

    // Настраиваем API-клиент для работы с изображениями
    const apiClient = {
        getAll: getAllImages,
        create: (data) => {
            // Проверяем количество изображений для данного товара
            const productId = parseInt(data.productId);
            const currentImages = productImages[productId] || [];
            const sortOrder = parseInt(data.sortOrder || 0);
            
            if (currentImages.length >= MAX_IMAGES_PER_PRODUCT) {
                throw new Error(`Товар уже имеет максимальное количество изображений (${MAX_IMAGES_PER_PRODUCT})`);
            }
            
            // Проверяем уникальность sortOrder для этого товара
            if (!isSortOrderUnique(productId, sortOrder)) {
                throw new Error(`Порядковый номер ${sortOrder} уже используется для этого товара`);
            }
            
            // Создаем структуру данных для отправки на сервер
            const imageData = {
                product: { id: productId },
                imageUrl: data.imageUrl,
                sortOrder: sortOrder
            };
            
            return createImage(imageData).then(result => {
                // Обновляем локальный кеш изображений после добавления
                setProductImages(prev => ({
                    ...prev,
                    [productId]: [...(prev[productId] || []), result]
                }));
                return result;
            });
        },
        update: (id, data) => {
            const productId = parseInt(data.productId);
            const sortOrder = parseInt(data.sortOrder || 0);
            
            // Проверяем уникальность sortOrder для этого товара
            if (!isSortOrderUnique(productId, sortOrder, parseInt(id))) {
                throw new Error(`Порядковый номер ${sortOrder} уже используется для этого товара`);
            }
            
            // Создаем структуру данных для отправки на сервер
            const imageData = {
                id: parseInt(id),
                product: { id: productId },
                imageUrl: data.imageUrl,
                sortOrder: sortOrder
            };
            return updateImage(id, imageData).then(result => {
                // Обновляем локальный кеш изображений после обновления
                setProductImages(prev => {
                    const updatedImages = prev[productId] ? prev[productId].map(img => 
                        img.id === parseInt(id) ? result : img
                    ) : [];
                    return {
                        ...prev,
                        [productId]: updatedImages
                    };
                });
                return result;
            });
        },
        delete: (id) => {
            return deleteImage(id).then(() => {
                // Обновляем локальный кеш изображений после удаления
                setProductImages(prev => {
                    const newState = { ...prev };
                    // Ищем изображение в каждом товаре и удаляем его
                    Object.keys(newState).forEach(productId => {
                        newState[productId] = newState[productId].filter(img => img.id !== parseInt(id));
                    });
                    return newState;
                });
            });
        }
    };

    // Преобразуем данные для редактирования
    const handleOnEdit = (item) => {
        const productId = item.product ? item.product.id : null;
        if (productId) {
            setSelectedProductId(productId);
        }
        return {
            ...item,
            productId: productId,
            sortOrder: item.sortOrder || 0
        };
    };

    // Информация о лимите изображений
    const ImageLimitInfo = () => {
        if (!selectedProductId) return null;
        
        const currentCount = getImagesCountForProduct(selectedProductId);
        const remainingSlots = MAX_IMAGES_PER_PRODUCT - currentCount;
        
        return (
            <div style={{ 
                padding: '10px', 
                marginBottom: '15px', 
                backgroundColor: remainingSlots <= 2 ? '#fff3cd' : '#e8f4f8',
                border: `1px solid ${remainingSlots <= 2 ? '#ffeeba' : '#bee5eb'}`,
                borderRadius: '4px'
            }}>
                <h4 style={{ margin: '0 0 5px 0' }}>Статистика изображений для товара ID: {selectedProductId}</h4>
                <div>Количество изображений: {currentCount} из {MAX_IMAGES_PER_PRODUCT}</div>
                <div>Осталось слотов: {remainingSlots}</div>
                {remainingSlots <= 0 && (
                    <div style={{ color: '#721c24', fontWeight: 'bold', marginTop: '5px' }}>
                        Достигнут лимит изображений для этого товара. Удалите ненужные изображения перед добавлением новых.
                    </div>
                )}
            </div>
        );
    };

    // Определяем поля для таблицы
    const fields = [
        {
            name: 'id',
            label: 'ID',
            type: 'number',
            readOnly: true
        },
        {
            name: 'productId',
            label: 'ID Товара',
            required: true,
            render: (item, onChange) => (
                <select
                    value={item.productId || ''}
                    onChange={(e) => {
                        const newValue = e.target.value;
                        onChange('productId', newValue);
                        handleProductChange(newValue);
                    }}
                >
                    <option value="">Выберите товар</option>
                    {products.map(product => {
                        const count = getImagesCountForProduct(product.id);
                        const isFull = count >= MAX_IMAGES_PER_PRODUCT;
                        return (
                            <option 
                                key={product.id} 
                                value={product.id}
                                disabled={isFull && item.productId !== product.id.toString()}
                            >
                                {product.id} {isFull ? '(заполнен)' : ''}
                            </option>
                        );
                    })}
                </select>
            ),
            display: (item) => {
                const productId = item.product ? item.product.id : null;
                if (!productId) return 'Не указан';
                
                return `${productId}`;
            }
        },
        {
            name: 'imageUrl',
            label: 'URL изображения',
            type: 'text',
            required: true,
            display: (item) => (
                <div>
                    <a href={item.imageUrl} target="_blank" rel="noopener noreferrer" 
                        style={{ marginRight: '10px', textDecoration: 'underline', color: 'blue' }}>
                        {item.imageUrl}
                    </a>
                    {item.imageUrl && (
                        <img src={item.imageUrl} alt="Preview" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                    )}
                </div>
            )
        },
        {
            name: 'sortOrder',
            label: 'Порядковый номер',
            type: 'number',
            hint: 'Должен быть уникальным для выбранного товара (от 0 до 7)',
            display: (item) => item.sortOrder || 0
        }
    ];

    // Настраиваем валидаторы
    const validators = {
        productId: (value) => {
            if (!value) return false;
            
            const productId = parseInt(value);
            const productExists = products.some(p => p.id === productId);
            if (!productExists) return false;
            
            // При редактировании не проверяем лимит для текущего товара
            // При создании нового проверяем лимит
            const currentCount = getImagesCountForProduct(productId);
            return currentCount < MAX_IMAGES_PER_PRODUCT;
        },
        imageUrl: (value) => {
            return value && value.trim() !== '';
        },
        sortOrder: (value, item) => {
            // Если значение пустое или не определено, считаем валидным (для промежуточного состояния при вводе)
            if (value === '' || value === undefined || value === null) {
                return true;
            }
            
            // Проверяем диапазон
            const numValue = parseInt(value);
            const isValidRange = !isNaN(numValue) && numValue >= 0 && numValue <= 7;
            if (!isValidRange) return false;
            
            // Проверяем наличие item и productId
            if (!item || !item.productId) return true;
            
            try {
                return isSortOrderUnique(
                    parseInt(item.productId), 
                    numValue, 
                    item.id ? parseInt(item.id) : null
                );
            } catch (error) {
                console.error('Ошибка при проверке уникальности sortOrder:', error);
                return true; // В случае ошибки позволяем пользователю продолжить
            }
        }
    };

    return (
        <GenericTableManager
            title="Управление изображениями"
            apiClient={apiClient}
            fields={fields}
            validators={validators}
            customHandlers={{
                onEdit: handleOnEdit
            }}
            additionalComponents={{
                beforeTable: selectedProductId ? <ImageLimitInfo /> : null
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

export default AdminImagesGeneric; 