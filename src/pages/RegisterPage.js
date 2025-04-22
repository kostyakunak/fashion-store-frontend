import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { AuthContext } from '../context/AuthContext';

// Стили для страницы регистрации
const styles = {
  container: {
    maxWidth: '400px',
    margin: '100px auto',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)'
  },
  title: {
    textAlign: 'center',
    marginBottom: '20px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  formGroup: {
    marginBottom: '15px'
  },
  label: {
    marginBottom: '5px',
    display: 'block'
  },
  input: {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ddd'
  },
  button: {
    padding: '10px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px'
  },
  error: {
    color: 'red',
    marginTop: '10px',
    textAlign: 'center'
  },
  loginLink: {
    textAlign: 'center',
    marginTop: '15px'
  }
};

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
    <div style={styles.container}>
      <h2 style={styles.title}>Регистрация</h2>
      
      {error && <div style={styles.error}>{error}</div>}
      
      <form style={styles.form} onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="firstName">Имя:</label>
          <input
            style={styles.input}
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="lastName">Фамилия:</label>
          <input
            style={styles.input}
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="email">Email:</label>
          <input
            style={styles.input}
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="phone">Телефон:</label>
          <input
            style={styles.input}
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+7XXXXXXXXXX"
            required
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="password">Пароль:</label>
          <input
            style={styles.input}
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="confirmPassword">Подтверждение пароля:</label>
          <input
            style={styles.input}
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        
        <button style={styles.button} type="submit" disabled={loading}>
          {loading ? 'Загрузка...' : 'Зарегистрироваться'}
        </button>
      </form>
      
      <div style={styles.loginLink}>
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </div>
    </div>
  );
};

export default RegisterPage;