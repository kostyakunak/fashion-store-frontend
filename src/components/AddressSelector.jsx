import React, { useEffect, useState } from "react";
import { getAddressesByUser, createAddress } from "../api/addressesApi";

const AddressSelector = ({ userId, selectedAddressId, onSelect, allowCreate = true }) => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ 
        recipientFirstName: '', 
        recipientLastName: '', 
        city: '', 
        street: '', 
        postalCode: '', 
        country: 'Ukraine', 
        is_main: false 
    });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        console.log('AddressSelector userId:', userId, 'selectedAddressId:', selectedAddressId);
        if (!userId) {
            setAddresses([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        getAddressesByUser(userId)
            .then(data => {
                setAddresses(data);
                setLoading(false);
                // Обираємо основну адресу тільки якщо selectedAddressId не заданий або не співпадає
                if ((!selectedAddressId || !data.some(addr => addr.id === selectedAddressId)) && data.length > 0) {
                    const main = data.find(addr => addr.is_main);
                    const newId = main ? main.id : data[0].id;
                    if (selectedAddressId !== newId) {
                        onSelect(newId);
                    }
                }
            })
            .catch(e => {
                setError(e.message || "Помилка завантаження адрес");
                setLoading(false);
            });
    }, [userId]);

    const handleSelect = (id) => {
        onSelect(id);
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        setError(null);
        try {
            // Формируем правильный формат данных для API
            const addressData = {
                recipientFirstName: form.recipientFirstName,
                recipientLastName: form.recipientLastName,
                city: form.city,
                street: form.street,
                postalCode: form.postalCode,
                country: form.country,
                isMain: form.is_main,
                user: {
                    id: userId  // API ожидает объект user с полем id
                }
            };
            const newAddr = await createAddress(addressData);
            setAddresses(prev => [...prev, newAddr]);
            setShowForm(false);
            setForm({ recipientFirstName: '', recipientLastName: '', city: '', street: '', postalCode: '', country: 'Ukraine', is_main: false });
            onSelect(newAddr.id);
        } catch (e) {
            setError(e.message || "Помилка створення адреси");
        } finally {
            setCreating(false);
        }
    };

    if (loading) return (
        <div style={{ padding: 12, textAlign: 'center' }}>
            <p style={{ opacity: 0.7 }}>Завантаження адрес...</p>
        </div>
    );
    
    if (error) return (
        <p style={{ color: '#ff5a5f', marginBottom: 12 }}>{error}</p>
    );

    return (
        <div>
            {addresses.length === 0 && !showForm && allowCreate && (
                <div style={{ marginBottom: 12 }}>
                    <p style={{ marginBottom: 12, opacity: 0.7, fontSize: 14 }}>Виберіть або додайте адресу доставки</p>
                    <button className="checkout-btn" onClick={() => setShowForm(true)}>
                        Додати адресу
                    </button>
                </div>
            )}
            {addresses.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                    {addresses.map(addr => (
                        <label key={addr.id} style={{ display: 'block', marginBottom: 8, cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="address"
                                value={addr.id}
                                checked={selectedAddressId === addr.id}
                                onChange={() => handleSelect(addr.id)}
                                style={{ marginRight: 8 }}
                            />
                            {addr.city}, {addr.street} {addr.house} {addr.apartment ? (", кв. " + addr.apartment) : ""}
                            {addr.is_main && <span style={{ color: '#4caf50', marginLeft: 8 }}>(основна)</span>}
                        </label>
                    ))}
                    {allowCreate && <button className="checkout-btn" onClick={() => setShowForm(true)}>Додати адресу</button>}
                </div>
            )}
            {showForm && allowCreate && (
                <form onSubmit={handleCreate} style={{ marginTop: 12 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <input name="recipientFirstName" placeholder="Ім'я отримувача" value={form.recipientFirstName} onChange={handleFormChange} required />
                        <input name="recipientLastName" placeholder="Прізвище отримувача" value={form.recipientLastName} onChange={handleFormChange} required />
                        <input name="city" placeholder="Місто" value={form.city} onChange={handleFormChange} required />
                        <input name="street" placeholder="Вулиця, будинок" value={form.street} onChange={handleFormChange} required />
                        <input name="postalCode" placeholder="Поштовий індекс" value={form.postalCode} onChange={handleFormChange} required />
                        <input name="country" placeholder="Країна" value={form.country} onChange={handleFormChange} required />
                        <label>
                            <input type="checkbox" name="is_main" checked={form.is_main} onChange={handleFormChange} /> Зробити основною адресою
                        </label>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button type="submit" className="checkout-btn" disabled={creating} style={{ flex: 1 }}>Зберегти</button>
                            <button type="button" className="checkout-btn" onClick={() => setShowForm(false)} style={{ flex: 1 }}>Скасувати</button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
};

export default AddressSelector; 