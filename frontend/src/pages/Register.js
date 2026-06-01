import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card, Row, Col } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [form, setForm] = useState({
    username: '',
    password: '',
    password2: '',
    email: '',
    first_name: '',
    last_name: '',
    user_type: 'client'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (form.password !== form.password2) {
      setError('Пароли не совпадают');
      setLoading(false);
      return;
    }

    if (form.password.length < 8) {
      setError('Пароль должен быть не менее 8 символов');
      setLoading(false);
      return;
    }

    try {
      await axios.post('http://localhost:8000/api/register/', {
        username: form.username,
        password: form.password,
        password2: form.password2,
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        user_type: form.user_type
      });

      const loginRes = await axios.post('http://localhost:8000/api/token/', {
        username: form.username,
        password: form.password
      });

      localStorage.setItem('access_token', loginRes.data.access);
      localStorage.setItem('refresh_token', loginRes.data.refresh);
      localStorage.setItem('user_type', form.user_type);

      navigate('/');
    } catch (err) {
      if (err.response?.data?.username) {
        setError(`Имя пользователя: ${err.response.data.username.join(', ')}`);
      } else if (err.response?.data?.password) {
        setError(`Пароль: ${err.response.data.password.join(', ')}`);
      } else {
        setError('Ошибка регистрации. Попробуйте другой username или пароль');
      }
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
      <Container style={{ maxWidth: '500px' }}>
        <Card style={{ borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', border: 'none' }}>
          <Card.Body style={{ padding: '40px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px', fontWeight: '700' }}>
              Регистрация
            </h2>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Имя пользователя *</Form.Label>
                <Form.Control
                  type="text"
                  value={form.username}
                  onChange={e => setForm({...form, username: e.target.value})}
                  required
                  style={{ borderRadius: '10px', padding: '12px' }}
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Имя</Form.Label>
                    <Form.Control
                      type="text"
                      value={form.first_name}
                      onChange={e => setForm({...form, first_name: e.target.value})}
                      style={{ borderRadius: '10px', padding: '12px' }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Фамилия</Form.Label>
                    <Form.Control
                      type="text"
                      value={form.last_name}
                      onChange={e => setForm({...form, last_name: e.target.value})}
                      style={{ borderRadius: '10px', padding: '12px' }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Email *</Form.Label>
                <Form.Control
                  type="email"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  required
                  style={{ borderRadius: '10px', padding: '12px' }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Пароль * (минимум 8 символов)</Form.Label>
                <Form.Control
                  type="password"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  required
                  style={{ borderRadius: '10px', padding: '12px' }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Подтвердите пароль *</Form.Label>
                <Form.Control
                  type="password"
                  value={form.password2}
                  onChange={e => setForm({...form, password2: e.target.value})}
                  required
                  style={{ borderRadius: '10px', padding: '12px' }}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Тип пользователя *</Form.Label>
                <Form.Select
                  value={form.user_type}
                  onChange={e => setForm({...form, user_type: e.target.value})}
                  style={{ borderRadius: '10px', padding: '12px' }}
                >
                  <option value="client">👤 Клиент (ищу консультации)</option>
                  <option value="consultant">👨‍🏫 Консультант (провожу консультации)</option>
                </Form.Select>
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
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
              </Button>
            </Form>

            <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
              Уже есть аккаунт? <Link to="/login" style={{ color: '#667eea', textDecoration: 'none' }}>Войти</Link>
            </p>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default Register;