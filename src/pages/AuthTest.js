import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const AuthTest = () => {
  const { user, isAuthenticated, isAdmin } = useContext(AuthContext);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Тест аутентификации</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Статус аутентификации:</h2>
        <p>Авторизован: {isAuthenticated() ? '✅ Да' : '❌ Нет'}</p>
        <p>Админ: {isAdmin() ? '✅ Да' : '❌ Нет'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Данные пользователя:</h2>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Токен:</h2>
        <p style={{ wordBreak: 'break-all', background: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
          {localStorage.getItem('token') || 'Токен не найден'}
        </p>
      </div>

      <div>
        <h2>Действия:</h2>
        <button 
          onClick={() => window.location.href = '/admin'}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Перейти в админку
        </button>
        
        <button 
          onClick={() => {
            localStorage.removeItem('token');
            window.location.reload();
          }}
          style={{ 
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Выйти
        </button>
      </div>
    </div>
  );
};

export default AuthTest;
