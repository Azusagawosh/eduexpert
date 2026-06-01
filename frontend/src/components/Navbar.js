import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const NavigationBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  // Проверка авторизации при загрузке и при изменении пути
  const checkAuth = () => {
    const token = localStorage.getItem('access_token');
    const type = localStorage.getItem('user_type');
    setIsAuthenticated(!!token);
    setUserType(type);
  };

  useEffect(() => {
    checkAuth();

    // Слушаем изменения в localStorage (для синхронизации между вкладками)
    window.addEventListener('storage', checkAuth);

    window.addEventListener('scroll', () => {
      setScrolled(window.scrollY > 50);
    });

    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, [location.pathname]); // Перепроверяем при смене страницы

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_type');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_phone');
    localStorage.removeItem('user_email');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <Navbar
      expand="lg"
      fixed="top"
      style={{
        background: scrolled ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.98)',
        backdropFilter: 'blur(10px)',
        boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.1)' : 'none',
        transition: 'all 0.3s ease',
        padding: '12px 0'
      }}
      variant="dark"
    >
      <Container>
        <Navbar.Brand as={Link} to="/" style={{ fontSize: '28px', fontWeight: '700' }}>
          <span style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Edu
          </span>
          <span style={{ color: '#fff' }}>Expert</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" style={{ fontSize: '16px', margin: '0 10px' }}>Главная</Nav.Link>
            <Nav.Link as={Link} to="/consultants" style={{ fontSize: '16px', margin: '0 10px' }}>Найти эксперта</Nav.Link>
            {isAuthenticated && userType === 'client' && (
              <Nav.Link as={Link} to="/my-consultations" style={{ fontSize: '16px', margin: '0 10px' }}>Мои занятия</Nav.Link>
            )}
            {isAuthenticated && userType === 'consultant' && (
              <>
                <Nav.Link as={Link} to="/my-schedule" style={{ fontSize: '16px', margin: '0 10px' }}>Мое расписание</Nav.Link>
                <Nav.Link as={Link} to="/requests" style={{ fontSize: '16px', margin: '0 10px' }}>Заявки</Nav.Link>
              </>
            )}
          </Nav>

          <Nav>
            {!isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/login">
                  <Button variant="outline-light" size="sm" style={{ borderRadius: '25px', padding: '8px 20px' }}>
                    Вход
                  </Button>
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  <Button size="sm" style={{
                    borderRadius: '25px',
                    padding: '8px 20px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none'
                  }}>
                    Регистрация
                  </Button>
                </Nav.Link>
              </>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <span style={{ color: 'white', fontSize: '14px' }}>
                  👤 {localStorage.getItem('user_name') || 'Пользователь'}
                </span>
                <Button variant="outline-light" onClick={handleLogout} size="sm" style={{ borderRadius: '25px', padding: '8px 20px' }}>
                  Выйти
                </Button>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;