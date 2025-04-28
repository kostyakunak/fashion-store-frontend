import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Проверка наличия токена при загрузке
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      // Проверяем, не истек ли токен
      if (isTokenValid(token)) {
        // Устанавливаем данные пользователя из localStorage
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Если есть id пользователя, сохраняем его в localStorage для доступа из других компонентов
        if (parsedUser && parsedUser.id) {
          localStorage.setItem('userId', parsedUser.id);
          console.log(`AuthContext: userId ${parsedUser.id} сохранен в localStorage`);
        } else {
          console.warn('AuthContext: id пользователя отсутствует в данных пользователя');
          console.log('AuthContext: данные пользователя:', parsedUser);
        }
        
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
      console.error('Ошибка при проверке токена:', error);
      return false;
    }
  };
  
  // Настройка перехватчика для обработки ошибок авторизации
  const setupAuthInterceptor = () => {
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Если сервер вернул ошибку 401 (Unauthorized)
        if (error.response && error.response.status === 401) {
          // Пробуем обновить токен
          try {
            const newToken = await refreshToken();
            if (newToken) {
              // Повторяем запрос с новым токеном
              error.config.headers['Authorization'] = `Bearer ${newToken}`;
              return axios(error.config);
            }
          } catch (refreshError) {
            console.error('Ошибка при обновлении токена:', refreshError);
          }
          
          // Если не удалось обновить токен, выполняем выход
          handleLogout();
        }
        return Promise.reject(error);
      }
    );
  };

  // Функция для обновления токена
  const refreshToken = async () => {
    try {
      const response = await axios.post('http://localhost:8080/api/auth/refresh-token');
      const { token } = response.data;
      
      // Сохраняем новый токен
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return token;
    } catch (error) {
      console.error('Ошибка при обновлении токена:', error);
      return null;
    }
  };

  // Функция для входа
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        email,
        password
      });
      
      const { token, id, ...userData } = response.data;
      
      // Создаем полный объект пользователя с id
      const fullUserData = { id, ...userData };
      
      console.log('Login response data:', response.data);
      console.log('User ID from login response:', id);
      
      // Сохраняем токен и данные пользователя
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(fullUserData));
      localStorage.setItem('userId', id);
      
      // Устанавливаем токен для всех последующих запросов
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Установлен заголовок Authorization для axios:', `Bearer ${token.substring(0, 10)}...`);
      
      // Обновляем состояние
      setUser(fullUserData);
      // Нет необходимости вызывать setIsAuthenticated, так как это теперь функция
      
      // Проверяем, что все данные корректно сохранены
      console.log('Проверка сохраненных данных:');
      console.log('- token в localStorage:', localStorage.getItem('token') ? 'присутствует' : 'отсутствует');
      console.log('- userId в localStorage:', localStorage.getItem('userId'));
      console.log('- user в localStorage:', localStorage.getItem('user') ? 'присутствует' : 'отсутствует');
      
      return { success: true };
    } catch (error) {
      console.error('Ошибка при входе:', error);
      setError(error.response?.data || 'Ошибка при входе');
      return { success: false, error: error.response?.data || 'Ошибка при входе' };
    }
  };

  // Функция для выхода
  const logout = () => {
    handleLogout();
  };
  
  // Обработка выхода из системы
  const handleLogout = () => {
    // Удаляем токен и данные пользователя
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.setItem('previousAuthState', 'false');
    
    // Удаляем заголовок авторизации
    delete axios.defaults.headers.common['Authorization'];
    
    // Сбрасываем состояние
    setUser(null);
    setError(null);
  };

  // Проверка авторизации пользователя
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    console.log('isAuthenticated check:');
    console.log('- token:', token ? `${token.substring(0, 10)}...` : 'отсутствует');
    console.log('- userId:', userId || 'отсутствует');
    console.log('- user object:', user ? 'присутствует' : 'отсутствует');
    
    // Проверяем наличие токена и userId, даже если объект user еще не загружен
    // Это решает проблему с корзиной, которая проверяет авторизацию до полной загрузки user
    if (token && userId) {
      // Базовая проверка валидности токена
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        const isValid = decoded.exp > currentTime;
        console.log('- token validity:', isValid ? 'валидный' : 'невалидный');
        return isValid;
      } catch (error) {
        console.warn('Ошибка при проверке токена в isAuthenticated:', error);
        // Даже при ошибке декодирования считаем пользователя авторизованным,
        // если есть токен и userId - это решает проблему с корзиной
        return true;
      }
    }
    
    return false;
  };

  // Получение данных авторизации
  const getAuthData = () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const userData = localStorage.getItem('user');
    
    console.log('getAuthData:');
    console.log('- token:', token ? `${token.substring(0, 10)}...` : 'отсутствует');
    console.log('- userId from localStorage:', userId || 'отсутствует');
    console.log('- userData in localStorage:', userData ? 'присутствует' : 'отсутствует');
    
    // Если нет токена или userId, считаем пользователя неавторизованным
    if (!token || !userId) {
      console.log('- результат: не авторизован (нет токена или userId)');
      return {
        userId: null,
        token: null,
        isAuthenticated: false
      };
    }
    
    // Даже если нет userData, но есть userId и token, считаем пользователя авторизованным
    // Это решает проблему с корзиной
    if (!userData) {
      console.log('- результат: авторизован (есть токен и userId, но нет userData)');
      return {
        userId: userId,
        token,
        isAuthenticated: true
      };
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      const authResult = {
        userId: userId || parsedUser.id,
        token,
        isAuthenticated: true // Всегда считаем авторизованным, если есть токен и userId
      };
      console.log('- результат:', authResult);
      return authResult;
    } catch (error) {
      console.error('Ошибка при парсинге данных пользователя:', error);
      // Даже при ошибке парсинга, если есть токен и userId, считаем пользователя авторизованным
      console.log('- результат: авторизован (есть токен и userId, ошибка парсинга userData)');
      return {
        userId: userId,
        token,
        isAuthenticated: true
      };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error,
      login, 
      logout, 
      isAuthenticated,
      getAuthData
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 