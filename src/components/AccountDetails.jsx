import React, { useContext, useEffect, useState } from "react";
import "../styles/AccountDetails.css";
import { Header } from "../scripts/Header";
import { Footer } from "../scripts/Footer";
import { AuthContext } from "../context/AuthContext";
import { getAddressesByUser, updateAddress, createAddress, deleteAddress } from "../api/addressesApi";

const AccountDetails = () => {
    const auth = useContext(AuthContext);
    const user = auth?.user;
    const userId = user?.id;
    const [addresses, setAddresses] = useState([]);
    const [currentAddressIndex, setCurrentAddressIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState('view'); // view | edit | add | selectMain
    const [details, setDetails] = useState({
        firstName: "",
        lastName: "",
        email: "",
        deliveryFirstName: "",
        deliveryLastName: "",
        country: "",
        city: "",
        street: "",
        postalCode: ""
    });
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [mainAddressIndex, setMainAddressIndex] = useState(null);

    // Загружаем все адреса пользователя
    useEffect(() => {
        if (userId) {
            getAddressesByUser(userId)
                .then((addresses) => {
                    // Сортируем: основной адрес — первый
                    const sorted = addresses.slice().sort((a, b) => (b.isMain ? 1 : 0) - (a.isMain ? 1 : 0));
                    setAddresses(sorted);
                    // currentAddressIndex всегда 0 (основной)
                    setCurrentAddressIndex(0);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [userId]);

    // Обновляем details при смене адреса или пользователя
    useEffect(() => {
        const addr = addresses[currentAddressIndex] || {};
        setDetails({
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            email: user?.email || "",
            deliveryFirstName: addr.recipientFirstName || "",
            deliveryLastName: addr.recipientLastName || "",
            country: addr.country || "",
            city: addr.city || "",
            street: addr.street || "",
            postalCode: addr.postalCode || ""
        });
    }, [user, addresses, currentAddressIndex]);

    // useEffect: при входе в edit/add/selectMain выставлять mainAddressIndex
    useEffect(() => {
        if ((mode === 'edit' || mode === 'add' || mode === 'selectMain') && addresses.length > 0) {
            const idx = addresses.findIndex(a => a.isMain);
            setMainAddressIndex(idx >= 0 ? idx : 0);
        }
    }, [mode, addresses]);

    const handleChange = (e, field) => {
        setDetails({ ...details, [field]: e.target.innerText });
    };

    // Переключение адреса (стрелки)
    const handlePrevAddress = () => {
        if (addresses.length < 2) return;
        setCurrentAddressIndex((prev) => {
            const newIdx = (prev - 1 + addresses.length) % addresses.length;
            return newIdx;
        });
    };
    const handleNextAddress = () => {
        if (addresses.length < 2) return;
        setCurrentAddressIndex((prev) => {
            const newIdx = (prev + 1) % addresses.length;
            return newIdx;
        });
    };

    // Добавление нового адреса
    const handleAddAddress = () => {
        setMode('add');
        setDetails({
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            email: user?.email || "",
            deliveryFirstName: "",
            deliveryLastName: "",
            country: "",
            city: "",
            street: "",
            postalCode: ""
        });
    };
    const isAddressFieldsValid = () => {
        return details.deliveryFirstName && details.deliveryLastName && details.country && details.city && details.street && details.postalCode;
    };
    const handleSaveEditAddress = async () => {
        if (!isAddressFieldsValid()) return;
        setSaving(true);
        setSaveError(null);
        try {
            const addr = addresses[currentAddressIndex];
            const updated = await updateAddress(addr.id, {
                ...addr,
                recipientFirstName: details.deliveryFirstName,
                recipientLastName: details.deliveryLastName,
                country: details.country,
                city: details.city,
                street: details.street,
                postalCode: details.postalCode,
                user: { id: userId }
            });
            const updatedAddresses = addresses.slice();
            updatedAddresses[currentAddressIndex] = updated;
            setAddresses(updatedAddresses);
            setMode('view');
        } catch (err) {
            setSaveError("Ошибка при сохранении изменений адреса");
        } finally {
            setSaving(false);
        }
    };

    // Удаление адреса
    const handleDeleteAddress = async () => {
        if (addresses.length <= 1) return; // нельзя удалить последний адрес
        if (!window.confirm("Удалить этот адрес?")) return;
        setSaving(true);
        setSaveError(null);
        try {
            const addr = addresses[currentAddressIndex];
            const wasMain = addr.isMain;
            await deleteAddress(addr.id);
            let updated = addresses.filter((_, idx) => idx !== currentAddressIndex);
            if (wasMain && updated.length > 0) {
                await updateAddress(updated[0].id, { ...updated[0], isMain: true, user: { id: userId } });
            }
            const fresh = await getAddressesByUser(userId);
            setAddresses(fresh);
            setCurrentAddressIndex(0);
            setMode('view');
        } catch (err) {
            if (err.message && err.message.includes('foreign key constraint fails')) {
                setSaveError('Этот адрес нельзя удалить, так как он используется в одном или нескольких заказах.');
            } else {
                setSaveError('Ошибка при удалении адреса');
            }
        } finally {
            setSaving(false);
        }
    };

    // Режим выбора адреса по умолчанию
    const handleSelectMainMode = () => {
        setMode('selectMain');
    };
    const handleSetMain = async () => {
        setSaving(true);
        setSaveError(null);
        try {
            // Сначала снимаем isMain со всех адресов
            await Promise.all(addresses.map(addr =>
                addr.id === addresses[currentAddressIndex].id
                    ? updateAddress(addr.id, { ...addr, isMain: true, user: { id: userId } })
                    : updateAddress(addr.id, { ...addr, isMain: false, user: { id: userId } })
            ));
            // Перезагружаем адреса
            const updated = await getAddressesByUser(userId);
            setAddresses(updated);
            const mainIdx = updated.findIndex(a => a.isMain);
            setCurrentAddressIndex(mainIdx >= 0 ? mainIdx : 0);
            setMode('view');
        } catch (err) {
            setSaveError("Ошибка при установке адреса по умолчанию");
        } finally {
            setSaving(false);
        }
    };

    // Сохранение изменений при редактировании адреса
    const handleSave = async () => {
        console.log('handleSave called', { mainAddressIndex, addresses });
        setSaveError(null);
        try {
            let updatedAddresses = [...addresses];
            if (mode === 'add') {
                const newAddress = {
                    recipientFirstName: details.deliveryFirstName,
                    recipientLastName: details.deliveryLastName,
                    country: details.country,
                    city: details.city,
                    street: details.street,
                    postalCode: details.postalCode,
                    user: { id: userId },
                    isMain: mainAddressIndex === addresses.length
                };
                await createAddress(newAddress);
            } else {
                for (let i = 0; i < updatedAddresses.length; i++) {
                    if (i === mainAddressIndex) {
                        console.log('Обновляем адрес как основной:', updatedAddresses[i].id, { ...updatedAddresses[i], isMain: true, user: { id: userId } });
                        await updateAddress(updatedAddresses[i].id, { ...updatedAddresses[i], isMain: true, user: { id: userId } });
                    } else if (updatedAddresses[i].isMain) {
                        console.log('Сбрасываем isMain у адреса:', updatedAddresses[i].id, { ...updatedAddresses[i], isMain: false, user: { id: userId } });
                        await updateAddress(updatedAddresses[i].id, { ...updatedAddresses[i], isMain: false, user: { id: userId } });
                    }
                }
            }
            const fresh = await getAddressesByUser(userId);
            setAddresses(fresh);
            const idx = fresh.findIndex(a => a.isMain);
            setMainAddressIndex(idx >= 0 ? idx : 0);
            setCurrentAddressIndex(idx >= 0 ? idx : 0);
            setMode('view');
        } catch (e) {
            setSaveError('Ошибка при сохранении адреса');
        }
    };

    if (loading) {
        return <div className="account-details"><Header /><div className="layout-container"><main><p>Загрузка...</p></main></div><Footer /></div>;
    }

    return (
        <div className="account-details">
            <Header />
            <div className="layout-container">
                <main>
                    <section className="account-section">
                        <h2 style={{marginBottom: '10px'}}>Account Details</h2>
                        <div className="title-container">
                            <h2>My Details</h2>
                        </div>
                        <div className="field">
                            <label>First Name</label>
                            <p
                                className="editable"
                                contentEditable={false}
                                suppressContentEditableWarning={true}
                            >
                                {details.firstName}
                            </p>
                        </div>
                        <div className="field">
                            <label>Last Name</label>
                            <p
                                className="editable"
                                contentEditable={false}
                                suppressContentEditableWarning={true}
                            >
                                {details.lastName}
                            </p>
                        </div>
                        <div className="field">
                            <label>Email</label>
                            <p
                                className="editable"
                                contentEditable={false}
                                suppressContentEditableWarning={true}
                            >
                                {details.email}
                            </p>
                        </div>
                    </section>

                    <section className="account-section">
                        <div className="delivery-title-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
                            <h2 style={{ textAlign: 'center', width: '100%', margin: 0 }}>Delivery Details</h2>
                        </div>
                        {/* Новый блок: если нет ни одного адреса */}
                        {addresses.length === 0 ? (
                          <div style={{ textAlign: 'center', margin: 24 }}>
                            <p>У вас нет ни одного адреса доставки.</p>
                            <button onClick={handleAddAddress}>Добавить адрес</button>
                          </div>
                        ) : (
                        // Контейнер стрелок и блока адреса
                        <>
                        <div className="address-arrows-container" style={{ marginBottom: 24 }}>
                            {(mode === 'edit' || mode === 'add' || mode === 'selectMain') && addresses.length > 1 && (
                                <button
                                    className="address-arrow-btn left"
                                    onClick={handlePrevAddress}
                                    aria-label="Предыдущий адрес"
                                    disabled={addresses.length <= 1}
                                    style={{ width: 40, minWidth: 40, textAlign: 'center', borderRadius: 0, background: '#2c394a' }}
                                >
                                    <span>&larr;</span>
                                </button>
                            )}
                            <div
                                className={`delivery-edit-block${mode === 'view' ? ' delivery-edit-hoverable' : ''}`}
                                onClick={() => mode === 'view' && setMode('edit')}
                                style={{ cursor: mode === 'view' ? 'pointer' : 'default', borderRadius: 8, transition: 'background 0.2s', marginBottom: 8, flex: 1 }}
                            >
                        <div className="field">
                            <label>First Name</label>
                            <p
                                        className={`editable ${(mode === 'edit' || mode === 'add') ? "editing" : ""}`}
                                        contentEditable={mode === 'edit' || mode === 'add'}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => handleChange(e, "deliveryFirstName")}
                            >
                                {details.deliveryFirstName}
                            </p>
                        </div>
                        <div className="field">
                            <label>Last Name</label>
                            <p
                                        className={`editable ${(mode === 'edit' || mode === 'add') ? "editing" : ""}`}
                                        contentEditable={mode === 'edit' || mode === 'add'}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => handleChange(e, "deliveryLastName")}
                            >
                                {details.deliveryLastName}
                            </p>
                        </div>
                        <div className="field">
                            <label>Country</label>
                            <p
                                        className={`editable ${(mode === 'edit' || mode === 'add') ? "editing" : ""}`}
                                        contentEditable={mode === 'edit' || mode === 'add'}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => handleChange(e, "country")}
                            >
                                {details.country}
                            </p>
                        </div>
                        <div className="field">
                            <label>City</label>
                            <p
                                        className={`editable ${(mode === 'edit' || mode === 'add') ? "editing" : ""}`}
                                        contentEditable={mode === 'edit' || mode === 'add'}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => handleChange(e, "city")}
                            >
                                {details.city}
                            </p>
                        </div>
                        <div className="field">
                                    <label>Street</label>
                            <p
                                        className={`editable ${(mode === 'edit' || mode === 'add') ? "editing" : ""}`}
                                        contentEditable={mode === 'edit' || mode === 'add'}
                                suppressContentEditableWarning={true}
                                        onBlur={(e) => handleChange(e, "street")}
                            >
                                        {details.street}
                            </p>
                        </div>
                        <div className="field">
                            <label>Postal Code</label>
                            <p
                                        className={`editable ${(mode === 'edit' || mode === 'add') ? "editing" : ""}`}
                                        contentEditable={mode === 'edit' || mode === 'add'}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => handleChange(e, "postalCode")}
                            >
                                {details.postalCode}
                            </p>
                        </div>
                            </div>
                            {(mode === 'edit' || mode === 'add' || mode === 'selectMain') && addresses.length > 1 && (
                                <button
                                    className="address-arrow-btn right"
                                    onClick={handleNextAddress}
                                    aria-label="Следующий адрес"
                                    disabled={addresses.length <= 1}
                                    style={{ width: 40, minWidth: 40, textAlign: 'center', borderRadius: 0, background: '#2c394a' }}
                                >
                                    <span>&rarr;</span>
                                </button>
                            )}
                        </div>
                        {saveError && <div style={{ color: 'red', marginTop: 10 }}>{saveError}</div>}
                        {(mode === 'edit' || mode === 'add' || mode === 'selectMain') && (
                            <>
                                <div style={{ display: 'flex', width: '100%', gap: 8, boxSizing: 'border-box' }}>
                                    {mode === 'edit' && (
                                        <button
                                            onClick={handleAddAddress}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                height: 44,
                                                width: '100%',
                                                minWidth: 0,
                                                textAlign: 'center',
                                                background: '#2c394a',
                                                color: '#fff',
                                                border: '1px solid transparent',
                                                borderRadius: 4,
                                                fontWeight: 'bold',
                                                opacity: 1,
                                                cursor: 'pointer',
                                                transition: 'background 0.2s, color 0.2s, opacity 0.2s',
                                                marginRight: 8
                                            }}
                                        >
                                            Добавить адрес
                                        </button>
                                    )}
                                    {mode === 'edit' && (
                                        <button
                                            onClick={handleSaveEditAddress}
                                            aria-label={mode === 'add' ? 'Save new address' : 'Save delivery details'}
                                            disabled={saving || !isAddressFieldsValid()}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                height: 44,
                                                width: '100%',
                                                minWidth: 0,
                                                textAlign: 'center',
                                                background: '#2c394a',
                                                color: '#fff',
                                                border: '1px solid transparent',
                                                borderRadius: 4,
                                                fontWeight: 'bold',
                                                opacity: saving || !isAddressFieldsValid() ? 0.5 : 1,
                                                cursor: saving || !isAddressFieldsValid() ? 'not-allowed' : 'pointer',
                                                transition: 'background 0.2s, color 0.2s, opacity 0.2s'
                                            }}
                                        >
                                            Сохранить
                                        </button>
                                    )}
                                    {mode === 'add' && (
                                        <>
                                            <button
                                                onClick={handleSave}
                                                aria-label="Save new address"
                                                disabled={saving || !isAddressFieldsValid()}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    height: 44,
                                                    width: '100%',
                                                    minWidth: 0,
                                                    textAlign: 'center',
                                                    background: '#2c394a',
                                                    color: '#fff',
                                                    border: '1px solid transparent',
                                                    borderRadius: 4,
                                                    fontWeight: 'bold',
                                                    opacity: saving || !isAddressFieldsValid() ? 0.5 : 1,
                                                    cursor: saving || !isAddressFieldsValid() ? 'not-allowed' : 'pointer',
                                                    transition: 'background 0.2s, color 0.2s, opacity 0.2s',
                                                    marginRight: 8
                                                }}
                                            >
                                                Сохранить
                                            </button>
                                            <button
                                                onClick={() => setMode('view')}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    height: 44,
                                                    width: '100%',
                                                    minWidth: 0,
                                                    textAlign: 'center',
                                                    background: '#2c394a',
                                                    color: '#fff',
                                                    border: '1px solid transparent',
                                                    borderRadius: 4,
                                                    fontWeight: 'bold',
                                                    opacity: 1,
                                                    cursor: 'pointer',
                                                    transition: 'background 0.2s, color 0.2s, opacity 0.2s'
                                                }}
                                            >
                                                Отменить
                                            </button>
                                        </>
                                    )}
                                    {mode !== 'add' && addresses.length > 1 && (
                                        <button
                                            type="button"
                                            className="main-address-btn"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                height: 44,
                                                width: '100%',
                                                minWidth: 0,
                                                textAlign: 'center',
                                                background: addresses[currentAddressIndex]?.isMain ? '#e0e4ea' : '#2c394a',
                                                color: addresses[currentAddressIndex]?.isMain ? '#222b3a' : '#fff',
                                                border: '1px solid transparent',
                                                borderRadius: 4,
                                                fontWeight: 'bold',
                                                opacity: saving ? 0.5 : 1,
                                                cursor: addresses[currentAddressIndex]?.isMain || saving ? 'not-allowed' : 'pointer',
                                                transition: 'background 0.2s, color 0.2s, opacity 0.2s'
                                            }}
                                            disabled={addresses[currentAddressIndex]?.isMain || saving}
                                            onClick={async () => {
                                                setSaving(true);
                                                try {
                                                    await Promise.all(addresses.map(addr =>
                                                        addr.id === addresses[currentAddressIndex].id
                                                            ? updateAddress(addr.id, { ...addr, isMain: true, user: { id: userId } })
                                                            : updateAddress(addr.id, { ...addr, isMain: false, user: { id: userId } })
                                                    ));
                                                    const updated = await getAddressesByUser(userId);
                                                    const sorted = updated.slice().sort((a, b) => (b.isMain ? 1 : 0) - (a.isMain ? 1 : 0));
                                                    setAddresses(sorted);
                                                    setCurrentAddressIndex(0);
                                                } finally {
                                                    setSaving(false);
                                                }
                                            }}
                                        >
                                            По умолчанию
                                        </button>
                                    )}
                                    {(addresses.length > 1 && mode !== 'add' && mode !== 'selectMain') && (
                                        <button
                                            onClick={handleDeleteAddress}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                height: 44,
                                                width: '100%',
                                                minWidth: 0,
                                                textAlign: 'center',
                                                background: '#2c394a',
                                                color: '#fff',
                                                border: '1px solid transparent',
                                                borderRadius: 4,
                                                fontWeight: 'bold',
                                                opacity: saving ? 0.5 : 1,
                                                cursor: saving ? 'not-allowed' : 'pointer',
                                                transition: 'background 0.2s, color 0.2s, opacity 0.2s'
                                            }}
                                            disabled={saving}
                                        >
                                            Удалить адрес
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                        </>
                        )}
                    </section>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default AccountDetails;