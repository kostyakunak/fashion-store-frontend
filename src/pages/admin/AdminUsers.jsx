import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/AdminUsers.css";

const API_URL = "http://localhost:8080/api/admin";

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [addresses, setAddresses] = useState({});
    const [newUser, setNewUser] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        password: "",
        role: "USER"
    });
    const [newAddress, setNewAddress] = useState({
        recipientFirstName: "",
        recipientLastName: "",
        street: "",
        city: "",
        postalCode: "",
        country: ""
    });
    const [selectedUserId, setSelectedUserId] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${API_URL}/users`);
            setUsers(response.data);
            // Загружаем адреса для каждого пользователя
            const addressesMap = {};
            for (const user of response.data) {
                const addressResponse = await axios.get(`${API_URL}/addresses/${user.id}`);
                addressesMap[user.id] = addressResponse.data;
            }
            setAddresses(addressesMap);
        } catch (error) {
            console.error("Ошибка при загрузке пользователей:", error);
        }
    };

    const handleCreateUser = async () => {
        try {
            const userResponse = await axios.post(`${API_URL}/users`, newUser);
            const createdUser = userResponse.data;
            
            // Создаем адрес для нового пользователя
            if (createdUser.id) {
                await axios.post(`${API_URL}/addresses`, {
                    ...newAddress,
                    user: { id: createdUser.id }
                });
            }

            // Очищаем формы
            setNewUser({
                firstName: "",
                lastName: "",
                phone: "",
                email: "",
                password: "",
                role: "USER"
            });
            setNewAddress({
                recipientFirstName: "",

                recipientLastName: "",
                street: "",
                city: "",
                postalCode: "",
                country: ""
            });

            // Обновляем список пользователей
            await fetchUsers();
        } catch (error) {
            console.error("Ошибка при создании пользователя:", error);
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            // Сначала удаляем все адреса пользователя
            const userAddresses = addresses[userId] || [];
            for (const address of userAddresses) {
                await axios.delete(`${API_URL}/addresses/${address.id}`);
            }
            
            // Затем удаляем самого пользователя
            await axios.delete(`${API_URL}/users/${userId}`);
            
            // Обновляем список пользователей
            await fetchUsers();
        } catch (error) {
            console.error("Ошибка при удалении пользователя:", error);
        }
    };

    return (
        <div className="admin-users">
            <h2>Управление пользователями</h2>
            
            <div className="create-user-form">
                <h3>Создать нового пользователя</h3>
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Имя"
                        value={newUser.firstName}
                        onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Фамилия"
                        value={newUser.lastName}
                        onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                    />
                    <input
                        type="tel"
                        placeholder="Телефон"
                        value={newUser.phone}
                        onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                    <input
                        type="password"
                        placeholder="Пароль"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    />
                    <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    >
                        <option value="USER">Пользователь</option>
                        <option value="ADMIN">Администратор</option>
                    </select>
                </div>

                <h3>Адрес пользователя</h3>
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Имя получателя"
                        value={newAddress.recipientFirstName}
                        onChange={(e) => setNewAddress({ ...newAddress, recipientFirstName: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Фамилия получателя"
                        value={newAddress.recipientLastName}
                        onChange={(e) => setNewAddress({ ...newAddress, recipientLastName: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Улица"
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Город"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Почтовый индекс"
                        value={newAddress.postalCode}
                        onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Страна"
                        value={newAddress.country}
                        onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                    />
                </div>

                <button onClick={handleCreateUser}>Создать пользователя</button>
            </div>

            <div className="users-list">
                <h3>Список пользователей</h3>
                {users.map((user) => (
                    <div key={user.id} className="user-card">
                        <div className="user-info">
                            <h4>{user.firstName} {user.lastName}</h4>
                            <p>Email: {user.email}</p>
                            <p>Телефон: {user.phone}</p>
                            <p>Роль: {user.role}</p>
                        </div>
                        
                        <div className="addresses-list">
                            <h4>Адреса:</h4>
                            {addresses[user.id]?.map((address) => (
                                <div key={address.id} className="address-card">
                                    <p>{address.recipientFirstName} {address.recipientLastName}</p>
                                    <p>{address.street}</p>
                                    <p>{address.city}, {address.postalCode}</p>
                                    <p>{address.country}</p>
                                </div>
                            ))}
                        </div>

                        <button onClick={() => handleDeleteUser(user.id)}>Удалить</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminUsers;