import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { AuthContext } from '../context/AuthContext';
import '../styles/AuthLayout.css';
import '../styles/LoginForm.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Пароль должен содержать минимум 8 символов');
      return false;
    }
    if (!/^\+7\d{10}$/.test(formData.phone)) {
      setError('Телефон должен быть в формате +7XXXXXXXXXX');
      return false;
    }
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const { confirmPassword, ...registerData } = formData;
      // Register using authService
      await authService.register(registerData);
      
      // Then login using AuthContext to update the user state
      const loginResult = await login(formData.email, formData.password);
      
      if (loginResult.success) {
        navigate('/account');
      } else {
        // If login fails after successful registration
        setError('Регистрация успешна, но возникла проблема при входе. Пожалуйста, войдите вручную.');
        navigate('/login');
      }
    } catch (err) {
      setError(err.message || 'Ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <h1 className="auth-title">Реєстрація</h1>
        
        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="firstName">Ім'я</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Введіть ваше ім'я"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="lastName">Прізвище</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Введіть ваше прізвище"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Введіть ваш email"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Телефон</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+380 (99) 999-99-99"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Введіть пароль (мінімум 8 символів)"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Підтвердження паролю</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Підтвердіть пароль"
              required
            />
          </div>
          
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Завантаження...' : 'Зареєструватися'}
          </button>
        </form>
        
        <div className="auth-links">
          <div className="auth-text">Вже є акаунт?</div>
          <Link to="/login" className="auth-link">Увійти в систему</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;