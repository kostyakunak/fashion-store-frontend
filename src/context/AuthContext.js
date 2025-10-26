import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { getUserByEmail } from '../utils/userApi';

export const AuthContext = createContext();

function mapUserApiToClient(user) {
  if (!user) return user;
  return {
    ...user,
    firstName: user.firstName || user.first_name || "",
    lastName: user.lastName || user.last_name || "",
  };
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Проверка наличия токена при загрузке
  useEffect(() => {
    console.log('🔐 AuthContext useEffect triggered', { timestamp: Date.now() });
    const token = localStorage.getItem('token');
    console.log('🔐 AuthContext token check:', { hasToken: !!token, tokenLength: token?.length || 0 });
    
    if (token) {
      // Проверяем, не истек ли токен
      if (isTokenValid(token)) {
        console.log('✅ Token is valid, decoding...');
        // Декодируем токен для получения данных пользователя
        try {
          const decoded = jwtDecode(token);
          console.log('🔐 decoded token:', decoded);
          let roles = [];
          if (decoded.roles) {
            if (typeof decoded.roles === 'string') {
              roles = decoded.roles.split(',');
            } else if (Array.isArray(decoded.roles)) {
              roles = decoded.roles;
            }
          }
          // user.id — число, если sub число, иначе null
          const isSubNumber = !isNaN(Number(decoded.sub));
          setUser({
            id: isSubNumber ? Number(decoded.sub) : null,
            email: decoded.email || decoded.sub,
            firstName: decoded.firstName,
            lastName: decoded.lastName,
            roles: roles,
            role: decoded.role || (roles.length > 0 ? roles[0].replace('ROLE_', '') : 'USER')
          });
          // Если id не число, пробуем получить id по email или sub
          const email = decoded.email || decoded.sub;
          if (!isSubNumber && email) {
            console.log('Вызов getUserByEmail с email:', email);
            try {
              getUserByEmail(email).then(userData => {
                console.log('userData from getUserByEmail:', userData);
                if (userData && userData.id && !isNaN(Number(userData.id))) {
                  setUser(prev => ({
                    ...prev,
                    ...mapUserApiToClient(userData)
                  }));
                  console.log('AuthContext setUser (by email):', userData);
                } else {
                  console.error('Не удалось получить числовой id по email:', userData);
                }
              }).catch(err => {
                console.error('Ошибка при получении id по email (then):', err);
              });
            } catch (err) {
              console.error('Ошибка при вызове getUserByEmail (try):', err);
            }
          }
          
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
      const response = await axios.post(`${process.env.REACT_APP_API_URL || "http://localhost:8080"}/api/auth/login`, {
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
        setUser(mapUserApiToClient(userData));
        
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
      await axios.post(`${process.env.REACT_APP_API_URL || "http://localhost:8080"}/api/auth/logout`);
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
    const isValid = !!token && isTokenValid(token);
    console.log('🔐 isAuthenticated called:', { 
      hasToken: !!token, 
      isValid, 
      user: !!user,
      timestamp: Date.now() 
    });
    return isValid;
  };
  
  // Проверка наличия роли администратора
  const isAdmin = () => {
    const hasUser = !!user;
    const hasRoles = !!user?.roles;
    const isAdminRole = hasUser && hasRoles && (user.roles.includes('ROLE_ADMIN') || user.role === 'ADMIN');
    console.log('👑 isAdmin called:', { 
      hasUser, 
      hasRoles, 
      userRoles: user?.roles, 
      userRole: user?.role,
      isAdminRole,
      timestamp: Date.now() 
    });
    return isAdminRole;
  };
  
  // Получение ID пользователя
  const getUserId = () => {
    if (!user) return null;
    // Используем числовой id, если есть, иначе null
    if (user.id && !isNaN(Number(user.id))) return Number(user.id);
    if (user.userId && !isNaN(Number(user.userId))) return Number(user.userId);
    return null;
  };

  useEffect(() => {
    console.log('AuthContext user:', user);
  }, [user]);

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