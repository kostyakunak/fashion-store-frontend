import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Компонент для защиты маршрутов, требующих авторизации
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  
  // Показываем индикатор загрузки, пока проверяем авторизацию
  if (loading) {
    return <div>Загрузка...</div>;
  }
  
  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  // Если пользователь авторизован, отображаем дочерние компоненты
  return children;
};

export default PrivateRoute; 