import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
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

function App() {
    return (
        <Router>
            <div className="App">
                <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/catalog" element={<Catalog />} />
                    <Route path="/contacts" element={<Contacts />} />
                    <Route path="/my-orders" element={<MyOrders />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/item" element={<Item />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/account-details" element={<AccountDetails />} />
                    <Route path="/order-details" element={<OrderDetails />} />
                    <Route path="/admin" element={<AdminPanel />} />
                    <Route path="/admin/add-product-page" element={<AdminProducts />} />
                    <Route path="/admin/add-order-page" element={<AdminOrders />} />
                    <Route path="/admin/add-user-page" element={<AdminUsers />} />
                    <Route path="/admin/specific-tables" element={<AdminSpecificTables />} />
                    <Route path="/admin/prices-management" element={<PricesManagement />} />
                    <Route path="/admin/inventory-management" element={<InventoryManagement />} />
                    <Route path="/admin/orders-management" element={<OrdersManagement />} />
                    <Route path="/admin/order-details" element={<AdminOrderDetails />} />
                    <Route path="/admin/addresses" element={<AdminAddresses />} />
                    <Route path="/admin/users-generic" element={<AdminUsersGeneric />} />
                    <Route path="/admin/products-generic" element={<AdminProductsGeneric />} />
                    <Route path="/admin/cart-generic" element={<AdminCartGeneric />} />
                    <Route path="/admin/wishlist-generic" element={<AdminWishlistGeneric />} />
                    <Route path="/admin/categories" element={<AdminCategoriesGeneric />} />
                    <Route path="/admin/sizes" element={<AdminSizesGeneric />} />
                    <Route path="/admin/payments" element={<AdminPaymentsGeneric />} />
                    <Route path="/admin/images" element={<AdminImagesGeneric />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;