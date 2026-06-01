import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import NavigationBar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ConsultantsList from './pages/ConsultantsList';
import ConsultantDetail from './pages/ConsultantDetail';
import MySchedule from './pages/MySchedule';
import MyConsultations from './pages/MyConsultations';
import Requests from './pages/Requests';

function App() {
  return (
    <Router>
      <NavigationBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/consultants" element={<ConsultantsList />} />
        <Route path="/consultants/:id" element={<ConsultantDetail />} />
        <Route path="/my-schedule" element={<MySchedule />} />
        <Route path="/my-consultations" element={<MyConsultations />} />
        <Route path="/requests" element={<Requests />} />
      </Routes>
    </Router>
  );
}

export default App;