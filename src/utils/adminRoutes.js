/**
 * Admin routes configuration for consistent navigation
 * 
 * This utility provides a single source of truth for all admin routes,
 * making it easier to maintain consistent navigation throughout the admin interface.
 */

const API_BASE_URL = "http://localhost:8080/api/admin";

// Route definitions for admin pages
export const AdminRoutes = {
  // Dashboard
  DASHBOARD: "/admin",
  
  // Product management
  PRODUCTS: "/admin/products",
  PRODUCTS_GENERIC: "/admin/products-generic",
  PRODUCT_DETAILS: (id) => `/admin/products/${id}`,
  
  // Category management
  CATEGORIES: "/admin/categories",
  CATEGORIES_GENERIC: "/admin/categories-generic",
  
  // Order management
  ORDERS: "/admin/orders",
  ORDERS_GENERIC: "/admin/orders-generic",
  ORDER_DETAILS: (id) => `/admin/order/${id}`,
  
  // User management
  USERS: "/admin/users",
  USERS_GENERIC: "/admin/users-generic",
  USER_DETAILS: (id) => `/admin/users/${id}`,
  
  // Address management
  ADDRESSES: "/admin/addresses",
  
  // Inventory management
  INVENTORY: "/admin/inventory",
  
  // Other admin pages
  PAYMENTS: "/admin/payments-generic",
  PAYMENTS_GENERIC: "/admin/payments-generic",
  IMAGES: "/admin/images",
  IMAGES_GENERIC: "/admin/images-generic",
  SIZES: "/admin/sizes-generic",
  CART_GENERIC: "/admin/cart-generic",
  WISHLIST_GENERIC: "/admin/wishlist-generic"
};

// API endpoint definitions
export const AdminApiEndpoints = {
  // Status and monitoring
  STATUS: `${API_BASE_URL}/status`,
  
  // Product management
  PRODUCTS: `${API_BASE_URL}/products`,
  PRODUCT_BY_ID: (id) => `${API_BASE_URL}/products/${id}`,
  PRODUCTS_BY_CATEGORY: (categoryId) => `${API_BASE_URL}/products/category/${categoryId}`,
  PRODUCTS_COUNT: `${API_BASE_URL}/products/count`,
  
  // Category management
  CATEGORIES: `${API_BASE_URL}/categories`,
  CATEGORY_BY_ID: (id) => `${API_BASE_URL}/categories/${id}`,
  CATEGORIES_COUNT: `${API_BASE_URL}/categories/count`,
  
  // Order management
  ORDERS: `${API_BASE_URL}/orders`,
  ORDER_BY_ID: (id) => `${API_BASE_URL}/orders/${id}`,
  ORDERS_BY_USER: (userId) => `${API_BASE_URL}/orders/user/${userId}`,
  ORDERS_COUNT: `${API_BASE_URL}/orders/count`,
  
  // User management
  USERS: `${API_BASE_URL}/users`,
  USER_BY_ID: (id) => `${API_BASE_URL}/users/${id}`,
  USERS_COUNT: `${API_BASE_URL}/users/count`,
  
  // Address management
  ADDRESSES: `${API_BASE_URL}/addresses`,
  ADDRESS_BY_ID: (id) => `${API_BASE_URL}/addresses/${id}`,
  ADDRESSES_BY_USER: (userId) => `${API_BASE_URL}/addresses/user/${userId}`,
  ADDRESSES_COUNT: `${API_BASE_URL}/addresses/count`,
  
  // Inventory management
  INVENTORY: `${API_BASE_URL}/inventory`,
  INVENTORY_BY_PRODUCT: (productId) => `${API_BASE_URL}/inventory/product/${productId}`,
  
  // Size management
  SIZES: `${API_BASE_URL}/sizes`,
  
  // Image management
  IMAGES: `${API_BASE_URL}/images`,
  IMAGES_BY_PRODUCT: (productId) => `${API_BASE_URL}/images/product/${productId}`,
  
  // Payment management
  PAYMENTS: `${API_BASE_URL}/payments`,
  
  // Cart management
  CARTS: `${API_BASE_URL}/carts`,
  CART_BY_USER: (userId) => `${API_BASE_URL}/carts/user/${userId}`,
  
  // Wishlist management
  WISHLISTS: `${API_BASE_URL}/wishlists`,
  WISHLIST_BY_USER: (userId) => `${API_BASE_URL}/wishlists/user/${userId}`,
};

// Navigation structure for admin sidebar or navbar
export const AdminNavigation = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    path: AdminRoutes.DASHBOARD,
    icon: '📊'
  },
  {
    id: 'catalog',
    title: 'Catalog',
    children: [
      {
        id: 'products',
        title: 'Products',
        path: AdminRoutes.PRODUCTS_GENERIC,
        icon: '📦'
      },
      {
        id: 'categories',
        title: 'Categories',
        path: AdminRoutes.CATEGORIES_GENERIC,
        icon: '🗂️'
      },
      {
        id: 'images',
        title: 'Images',
        path: AdminRoutes.IMAGES_GENERIC,
        icon: '🖼️'
      }
    ]
  },
  {
    id: 'sales',
    title: 'Sales',
    children: [
      {
        id: 'orders',
        title: 'Orders',
        path: AdminRoutes.ORDERS_GENERIC,
        icon: '🛒'
      },
      {
        id: 'payments',
        title: 'Payments',
        path: AdminRoutes.PAYMENTS_GENERIC,
        icon: '💰'
      }
    ]
  },
  {
    id: 'customers',
    title: 'Customers',
    children: [
      {
        id: 'users',
        title: 'Users',
        path: AdminRoutes.USERS_GENERIC,
        icon: '👥'
      },
      {
        id: 'addresses',
        title: 'Addresses',
        path: AdminRoutes.ADDRESSES,
        icon: '📍'
      },
      {
        id: 'cart',
        title: 'Cart',
        path: AdminRoutes.CART_GENERIC,
        icon: '🛒'
      },
      {
        id: 'wishlist',
        title: 'Wishlist',
        path: AdminRoutes.WISHLIST_GENERIC,
        icon: '❤️'
      }
    ]
  },
  {
    id: 'inventory',
    title: 'Inventory',
    path: AdminRoutes.INVENTORY,
    icon: '📦'
  },
  {
    id: 'configuration',
    title: 'Configuration',
    children: [
      {
        id: 'sizes',
        title: 'Sizes',
        path: AdminRoutes.SIZES,
        icon: '📏'
      }
    ]
  }
];

// Export the admin routes configuration
export default {
  routes: AdminRoutes,
  apiEndpoints: AdminApiEndpoints,
  navigation: AdminNavigation
};