import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { authService } from '../services/authService';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import ProfileView from '../components/profile/ProfileView';

jest.mock('../services/authService');

describe('Интеграционные тесты авторизации', () => {
    const mockUser = {
        firstName: 'Иван',
        lastName: 'Иванов',
        email: 'test@example.com',
        phone: '+79123456789',
        address: 'ул. Примерная, 123'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        window.history.pushState({}, '', '/');
    });

    test('полный цикл регистрации и входа', async () => {
        // Настраиваем моки
        authService.register.mockResolvedValueOnce({ token: 'register-token' });
        authService.login.mockResolvedValueOnce({ token: 'login-token' });
        authService.getCurrentUser.mockResolvedValue(mockUser);

        render(
            <BrowserRouter>
                <Routes>
                    <Route path="/register" element={<RegisterForm />} />
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/profile" element={<ProfileView />} />
                </Routes>
            </BrowserRouter>
        );

        // Переходим на страницу регистрации
        window.history.pushState({}, '', '/register');

        // Заполняем форму регистрации
        fireEvent.change(screen.getByLabelText(/имя/i), {
            target: { value: mockUser.firstName },
        });
        fireEvent.change(screen.getByLabelText(/фамилия/i), {
            target: { value: mockUser.lastName },
        });
        fireEvent.change(screen.getByLabelText(/email/i), {
            target: { value: mockUser.email },
        });
        fireEvent.change(screen.getByLabelText(/телефон/i), {
            target: { value: mockUser.phone },
        });
        fireEvent.change(screen.getByLabelText(/пароль/i), {
            target: { value: 'password123' },
        });
        fireEvent.change(screen.getByLabelText(/подтверждение пароля/i), {
            target: { value: 'password123' },
        });

        // Отправляем форму регистрации
        fireEvent.click(screen.getByRole('button', { name: /зарегистрироваться/i }));

        // Проверяем, что мы перенаправлены на страницу профиля
        await waitFor(() => {
            expect(window.location.pathname).toBe('/profile');
        });

        // Выходим из системы
        fireEvent.click(screen.getByRole('button', { name: /выйти/i }));

        // Проверяем, что мы перенаправлены на страницу входа
        expect(window.location.pathname).toBe('/login');

        // Заполняем форму входа
        fireEvent.change(screen.getByLabelText(/email/i), {
            target: { value: mockUser.email },
        });
        fireEvent.change(screen.getByLabelText(/пароль/i), {
            target: { value: 'password123' },
        });

        // Отправляем форму входа
        fireEvent.click(screen.getByRole('button', { name: /войти/i }));

        // Проверяем, что мы снова перенаправлены на страницу профиля
        await waitFor(() => {
            expect(window.location.pathname).toBe('/profile');
        });

        // Проверяем, что данные пользователя отображаются
        await waitFor(() => {
            expect(screen.getByDisplayValue(mockUser.firstName)).toBeInTheDocument();
            expect(screen.getByDisplayValue(mockUser.lastName)).toBeInTheDocument();
        });
    });

    test('защита маршрутов', async () => {
        // Настраиваем моки
        authService.getCurrentUser.mockRejectedValueOnce(new Error('Не авторизован'));

        render(
            <BrowserRouter>
                <Routes>
                    <Route path="/profile" element={<ProfileView />} />
                </Routes>
            </BrowserRouter>
        );

        // Пытаемся перейти на страницу профиля без авторизации
        window.history.pushState({}, '', '/profile');

        // Проверяем, что мы перенаправлены на страницу входа
        await waitFor(() => {
            expect(window.location.pathname).toBe('/login');
        });
    });
}); 