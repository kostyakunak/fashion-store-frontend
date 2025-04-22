import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import PageWrapper from "./components/PageWrapper";

import Home from "./components/Home";
import Catalog from "./components/Catalog";
import Contacts from "./components/Contacts";
import MyOrders from "./components/MyOrders";
import Wishlist from "./components/Wishlist";
import Item from "./components/Item";
import Cart from "./components/Cart";
import Account from "./components/Account";
import AccountDetails from "./components/AccountDetails";
import OrderDetails from "./components/OrderDetails";
import AdminPanel from "./pages/admin/AdminPanel";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSpecificTables from "./pages/admin/AdminSpecificTables";
import PricesManagement from "./pages/admin/PricesManagement";
import InventoryManagement from "./pages/admin/InventoryManagement";
import OrdersManagement from "./pages/admin/OrdersManagement";
import AdminOrderDetails from './pages/admin/AdminOrderDetails';
import AdminAddresses from './pages/admin/AdminAddresses';
import AdminUsersGeneric from './pages/admin/AdminUsersGeneric';
import AdminProductsGeneric from './pages/admin/AdminProductsGeneric';
import AdminCartGeneric from './pages/admin/AdminCartGeneric';
import AdminWishlistGeneric from './pages/admin/AdminWishlistGeneric';
import AdminCategoriesGeneric from './pages/admin/AdminCategoriesGeneric';
import AdminSizesGeneric from './pages/admin/AdminSizesGeneric';
import AdminPaymentsGeneric from './pages/admin/AdminPaymentsGeneric';
import AdminImagesGeneric from './pages/admin/AdminImagesGeneric';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <Routes>
                        {/* Публичные маршруты */}
                        <Route path="/" element={<Home />} />
                        <Route path="/catalog" element={<PageWrapper><Catalog /></PageWrapper>} />
                        <Route path="/contacts" element={<PageWrapper><Contacts /></PageWrapper>} />
                        <Route path="/item" element={<PageWrapper><Item /></PageWrapper>} />
                        <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
                        <Route path="/register" element={<PageWrapper><RegisterPage /></PageWrapper>} />
                        
                        {/* Защищенные маршруты */}
                        <Route path="/account" element={<PrivateRoute><PageWrapper><Account /></PageWrapper></PrivateRoute>} />
                        <Route path="/account/details" element={<PrivateRoute><PageWrapper><AccountDetails /></PageWrapper></PrivateRoute>} />
                        <Route path="/orders" element={<PrivateRoute><PageWrapper><MyOrders /></PageWrapper></PrivateRoute>} />
                        <Route path="/wishlist" element={<PrivateRoute><PageWrapper><Wishlist /></PageWrapper></PrivateRoute>} />
                        <Route path="/cart" element={<PrivateRoute><PageWrapper><Cart /></PageWrapper></PrivateRoute>} />
                        <Route path="/order/:id" element={<PrivateRoute><PageWrapper><OrderDetails /></PageWrapper></PrivateRoute>} />
                        
                        {/* Админ маршруты */}
                        <Route path="/admin" element={<PrivateRoute><PageWrapper><AdminPanel /></PageWrapper></PrivateRoute>} />
                        <Route path="/admin/products" element={<PrivateRoute><PageWrapper><AdminProducts /></PageWrapper></PrivateRoute>} />
                        <Route path="/admin/orders" element={<PrivateRoute><PageWrapper><AdminOrders /></PageWrapper></PrivateRoute>} />
                        <Route path="/admin/users" element={<PrivateRoute><PageWrapper><AdminUsers /></PageWrapper></PrivateRoute>} />
                        <Route path="/admin/specific-tables" element={<PrivateRoute><PageWrapper><AdminSpecificTables /></PageWrapper></PrivateRoute>} />
                        <Route path="/admin/prices" element={<PrivateRoute><PageWrapper><PricesManagement /></PageWrapper></PrivateRoute>} />
                        <Route path="/admin/inventory" element={<PrivateRoute><PageWrapper><InventoryManagement /></PageWrapper></PrivateRoute>} />
                        <Route path="/admin/orders-management" element={<PrivateRoute><PageWrapper><OrdersManagement /></PageWrapper></PrivateRoute>} />
                        <Route path="/admin/order/:id" element={<PrivateRoute><PageWrapper><AdminOrderDetails /></PageWrapper></PrivateRoute>} />
                        <Route path="/admin/addresses" element={<PrivateRoute><PageWrapper><AdminAddresses /></PageWrapper></PrivateRoute>} />
                        <Route path="/admin/users-generic" element={<PrivateRoute><PageWrapper><AdminUsersGeneric /></PageWrapper></PrivateRoute>} />
                        <Route path="/admin/products-generic" element={<PrivateRoute><PageWrapper><AdminProductsGeneric /></PageWrapper></PrivateRoute>} />
                        <Route path="/admin/cart-generic" element={<PrivateRoute><PageWrapper><AdminCartGeneric /></PageWrapper></PrivateRoute>} />
                        <Route path="/admin/wishlist-generic" element={<PrivateRoute><PageWrapper><AdminWishlistGeneric /></PageWrapper></PrivateRoute>} />
                        <Route path="/admin/categories-generic" element={<PrivateRoute><PageWrapper><AdminCategoriesGeneric /></PageWrapper></PrivateRoute>} />
                        <Route path="/admin/sizes-generic" element={<PrivateRoute><PageWrapper><AdminSizesGeneric /></PageWrapper></PrivateRoute>} />
                        <Route path="/admin/payments-generic" element={<PrivateRoute><PageWrapper><AdminPaymentsGeneric /></PageWrapper></PrivateRoute>} />
                        <Route path="/admin/images-generic" element={<PrivateRoute><PageWrapper><AdminImagesGeneric /></PageWrapper></PrivateRoute>} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;