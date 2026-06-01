import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';

const Requests = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await axios.get('http://localhost:8000/api/consultations/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConsultations(response.data);
    } catch (error) {
      console.error('Ошибка:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id) => {
    const token = localStorage.getItem('access_token');
    try {
      await axios.post(`http://localhost:8000/api/consultations/${id}/confirm/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('✓ Консультация подтверждена');
      fetchRequests();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Ошибка при подтверждении');
    }
  };

  const handleComplete = async (id) => {
    const token = localStorage.getItem('access_token');
    try {
      await axios.post(`http://localhost:8000/api/consultations/${id}/complete/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('✓ Консультация завершена');
      fetchRequests();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Ошибка при завершении');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Не указана';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  const pendingRequests = consultations.filter(c => c.status === 'pending');
  const confirmedRequests = consultations.filter(c => c.status === 'confirmed');
  const completedRequests = consultations.filter(c => c.status === 'completed');

  return (
    <Container className="mt-4">
      <h1 className="mb-4" style={{ fontWeight: '700' }}>📌 Заявки на консультации</h1>
      {message && <Alert variant="success">{message}</Alert>}

      <h3 className="mt-4">⏳ Ожидают подтверждения ({pendingRequests.length})</h3>
      {pendingRequests.length === 0 ? (
        <Alert variant="info">Нет заявок</Alert>
      ) : (
        <Row>
          {pendingRequests.map(c => (
            <Col md={6} key={c.id} className="mb-3">
              <Card style={{ borderRadius: '15px' }}>
                <Card.Body>
                  <Card.Title>{c.topic}</Card.Title>
                  <Card.Text>
                    <strong>👤 Клиент:</strong> {c.client_name}<br />
                    <strong>📅 Дата:</strong> {c.schedule?.date ? formatDate(c.schedule.date) : 'Не указана'}<br />
                    <strong>🕐 Время:</strong> {c.schedule?.start_time ? `${c.schedule.start_time.substring(0,5)} - ${c.schedule.end_time.substring(0,5)}` : 'Не указано'}
                  </Card.Text>
                  <Button variant="success" size="sm" onClick={() => handleConfirm(c.id)}>
                    ✓ Подтвердить
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <h3 className="mt-4">✅ Подтвержденные ({confirmedRequests.length})</h3>
      {confirmedRequests.length === 0 ? (
        <Alert variant="info">Нет подтвержденных</Alert>
      ) : (
        <Row>
          {confirmedRequests.map(c => (
            <Col md={6} key={c.id} className="mb-3">
              <Card style={{ borderRadius: '15px' }}>
                <Card.Body>
                  <Card.Title>{c.topic}</Card.Title>
                  <Card.Text>
                    <strong>👤 Клиент:</strong> {c.client_name}<br />
                    <strong>📅 Дата:</strong> {c.schedule?.date ? formatDate(c.schedule.date) : 'Не указана'}
                  </Card.Text>
                  <Button variant="primary" size="sm" onClick={() => handleComplete(c.id)}>
                    ✓ Завершить
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <h3 className="mt-4">🏆 Завершенные ({completedRequests.length})</h3>
      {completedRequests.length === 0 ? (
        <Alert variant="info">Нет завершенных</Alert>
      ) : (
        <Row>
          {completedRequests.map(c => (
            <Col md={6} key={c.id} className="mb-3">
              <Card style={{ borderRadius: '15px' }}>
                <Card.Body>
                  <Card.Title>{c.topic}</Card.Title>
                  <Card.Text>
                    <strong>👤 Клиент:</strong> {c.client_name}<br />
                    <strong>📅 Дата:</strong> {c.schedule?.date ? formatDate(c.schedule.date) : 'Не указана'}
                  </Card.Text>
                  <Badge bg="success">🏆 Завершено</Badge>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Requests;