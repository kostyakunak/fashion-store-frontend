import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProfileView from '../ProfileView';
import { authService } from '../../../services/authService';

jest.mock('../../../services/authService');

describe('ProfileView', () => {
    const mockUser = {
        firstName: 'Иван',
        lastName: 'Иванов',
        email: 'test@example.com',
        phone: '+79123456789',
        address: 'ул. Примерная, 123'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        authService.getCurrentUser.mockResolvedValue(mockUser);
    });

    test('отображает данные пользователя', async () => {
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

    test('переключается в режим редактирования', async () => {
        render(
            <BrowserRouter>
                <ProfileView />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /редактировать/i })).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: /редактировать/i }));

        expect(screen.getByRole('button', { name: /сохранить/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /отмена/i })).toBeInTheDocument();
    });

    test('сохраняет изменения профиля', async () => {
        authService.updateProfile.mockResolvedValueOnce({ success: true });

        render(
            <BrowserRouter>
                <ProfileView />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /редактировать/i })).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: /редактировать/i }));

        const newFirstName = 'Петр';
        fireEvent.change(screen.getByLabelText(/имя/i), {
            target: { value: newFirstName },
        });

        fireEvent.click(screen.getByRole('button', { name: /сохранить/i }));

        await waitFor(() => {
            expect(authService.updateProfile).toHaveBeenCalledWith(
                expect.objectContaining({ firstName: newFirstName })
            );
        });
    });

    test('выход из системы', async () => {
        render(
            <BrowserRouter>
                <ProfileView />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /выйти/i })).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: /выйти/i }));

        expect(authService.logout).toHaveBeenCalled();
        expect(window.location.pathname).toBe('/login');
    });

    test('показывает ошибку при загрузке профиля', async () => {
        authService.getCurrentUser.mockRejectedValueOnce(new Error('Ошибка загрузки профиля'));

        render(
            <BrowserRouter>
                <ProfileView />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/ошибка при загрузке профиля/i)).toBeInTheDocument();
        });
    });
}); 