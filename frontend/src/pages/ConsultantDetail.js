import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge, Modal, Form } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ConsultantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [consultant, setConsultant] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [bookingData, setBookingData] = useState({
    client_name: '',
    client_phone: '',
    client_email: '',
    topic: '',
    notes: ''
  });

  useEffect(() => {
    fetchConsultant();
    fetchAvailableSlots();
  }, [id]);

  const fetchConsultant = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/consultants/${id}/`);
      setConsultant(response.data);
    } catch (error) {
      console.error('Ошибка загрузки консультанта:', error);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/schedules/');
      const filteredSlots = response.data.filter(slot => {
        return slot.consultant === parseInt(id) && !slot.is_booked;
      });
      setAvailableSlots(filteredSlots);
    } catch (error) {
      console.error('Ошибка загрузки расписания:', error);
    } finally {
      setLoading(false);
    }
  };

  const openBookingModal = (slot) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setMessageType('warning');
      setMessage('Сначала войдите в систему');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    setSelectedSlot(slot);
    setBookingData({
      client_name: localStorage.getItem('user_name') || '',
      client_phone: localStorage.getItem('user_phone') || '',
      client_email: localStorage.getItem('user_email') || '',
      topic: `Консультация с ${consultant?.user?.first_name || consultant?.user?.username}`,
      notes: ''
    });
    setShowModal(true);
  };

  const handleBookingSubmit = async () => {
    if (!bookingData.client_name.trim()) {
      alert('Введите ваше имя');
      return;
    }

    if (!bookingData.client_phone.trim()) {
      alert('Введите номер телефона');
      return;
    }

    setBooking(true);
    setShowModal(false);

    try {
      const token = localStorage.getItem('access_token');

      localStorage.setItem('user_name', bookingData.client_name);
      localStorage.setItem('user_phone', bookingData.client_phone);
      if (bookingData.client_email) localStorage.setItem('user_email', bookingData.client_email);

      const notes = `👤 Клиент: ${bookingData.client_name}\n📞 Телефон: ${bookingData.client_phone}\n📧 Email: ${bookingData.client_email || 'не указан'}\n📝 Тема: ${bookingData.topic}\n\n💬 Дополнительно:\n${bookingData.notes}`;

      await axios.post('http://localhost:8000/api/consultations/', {
        schedule: selectedSlot.id,
        topic: bookingData.topic,
        notes: notes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessageType('success');
      setMessage('✓ Консультация успешно забронирована! Эксперт свяжется с вами.');
      fetchAvailableSlots();

      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error('Ошибка:', error.response?.data);
      setMessageType('danger');
      setMessage(error.response?.data?.error || 'Ошибка при бронировании');
      setTimeout(() => setMessage(''), 4000);
    } finally {
      setBooking(false);
      setSelectedSlot(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Загрузка...</p>
      </Container>
    );
  }

  if (!consultant) {
    return (
      <Container className="text-center mt-5">
        <Alert variant="danger">Консультант не найден</Alert>
      </Container>
    );
  }

  // Группировка слотов по дате
  const groupedSlots = availableSlots.reduce((groups, slot) => {
    const date = slot.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(slot);
    return groups;
  }, {});

  return (
    <div style={{ background: '#f8f9fa', minHeight: 'calc(100vh - 70px)', padding: '40px 0' }}>
      <Container>
        {message && (
          <Alert variant={messageType} style={{ borderRadius: '15px', marginBottom: '30px' }}>
            {message}
          </Alert>
        )}

        <Row>
          <Col lg={4} className="mb-4">
            <Card style={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
              <div style={{
                height: '150px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '20px 20px 0 0',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  bottom: '-50px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '100px',
                  height: '100px',
                  background: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  boxShadow: '0 5px 20px rgba(0,0,0,0.2)'
                }}>
                  👨‍🏫
                </div>
              </div>
              <Card.Body style={{ paddingTop: '70px', textAlign: 'center' }}>
                <Card.Title style={{ fontSize: '24px', fontWeight: '700' }}>
                  {consultant.user?.first_name || consultant.user?.username}
                </Card.Title>
                <Card.Subtitle className="mb-3" style={{ color: '#667eea', fontSize: '16px' }}>
                  {consultant.specialization}
                </Card.Subtitle>

                <div style={{ marginBottom: '20px' }}>
                  <Badge bg="warning" style={{ fontSize: '14px', padding: '8px 15px' }}>
                    ⭐ {consultant.rating} / 5
                  </Badge>
                </div>

                <div style={{ textAlign: 'left', marginTop: '20px' }}>
                  <p><strong>📚 Опыт:</strong> {consultant.experience_years} лет</p>
                  <p><strong>💰 Цена:</strong> {consultant.hourly_rate} ₽ / час</p>
                  <p><strong>👥 Консультаций:</strong> {consultant.total_consultations}</p>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={8}>
            <Card style={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
              <Card.Body style={{ padding: '30px' }}>
                <h3 style={{ marginBottom: '20px', fontWeight: '700' }}>
                  📅 Доступное время для записи
                </h3>

                {availableSlots.length === 0 ? (
                  <Alert variant="info" style={{ borderRadius: '15px' }}>
                    Нет доступного времени для записи. Попробуйте позже.
                  </Alert>
                ) : (
                  Object.keys(groupedSlots).map(date => (
                    <div key={date} className="mb-4">
                      <h5 className="mb-3" style={{ color: '#667eea' }}>
                        📅 {formatDate(date)}
                      </h5>
                      <Row>
                        {groupedSlots[date].map((slot) => (
                          <Col md={6} key={slot.id} className="mb-3">
                            <Card style={{
                              borderRadius: '15px',
                              border: '1px solid #e0e0e0',
                              transition: 'transform 0.3s'
                            }}>
                              <Card.Body>
                                <div style={{ fontSize: '18px', marginBottom: '10px' }}>
                                  🕐 {slot.start_time.substring(0,5)} - {slot.end_time.substring(0,5)}
                                </div>
                                <Button
                                  variant="primary"
                                  onClick={() => openBookingModal(slot)}
                                  disabled={booking}
                                  style={{
                                    width: '100%',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: 'none',
                                    borderRadius: '10px',
                                    padding: '10px'
                                  }}
                                >
                                  {booking ? 'Бронирование...' : 'Записаться'}
                                </Button>
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  ))
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Модальное окно */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title style={{ fontWeight: '700' }}>📝 Запись на консультацию</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Ваше имя *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Введите ваше имя"
                value={bookingData.client_name}
                onChange={(e) => setBookingData({...bookingData, client_name: e.target.value})}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Номер телефона *</Form.Label>
              <Form.Control
                type="tel"
                placeholder="+7 (___) ___-__-__"
                value={bookingData.client_phone}
                onChange={(e) => setBookingData({...bookingData, client_phone: e.target.value})}
              />
              <Form.Text className="text-muted">
                Эксперт свяжется с вами по этому номеру
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email (необязательно)</Form.Label>
              <Form.Control
                type="email"
                placeholder="your@email.com"
                value={bookingData.client_email}
                onChange={(e) => setBookingData({...bookingData, client_email: e.target.value})}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Тема консультации</Form.Label>
              <Form.Control
                type="text"
                placeholder="Кратко опишите тему"
                value={bookingData.topic}
                onChange={(e) => setBookingData({...bookingData, topic: e.target.value})}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Дополнительная информация</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Что хотите обсудить? Какие вопросы?"
                value={bookingData.notes}
                onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
              />
            </Form.Group>

            {selectedSlot && (
              <Alert variant="info" className="mt-2">
                <strong>Выбранное время:</strong><br />
                📅 {formatDate(selectedSlot.date)}<br />
                🕐 {selectedSlot.start_time.substring(0,5)} - {selectedSlot.end_time.substring(0,5)}
              </Alert>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Отмена
          </Button>
          <Button
            variant="primary"
            onClick={handleBookingSubmit}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none'
            }}
          >
            Подтвердить запись
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ConsultantDetail;