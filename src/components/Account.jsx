import React from "react";

import "../styles/Account.css";
import { Header } from "../scripts/Header";

function Account() {


    return (
        <div className="account">
            <Header />
        <main>

            <div className="navigation">

                <a href="/cart" className="nav-button">Мій кошик</a>
                <a href="/wishlist" className="nav-button">Мій список бажань</a>
                <a href="/my-orders" className="nav-button">Мої замовлення</a>
                <a href="/account/details" className="nav-button">Деталі акаунта</a>
            </div>

        </main>
        </div>
    );
}

export default Account;