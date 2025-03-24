import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Account from "./components/Account";
import OrderDetails from "./components/OrderDetails";
import Home from "./components/Home";
import Catalog from "./components/Catalog";
import Contacts from "./components/Contacts";
import MyOrders from "./components/MyOrders";
import Wishlist from "./components/Wishlist";
import Item from "./components/Item";
import Cart from "./components/Cart";
import AccountDetails from "./components/AccountDetails";
import AdminProducts from "./pages/admin/AdminProducts"; // ✅ Добавили

function App() {
  return (
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/account" element={<Account />} />
            <Route path="/order-details" element={<OrderDetails />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/item" element={<Item />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/account-details" element={<AccountDetails />} />
            <Route path="/admin/products" element={<AdminProducts />} /> {/* ✅ Новый маршрут */}
          </Routes>
        </div>
      </Router>
  );
}

export default App;