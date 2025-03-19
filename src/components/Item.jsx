import React from "react";
import "../styles/Item.css";
import "../styles/image-modal.css";
import ImageRoller from "../hooks/ImageRoller";
import useImageModal from "../hooks/useImageModal";
import { Header } from "../scripts/Header";
import { Footer } from "../scripts/Footer";

function Item() {
    const {
        imagesRowRef
    } = ImageRoller();

    const {
        isOpen,
        imageSrc,
        modalRef,
        openModal,
        closeModal,
        zoomBox,
        zoomPosition,
        toggleZoomBox,
        updateZoomPosition
    } = useImageModal();

    const handleMouseMove = (e) => {
        if (!modalRef.current) return;
        const rect = modalRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
            updateZoomPosition(e);
        }
    };

    return (
        <div className="item">
            <Header />
            <main>
                <div className="product-item">
                    <div className="product-card">
                        <h1>Calvin Klein 90's faded jeans</h1>

                        <div className="images-row" ref={imagesRowRef}>
                            {["image1.png", "image2.png", "image3.png", "image4.png", "image5.png"].map((img, index) => (
                                <div className={`card-sizing ${index === 0 ? "active" : "inactive"}`} key={index}>
                                    <img
                                        src={`images/${img}`}
                                        alt="Calvin Klein Jeans"
                                        className="thumbnail"
                                        onClick={() => openModal(`images/${img}`)}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Модальное окно */}
                        {isOpen && (
                            <div className="image-modal-overlay" onClick={closeModal}>
                                <div className="image-modal-content" ref={modalRef} onClick={(e) => e.stopPropagation()}>
                                    <span className="close" onClick={closeModal}>&times;</span>
                                    <img
                                        src={imageSrc}
                                        alt="Full Size"
                                        onClick={toggleZoomBox}
                                        onMouseMove={handleMouseMove}
                                    />
                                    {zoomBox && (
                                        <div
                                            className="zoom-box"
                                            style={{
                                                width: "50%",
                                                height: "50vh",
                                                position: "absolute",
                                                top: `${Math.min(Math.max(zoomPosition.y - 100, 0), modalRef.current.clientHeight - 100)}px`,
                                                left: `${Math.min(Math.max(zoomPosition.x - 100, 0), modalRef.current.clientWidth - 100)}px`,
                                                backgroundImage: `url(${imageSrc})`,
                                                backgroundSize: "200%",
                                                backgroundPosition: `${-zoomPosition.x * 2}px ${-zoomPosition.y * 2}px`,
                                                pointerEvents: "none"
                                            }}
                                        ></div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="price-wishlist-container">
                            <div className="cost">$122</div>
                            <button className="wishlist-button">♥</button>
                        </div>

                        <div className="details-container">
                            <div className="details-left">
                                <div className="product-details">
                                    <h3>Product details</h3>
                                    <p>Italian waterproof fabric</p>
                                    <p>Elastic waist</p>
                                    <p>Functional pockets</p>
                                    <p>Wide legs</p>
                                </div>
                            </div>
                            <div className="details-right">
                                <div className="measurements-container">
                                    <h3>Measurements</h3>
                                    <p>Model: height 186.5 cm / 6'1"</p>
                                    <p>Wearing size: M</p>
                                </div>
                            </div>
                        </div>

                        <div className="purchase-container">
                            <div className="size-buttons">
                                <button className="size-button">S</button>
                                <button className="size-button">M</button>
                                <button className="size-button">L</button>
                            </div>
                            <button className="add-to-bag">Add to bag</button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default Item;
