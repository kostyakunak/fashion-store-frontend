import React from "react";
import "../styles/Contacts.css";

function Contacts() {
    return (
        <div className="contacts-page">
            <div className="contacts">
                <div className="content">
                    <p>E-MAIL: info@kounak.com</p>
                    <p>
                        <a href="https://instagram.com/kounak" target="_blank" rel="noopener noreferrer">
                            <img src="/images/instagram.png" alt="Instagram" />
                        </a>
                        INSTAGRAM: @kounak
                    </p>
                    <p>
                        <a href="https://tiktok.com/@kounak" target="_blank" rel="noopener noreferrer">
                            <img src="/images/tiktok.png" alt="TikTok" />
                        </a>
                        TIKTOK: @kounak
                    </p>
                </div>
                <div className="image-container">
                    <img 
                        src="/images/gufram-lady.jpg" 
                        alt="Kounak Contact"
                    />
                </div>
            </div>
        </div>
    );
}

export default Contacts;