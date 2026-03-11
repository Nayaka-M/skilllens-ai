import React, { useState } from 'react';
import axios from 'axios';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const { data } = await axios.post(`http://localhost:5000${url}`, formData);
      if (isLogin) {
        localStorage.setItem('skilllens_token', data.token);
        window.location.href = '/dashboard'; // Redirect to AI Tutor dashboard
      } else {
        alert("Registration success! Now please login.");
        setIsLogin(true);
      }
    } catch (err) {
      alert(err.response?.data?.error || "Check your connection.");
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>SkillLens AI {isLogin ? 'Login' : 'Register'}</h1>
      <form onSubmit={handleSubmit} style={{ display: 'inline-block', textAlign: 'left' }}>
        {!isLogin && (
          <input name="username" placeholder="Username" onChange={handleChange} required style={inputStyle} />
        )}
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required style={inputStyle} />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required style={inputStyle} />
        <button type="submit" style={btnStyle}>{isLogin ? 'Enter SkillLens' : 'Create Account'}</button>
      </form>
      <p onClick={() => setIsLogin(!isLogin)} style={{ cursor: 'pointer', color: '#007bff' }}>
        {isLogin ? "New to SkillLens? Register here." : "Already have an account? Login."}
      </p>
    </div>
  );
};

const inputStyle = { display: 'block', padding: '10px', margin: '10px 0', width: '250px' };
const btnStyle = { width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none' };

export default Auth;