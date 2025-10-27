# Frontend - Fashion Store React Application

> Современный React frontend для интернет-магазина модной одежды

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-5.15.10-007FFF.svg)](https://mui.com/)
[![Netlify](https://img.shields.io/badge/Netlify-Deployed-00C7B7.svg)](https://netlify.com/)

## 🌐 Живой Сайт

**Production URL**: https://kounakwebstore.netlify.app

## 🎯 Основные Возможности

### 👤 Пользовательский Интерфейс
- **Главная страница** с популярными товарами
- **Каталог товаров** с фильтрацией и поиском
- **Детальная страница товара** с изображениями
- **Корзина покупок** с динамическим обновлением
- **Wishlist** для сохранения понравившихся товаров
- **Личный кабинет** с историей заказов
- **Checkout** для оформления заказа

### 🔐 Аутентификация
- Регистрация новых пользователей
- Вход в систему с JWT токенами
- Выход из системы
- Context API для управления состоянием авторизации
- Защищенные маршруты

### 🛒 Покупки
- Добавление/удаление из корзины
- Изменение количества товаров
- Сохранение корзины между сеансами
- Wishlist функционал
- Оформление заказа с адресом доставки

### 📱 Адаптивность
- Responsive дизайн для всех устройств
- Mobile-first подход
- Оптимизация для планшетов и десктопов

## 🏗️ Архитектура

```
fashion-store-frontend/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── images/          # Статические изображения
│
├── src/
│   ├── api/             # API клиенты (21 файл)
│   │   ├── productsApi.js
│   │   ├── cartApi.js
│   │   ├── ordersApi.js
│   │   ├── wishlistApi.js
│   │   ├── addressesApi.js
│   │   ├── authApi.js
│   │   └── ...
│   │
│   ├── components/       # React компоненты (41 файл)
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── ProductCard.jsx
│   │   ├── Cart.jsx
│   │   ├── Wishlist.jsx
│   │   ├── MyOrders.jsx
│   │   ├── Checkout.jsx
│   │   ├── AddressSelector.jsx
│   │   └── ...
│   │
│   ├── pages/            # Страницы (29 файлов)
│   │   ├── Home.jsx
│   │   ├── Catalog.jsx
│   │   ├── ProductDetails.jsx
│   │   ├── CartPage.jsx
│   │   ├── WishlistPage.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Profile.jsx
│   │   ├── admin/
│   │   │   ├── AdminPanel.jsx
│   │   │   ├── ProductManagement.jsx
│   │   │   └── OrderManagement.jsx
│   │   └── ...
│   │
│   ├── context/          # Context API
│   │   └── AuthContext.js
│   │
│   ├── hooks/            # Custom Hooks (7 файлов)
│   │   ├── useCart.js
│   │   ├── useWishlist.js
│   │   ├── useOrders.js
│   │   ├── useAdmin.js
│   │   └── ...
│   │
│   ├── config/           # Конфигурация
│   │   └── apiConfig.js
│   │
│   ├── styles/           # Стили (34 файла)
│   │   ├── App.css
│   │   ├── Header.css
│   │   ├── Footer.css
│   │   └── ...
│   │
│   └── utils/            # Утилиты
│       ├── helpers.js
│       └── validators.js
│
├── package.json
└── netlify.toml
```

## 🛠️ Технологии

### Основной Стек
- **React 18.2.0** - UI библиотека
- **React Router 6.22.1** - Маршрутизация
- **Axios 1.6.7** - HTTP клиент
- **Material-UI 5.15.10** - Компоненты UI
- **React Hot Toast 2.4.1** - Уведомления
- **React Beautiful DnD** - Drag & Drop для админки
- **JWT Decode** - Декодирование токенов

### Дополнительные Библиотеки
- **React Helmet Async** - SEO оптимизация
- **@emotion/react** - Styled components

### Демо Аккаунт

Админка: **admin@kounak.com** / **admin123**

## 🚀 Запуск

### Установка
```bash
# Клонирование
git clone https://github.com/yourusername/kounak.git
cd kounak/fashion-store-frontend

# Установка зависимостей
npm install
```

### Локальный Запуск
```bash
# Development сервер
npm start

# Сайт будет доступен на http://localhost:3000
```

### Сборка для Production
```bash
# Сборка
npm run build

# Файлы будут в папке build/
```

## 📁 Основные Компоненты

### Header
- Навигация по сайту
- Поиск товаров
- Корзина и Wishlist
- Аватар пользователя
- Выход из системы

### Home
- Hero секция
- Популярные товары
- Рекомендации
- Категории

### Catalog
- Список товаров
- Фильтры по категориям
- Пагинация
- Сортировка

### ProductDetails
- Детальная информация о товаре
- Галерея изображений
- Размеры
- Добавление в корзину
- Добавление в Wishlist

### Cart
- Список товаров в корзине
- Изменение количества
- Удаление товаров
- Общая стоимость
- Переход к оформлению

### Checkout
- Выбор адреса доставки
- Создание адреса
- Товары в заказе
- Итоговая стоимость
- Оформление заказа

### AdminPanel
- Управление товарами
- CRUD операции
- Управление заказами
- Управление пользователями
- Статистика

## 🔐 State Management

### AuthContext
Глобальное управление авторизацией:
```javascript
const { user, login, logout, isAuthenticated } = useAuth();
```

### Custom Hooks
- `useCart()` - Управление корзиной
- `useWishlist()` - Управление wishlist
- `useOrders()` - Управление заказами
- `useAdmin()` - Админ функции

## 🎨 Стилизация

### CSS Modules
- Компонентные стили
- Переиспользуемые классы
- Responsive медиа-запросы

### Material-UI
- Компоненты Material Design
- Кастомная тематика
- Адаптивность

## 📱 Responsive Design

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Оптимизация
- Lazy loading компонентов
- Изображения с оптимизацией
- Минификация CSS/JS

## 🚢 Деплой

### Netlify
Автоматический деплой при push в GitHub:
1. Repository: `kounak/fashion-store-frontend`
2. Build command: `npm run build`
3. Publish directory: `build`

### Environment Variables
```bash
REACT_APP_API_URL=https://kounakwebstore-backend-production.up.railway.app
```

## 🧪 Тестирование

```bash
# Запуск тестов
npm test

# Запуск с покрытием
npm test -- --coverage
```

## 📊 Статистика

- **Компоненты**: 41
- **Страницы**: 29
- **API клиенты**: 21
- **Custom Hooks**: 7
- **Стилей**: 34
- **Размер**: Production build ~2MB

## 🎯 Особенности

✅ **Современный UI** - Material-UI компоненты  
✅ **Быстрая загрузка** - Оптимизированные запросы  
✅ **Responsive** - Работает на всех устройствах  
✅ **SEO оптимизация** - Meta теги и Open Graph  
✅ **Accessibility** - ARIA атрибуты  

## 🔄 API Интеграция

### Основные Endpoints
```javascript
// Продукты
GET /api/public/products
GET /api/public/products/{id}

// Корзина
GET /api/cart
POST /api/cart/add
DELETE /api/cart/remove/{productId}

// Заказы
POST /api/orders/create
GET /api/orders
GET /api/orders/{id}

// Админ
GET /api/admin/products
POST /api/admin/products
PUT /api/admin/products/{id}
DELETE /api/admin/products/{id}
```

## 📄 Лицензия

MIT License

## 👨‍💻 Автор

**Kostya Kunak** - Разработано с нуля для дипломной работы

---

⭐ Спасибо за интерес к проекту!

