import React from 'react';
import { render, screen } from '@testing-library/react';
import AuthLayout from '../AuthLayout';

// Мокаем react-router-dom
jest.mock('react-router-dom', () => ({
  Link: ({ children, to }) => <a href={to} data-testid={`link-${to.replace('/', '')}`}>{children}</a>
}));

describe('AuthLayout компонент', () => {
  test('отображает заголовок и дочерние элементы', () => {
    render(
      <AuthLayout title="Тестовый заголовок">
        <p>Тестовое содержимое</p>
      </AuthLayout>
    );
    
    expect(screen.getByText('Тестовый заголовок')).toBeInTheDocument();
    expect(screen.getByText('Тестовое содержимое')).toBeInTheDocument();
  });
  
  test('отображает ссылки на страницы входа и регистрации', () => {
    render(<AuthLayout title="Заголовок">Содержимое</AuthLayout>);
    
    expect(screen.getByTestId('link-login')).toBeInTheDocument();
    expect(screen.getByTestId('link-register')).toBeInTheDocument();
    expect(screen.getByText('Вход')).toBeInTheDocument();
    expect(screen.getByText('Регистрация')).toBeInTheDocument();
  });
}); 