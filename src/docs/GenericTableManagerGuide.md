# Руководство по использованию GenericTableManager

Данный документ содержит рекомендации по эффективному использованию компонента GenericTableManager и предотвращению типичных ошибок.

## Типичные проблемы и их решения

### 1. Проблема автоинкремента ID

**Проблема**: При создании новых записей через GenericTableManager возникает конфликт между ID, генерируемыми на фронтенде, и автоинкрементом ID в базе данных.

**Решение**: 
- В методе `create` апи-клиента необходимо удалять поле `id` перед отправкой на сервер:
```javascript
create: (data) => {
    // Валидация и прочая логика...
    
    const itemToSend = {
        ...data,
        // Другие преобразования...
    };
    
    // Удаляем поле id при создании, позволяя базе самой назначить ID
    delete itemToSend.id;
    
    return yourApiCreateFunction(itemToSend);
}
```

### 2. Проблема при редактировании связанных данных

**Проблема**: При редактировании записи со связанными данными (например, товар с категорией), значение видно в интерфейсе, но не устанавливается в объекте редактирования, из-за чего при сохранении возникает ошибка валидации.

**Решение**:
- Использовать пользовательский обработчик `onEdit` для предварительной обработки данных:
```javascript
const handleOnEdit = (item) => {
    // Если у элемента есть связанный объект, преобразуем его в нужный формат
    if (item.relatedObject && item.relatedObject.id) {
        return {
            ...item,
            relatedObjectId: item.relatedObject.id.toString()
        };
    }
    return item;
};

// Затем передаем этот обработчик в компонент
<GenericTableManager
    // Другие props...
    customHandlers={{
        onEdit: handleOnEdit
    }}
/>
```

### 3. Проблема с оповещением об ошибках

**Проблема**: Ошибки валидации и HTTP-запросов логируются в консоль, но не отображаются в интерфейсе.

**Решение**:
- Использовать компонент ErrorAlert для отображения всех типов ошибок
- В методах apiClient возвращать читаемые сообщения об ошибках:
```javascript
try {
    // Логика...
} catch (error) {
    // Извлекаем сообщение из ответа API или используем дефолтное
    throw new Error(error.response?.data?.message || 'Произошла ошибка при выполнении операции');
}
```

### 4. Проблема с валидацией "на лету"

**Проблема**: Валидация слишком рано срабатывает при вводе и мешает пользователю.

**Решение**:
- Отключить валидацию во время ввода, проверяя только при отправке:
```javascript
const validators = {
    // Валидаторы возвращают true, чтобы не выводить ошибку во время ввода
    email: () => true,
    phone: () => true
};

// Проверка происходит только при отправке
if (!validateEmail(data.email)) {
    throw new Error('Некорректный email');
}
```

### 5. Проблема с значениями по умолчанию

**Проблема**: При создании новой записи необходимые поля не заполняются автоматически.

**Решение**:
- Модифицировать метод `handleOpenAddForm` для установки значений по умолчанию:
```javascript
const handleOpenAddForm = () => {
    const nextId = getNextAvailableId();
    
    // Создаем объект с необходимыми значениями по умолчанию
    const defaultValues = { 
        id: nextId,
        status: 'ACTIVE',
        role: 'USER'
        // и т.д.
    };
    
    setNewItem(defaultValues);
    setShowAddForm(true);
};
```

### 6. Проблема с сортировкой списка после операций CRUD

**Проблема**: После выполнения операций создания, обновления или удаления записей, новые или измененные записи могут отображаться в произвольном порядке (например, новая запись с ID 7 может оказаться в середине списка между записями с ID 1 и 5).

**Пример проблемы**:
```
ID | Пользователь | Товар
---+-------------+-------
1  | User A      | Item X
7  | User B      | Item Y    <-- Новая запись с ID 7 оказывается в середине списка
5  | User C      | Item Z
```

**Решение**:
- Добавить сортировку данных во всех методах работы с данными:

