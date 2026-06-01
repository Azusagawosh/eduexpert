import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Alert, Row, Col, Badge, Spinner } from 'react-bootstrap';
import axios from 'axios';

const MySchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    date: '',
    start_time: '',
    end_time: ''
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await axios.get('http://localhost:8000/api/schedules/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSchedules(response.data);
    } catch (error) {
      console.error('Ошибка:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    try {
      await axios.post('http://localhost:8000/api/schedules/', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('✓ Время добавлено!');
      fetchSchedules();
      setShowForm(false);
      setFormData({ date: '', start_time: '', end_time: '' });
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Ошибка при добавлении');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('access_token');
    try {
      await axios.delete(`http://localhost:8000/api/schedules/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSchedules();
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 style={{ fontWeight: '700' }}>📅 Мое расписание</h1>
        <Button
          variant="primary"
          onClick={() => setShowForm(!showForm)}
          style={{ borderRadius: '25px' }}
        >
          {showForm ? '✖ Отмена' : '+ Добавить время'}
        </Button>
      </div>

      {message && <Alert variant="success">{message}</Alert>}

      {showForm && (
        <Card className="mb-4" style={{ borderRadius: '15px' }}>
          <Card.Body>
            <h5>Добавить время для консультаций</h5>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Дата</Form.Label>
                    <Form.Control
                      type="date"
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Время начала</Form.Label>
                    <Form.Control
                      type="time"
                      value={formData.start_time}
                      onChange={e => setFormData({...formData, start_time: e.target.value})}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Время окончания</Form.Label>
                    <Form.Control
                      type="time"
                      value={formData.end_time}
                      onChange={e => setFormData({...formData, end_time: e.target.value})}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Button type="submit" variant="success">Сохранить</Button>
            </Form>
          </Card.Body>
        </Card>
      )}

      <Row>
        {schedules.length === 0 ? (
          <Alert variant="info">У вас пока нет добавленного расписания</Alert>
        ) : (
          schedules.map(slot => (
            <Col md={4} key={slot.id} className="mb-3">
              <Card style={{ borderRadius: '15px' }}>
                <Card.Body>
                  <Badge bg={slot.is_booked ? 'danger' : 'success'} style={{ marginBottom: '10px' }}>
                    {slot.is_booked ? 'Занято' : 'Свободно'}
                  </Badge>
                  <h5>{slot.date}</h5>
                  <p>🕐 {slot.start_time.substring(0,5)} - {slot.end_time.substring(0,5)}</p>
                  {!slot.is_booked && (
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(slot.id)}>
                      Удалить
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

export default MySchedule;