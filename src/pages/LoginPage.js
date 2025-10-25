import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/AuthLayout.css';
import '../styles/LoginForm.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        // Перенаправляем на страницу аккаунта
        navigate('/account');
      } else {
        setError(result.message || 'Неверный email или пароль');
      }
    } catch (error) {
      setError('Ошибка при входе в систему');
      console.error('Login error:', error);
    }
  };
  
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <h1 className="auth-title">Вхід в систему</h1>
        
        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Введіть ваш email"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введіть ваш пароль"
              required
            />
          </div>
          
          <button type="submit" className="submit-button">
            Увійти
          </button>
        </form>
        
        <div className="auth-links">
          <div className="auth-text">Немає акаунту?</div>
          <Link to="/register" className="auth-link">Зареєструватися</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 