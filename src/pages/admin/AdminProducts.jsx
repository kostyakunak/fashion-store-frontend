import React, { useEffect, useState } from "react";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../../api/productsApi";
import { createPrice } from "../../api/pricesApi";
import { createImage, getImagesByProductId, deleteImage, updateImage } from "../../api/imagesApi";
import { createWarehouse } from "../../api/warehouseApi";
import { getCategories } from "../../api/categoriesApi";
import { getSizes } from "../../api/sizesApi";
import "./AdminProducts.css";

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [productImages, setProductImages] = useState({});
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [newImage, setNewImage] = useState({ imageUrl: "" });
    const [newProductImages, setNewProductImages] = useState([]);
    const [newProduct, setNewProduct] = useState({
        name: "",
        productDetails: "",
        measurements: "",
        categoryId: "",
        originalPrice: "",
        current_price: "",
    });
    // Новое состояние для хранения размеров и их количества
    const [sizeQuantities, setSizeQuantities] = useState([]);
    const [activeTab, setActiveTab] = useState("productList"); // productList, addProduct, manageImages
    const [draggedImage, setDraggedImage] = useState(null);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchSizes();
    }, []);

    const fetchProducts = async () => {
        const data = await getProducts();
        setProducts(data);
        
        // Загружаем изображения для каждого товара
        const imagesMap = {};
        for (const product of data) {
            const images = await getImagesByProductId(product.id);
            imagesMap[product.id] = images;
        }
        setProductImages(imagesMap);
    };

    const fetchCategories = async () => {
        const data = await getCategories();
        setCategories(data);
    };

    const fetchSizes = async () => {
        const data = await getSizes();
        setSizes(data);
    };

    // Обработчик добавления нового размера и количества
    const handleAddSizeQuantity = () => {
        setSizeQuantities([...sizeQuantities, { sizeId: "", quantity: "" }]);
    };

    // Обработчик удаления размера и количества
    const handleRemoveSizeQuantity = (index) => {
        const updatedSizeQuantities = [...sizeQuantities];
        updatedSizeQuantities.splice(index, 1);
        setSizeQuantities(updatedSizeQuantities);
    };

    // Обработчик изменения размера или количества
    const handleSizeQuantityChange = (index, field, value) => {
        const updatedSizeQuantities = [...sizeQuantities];
        updatedSizeQuantities[index] = {
            ...updatedSizeQuantities[index],
            [field]: value
        };
        setSizeQuantities(updatedSizeQuantities);
    };

    const handleCreate = async () => {
        if (!newProduct.categoryId) {
            alert("Выберите категорию!");
            return;
        }

        if (newProductImages.length === 0) {
            alert("Добавьте хотя бы одно изображение!");
            return;
        }

        if (sizeQuantities.length === 0) {
            alert("Добавьте хотя бы один размер и его количество!");
            return;
        }

        // Проверка валидности размеров и количества
        for (const sizeQuantity of sizeQuantities) {
            if (!sizeQuantity.sizeId || !sizeQuantity.quantity) {
                alert("Заполните все размеры и их количество!");
                return;
            }
            
            if (parseInt(sizeQuantity.quantity) <= 0) {
                alert("Количество должно быть больше нуля!");
                return;
            }
        }

        try {
            // 1️⃣ Создаем товар
            const createdProduct = await createProduct({
                name: newProduct.name,
                productDetails: newProduct.productDetails,
                measurements: newProduct.measurements,
                category: { id: newProduct.categoryId }
            });

            // 2️⃣ Создаем цену, привязывая к productId
            console.log("Отправляемый товар:", newProduct);
            await createPrice({
                product: { id: createdProduct.id },
                original_price: parseFloat(newProduct.originalPrice),
                present_price: parseFloat(newProduct.current_price)
            });

            // 3️⃣ Добавляем все изображения с соответствующими порядковыми номерами
            for (let i = 0; i < newProductImages.length; i++) {
                await createImage({
                    product: { id: createdProduct.id },
                    imageUrl: newProductImages[i].imageUrl,
                    sortOrder: i
                });
            }

            // 4️⃣ Добавляем все размеры и их количества на склад
            for (const sizeQuantity of sizeQuantities) {
                await createWarehouse({
                    id: Date.now().toString() + Math.random().toString().slice(2, 6), // Генерируем уникальный ID
                    productId: createdProduct.id.toString(),
                    sizeId: parseInt(sizeQuantity.sizeId).toString(),
                    quantity: parseInt(sizeQuantity.quantity)
                });
            }

            // Очищаем форму
            setNewProduct({
                name: "",
                productDetails: "",
                measurements: "",
                categoryId: "",
                originalPrice: "",
                current_price: "",
            });
            setSizeQuantities([]);
            setNewProductImages([]);

            // Обновляем список товаров
            await fetchProducts();
            
            // Переключаемся на список товаров
            setActiveTab("productList");
            
            alert("Товар успешно добавлен!");
        } catch (error) {
            console.error("Ошибка при создании товара:", error);
            alert("Ошибка при создании товара: " + error.message);
        }
    };

    const handleDelete = async (id) => {
        try {
            // Сначала пробуем удалить без принудительного удаления
            await deleteProduct(id, false);
            await fetchProducts();
            alert("Товар успешно удален!");
        } catch (error) {
            // Если ошибка содержит упоминание о заказах, предлагаем принудительное удаление
            if (error.message && error.message.includes("заказах")) {
                const confirmed = window.confirm(
                    `${error.message}\n\nВы уверены, что хотите принудительно удалить этот товар? Это удалит его из всех заказов и может повлиять на историю заказов клиентов.`
                );
                
                if (confirmed) {
                    try {
                        await deleteProduct(id, true);
                        await fetchProducts();
                        alert("Товар успешно удален со всеми связанными данными, включая записи в заказах!");
                    } catch (secondError) {
                        console.error("Ошибка при принудительном удалении товара:", secondError);
                        alert("Ошибка при принудительном удалении товара: " + secondError.message);
                    }
                }
            } else {
                console.error("Ошибка при удалении товара:", error);
                alert("Ошибка при удалении товара: " + error.message);
            }
        }
    };
    
    const handleSelectProduct = (product) => {
        setSelectedProduct(product);
        setActiveTab("manageImages");
    };
    
    // Обновление порядка всех изображений после добавления или удаления
    const reorderImages = async (productId) => {
        try {
            const images = await getImagesByProductId(productId);
            
            // Сортируем изображения по текущему порядку
            const sortedImages = [...images].sort((a, b) => 
                (a.sortOrder || 0) - (b.sortOrder || 0)
            );
            
            // Обновляем порядковые номера
            for (let i = 0; i < sortedImages.length; i++) {
                if (sortedImages[i].sortOrder !== i) {
                    await updateImage(sortedImages[i].id, {
                        ...sortedImages[i],
                        sortOrder: i
                    });
                }
            }
            
            // Обновляем изображения в состоянии
            const updatedImages = await getImagesByProductId(productId);
            setProductImages({
                ...productImages,
                [productId]: updatedImages
            });
        } catch (error) {
            console.error("Ошибка при обновлении порядка изображений:", error);
        }
    };
    
    const handleAddNewProductImage = () => {
        if (!newImage.imageUrl) return;
        
        // Проверяем количество изображений
        if (newProductImages.length >= 8) {
            alert("Товар уже имеет максимальное количество изображений (8)");
            return;
        }
        
        // Добавляем новое изображение с временным ID
        const newImageWithId = {
            id: `temp-${Date.now()}`, // Временный ID для взаимодействия на клиенте
            imageUrl: newImage.imageUrl,
            sortOrder: newProductImages.length
        };
        
        setNewProductImages([...newProductImages, newImageWithId]);
        
        // Очищаем форму
        setNewImage({ imageUrl: "" });
    };
    
    const handleDeleteNewProductImage = (imageId) => {
        // Удаляем изображение из списка
        const updatedImages = newProductImages.filter(img => img.id !== imageId);
        
        // Обновляем порядковые номера
        const reorderedImages = updatedImages.map((img, index) => ({
            ...img,
            sortOrder: index
        }));
        
        setNewProductImages(reorderedImages);
    };
    
    // Функция для перетаскивания изображений нового товара
    const handleNewProductImageDragStart = (e, image) => {
        // Предотвращаем стандартное поведение, которое может мешать
        e.stopPropagation();
        
        // Сохраняем информацию о перетаскиваемом изображении
        setDraggedImage(image);
        
        // Установка данных для перетаскивания - необходимо для некоторых браузеров
        e.dataTransfer.setData('text/plain', image.id);
        e.dataTransfer.effectAllowed = "move";
        
        // Убираем привязку к картинке, выбирая всю карточку
        const card = e.currentTarget;
        
        // Убираем все остальные возможные drag-события с дочерних элементов
        const images = card.querySelectorAll('img');
        images.forEach(img => {
            img.draggable = false;
        });
        
        // Добавляем класс к перетаскиваемому элементу
        card.classList.add('dragging');
        
        // Добавляем глобальную переменную, чтобы отслеживать перетаскивание
        window._isDragging = true;
        
        // Задержка для применения эффекта прозрачности (CSS transitions могут конфликтовать)
        setTimeout(() => {
            if (window._isDragging) {
                card.style.opacity = "0.4";
            }
        }, 10);
    };
    
    const handleNewProductImageDrop = (e, targetImage) => {
        e.preventDefault();
        e.stopPropagation(); // Предотвращаем всплытие события
        
        // Сбрасываем глобальную переменную
        window._isDragging = false;
        
        // Удаляем стили и классы
        const card = e.currentTarget;
        card.classList.remove('drag-over');
        
        // Убеждаемся, что у нас есть и исходное, и целевое изображение
        if (!draggedImage || !targetImage || draggedImage.id === targetImage.id) {
            console.log("Некорректное перетаскивание:", {
                dragged: draggedImage?.id,
                target: targetImage?.id
            });
            return;
        }
        
        // Получаем индексы изображений
        const draggedIndex = newProductImages.findIndex(img => img.id === draggedImage.id);
        const targetIndex = newProductImages.findIndex(img => img.id === targetImage.id);
        
        if (draggedIndex === -1 || targetIndex === -1) {
            console.error("Не найдены изображения");
            return;
        }
        
        // Создаем копию массива
        const updatedImages = [...newProductImages];
        
        // Создаем копию перетаскиваемого изображения
        const draggedItem = { ...updatedImages[draggedIndex] };
        
        // Удаляем перетаскиваемый элемент
        updatedImages.splice(draggedIndex, 1);
        
        // Вставляем его на новую позицию
        updatedImages.splice(targetIndex, 0, draggedItem);
        
        // Обновляем порядковые номера
        const reorderedImages = updatedImages.map((img, index) => ({
            ...img,
            sortOrder: index
        }));
        
        // Обновляем состояние
        setNewProductImages(reorderedImages);
        
        // Сбрасываем состояние перетаскивания
        setDraggedImage(null);
    };

    // Восстанавливаем функции для существующего товара
    const handleAddImage = async () => {
        if (!selectedProduct) return;
        
        try {
            // Проверяем количество изображений
            const currentImages = productImages[selectedProduct.id] || [];
            if (currentImages.length >= 8) {
                alert("Товар уже имеет максимальное количество изображений (8)");
                return;
            }
            
            // Получаем следующий порядковый номер
            const nextSortOrder = currentImages.length;
            
            // Создаем новое изображение с автоматическим порядковым номером
            // sortOrder определяет порядок изображения (0 - основное)
            await createImage({
                product: { id: selectedProduct.id },
                imageUrl: newImage.imageUrl,
                sortOrder: nextSortOrder
            });
            
            // Обновляем список изображений
            const updatedImages = await getImagesByProductId(selectedProduct.id);
            setProductImages({
                ...productImages,
                [selectedProduct.id]: updatedImages
            });
            
            // Очищаем форму
            setNewImage({ imageUrl: "" });
            
            alert("Изображение успешно добавлено!");
        } catch (error) {
            console.error("Ошибка при добавлении изображения:", error);
            alert("Ошибка при добавлении изображения: " + error.message);
        }
    };
    
    const handleDeleteImage = async (imageId) => {
        if (!selectedProduct) return;
        
        try {
            await deleteImage(imageId);
            
            // Обновляем порядок оставшихся изображений
            await reorderImages(selectedProduct.id);
            
            alert("Изображение успешно удалено!");
        } catch (error) {
            console.error("Ошибка при удалении изображения:", error);
            alert("Ошибка при удалении изображения: " + error.message);
        }
    };

    // Функции для drag-and-drop
    const handleDragStart = (e, image) => {
        // Предотвращаем стандартное поведение, которое может мешать
        e.stopPropagation();
        
        // Сохраняем информацию о перетаскиваемом изображении
        setDraggedImage(image);
        
        // Установка данных для перетаскивания - необходимо для некоторых браузеров
        e.dataTransfer.setData('text/plain', image.id);
        e.dataTransfer.effectAllowed = "move";
        
        // Убираем привязку к картинке, выбирая всю карточку
        const card = e.currentTarget;
        
        // Убираем все остальные возможные drag-события с дочерних элементов
        const images = card.querySelectorAll('img');
        images.forEach(img => {
            img.draggable = false;
        });
        
        // Добавляем класс к перетаскиваемому элементу
        card.classList.add('dragging');
        
        // Добавляем глобальную переменную, чтобы отслеживать перетаскивание
        window._isDragging = true;
        
        // Задержка для применения эффекта прозрачности (CSS transitions могут конфликтовать)
        setTimeout(() => {
            if (window._isDragging) {
                card.style.opacity = "0.4";
            }
        }, 10);
    };

    const handleDragEnd = (e) => {
        // Сбрасываем глобальную переменную
        window._isDragging = false;
        
        // Восстанавливаем прозрачность и убираем класс
        e.currentTarget.style.opacity = "1";
        e.currentTarget.classList.remove('dragging');
        
        // Делаем небольшую задержку перед сбросом состояния перетаскивания
        // Это помогает предотвратить проблемы, связанные с тем, что drop иногда срабатывает после dragEnd
        setTimeout(() => {
            setDraggedImage(null);
        }, 50);
        
        // Возвращаем возможность перетаскивания изображений
        const images = e.currentTarget.querySelectorAll('img');
        images.forEach(img => {
            img.draggable = false;
        });
        
        // Удаляем класс drag-over со всех элементов
        document.querySelectorAll('.image-card').forEach(card => {
            card.classList.remove('drag-over');
        });
    };

    const handleDragOver = (e) => {
        // Предотвращаем стандартное поведение (по умолчанию drop запрещен)
        e.preventDefault();
        e.stopPropagation();
        
        // Проверяем, что сейчас действительно что-то перетаскивается
        if (!window._isDragging) return;
        
        e.dataTransfer.dropEffect = "move";
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Проверяем, что сейчас действительно что-то перетаскивается
        if (!window._isDragging) return;
        
        // Находим родительский элемент карточки для добавления класса
        const card = e.currentTarget;
        if (card && !card.classList.contains('drag-over')) {
            card.classList.add('drag-over');
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Проверяем, что сейчас действительно что-то перетаскивается
        if (!window._isDragging) return;
        
        // Убираем класс только если мышь действительно покинула элемент
        // (а не перешла на дочерний элемент)
        const relatedTarget = e.relatedTarget;
        const card = e.currentTarget;
        
        // Проверяем, что relatedTarget не является дочерним элементом карточки
        if (card && !card.contains(relatedTarget)) {
            card.classList.remove('drag-over');
        }
    };

    const handleDrop = async (e, targetImage) => {
        e.preventDefault();
        e.stopPropagation(); // Предотвращаем всплытие события
        
        // Сбрасываем глобальную переменную
        window._isDragging = false;
        
        // Удаляем стили и классы
        const card = e.currentTarget;
        card.classList.remove('drag-over');
        
        // Убеждаемся, что у нас есть и исходное, и целевое изображение
        if (!draggedImage || !targetImage || draggedImage.id === targetImage.id) {
            console.log("Некорректное перетаскивание:", {
                dragged: draggedImage?.id,
                target: targetImage?.id
            });
            return;
        }

        try {
            const productId = selectedProduct.id;
            
            // Показываем индикатор загрузки и блокируем все карточки от повторных действий
            card.classList.add('updating');
            document.querySelectorAll('.image-card').forEach(c => {
                c.classList.add('disabled');
            });
            
            // Получаем свежие данные перед обновлением
            const freshImages = await getImagesByProductId(productId);
            
            // Находим актуальные данные для обоих изображений
            const currentDragged = freshImages.find(img => img.id === draggedImage.id);
            const currentTarget = freshImages.find(img => img.id === targetImage.id);
            
            if (!currentDragged || !currentTarget) {
                console.error("Не найдены актуальные данные изображений");
                card.classList.remove('updating');
                document.querySelectorAll('.image-card').forEach(c => {
                    c.classList.remove('disabled');
                });
                return;
            }
            
            // Обмениваем порядковые номера
            const draggedOrder = currentDragged.sortOrder;
            const targetOrder = currentTarget.sortOrder;
            
            console.log('Меняем порядок:', {
                dragged: { id: currentDragged.id, order: draggedOrder },
                target: { id: currentTarget.id, order: targetOrder }
            });
            
            // Обновляем сначала одно изображение, затем другое
            await updateImage(currentDragged.id, { 
                ...currentDragged, 
                sortOrder: targetOrder 
            });
            
            await updateImage(currentTarget.id, { 
                ...currentTarget, 
                sortOrder: draggedOrder 
            });
            
            // Обновляем данные на странице
            await reorderImages(productId);
            
            // Убираем индикатор загрузки и разблокируем карточки
            card.classList.remove('updating');
            document.querySelectorAll('.image-card').forEach(c => {
                c.classList.remove('disabled');
            });
            
            // Сбрасываем состояние перетаскивания
            setDraggedImage(null);
        } catch (error) {
            console.error("Ошибка при изменении порядка изображений:", error);
            
            // Убираем индикатор загрузки и разблокируем карточки в случае ошибки
            card.classList.remove('updating');
            document.querySelectorAll('.image-card').forEach(c => {
                c.classList.remove('disabled');
            });
            
            // Сбрасываем состояние перетаскивания
            setDraggedImage(null);
            
            // Показываем пользователю сообщение об ошибке
            alert(`Ошибка при изменении порядка изображений: ${error.message}`);
        }
    };

    // Добавляем эффект для настройки и очистки drag-and-drop при монтировании/размонтировании
    useEffect(() => {
        // Функция для обработки событий dragover на всей странице
        const handleGlobalDragOver = (e) => {
            // Предотвращаем стандартное поведение, чтобы разрешить drop везде
            e.preventDefault();
        };

        // Функция для обработки событий drop на всей странице
        const handleGlobalDrop = (e) => {
            // Предотвращаем стандартное поведение, чтобы избежать нежелательных действий
            e.preventDefault();
            
            // Сбрасываем состояние перетаскивания
            window._isDragging = false;
            setDraggedImage(null);
            
            // Удаляем все классы drag-over
            document.querySelectorAll('.image-card').forEach(card => {
                card.classList.remove('drag-over');
                card.classList.remove('dragging');
                card.style.opacity = "1";
            });
        };
        
        // Функция для обработки снятия фокуса с окна
        const handleBlur = () => {
            // Сбрасываем состояние перетаскивания при потере фокуса
            if (window._isDragging) {
                window._isDragging = false;
                setDraggedImage(null);
                
                // Удаляем все классы для перетаскивания
                document.querySelectorAll('.image-card').forEach(card => {
                    card.classList.remove('drag-over');
                    card.classList.remove('dragging');
                    card.style.opacity = "1";
                });
            }
        };
        
        // Добавляем глобальные обработчики
        document.addEventListener('dragover', handleGlobalDragOver);
        document.addEventListener('drop', handleGlobalDrop);
        window.addEventListener('blur', handleBlur);
        
        // Инициализация состояния перетаскивания
        window._isDragging = false;
        
        // Отключаем перетаскивание для всех изображений в карточках
        document.querySelectorAll('.image-card img').forEach(img => {
            img.draggable = false;
        });
        
        // Очистка при размонтировании
        return () => {
            document.removeEventListener('dragover', handleGlobalDragOver);
            document.removeEventListener('drop', handleGlobalDrop);
            window.removeEventListener('blur', handleBlur);
            
            // Очищаем глобальную переменную
            window._isDragging = false;
        };
    }, []); // Пустой массив зависимостей - эффект запускается только при монтировании/размонтировании
    
    // Добавляем эффект для очистки состояния перетаскивания при изменении активной вкладки
    useEffect(() => {
        // Сбрасываем состояние перетаскивания при смене вкладки
        window._isDragging = false;
        setDraggedImage(null);
        
        // Удаляем все классы для перетаскивания
        document.querySelectorAll('.image-card').forEach(card => {
            card.classList.remove('drag-over');
            card.classList.remove('dragging');
            card.style.opacity = "1";
        });
    }, [activeTab]);

    const renderProductList = () => {
        return (
            <div className="product-list">
                <h2>Список товаров</h2>
                <button className="add-btn" onClick={() => setActiveTab("addProduct")}>Добавить новый товар</button>
                
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Название</th>
                            <th>Категория</th>
                            <th>Изображения</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td>{product.id}</td>
                                <td>{product.name}</td>
                                <td>{product.category ? product.category.name : "Нет категории"}</td>
                                <td>
                                    {productImages[product.id]?.length > 0 ? (
                                        <div className="product-images">
                                            {productImages[product.id].map((image, index) => (
                                                <img 
                                                    key={image.id} 
                                                    src={image.imageUrl} 
                                                    alt={`${product.name} ${index}`} 
                                                    className={`product-thumbnail ${image.sortOrder === 0 ? 'main-thumbnail' : ''}`}
                                                    title={`Сортировка: ${image.sortOrder || 0}${image.sortOrder === 0 ? ' (Основное)' : ''}`}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        "Нет изображений"
                                    )}
                                </td>
                                <td>
                                    <button className="action-btn edit-btn" onClick={() => handleSelectProduct(product)}>
                                        Управление изображениями
                                    </button>
                                    <button className="action-btn delete-btn" onClick={() => handleDelete(product.id)}>
                                        Удалить
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderAddProductForm = () => {
        return (
            <div className="add-product-form">
                <button className="back-btn" onClick={() => setActiveTab("productList")}>
                    Вернуться к списку товаров
                </button>
                <h2>Добавить новый товар</h2>
                
                <div className="form-section">
                    <h3>Основная информация</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Название товара</label>
                            <input
                                type="text"
                                placeholder="Название товара"
                                value={newProduct.name}
                                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Детали товара</label>
                            <input
                                type="text"
                                placeholder="Детали товара"
                                value={newProduct.productDetails}
                                onChange={(e) => setNewProduct({ ...newProduct, productDetails: e.target.value })}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Замеры</label>
                            <input
                                type="text"
                                placeholder="Замеры"
                                value={newProduct.measurements}
                                onChange={(e) => setNewProduct({ ...newProduct, measurements: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Категория</label>
                            <select
                                value={newProduct.categoryId}
                                onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                            >
                                <option value="">Выберите категорию</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Оригинальная цена</label>
                            <input
                                type="number"
                                placeholder="Оригинальная цена"
                                value={newProduct.originalPrice}
                                onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Текущая цена</label>
                            <input
                                type="number"
                                placeholder="Текущая цена"
                                value={newProduct.current_price}
                                onChange={(e) => setNewProduct({ ...newProduct, current_price: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
                
                <div className="form-section">
                    <h3>Размеры и количество</h3>
                    <button 
                        className="add-size-btn" 
                        onClick={handleAddSizeQuantity}
                        type="button"
                    >
                        Добавить размер
                    </button>
                    
                    {sizeQuantities.length === 0 && (
                        <p className="info-text">Добавьте хотя бы один размер и его количество на складе</p>
                    )}
                    
                    <div className="size-quantities-container">
                        {sizeQuantities.map((sizeQuantity, index) => (
                            <div key={index} className="size-quantity-row">
                                <div className="size-select">
                                    <select
                                        value={sizeQuantity.sizeId}
                                        onChange={(e) => handleSizeQuantityChange(index, 'sizeId', e.target.value)}
                                    >
                                        <option value="">Выберите размер</option>
                                        {sizes.map((size) => (
                                            <option 
                                                key={size.id} 
                                                value={size.id}
                                                disabled={sizeQuantities.some(
                                                    (sq, idx) => idx !== index && sq.sizeId === size.id.toString()
                                                )}
                                            >
                                                {size.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="quantity-input">
                                    <input
                                        type="number"
                                        placeholder="Количество"
                                        value={sizeQuantity.quantity}
                                        onChange={(e) => handleSizeQuantityChange(index, 'quantity', e.target.value)}
                                        min="1"
                                    />
                                </div>
                                <div className="remove-size-btn">
                                    <button 
                                        type="button"
                                        onClick={() => handleRemoveSizeQuantity(index)}
                                    >
                                        ✖
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="form-section">
                    <h3>Изображения товара</h3>
                    <div className="images-container">
                        <div className="add-image-form">
                            <div className="form-group">
                                <label>URL изображения</label>
                                <input
                                    type="text"
                                    placeholder="URL изображения"
                                    value={newImage.imageUrl}
                                    onChange={(e) => setNewImage({ ...newImage, imageUrl: e.target.value })}
                                />
                            </div>
                            <button 
                                className="add-btn" 
                                onClick={handleAddNewProductImage}
                                type="button"
                            >
                                Добавить изображение
                            </button>
                        </div>
                        
                        <div className="existing-images">
                            <h4>Изображения товара</h4>
                            
                            {newProductImages.length === 0 ? (
                                <p>Не добавлено ни одного изображения</p>
                            ) : (
                                <div 
                                    className="images-grid" 
                                    onDragOver={handleDragOver}
                                >
                                    {newProductImages.map((image, index) => (
                                        <div
                                            key={index}
                                            className={`image-card ${index === 0 ? 'main-image' : ''}`}
                                            draggable={true}
                                            onDragStart={(e) => handleNewProductImageDragStart(e, image)}
                                            onDragEnd={handleDragEnd}
                                            onDragEnter={handleDragEnter}
                                            onDragLeave={handleDragLeave}
                                            onDrop={(e) => handleNewProductImageDrop(e, image)}
                                        >
                                            <div className="image-preview">
                                                <img src={image.imageUrl} alt={`Изображение ${index + 1}`} />
                                            </div>
                                            <div className="image-info">
                                                {index === 0 && <span className="main-badge">Основное</span>}
                                                <span>#{index + 1}</span>
                                            </div>
                                            <div className="image-actions">
                                                {index !== 0 && (
                                                    <button
                                                        className="set-main-btn"
                                                        onClick={() => {
                                                            const updatedImages = [...newProductImages];
                                                            const mainImage = updatedImages[0];
                                                            updatedImages[0] = image;
                                                            updatedImages[index] = mainImage;
                                                            setNewProductImages(updatedImages);
                                                        }}
                                                    >
                                                        Сделать основным
                                                    </button>
                                                )}
                                                <button
                                                    className="delete-btn"
                                                    onClick={() => handleDeleteNewProductImage(index)}
                                                >
                                                    Удалить
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="form-actions">
                    <button className="create-btn" onClick={handleCreate}>
                        Добавить товар
                    </button>
                </div>
            </div>
        );
    };
    
    const renderManageImages = () => {
        if (!selectedProduct) return null;
        
        const productImagesArray = productImages[selectedProduct.id] || [];
        const canAddMoreImages = productImagesArray.length < 8;
        
        return (
            <div className="manage-images">
                <h2>Управление изображениями: {selectedProduct.name}</h2>
                <button className="back-btn" onClick={() => setActiveTab("productList")}>Вернуться к списку</button>
                
                <div className="instructions">
                    <p>
                        <strong>Подсказка:</strong> Для изменения порядка изображений перетащите карточку на новое место.
                        Изображение с порядковым номером 0 считается основным. Чтобы сделать изображение основным, перетащите его на первую позицию в списке.
                    </p>
                </div>
                
                <div className="images-container">
                    <div className="existing-images">
                        <h3>Существующие изображения ({productImagesArray.length}/8)</h3>
                        
                        {productImagesArray.length === 0 ? (
                            <p>У товара нет изображений</p>
                        ) : (
                            <div className="images-grid">
                                {productImagesArray.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map((image) => (
                                    <div 
                                        key={image.id} 
                                        className={`image-card ${image.sortOrder === 0 ? 'main-image' : ''}`}
                                        draggable={true}
                                        onDragStart={(e) => handleDragStart(e, image)}
                                        onDragEnd={handleDragEnd}
                                        onDragOver={handleDragOver}
                                        onDragEnter={handleDragEnter}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => handleDrop(e, image)}
                                    >
                                        <div className="image-preview">
                                            <img src={image.imageUrl} alt={`Изображение ${image.id}`} />
                                        </div>
                                        <div className="image-info">
                                            <p>
                                                {image.sortOrder === 0 && <span className="main-badge">Основное</span>}
                                            </p>
                                            <div className="image-actions">
                                                <button 
                                                    className="delete-btn" 
                                                    onClick={() => handleDeleteImage(image.id)}
                                                >
                                                    Удалить
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {canAddMoreImages && (
                        <div className="add-image-form">
                            <h3>Добавить новое изображение</h3>
                            
                            <div className="form-group">
                                <label>URL изображения</label>
                                <input
                                    type="text"
                                    placeholder="URL изображения"
                                    value={newImage.imageUrl}
                                    onChange={(e) => setNewImage({ ...newImage, imageUrl: e.target.value })}
                                />
                                {newImage.imageUrl && (
                                    <div className="image-preview">
                                        <img src={newImage.imageUrl} alt="Preview" />
                                    </div>
                                )}
                            </div>
                            
                            <button 
                                className="add-btn" 
                                onClick={handleAddImage}
                                disabled={!newImage.imageUrl}
                            >
                                Добавить изображение
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="admin-products">
            {activeTab === "productList" && renderProductList()}
            {activeTab === "addProduct" && renderAddProductForm()}
            {activeTab === "manageImages" && renderManageImages()}
        </div>
    );
};

export default AdminProducts;