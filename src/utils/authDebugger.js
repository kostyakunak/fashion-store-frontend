/**
 * Утилита для отладки проблем с авторизацией
 */

export const debugAuth = () => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const user = localStorage.getItem('user');
  const previousAuthState = localStorage.getItem('previousAuthState');
  
  console.group('=== ОТЛАДКА АВТОРИЗАЦИИ ===');
  console.log('Время проверки:', new Date().toISOString());
  console.log('Токен:', token ? `${token.substring(0, 10)}...` : 'отсутствует');
  console.log('ID пользователя:', userId || 'отсутствует');
  console.log('Данные пользователя:', user ? 'присутствуют' : 'отсутствуют');
  if (user) {
    try {
      const parsedUser = JSON.parse(user);
      console.log('Данные пользователя (распарсенные):', {
        id: parsedUser.id,
        email: parsedUser.email,
        firstName: parsedUser.firstName,
        lastName: parsedUser.lastName,
        role: parsedUser.role
      });
    } catch (e) {
      console.error('Ошибка при парсинге данных пользователя:', e);
    }
  }
  console.log('Предыдущее состояние авторизации:', previousAuthState);
  
  // Проверка заголовков axios
  if (window.axios && window.axios.defaults && window.axios.defaults.headers) {
    console.log('Заголовок Authorization в axios:', 
      window.axios.defaults.headers.common['Authorization'] || 'отсутствует');
  } else {
    console.log('Axios не найден или не имеет настроенных заголовков');
  }
  
  console.groupEnd();
  
  return {
    token: !!token,
    userId: !!userId,
    user: !!user,
    parsedUser: user ? JSON.parse(user) : null,
    previousAuthState,
    axiosAuthHeader: window.axios?.defaults?.headers?.common?.['Authorization'] || null
  };
};

/**
 * Проверяет наличие всех необходимых данных для авторизации
 * @returns {boolean} Результат проверки
 */
export const isAuthComplete = () => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const user = localStorage.getItem('user');
  
  return !!(token && userId && user);
};

/**
 * Исправляет проблемы с авторизацией
 * @returns {boolean} true, если исправления были применены
 */
export const fixAuthIssues = () => {
  let fixed = false;
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const user = localStorage.getItem('user');
  
  // Если есть токен и данные пользователя, но нет userId
  if (token && user && !userId) {
    try {
      const parsedUser = JSON.parse(user);
      if (parsedUser.id) {
        localStorage.setItem('userId', parsedUser.id);
        console.log(`Исправлено: userId установлен из данных пользователя (${parsedUser.id})`);
        fixed = true;
      }
    } catch (e) {
      console.error('Ошибка при парсинге данных пользователя:', e);
    }
  }
  
  // Если есть токен и userId, но нет данных пользователя
  if (token && userId && !user) {
    // Создаем минимальный объект пользователя
    const minimalUser = { id: userId };
    localStorage.setItem('user', JSON.stringify(minimalUser));
    console.log(`Исправлено: создан минимальный объект пользователя с id=${userId}`);
    fixed = true;
  }
  
  // Если нет предыдущего состояния авторизации, но есть токен и userId
  if (token && userId && !localStorage.getItem('previousAuthState')) {
    localStorage.setItem('previousAuthState', 'true');
    console.log('Исправлено: установлено previousAuthState=true');
    fixed = true;
  }
  
  return fixed;
};

/**
 * Очищает все данные авторизации
 */
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('user');
  localStorage.removeItem('previousAuthState');
  
  if (window.axios && window.axios.defaults && window.axios.defaults.headers) {
    delete window.axios.defaults.headers.common['Authorization'];
  }
  
  console.log('Все данные авторизации очищены');
};