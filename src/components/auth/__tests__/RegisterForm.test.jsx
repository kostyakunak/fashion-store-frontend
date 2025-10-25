import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RegisterForm from '../RegisterForm';
import { authService } from '../../../services/authService';

jest.mock('../../../services/authService');

describe('RegisterForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('отображает форму регистрации', () => {
        render(
            <BrowserRouter>
                <RegisterForm />
            </BrowserRouter>
        );

        expect(screen.getByLabelText(/имя/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/фамилия/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/телефон/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/пароль/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/подтверждение пароля/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /зарегистрироваться/i })).toBeInTheDocument();
    });

    test('показывает ошибку при несовпадении паролей', async () => {
        render(
            <BrowserRouter>
                <RegisterForm />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/пароль/i), {
            target: { value: 'SecurePass2024!' },
        });
        fireEvent.change(screen.getByLabelText(/подтверждение пароля/i), {
            target: { value: 'DifferentPass2024!' },
        });

        fireEvent.click(screen.getByRole('button', { name: /зарегистрироваться/i }));

        expect(await screen.findByText(/пароли не совпадают/i)).toBeInTheDocument();
    });

    test('показывает ошибку при неверном формате телефона', async () => {
        render(
            <BrowserRouter>
                <RegisterForm />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/телефон/i), {
            target: { value: '1234567890' },
        });

        fireEvent.click(screen.getByRole('button', { name: /зарегистрироваться/i }));

        expect(await screen.findByText(/телефон должен быть в формате/i)).toBeInTheDocument();
    });

    test('успешная регистрация перенаправляет на страницу профиля', async () => {
        authService.register.mockResolvedValueOnce({ token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c' });

        render(
            <BrowserRouter>
                <RegisterForm />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/имя/i), {
            target: { value: 'Александр' },
        });
        fireEvent.change(screen.getByLabelText(/фамилия/i), {
            target: { value: 'Петров' },
        });
        fireEvent.change(screen.getByLabelText(/email/i), {
            target: { value: 'alex.petrov@fashionstore.ru' },
        });
        fireEvent.change(screen.getByLabelText(/телефон/i), {
            target: { value: '+79161234567' },
        });
        fireEvent.change(screen.getByLabelText(/пароль/i), {
            target: { value: 'SecurePass2024!' },
        });
        fireEvent.change(screen.getByLabelText(/подтверждение пароля/i), {
            target: { value: 'SecurePass2024!' },
        });

        fireEvent.click(screen.getByRole('button', { name: /зарегистрироваться/i }));

        await waitFor(() => {
            expect(window.location.pathname).toBe('/profile');
        });
    });

    test('валидация обязательных полей', async () => {
        render(
            <BrowserRouter>
                <RegisterForm />
            </BrowserRouter>
        );

        fireEvent.click(screen.getByRole('button', { name: /зарегистрироваться/i }));

        expect(await screen.findByText(/имя обязательно/i)).toBeInTheDocument();
        expect(await screen.findByText(/фамилия обязательна/i)).toBeInTheDocument();
        expect(await screen.findByText(/email обязателен/i)).toBeInTheDocument();
        expect(await screen.findByText(/телефон обязателен/i)).toBeInTheDocument();
        expect(await screen.findByText(/пароль обязателен/i)).toBeInTheDocument();
    });
}); 