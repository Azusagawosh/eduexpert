import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [consultants, setConsultants] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/consultants/')
      .then(res => setConsultants(res.data.slice(0, 6)))
      .catch(err => console.log(err));

    axios.get('http://localhost:8000/api/categories/')
      .then(res => setCategories(res.data.slice(0, 8)))
      .catch(err => console.log(err));
  }, []);

  return (
    <>
      {/* Hero секция */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '600px',
        display: 'flex',
        alignItems: 'center',
        marginTop: '-56px',
        paddingTop: '56px'
      }}>
        <Container style={{ textAlign: 'center', color: 'white', padding: '100px 0' }}>
          <h1 style={{ fontSize: '56px', fontWeight: '800', marginBottom: '20px' }}>
            Найди своего эксперта
          </h1>
          <p style={{ fontSize: '20px', marginBottom: '30px', opacity: 0.95 }}>
            Обучение с лучшими репетиторами и экспертами в любой области
          </p>
          <div>
            <Button as={Link} to="/consultants" size="lg" style={{
              background: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: '50px',
              padding: '12px 40px',
              fontWeight: '600',
              marginRight: '15px'
            }}>
              Найти эксперта
            </Button>
            <Button as={Link} to="/register" size="lg" variant="outline-light" style={{
              borderRadius: '50px',
              padding: '12px 40px',
              fontWeight: '600'
            }}>
              Стать экспертом
            </Button>
          </div>

          <Row style={{ marginTop: '80px' }}>
            <Col md={4}>
              <h3 style={{ fontSize: '36px', fontWeight: '700' }}>500+</h3>
              <p>Экспертов</p>
            </Col>
            <Col md={4}>
              <h3 style={{ fontSize: '36px', fontWeight: '700' }}>2000+</h3>
              <p>Учеников</p>
            </Col>
            <Col md={4}>
              <h3 style={{ fontSize: '36px', fontWeight: '700' }}>98%</h3>
              <p>Довольных клиентов</p>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Категории */}
      <Container style={{ padding: '80px 0' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '50px', fontSize: '36px', fontWeight: '700' }}>
          Популярные направления
        </h2>
        <Row>
          {categories.map(cat => (
            <Col md={3} key={cat.id} style={{ marginBottom: '20px' }}>
              <Card style={{
                border: 'none',
                borderRadius: '15px',
                boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
                transition: 'transform 0.3s',
                cursor: 'pointer',
                textAlign: 'center'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Card.Body style={{ padding: '30px' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    fontSize: '24px',
                    color: 'white'
                  }}>
                    📚
                  </div>
                  <Card.Title style={{ fontSize: '18px', fontWeight: '600' }}>{cat.name}</Card.Title>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Топ эксперты */}
      <Container style={{ background: '#f8f9fa', borderRadius: '30px', padding: '80px 40px', marginBottom: '80px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '50px', fontSize: '36px', fontWeight: '700' }}>
          Топ эксперты
        </h2>
        <Row>
          {consultants.map(c => (
            <Col md={4} key={c.id} style={{ marginBottom: '30px' }}>
              <Card style={{
                border: 'none',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s',
                overflow: 'hidden'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-10px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{
                  height: '120px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  position: 'relative'
                }}>
                  <div style={{
                    width: '100px',
                    height: '100px',
                    background: 'white',
                    borderRadius: '50%',
                    position: 'absolute',
                    bottom: '-50px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
                  }}>
                    👨‍🏫
                  </div>
                </div>
                <Card.Body style={{ paddingTop: '60px', textAlign: 'center' }}>
                  <Card.Title style={{ fontSize: '20px', fontWeight: '700' }}>
                    {c.user?.first_name || c.user?.username}
                  </Card.Title>
                  <Card.Subtitle style={{ color: '#667eea', marginBottom: '15px' }}>
                    {c.specialization}
                  </Card.Subtitle>
                  <Badge bg="warning" style={{ marginBottom: '15px' }}>
                    ⭐ {c.rating} / 5
                  </Badge>
                  <Card.Text>
                    <strong>{c.experience_years} лет опыта</strong><br />
                    от {c.hourly_rate} ₽ / час
                  </Card.Text>
                  <Button as={Link} to={`/consultants/${c.id}`} style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '25px',
                    padding: '10px 30px',
                    width: '100%'
                  }}>
                    Записаться
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* CTA секция */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '60px 0',
        textAlign: 'center',
        color: 'white'
      }}>
        <Container>
          <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>Готов начать обучение?</h2>
          <p style={{ fontSize: '18px', marginBottom: '30px' }}>Присоединяйся к сообществу EduExpert уже сегодня</p>
          <Button as={Link} to="/register" size="lg" style={{
            background: 'white',
            color: '#667eea',
            border: 'none',
            borderRadius: '50px',
            padding: '12px 40px',
            fontWeight: '600'
          }}>
            Начать сейчас
          </Button>
        </Container>
      </div>
    </>
  );
};

export default Home;