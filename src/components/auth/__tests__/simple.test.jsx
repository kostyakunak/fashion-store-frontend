import React from 'react';
import { render, screen } from '@testing-library/react';

// Простой компонент для тестирования без зависимостей
const SimpleComponent = ({ text }) => {
  return <div data-testid="simple-component">{text}</div>;
};

test('рендерит простой компонент', () => {
  render(<SimpleComponent text="Тестовый текст" />);
  
  const element = screen.getByTestId('simple-component');
  expect(element).toBeInTheDocument();
  expect(element).toHaveTextContent('Тестовый текст');
}); 