```javascript
// При первичной загрузке данных
useEffect(() => {
    const loadData = async () => {
        try {
            // ... получение данных с сервера ...
            
            // Сортируем по ID перед установкой в состояние
            setItems(data.sort((a, b) => a.id - b.id));
        } catch (error) {
            // ... обработка ошибок ...
        }
    };
    loadData();
}, []);

// В методе getAll
const getAllItems = async () => {
    const data = await apiClient.getAll();
    // Сортируем данные перед возвратом
    return data.sort((a, b) => a.id - b.id);
};

// В методе create
create: (data) => {
    // ... валидация и подготовка данных ...
    
    return apiClient.create(itemToSend)
        .then(newItem => {
            // Обновляем список и сортируем по ID
            const updatedItems = [...items, newItem].sort((a, b) => a.id - b.id);
            setItems(updatedItems);
            return newItem;
        });
},

// В методе update
update: (id, data) => {
    // ... валидация и подготовка данных ...
    
    return apiClient.update(id, itemToSend)
        .then(updatedItem => {
            // Обновляем список и сортируем по ID
            const updatedItems = items
                .map(item => item.id === id ? updatedItem : item)
                .sort((a, b) => a.id - b.id);
            setItems(updatedItems);
            return updatedItem;
        });
},

// В методе delete
delete: (id) => {
    return apiClient.delete(id)
        .then(() => {
            // Удаляем элемент из списка и сортируем
            const updatedItems = items
                .filter(item => item.id !== id)
                .sort((a, b) => a.id - b.id);
            setItems(updatedItems);
        });
}
```

Это обеспечит последовательное отображение записей в таблице, и новые элементы будут отображаться в правильном порядке согласно их ID.

**Бонус: Альтернативные способы сортировки**

Вы также можете сортировать по другим полям или использовать более сложную логику сортировки:

```javascript
// Сортировка по имени пользователя
const sortedByName = data.sort((a, b) => {
    const nameA = `${a.user.firstName} ${a.user.lastName}`;
    const nameB = `${b.user.firstName} ${b.user.lastName}`;
    return nameA.localeCompare(nameB);
});

// Сортировка по дате (если есть поле createdAt)
const sortedByDate = data.sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
);

// Комбинированная сортировка (сначала по категории, затем по имени)
const sortedByMultiple = data.sort((a, b) => {
    // Сначала сравниваем по категории
    const catComp = a.category.name.localeCompare(b.category.name);
    
    // Если категории равны, сортируем по имени
    if (catComp === 0) {
        return a.name.localeCompare(b.name);
    }
    
    return catComp;
});
```

## Рекомендации по созданию компонентов с GenericTableManager

1. **Преобразование данных**:
   - Всегда преобразуйте данные в нужный формат перед отправкой на сервер
   - Используйте временные поля (например, categoryId вместо category) для упрощения работы с формами

2. **Обработка ошибок**:
   - Всегда оборачивайте API-вызовы в try-catch
   - Предоставляйте пользователю понятные сообщения об ошибках
   - Логируйте детали ошибок в консоль для отладки

3. **Работа со связанными данными**:
   - Загружайте связанные данные (например, список категорий) при инициализации компонента
   - Используйте пользовательские рендереры (render) для отображения связанных данных в формах

4. **Валидация данных**:
   - Основную валидацию выполняйте перед отправкой на сервер
   - Для полей с предопределенными значениями (выпадающие списки) всегда проверяйте существование выбранного значения

5. **Работа с ID**:
   - Для таблиц с автоинкрементом на сервере удаляйте ID перед созданием
   - Для таблиц с ручным управлением ID генерируйте и проверяйте уникальность ID на фронтенде

## Примеры использования

### Пример создания компонента для управления товарами

```javascript
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
            // Валидация и трансформация данных
            // ...
            
            // Удаляем поле id при создании нового продукта
            delete productToSend.id;
            
            return createProduct(productToSend);
        },
        update: (id, data) => {
            // Валидация и трансформация данных
            // ...
            return updateProduct(id, productToSend);
        },
        delete: deleteProduct
    };

    // Определение полей и других настроек
    // ...

    return (
        <GenericTableManager
            title="Управление товарами"
            apiClient={apiClient}
            fields={fields}
            validators={validators}
            customHandlers={{
                onEdit: handleOnEdit
            }}
            styles={{...}}
        />
    );
};
```

## Дополнительные рекомендации

- Тщательно тестируйте все операции CRUD
- Используйте явные типы для полей ввода (number для числовых полей и т.д.)
- При создании связей между таблицами всегда обеспечивайте правильное преобразование типов
- Предусматривайте все возможные сценарии ошибок
- Явно указывайте обязательные поля через параметр `required: true` 