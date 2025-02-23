import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
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

function App() {
  return (
      <Router>
        <div className="App">
          {/* Навигация теперь будет доступна на всех страницах */}


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
          </Routes>


        </div>
      </Router>

  );
}

export default App;