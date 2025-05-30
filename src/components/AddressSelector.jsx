import React, { useEffect, useState } from "react";
import { getAddressesByUser, createAddress } from "../api/addressesApi";

const AddressSelector = ({ userId, selectedAddressId, onSelect, allowCreate = true }) => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ city: '', street: '', house: '', apartment: '', is_main: false });
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
            const newAddr = await createAddress({ ...form, userId });
            setAddresses(prev => [...prev, newAddr]);
            setShowForm(false);
            setForm({ city: '', street: '', house: '', apartment: '', is_main: false });
            onSelect(newAddr.id);
        } catch (e) {
            setError(e.message || "Помилка створення адреси");
        } finally {
            setCreating(false);
        }
    };

    if (loading) return <p style={{ opacity: 0.7 }}>Завантаження адрес...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            {addresses.length === 0 && !showForm && allowCreate && (
                <button className="checkout-btn" onClick={() => setShowForm(true)}>Додати адресу</button>
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
                <form onSubmit={handleCreate} style={{ marginTop: 8 }}>
                    <input name="city" placeholder="Місто" value={form.city} onChange={handleFormChange} required style={{ marginRight: 8 }} />
                    <input name="street" placeholder="Вулиця" value={form.street} onChange={handleFormChange} required style={{ marginRight: 8 }} />
                    <input name="house" placeholder="Будинок" value={form.house} onChange={handleFormChange} required style={{ marginRight: 8 }} />
                    <input name="apartment" placeholder="Квартира" value={form.apartment} onChange={handleFormChange} style={{ marginRight: 8 }} />
                    <label style={{ marginRight: 8 }}>
                        <input type="checkbox" name="is_main" checked={form.is_main} onChange={handleFormChange} /> Зробити основною
                    </label>
                    <button type="submit" className="checkout-btn" disabled={creating}>Зберегти</button>
                    <button type="button" className="checkout-btn" style={{ marginLeft: 8 }} onClick={() => setShowForm(false)}>Скасувати</button>
                </form>
            )}
        </div>
    );
};

export default AddressSelector; 