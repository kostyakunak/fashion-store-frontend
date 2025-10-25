import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import '../styles/ProfileView.css';

const ProfileView = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = authService.getCurrentUser();
                if (currentUser) {
                    setUser(currentUser);
                    setFormData({
                        firstName: currentUser.firstName,
                        lastName: currentUser.lastName,
                        email: currentUser.email,
                        phone: currentUser.phone,
                        address: currentUser.address || ''
                    });
                }
            } catch (err) {
                setError('Помилка при завантаженні профілю');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Здесь будет логика обновления профиля
            setEditMode(false);
        } catch (err) {
            setError('Помилка при оновленні профілю');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        authService.logout();
        window.location.href = '/login';
    };

    if (loading) {
        return <div className="loading">Завантаження...</div>;
    }

    if (!user) {
        return <div className="error">Користувача не знайдено</div>;
    }

    return (
        <div className="profile-container">
            <h1>Профіль користувача</h1>
            
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-group">
                    <label htmlFor="firstName">Ім'я</label>
                    <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        disabled={!editMode}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="lastName">Прізвище</label>
                    <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        disabled={!editMode}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!editMode}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="phone">Телефон</label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!editMode}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="address">Адреса</label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        disabled={!editMode}
                    />
                </div>

                <div className="button-group">
                    {editMode ? (
                        <>
                            <button type="submit" className="save-button">
                                Зберегти
                            </button>
                            <button
                                type="button"
                                className="cancel-button"
                                onClick={() => setEditMode(false)}
                            >
                                Скасувати
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            className="edit-button"
                            onClick={() => setEditMode(true)}
                        >
                            Редагувати
                        </button>
                    )}
                </div>
            </form>

            <button className="logout-button" onClick={handleLogout}>
                Вийти
            </button>
        </div>
    );
};

export default ProfileView; 