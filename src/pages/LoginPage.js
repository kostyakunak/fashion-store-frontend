import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Стили для страницы входа
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
  registerLink: {
    textAlign: 'center',
    marginTop: '15px'
  }
};

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
    <div style={styles.container}>
      <h2 style={styles.title}>Вход в систему</h2>
      
      {error && <div style={styles.error}>{error}</div>}
      
      <form style={styles.form} onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="email">Email:</label>
          <input
            style={styles.input}
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="password">Пароль:</label>
          <input
            style={styles.input}
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button style={styles.button} type="submit">
          Войти
        </button>
      </form>
      
      <div style={styles.registerLink}>
        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
      </div>
    </div>
  );
};

export default LoginPage; 