import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProfileView from '../ProfileView';
import { authService } from '../../../services/authService';

jest.mock('../../../services/authService');

describe('ProfileView', () => {
    const mockUser = {
        firstName: 'Іван',
        lastName: 'Іваненко',
        email: 'test@example.com',
        phone: '+380931234567',
        address: 'вул. Прикладна, 123'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        authService.getCurrentUser.mockResolvedValue(mockUser);
    });

    test('відображає дані користувача', async () => {
        render(
            <BrowserRouter>
                <ProfileView />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByDisplayValue(mockUser.firstName)).toBeInTheDocument();
            expect(screen.getByDisplayValue(mockUser.lastName)).toBeInTheDocument();
            expect(screen.getByDisplayValue(mockUser.email)).toBeInTheDocument();
            expect(screen.getByDisplayValue(mockUser.phone)).toBeInTheDocument();
            expect(screen.getByDisplayValue(mockUser.address)).toBeInTheDocument();
        });
    });

    test('перемикається в режим редагування', async () => {
        render(
            <BrowserRouter>
                <ProfileView />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /редагувати/i })).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: /редагувати/i }));

        expect(screen.getByRole('button', { name: /зберегти/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /скасувати/i })).toBeInTheDocument();
    });

    test('зберігає зміни профілю', async () => {
        authService.updateProfile.mockResolvedValueOnce({ success: true });

        render(
            <BrowserRouter>
                <ProfileView />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /редагувати/i })).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: /редагувати/i }));

        const newFirstName = 'Петро';
        fireEvent.change(screen.getByLabelText(/ім'я/i), {
            target: { value: newFirstName },
        });

        fireEvent.click(screen.getByRole('button', { name: /зберегти/i }));

        await waitFor(() => {
            expect(authService.updateProfile).toHaveBeenCalledWith(
                expect.objectContaining({ firstName: newFirstName })
            );
        });
    });

    test('вихід із системи', async () => {
        render(
            <BrowserRouter>
                <ProfileView />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /вийти/i })).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: /вийти/i }));

        expect(authService.logout).toHaveBeenCalled();
        expect(window.location.pathname).toBe('/login');
    });

    test('показує помилку при завантаженні профілю', async () => {
        authService.getCurrentUser.mockRejectedValueOnce(new Error('Помилка при завантаженні профілю'));

        render(
            <BrowserRouter>
                <ProfileView />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/помилка при завантаженні профілю/i)).toBeInTheDocument();
        });
    });
}); 