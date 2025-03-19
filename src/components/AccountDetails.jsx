import React from "react";
import "../styles/AccountDetails.css";
import { Header } from "../scripts/Header";
import { Footer } from "../scripts/Footer";
import { useEditDataField } from "../hooks/useEditDataField";

const AccountDetails = () => {
    const { isEditMode, details, toggleEditMode, handleChange } = useEditDataField({
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        deliveryFirstName: "John",
        deliveryLastName: "Doe",
        country: "USA",
        city: "New York",
        province: "",
        postalCode: "10001"
    });

    return (
        <div className="account-details">
            <Header />
            <div className="layout-container">
                <main>
                    <section className="account-section">
                        <div className="title-container">
                            <h2>My Details</h2>
                            <button onClick={toggleEditMode} aria-label="Edit account details">
                                {isEditMode ? "Save" : "Edit"}
                            </button>
                        </div>
                        <div className="field">
                            <label>First Name</label>
                            <p
                                className={`editable ${isEditMode ? "editing" : ""}`}
                                contentEditable={isEditMode}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => handleChange(e, "firstName")}
                            >
                                {details.firstName}
                            </p>
                        </div>
                        <div className="field">
                            <label>Last Name</label>
                            <p
                                className={`editable ${isEditMode ? "editing" : ""}`}
                                contentEditable={isEditMode}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => handleChange(e, "lastName")}
                            >
                                {details.lastName}
                            </p>
                        </div>
                        <div className="field">
                            <label>Email</label>
                            <p
                                className={`editable ${isEditMode ? "editing" : ""}`}
                                contentEditable={isEditMode}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => handleChange(e, "email")}
                            >
                                {details.email}
                            </p>
                        </div>
                    </section>

                    <section className="account-section">
                        <h2>Delivery Details</h2>
                        <div className="field">
                            <label>First Name</label>
                            <p
                                className={`editable ${isEditMode ? "editing" : ""}`}
                                contentEditable={isEditMode}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => handleChange(e, "deliveryFirstName")}
                            >
                                {details.deliveryFirstName}
                            </p>
                        </div>
                        <div className="field">
                            <label>Last Name</label>
                            <p
                                className={`editable ${isEditMode ? "editing" : ""}`}
                                contentEditable={isEditMode}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => handleChange(e, "deliveryLastName")}
                            >
                                {details.deliveryLastName}
                            </p>
                        </div>
                        <div className="field">
                            <label>Country</label>
                            <p
                                className={`editable ${isEditMode ? "editing" : ""}`}
                                contentEditable={isEditMode}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => handleChange(e, "country")}
                            >
                                {details.country}
                            </p>
                        </div>
                        <div className="field">
                            <label>City</label>
                            <p
                                className={`editable ${isEditMode ? "editing" : ""}`}
                                contentEditable={isEditMode}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => handleChange(e, "city")}
                            >
                                {details.city}
                            </p>
                        </div>
                        <div className="field">
                            <label>Province (optional)</label>
                            <p
                                className={`editable ${isEditMode ? "editing" : ""}`}
                                contentEditable={isEditMode}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => handleChange(e, "province")}
                            >
                                {details.province}
                            </p>
                        </div>
                        <div className="field">
                            <label>Postal Code</label>
                            <p
                                className={`editable ${isEditMode ? "editing" : ""}`}
                                contentEditable={isEditMode}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => handleChange(e, "postalCode")}
                            >
                                {details.postalCode}
                            </p>
                        </div>
                    </section>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default AccountDetails;