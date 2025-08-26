// src/pages/auth/register.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', formData); // Updated endpoint
      setSuccess(res.data.message || 'Registration successful');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      // Fixed: Check for both 'error' and 'message' fields
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      console.error('Registration error:', err.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Employee Registration</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            required
            value={formData.name}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            value={formData.email}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            value={formData.password}
            onChange={handleChange}
          />

          <input
            type="text"
            name="department"
            placeholder="Department"
            required
            value={formData.department}
            onChange={handleChange}
          />

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
        
        <p>
          Already have an account? 
          <button 
            type="button" 
            onClick={() => navigate('/login')}
            style={{ background: 'none', border: 'none', color: '#007bff', textDecoration: 'underline', cursor: 'pointer' }}
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;