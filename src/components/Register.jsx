import React, { useState } from 'react';

const Register = ({ onRegisterSuccess, toggleForm }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        onRegisterSuccess(data.user, data.token);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Backend Offline");
    }
  };

  return (
    <div className="auth-container">
      <h2>Create SkillLens Account</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input 
          type="text" placeholder="Full Name" 
          onChange={(e) => setFormData({...formData, name: e.target.value})} 
          required 
        />
        <input 
          type="email" placeholder="Email" 
          onChange={(e) => setFormData({...formData, email: e.target.value})} 
          required 
        />
        <input 
          type="password" placeholder="Password" 
          onChange={(e) => setFormData({...formData, password: e.target.value})} 
          required 
        />
        <button type="submit">Sign Up</button>
      </form>
      <p onClick={toggleForm} style={{ cursor: 'pointer', color: '#00ff41' }}>
        Already have an account? Log In
      </p>
    </div>
  );
};

export default Register;