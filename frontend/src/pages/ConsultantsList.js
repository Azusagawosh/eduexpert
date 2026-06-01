import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ConsultantsList = () => {
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8000/api/consultants/')
      .then(res => setConsultants(res.data))
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredConsultants = consultants.filter(consultant =>
    consultant.specialization?.toLowerCase().includes(search.toLowerCase()) ||
    consultant.user?.username?.toLowerCase().includes(search.toLowerCase()) ||
    consultant.user?.first_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Загрузка экспертов...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h1 className="text-center mb-4" style={{ fontWeight: '700' }}>Наши эксперты</h1>

      <Form className="mb-5" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <Form.Control
          type="text"
          placeholder="🔍 Поиск по специализации или имени..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ borderRadius: '50px', padding: '12px 20px' }}
        />
      </Form>

      {filteredConsultants.length === 0 ? (
        <div className="text-center mt-5">
          <h4>Ничего не найдено</h4>
          <p>Попробуйте изменить поисковый запрос</p>
        </div>
      ) : (
        <Row>
          {filteredConsultants.map((consultant) => (
            <Col md={6} lg={4} xl={3} key={consultant.id} className="mb-4">
              <Card className="h-100" style={{
                borderRadius: '15px',
                border: 'none',
                boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
                transition: 'transform 0.3s, box-shadow 0.3s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 5px 20px rgba(0,0,0,0.08)';
              }}>
                <Card.Body>
                  <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '15px' }}>👨‍🏫</div>
                  <Card.Title className="text-center" style={{ fontSize: '18px', fontWeight: '700' }}>
                    {consultant.user?.first_name || consultant.user?.username}
                  </Card.Title>
                  <Card.Subtitle className="text-center mb-3" style={{ color: '#667eea', fontSize: '14px' }}>
                    {consultant.specialization?.substring(0, 50)}
                  </Card.Subtitle>

                  <div className="text-center mb-3">
                    <Badge bg="warning" style={{ fontSize: '12px' }}>⭐ {consultant.rating} / 5</Badge>
                  </div>

                  <Card.Text style={{ fontSize: '14px' }}>
                    <strong>📚 Опыт:</strong> {consultant.experience_years} лет<br />
                    <strong>💰 Цена:</strong> {consultant.hourly_rate} ₽/час<br />
                    <strong>👥 Консультаций:</strong> {consultant.total_consultations}
                  </Card.Text>

                  <div className="text-center">
                    <Badge bg={consultant.is_available ? 'success' : 'danger'} style={{ marginBottom: '15px' }}>
                      {consultant.is_available ? '✓ Доступен' : '✗ Недоступен'}
                    </Badge>
                  </div>

                  <Button
                    as={Link}
                    to={`/consultants/${consultant.id}`}
                    variant="primary"
                    className="w-100"
                    disabled={!consultant.is_available}
                    style={{
                      background: consultant.is_available ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#6c757d',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '10px'
                    }}
                  >
                    {consultant.is_available ? 'Записаться' : 'Недоступен'}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default ConsultantsList;