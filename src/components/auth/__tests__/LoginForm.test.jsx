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

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  test('вызывает authService.login при отправке формы', async () => {
    const { authService } = require('../../../services/authService');
    authService.login.mockResolvedValueOnce({ token: 'test-token' });

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/пароль/i);
    const submitButton = screen.getByRole('button', { name: /войти/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  test('перенаправляет на страницу профиля после успешного входа', async () => {
    const { authService } = require('../../../services/authService');
    authService.login.mockResolvedValueOnce({ token: 'test-token' });

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/пароль/i);
    const submitButton = screen.getByRole('button', { name: /войти/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });
  });
}); 