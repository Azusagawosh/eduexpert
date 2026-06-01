import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:8000/api/token/', { username, password });
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      navigate('/');
    } catch (err) {
      setError('Неверное имя пользователя или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      padding: '40px 0'
    }}>
      <Container style={{ maxWidth: '450px' }}>
        <Card style={{ borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', border: 'none' }}>
          <Card.Body style={{ padding: '40px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px', fontWeight: '700' }}>
              Добро пожаловать
            </h2>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
              Войдите в свой аккаунт
            </p>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Имя пользователя</Form.Label>
                <Form.Control
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Введите имя пользователя"
                  required
                  style={{ borderRadius: '10px', padding: '12px' }}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Пароль</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  required
                  style={{ borderRadius: '10px', padding: '12px' }}
                />
              </Form.Group>

              <Button
                type="submit"
                variant="primary"
                className="w-100"
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontWeight: '600'
                }}
              >
                {loading ? 'Вход...' : 'Войти'}
              </Button>
            </Form>

            <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
              Нет аккаунта? <Link to="/register" style={{ color: '#667eea', textDecoration: 'none' }}>Зарегистрироваться</Link>
            </p>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default Login;