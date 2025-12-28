import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerPsychologist, loginUser } from '../services/api';


const PsychologistRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!formData.username || !formData.password) {
    alert('Please fill username and password');
    return;
  }

  try {
    const registerResult = await registerPsychologist(formData);
    
    if (registerResult.success) {
      console.log('Register successful, attempting auto-login...');
      
      const loginResult = await loginUser({
        username: formData.username,
        password: formData.password
      });
      
      if (loginResult.success) {
        localStorage.setItem('token', loginResult.token);
        localStorage.setItem('userRole', loginResult.role); 
        localStorage.setItem('userData', JSON.stringify(loginResult.userData));
        
        console.log('Auto-login successful, redirecting to dashboard...');
        
        navigate('/dashboard');
      } else {
        console.warn('Auto-login failed:', loginResult.message);
        alert('Account created! Please log in manually.');
        navigate('/login');
      }
    } else {
      alert(registerResult.message);
    }
  } catch (error) {
    console.error('Registration error:', error);
    alert('Error: ' + error.message);
  }
};

  return (
    <div className="register-container">
      <h2>Create your professional account</h2>
      
      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-group">
          <label>Username *</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            placeholder="Choose a username"
          />
        </div>
        
        <div className="form-group">
          <label>Password *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Choose a password"
          />
        </div>
        
        <div className="name-group">
          <div className="form-group">
            <label>First Name *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              placeholder='Enter your first name'
            />
          </div>
          
          <div className="form-group">
            <label>Last Name *</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              placeholder='Enter your last name'

            />
          </div>
        </div>
        
        <div className="form-buttons">
          <button type="submit" className="glass-btn submit-btn">
            Register
          </button>
          <button 
            type="button" 
            className="glass-btn cancel-btn"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>
      </form>
      
      <div className="login-link">
        <p>Already have an account? <span onClick={() => navigate('/login')}>Log in here</span></p>
      </div>
    </div>
  );
};

export default PsychologistRegister;