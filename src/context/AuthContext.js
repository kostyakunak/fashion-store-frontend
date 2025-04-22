import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Проверка наличия токена при загрузке
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      // Проверяем, не истек ли токен
      if (isTokenValid(token)) {
        // Устанавливаем данные пользователя из localStorage
        setUser(JSON.parse(userData));
        
        // Настраиваем axios для отправки токена в заголовках
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Настраиваем перехватчик для обработки ошибок авторизации
        setupAuthInterceptor();
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
        // Если сервер вернул ошибку 401 (Unauthorized), выполняем выход
        if (error.response && error.response.status === 401) {
          handleLogout();
        }
        return Promise.reject(error);
      }
    );
  };

  // Функция для входа
  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        email,
        password
      });
      
      const { token, ...userData } = response.data;
      
      // Сохраняем токен и данные пользователя
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Устанавливаем токен для всех последующих запросов
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Обновляем состояние
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data || 'Ошибка при входе в систему' 
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
    // Удаляем токен и данные пользователя
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Удаляем заголовок авторизации
    delete axios.defaults.headers.common['Authorization'];
    
    // Сбрасываем состояние
    setUser(null);
  };

  // Проверка авторизации пользователя
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!user && !!token && isTokenValid(token);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      isAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 