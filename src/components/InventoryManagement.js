import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';

const InventoryManagement = () => {
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [newId, setNewId] = useState('');
  const [idError, setIdError] = useState('');

  const fetchData = async () => {
    try {
      const [warehouseResponse, categoriesResponse, productsResponse, sizesResponse] = await Promise.all([
        axios.get(`${API_CONFIG.API_URL}/warehouse`),
        axios.get(`${API_CONFIG.API_URL}/categories`),
        axios.get(`${API_CONFIG.API_URL}/products`),
        axios.get(`${API_CONFIG.API_URL}/sizes`)
      ]);
      setItems(warehouseResponse.data);
      setCategories(categoriesResponse.data);
      setProducts(productsResponse.data);
      setSizes(sizesResponse.data);
      
      // Находим следующий свободный ID
      const existingIds = warehouseResponse.data.map(item => item.id).sort((a, b) => a - b);
      let nextId = 1;
      for (let i = 0; i < existingIds.length; i++) {
        if (existingIds[i] !== i + 1) {
          nextId = i + 1;
          break;
        }
        nextId = existingIds[i] + 1;
      }
      setNewId(nextId.toString());
    } catch (error) {
      console.error('Помилка отримання даних:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredItems = selectedCategory
    ? items.filter(item => item.product.category.id === selectedCategory)
    : items;

  const handleEdit = (item) => {
    setEditingItem(item);
    setSelectedProduct(item.product.id);
    setSelectedSize(item.size.id);
    setQuantity(item.quantity.toString());
    setShowAddForm(true);
  };

  const handleAddClick = () => {
    setShowAddForm(true);
    setEditingItem(null);
    setSelectedProduct('');
    setSelectedSize('');
    setQuantity('');
    setIdError('');
  };

  const handleSave = async () => {
    try {
      if (editingItem) {
        await axios.put(`${API_CONFIG.API_URL}/warehouse/${editingItem.id}`, {
          productId: parseInt(selectedProduct),
          sizeId: parseInt(selectedSize),
          quantity: parseInt(quantity)
        });
      } else {
        // Проверяем, существует ли ID
        const idExists = items.some(item => item.id === parseInt(newId));
        if (idExists) {
          setIdError('Цей ID вже існує. Будь ласка, виберіть інший.');
          return;
        }

        await axios.post(`${API_CONFIG.API_URL}/warehouse`, {
          id: parseInt(newId),
          productId: parseInt(selectedProduct),
          sizeId: parseInt(selectedSize),
          quantity: parseInt(quantity)
        });
      }
      fetchData();
      setShowAddForm(false);
      setEditingItem(null);
      setSelectedProduct('');
      setSelectedSize('');
      setQuantity('');
      setIdError('');
    } catch (error) {
      console.error('Помилка збереження даних:', error);
      if (error.response && error.response.status === 409) {
        setIdError('Цей ID вже існує. Будь ласка, виберіть інший.');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-4">Управління складом</h2>
        <div className="flex gap-4 mb-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="">Всі категорії</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddClick}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Додати нову позицію
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="mb-4 p-4 border rounded">
          <h3 className="text-xl font-bold mb-4">
            {editingItem ? 'Редагувати позицію' : 'Додати нову позицію'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">ID</label>
              <input
                type="number"
                value={editingItem ? editingItem.id : newId}
                onChange={(e) => {
                  if (!editingItem) {
                    setNewId(e.target.value);
                    setIdError('');
                  }
                }}
                disabled={!!editingItem}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${editingItem ? 'bg-gray-100' : ''}`}
              />
              {idError && <p className="mt-1 text-sm text-red-600">{idError}</p>}
            </div>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="">Оберіть товар</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="">Оберіть розмір</option>
              {sizes.map(size => (
                <option key={size.id} value={size.id}>
                  {size.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Кількість"
              className="border rounded px-3 py-2"
            />
          </div>
          <button
            onClick={handleSave}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {editingItem ? 'Зберегти зміни' : 'Додати'}
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Товар
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Категорія
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Розмір
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Кількість
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Дії
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-300">
                  {item.product.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-300">
                  {item.product.category.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-300">
                  {item.size.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-300">
                  {item.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-300">
                  <button
                    onClick={() => handleEdit(item)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-2"
                  >
                    Редагувати
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                  >
                    Видалити
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryManagement; 