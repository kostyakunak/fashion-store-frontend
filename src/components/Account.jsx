import React from "react";

import "../styles/Account.css";
import { Header } from "../scripts/Header";
import { Footer } from "../scripts/Footer";

function Account() {


    return (
        <div className="account">
            <Header />
        <main>

            <div className="navigation">

                <a href="/cart" className="nav-button">Мій кошик</a>
                <a href="/my-orders" className="nav-button">Мої замовлення</a>
                <a href="/account/details" className="nav-button">Деталі акаунта</a>
                <a href="/contacts" className="nav-button">Контакти</a>
            </div>

        </main>
            <Footer />
        </div>
    );
}

export default Account;