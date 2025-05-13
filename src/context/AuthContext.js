import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Проверка наличия токена при загрузке
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // Проверяем, не истек ли токен
      if (isTokenValid(token)) {
        // Декодируем токен для получения данных пользователя
        try {
          const decoded = jwtDecode(token);
          
          // Получаем роли из токена
          let roles = [];
          if (decoded.roles) {
            if (typeof decoded.roles === 'string') {
              roles = decoded.roles.split(',');
            } else if (Array.isArray(decoded.roles)) {
              roles = decoded.roles;
            }
          }
          
          setUser({
            id: decoded.sub,
            email: decoded.email || decoded.sub,
            firstName: decoded.firstName,
            lastName: decoded.lastName,
            roles: roles,
            role: decoded.role || (roles.length > 0 ? roles[0].replace('ROLE_', '') : 'USER')
          });
          
          // Настраиваем axios для отправки токена в заголовках
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Настраиваем перехватчик для обработки ошибок авторизации
          setupAuthInterceptor();
        } catch (error) {
          console.error("Ошибка при декодировании токена:", error);
          handleLogout();
        }
      } else {
        // Если токен истек, выполняем выход
        handleLogout();
      }
    }
    
    setLoading(false);
  }, []);
  
  // Проверка валидности токена
  const isTokenValid = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      // Проверяем, не истек ли срок действия токена
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  };
  
  // Настройка перехватчика для обработки ошибок авторизации
  const setupAuthInterceptor = () => {
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // Если сервер вернул ошибку 401 (Unauthorized) или 403 (Forbidden), выполняем выход
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          setAuthError(error.response.data.message || "Authentication error");
          handleLogout();
        }
        return Promise.reject(error);
      }
    );
  };

  // Функция для входа
  const login = async (email, password) => {
    try {
      setAuthError(null);
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        email,
        password
      });
      
      const { token, firstName, lastName, role, roles } = response.data;
      
      // Сохраняем токен
      localStorage.setItem('token', token);
      
      // Устанавливаем токен для всех последующих запросов
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Декодируем токен и устанавливаем пользователя
      try {
        const decoded = jwtDecode(token);
        
        // Обрабатываем роли из ответа сервера или из токена
        let userRoles = roles || [];
        if (decoded.roles) {
          if (typeof decoded.roles === 'string') {
            userRoles = decoded.roles.split(',');
          } else if (Array.isArray(decoded.roles)) {
            userRoles = decoded.roles;
          }
        }
        
        const userData = {
          id: decoded.sub,
          email: email || decoded.email || decoded.sub,
          firstName: firstName || decoded.firstName,
          lastName: lastName || decoded.lastName,
          roles: userRoles,
          role: role || (userRoles.length > 0 ? userRoles[0].replace('ROLE_', '') : 'USER')
        };
        
        // Обновляем состояние
        setUser(userData);
        
        return { success: true };
      } catch (error) {
        console.error("Ошибка при декодировании токена:", error);
        return {
          success: false,
          message: 'Ошибка при обработке данных пользователя'
        };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Ошибка при входе в систему';
      setAuthError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  // Функция для выхода
  const logout = async () => {
    try {
      // Вызываем API для выхода
      await axios.post('http://localhost:8080/api/auth/logout');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    } finally {
      handleLogout();
    }
  };
  
  // Обработка выхода из системы
  const handleLogout = () => {
    // Удаляем токен
    localStorage.removeItem('token');
    
    // Удаляем заголовок авторизации
    delete axios.defaults.headers.common['Authorization'];
    
    // Сбрасываем состояние
    setUser(null);
  };

  // Проверка авторизации пользователя
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token && isTokenValid(token);
  };
  
  // Проверка наличия роли администратора
  const isAdmin = () => {
    if (!user || !user.roles) return false;
    return user.roles.includes('ROLE_ADMIN') || user.role === 'ADMIN';
  };
  
  // Получение ID пользователя
  const getUserId = () => {
    if (!user) return null;
    return user.id;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAuthenticated,
      isAdmin,
      getUserId,
      authError
    }}>
      {children}
    </AuthContext.Provider>
  );
};