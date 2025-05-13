import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * Enhanced PrivateRoute component that supports role-based access control
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render when authorized
 * @param {boolean} props.requireAdmin - Whether the route requires admin privileges
 * @returns {JSX.Element} The protected route component
 */
const PrivateRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading, authError } = useContext(AuthContext);
  
  // Показываем индикатор загрузки, пока проверяем авторизацию
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Загрузка...</p>
      </div>
    );
  }
  
  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: window.location.pathname, message: "Для доступа к этой странице необходимо войти в систему" }} />;
  }
  
  // Если требуются права администратора, но у пользователя их нет
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/" replace state={{ message: "У вас нет прав для доступа к этой странице" }} />;
  }
  
  // Если есть ошибка аутентификации
  if (authError) {
    return <Navigate to="/login" replace state={{ message: authError }} />;
  }
  
  // Если пользователь авторизован и имеет необходимые права, отображаем дочерние компоненты
  return children;
};

export default PrivateRoute;