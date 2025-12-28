import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PsychologistRegister from './pages/PsychologistRegister';
import PsychDashboard from './pages/PsychDashboard';
import LoginPage from './pages/Login';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register/psychologist" element={<PsychologistRegister />} />
          <Route path="/psych-dashboard" element={<PsychDashboard />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
