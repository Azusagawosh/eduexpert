import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Badge, Spinner, Alert, Tabs, Tab } from 'react-bootstrap';
import axios from 'axios';

const MyConsultations = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Сначала войдите в систему');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('http://localhost:8000/api/consultations/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConsultations(response.data);
    } catch (error) {
      console.error('Ошибка:', error);
      setError('Ошибка загрузки консультаций');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <Badge bg="success" style={{ fontSize: '12px', padding: '8px 12px' }}>✅ Ваша запись принята</Badge>;
      case 'confirmed':
        return <Badge bg="success" style={{ fontSize: '12px', padding: '8px 12px' }}>✅ Запись подтверждена</Badge>;
      case 'completed':
        return <Badge bg="primary" style={{ fontSize: '12px', padding: '8px 12px' }}>🏆 Завершена</Badge>;
      default:
        return <Badge bg="secondary" style={{ fontSize: '12px', padding: '8px 12px' }}>{status}</Badge>;
    }
  };

  const getStatusMessage = (status) => {
    switch(status) {
      case 'pending':
        return { text: '✅ Ваша запись принята! Эксперт скоро свяжется с вами', variant: 'success' };
      case 'confirmed':
        return { text: '✅ Запись подтверждена! Эксперт скоро свяжется с вами', variant: 'success' };
      case 'completed':
        return { text: '🏆 Консультация завершена! Спасибо за обращение', variant: 'primary' };
      default:
        return { text: 'Статус неизвестен', variant: 'secondary' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Дата не указана';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Время не указано';
    return timeString.substring(0, 5);
  };

  const parseNotes = (notes) => {
    if (!notes) return { clientName: '', clientPhone: '', clientEmail: '', additionalNotes: '' };

    const nameMatch = notes.match(/👤 Клиент: (.*?)[\n|$]/);
    const phoneMatch = notes.match(/📞 Телефон: (.*?)[\n|$]/);
    const emailMatch = notes.match(/📧 Email: (.*?)[\n|$]/);
    const additionalMatch = notes.match(/💬 Дополнительно:\n(.*?)$/s);

    return {
      clientName: nameMatch ? nameMatch[1] : '',
      clientPhone: phoneMatch ? phoneMatch[1] : '',
      clientEmail: emailMatch ? emailMatch[1] : 'не указан',
      additionalNotes: additionalMatch ? additionalMatch[1] : ''
    };
  };

  const pendingConsultations = consultations.filter(c => c.status === 'pending');
  const confirmedConsultations = consultations.filter(c => c.status === 'confirmed');
  const completedConsultations = consultations.filter(c => c.status === 'completed');

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Загрузка ваших консультаций...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <div style={{ background: '#f8f9fa', minHeight: 'calc(100vh - 70px)', padding: '40px 0' }}>
      <Container>
        <div className="text-center mb-4">
          <h1 style={{ fontWeight: '700' }}>📋 Мои консультации</h1>
          <p className="text-muted">Всего записей: {consultations.length}</p>
        </div>

        {consultations.length === 0 ? (
          <Alert variant="info" style={{ borderRadius: '15px', textAlign: 'center' }}>
            <h5>У вас пока нет консультаций</h5>
            <p>Перейдите на <a href="/consultants">страницу консультантов</a>, чтобы записаться</p>
          </Alert>
        ) : (
          <Tabs defaultActiveKey="upcoming" className="mb-4" fill>
            <Tab eventKey="upcoming" title={`📅 Активные (${pendingConsultations.length + confirmedConsultations.length})`}>
              <Row>
                {pendingConsultations.map(c => {
                  const parsed = parseNotes(c.notes);
                  const statusMsg = getStatusMessage(c.status);
                  return (
                    <Col md={6} key={c.id} className="mb-3">
                      <Card style={{ borderRadius: '15px', borderLeft: '4px solid #198754' }}>
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <Card.Title style={{ fontWeight: '600' }}>
                              Консультация с {c.consultant_name}
                            </Card.Title>
                            {getStatusBadge(c.status)}
                          </div>
                          <Card.Text>
                            <div style={{ marginBottom: '8px' }}>
                              <strong>👤 Клиент:</strong> {parsed.clientName}
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                              <strong>📞 Телефон:</strong> {parsed.clientPhone}
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                              <strong>📅 Дата:</strong> {formatDate(c.schedule_date)}
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                              <strong>🕐 Время:</strong> {formatTime(c.schedule_start)} - {formatTime(c.schedule_end)}
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                              <strong>📝 Тема:</strong> {c.topic}
                            </div>
                          </Card.Text>
                          <Alert variant={statusMsg.variant} style={{ fontSize: '14px', marginBottom: 0 }}>
                            {statusMsg.text}
                          </Alert>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}

                {confirmedConsultations.map(c => {
                  const parsed = parseNotes(c.notes);
                  const statusMsg = getStatusMessage(c.status);
                  return (
                    <Col md={6} key={c.id} className="mb-3">
                      <Card style={{ borderRadius: '15px', borderLeft: '4px solid #198754' }}>
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <Card.Title style={{ fontWeight: '600' }}>
                              Консультация с {c.consultant_name}
                            </Card.Title>
                            {getStatusBadge(c.status)}
                          </div>
                          <Card.Text>
                            <div style={{ marginBottom: '8px' }}>
                              <strong>👤 Клиент:</strong> {parsed.clientName}
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                              <strong>📞 Телефон:</strong> {parsed.clientPhone}
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                              <strong>📅 Дата:</strong> {formatDate(c.schedule_date)}
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                              <strong>🕐 Время:</strong> {formatTime(c.schedule_start)} - {formatTime(c.schedule_end)}
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                              <strong>📝 Тема:</strong> {c.topic}
                            </div>
                          </Card.Text>
                          <Alert variant={statusMsg.variant} style={{ fontSize: '14px', marginBottom: 0 }}>
                            {statusMsg.text}
                          </Alert>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}

                {pendingConsultations.length === 0 && confirmedConsultations.length === 0 && (
                  <Alert variant="info">Нет активных консультаций</Alert>
                )}
              </Row>
            </Tab>

            <Tab eventKey="history" title={`🏆 Завершенные (${completedConsultations.length})`}>
              <Row>
                {completedConsultations.length === 0 ? (
                  <Alert variant="info">Нет завершенных консультаций</Alert>
                ) : (
                  completedConsultations.map(c => {
                    const parsed = parseNotes(c.notes);
                    return (
                      <Col md={6} key={c.id} className="mb-3">
                        <Card style={{ borderRadius: '15px', borderLeft: '4px solid #0d6efd' }}>
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <Card.Title style={{ fontWeight: '600' }}>
                                Консультация с {c.consultant_name}
                              </Card.Title>
                              <Badge bg="primary" style={{ fontSize: '12px', padding: '8px 12px' }}>🏆 Завершена</Badge>
                            </div>
                            <Card.Text>
                              <div style={{ marginBottom: '8px' }}>
                                <strong>👤 Клиент:</strong> {parsed.clientName}
                              </div>
                              <div style={{ marginBottom: '8px' }}>
                                <strong>📅 Дата:</strong> {formatDate(c.schedule_date)}
                              </div>
                              <div style={{ marginBottom: '8px' }}>
                                <strong>🕐 Время:</strong> {formatTime(c.schedule_start)} - {formatTime(c.schedule_end)}
                              </div>
                              <div style={{ marginBottom: '8px' }}>
                                <strong>📝 Тема:</strong> {c.topic}
                              </div>
                            </Card.Text>
                            <Alert variant="primary" style={{ fontSize: '14px', marginBottom: 0 }}>
                              🏆 Консультация завершена! Спасибо за обращение
                            </Alert>
                          </Card.Body>
                        </Card>
                      </Col>
                    );
                  })
                )}
              </Row>
            </Tab>
          </Tabs>
        )}
      </Container>
    </div>
  );
};

export default MyConsultations;