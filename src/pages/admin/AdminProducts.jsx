import React, { useEffect, useState } from "react";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../../api/productsApi";
import { createPrice } from "../../api/pricesApi";
import { createImage } from "../../api/imagesApi";
import { createWarehouse } from "../../api/warehouseApi";
import { getCategories } from "../../api/categoriesApi";
import { getSizes } from "../../api/sizesApi";

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [newProduct, setNewProduct] = useState({
        name: "",
        productDetails: "",
        measurements: "",
        categoryId: "",
        originalPrice: "",
        currentPrice: "",
        imageUrl: "",
        sizeId: "",
        quantity: ""
    });

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchSizes();
    }, []);

    const fetchProducts = async () => {
        const data = await getProducts();
        setProducts(data);
    };

    const fetchCategories = async () => {
        const data = await getCategories();
        setCategories(data);
    };

    const fetchSizes = async () => {
        const data = await getSizes();
        setSizes(data);
    };

    const handleCreate = async () => {
        if (!newProduct.categoryId) {
            alert("Выберите категорию!");
            return;
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
                originalPrice: newProduct.originalPrice,
                currentPrice: newProduct.currentPrice
            });

            // 3️⃣ Добавляем изображение
            await createImage({
                product: { id: createdProduct.id },
                imageUrl: newProduct.imageUrl,
                isMain: true
            });

            // 4️⃣ Добавляем товар на склад
            await createWarehouse({
                product: { id: createdProduct.id },
                size: { id: newProduct.sizeId },
                quantity: newProduct.quantity
            });

            // Очищаем форму
            setNewProduct({
                name: "",
                productDetails: "",
                measurements: "",
                categoryId: "",
                originalPrice: "",
                currentPrice: "",
                imageUrl: "",
                sizeId: "",
                quantity: ""
            });

            // Обновляем список товаров
            await fetchProducts();
        } catch (error) {
            console.error("Ошибка при создании товара:", error);
        }
    };

    const handleDelete = async (id) => {
        await deleteProduct(id);
        await fetchProducts();
    };

    return (
        <div>
            <h2>Админка - Товары</h2>
            <div>
                <input
                    type="text"
                    placeholder="Название"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Детали товара"
                    value={newProduct.productDetails}
                    onChange={(e) => setNewProduct({ ...newProduct, productDetails: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Замеры"
                    value={newProduct.measurements}
                    onChange={(e) => setNewProduct({ ...newProduct, measurements: e.target.value })}
                />

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

                <input
                    type="number"
                    placeholder="Оригинальная цена"
                    value={newProduct.originalPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                />
                <input
                    type="number"
                    placeholder="Текущая цена"
                    value={newProduct.currentPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, currentPrice: e.target.value })}
                />

                <input
                    type="text"
                    placeholder="URL изображения"
                    value={newProduct.imageUrl}
                    onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                />

                <select
                    value={newProduct.sizeId}
                    onChange={(e) => setNewProduct({ ...newProduct, sizeId: e.target.value })}
                >
                    <option value="">Выберите размер</option>
                    {sizes.map((size) => (
                        <option key={size.id} value={size.id}>
                            {size.name}
                        </option>
                    ))}
                </select>

                <input
                    type="number"
                    placeholder="Количество на складе"
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                />

                <button onClick={handleCreate}>Добавить</button>
            </div>
            <ul>
                {products.map((product) => (
                    <li key={product.id}>
                        {product.name} - {product.productDetails} - {product.measurements}
                        (Категория: {product.category ? product.category.name : "Нет категории"})
                        <button onClick={() => handleDelete(product.id)}>Удалить</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AdminProducts;