import React, { useState } from "react";

import "../styles/Account.css";
import { Header } from "../scripts/Header";
import { Footer } from "../scripts/Footer";

function Account() {


    return (
        <div className="account">
            <Header />
        <main>

            <div className="navigation">

                <a href="/cart" className="nav-button">My Cart</a>
                <a href="/my-orders" className="nav-button">My Orders</a>
                <a href="/account/details" className="nav-button">Account Details</a>
                <a href="/contacts" className="nav-button">Contacts</a>
            </div>

        </main>
            <Footer />
        </div>
    );
}

export default Account;