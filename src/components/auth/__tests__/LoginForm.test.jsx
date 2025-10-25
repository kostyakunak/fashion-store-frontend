import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginForm from '../LoginForm';

// Мокаем модули
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

jest.mock('../../../services/authService', () => ({
  authService: {
    login: jest.fn()
  }
}));

// Создаем мок для navigate
const mockNavigate = jest.fn();

describe('LoginForm компонент', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('отображает форму входа', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/пароль/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument();
  });

  test('обновляет значения полей при вводе', () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/пароль/i);

    fireEvent.change(emailInput, { target: { value: 'alex.petrov@fashionstore.ru' } });
    fireEvent.change(passwordInput, { target: { value: 'SecurePass2024!' } });

    expect(emailInput.value).toBe('alex.petrov@fashionstore.ru');
    expect(passwordInput.value).toBe('SecurePass2024!');
  });

  test('вызывает authService.login при отправке формы', async () => {
    const { authService } = require('../../../services/authService');
    authService.login.mockResolvedValueOnce({ token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c' });

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/пароль/i);
    const submitButton = screen.getByRole('button', { name: /войти/i });

    fireEvent.change(emailInput, { target: { value: 'alex.petrov@fashionstore.ru' } });
    fireEvent.change(passwordInput, { target: { value: 'SecurePass2024!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'alex.petrov@fashionstore.ru',
        password: 'SecurePass2024!'
      });
    });
  });

  test('перенаправляет на страницу профиля после успешного входа', async () => {
    const { authService } = require('../../../services/authService');
    authService.login.mockResolvedValueOnce({ token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c' });

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/пароль/i);
    const submitButton = screen.getByRole('button', { name: /войти/i });

    fireEvent.change(emailInput, { target: { value: 'alex.petrov@fashionstore.ru' } });
    fireEvent.change(passwordInput, { target: { value: 'SecurePass2024!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });
  });
}); 