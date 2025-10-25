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
import AdminDebugger from './pages/admin/AdminDebugger';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import AdminOrdersGeneric from './pages/admin/AdminOrdersGeneric';
import Checkout from "./components/Checkout";
import AuthTest from './pages/AuthTest';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <Routes>
                        {/* Публічні маршрути */}
                        <Route path="/" element={<Home />} />
                        <Route path="/catalog" element={<PageWrapper><Catalog /></PageWrapper>} />
                        <Route path="/contacts" element={<PageWrapper><Contacts /></PageWrapper>} />
                        <Route path="/item" element={<PageWrapper><Item /></PageWrapper>} />
                        <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
                        <Route path="/register" element={<PageWrapper><RegisterPage /></PageWrapper>} />
                        <Route path="/auth-test" element={<PageWrapper><AuthTest /></PageWrapper>} />
                        
                        {/* Захищені маршрути користувача */}
                        <Route path="/account" element={<PrivateRoute><PageWrapper><Account /></PageWrapper></PrivateRoute>} />
                        <Route path="/account/details" element={<PrivateRoute><PageWrapper><AccountDetails /></PageWrapper></PrivateRoute>} />
                        <Route path="/orders" element={<PrivateRoute><PageWrapper><MyOrders /></PageWrapper></PrivateRoute>} />
                        <Route path="/my-orders" element={<PrivateRoute><PageWrapper><MyOrders /></PageWrapper></PrivateRoute>} />
                        <Route path="/wishlist" element={<PrivateRoute><PageWrapper><Wishlist /></PageWrapper></PrivateRoute>} />
                        <Route path="/cart" element={<PrivateRoute><PageWrapper><Cart /></PageWrapper></PrivateRoute>} />
                        <Route path="/orders/:orderId" element={<PrivateRoute><PageWrapper><OrderDetails /></PageWrapper></PrivateRoute>} />
                        <Route path="/checkout" element={<PrivateRoute><PageWrapper><Checkout /></PageWrapper></PrivateRoute>} />
                        
                        {/* Адмін-маршрути з перевіркою ролі ADMIN */}
                        <Route path="/admin" element={<PrivateRoute requireAdmin={true}><PageWrapper><AdminPanel /></PageWrapper></PrivateRoute>} />
                        <Route path="/admin/products" element={<PrivateRoute requireAdmin={true}><PageWrapper><AdminProducts /></PageWrapper></PrivateRoute>} />
                        <Route path="/admin/orders" element={<PrivateRoute requireAdmin={true}><PageWrapper><AdminOrders /></PageWrapper></PrivateRoute>} />
                        <Route path="/admin/users" element={<PrivateRoute requireAdmin={true}><PageWrapper><AdminUsers /></PageWrapper></PrivateRoute>} />
                        <Route path="/admin/specific-tables" element={<PrivateRoute requireAdmin={true}><PageWrapper><AdminSpecificTables /></PageWrapper></PrivateRoute>} />
                        <Route path="/admin/prices" element={<PrivateRoute requireAdmin={true}><PageWrapper><PricesManagement /></PageWrapper></PrivateRoute>} />
                        <Route path="/admin/inventory" element={<PrivateRoute requireAdmin={true}><PageWrapper><InventoryManagement /></PageWrapper></PrivateRoute>} />
                        <Route path="/admin/orders-management" element={<PrivateRoute requireAdmin={true}><PageWrapper><OrdersManagement /></PageWrapper></PrivateRoute>} />
                        <Route path="/admin/order/:id" element={<PrivateRoute requireAdmin={true}><PageWrapper><AdminOrderDetails /></PageWrapper></PrivateRoute>} />
                        <Route path="/admin/addresses" element={<PrivateRoute requireAdmin={true}><PageWrapper><AdminAddresses /></PageWrapper></PrivateRoute>} />
                        <Route path="/admin/users-generic" element={<PrivateRoute requireAdmin={true}><PageWrapper><AdminUsersGeneric /></PageWrapper></PrivateRoute>} />
                        <Route path="/admin/products-generic" element={<PrivateRoute requireAdmin={true}><PageWrapper><AdminProductsGeneric /></PageWrapper></PrivateRoute>} />
                        <Route path="/admin/cart-generic" element={<PrivateRoute requireAdmin={true}><PageWrapper><AdminCartGeneric /></PageWrapper></PrivateRoute>} />
                        <Route path="/admin/wishlist-generic" element={<PrivateRoute requireAdmin={true}><PageWrapper><AdminWishlistGeneric /></PageWrapper></PrivateRoute>} />
                        <Route path="/admin/categories-generic" element={<PrivateRoute requireAdmin={true}><PageWrapper><AdminCategoriesGeneric /></PageWrapper></PrivateRoute>} />
                        <Route path="/admin/sizes-generic" element={<PrivateRoute requireAdmin={true}><PageWrapper><AdminSizesGeneric /></PageWrapper></PrivateRoute>} />
                        <Route path="/admin/payments-generic" element={<PrivateRoute requireAdmin={true}><PageWrapper><AdminPaymentsGeneric /></PageWrapper></PrivateRoute>} />
                        <Route path="/admin/images-generic" element={<PrivateRoute requireAdmin={true}><PageWrapper><AdminImagesGeneric /></PageWrapper></PrivateRoute>} />
                        <Route path="/admin/debug" element={<PrivateRoute requireAdmin={true}><PageWrapper><AdminDebugger /></PageWrapper></PrivateRoute>} />
                        <Route path="/admin/orders-generic" element={<PrivateRoute requireAdmin={true}><PageWrapper><AdminOrdersGeneric /></PageWrapper></PrivateRoute>} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;