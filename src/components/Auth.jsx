import React, { useState } from 'react';

const AuthView = ({ onLogin, theme, isDark }) => {
  const [mode, setMode] = useState('login'); // 'login', 'signup', or 'forgot'
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Endpoint logic based on mode
    const endpoint = mode === 'signup' ? 'signup' : 'login';
    
    // Simulate API Call (Replace with your fetch logic)
    try {
      const response = await fetch(`http://localhost:5000/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (data.id) {
        onLogin(data);
      } else {
        alert(data.error || "Authentication failed. Please check your credentials.");
      }
    } catch (err) {
      alert("Backend server not reached. Ensure server.js is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.authPage}>
      <div style={{...s.authCard, background: isDark ? '#111827' : '#ffffff'}}>
        {/* Header Section */}
        <div style={s.header}>
          <h1 style={s.logoText}>skillens-ai</h1>
          <p style={s.subText}>
            {mode === 'login' && "Welcome back! Please enter your details."}
            {mode === 'signup' && "Join the intelligence revolution today."}
            {mode === 'forgot' && "Enter your email to reset your access."}
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} style={s.form}>
          {mode === 'signup' && (
            <div style={s.inputGroup}>
              <label style={s.label}>Full Name</label>
              <input
                name="name"
                type="text"
                required
                style={{...s.input, ...theme.input}}
                placeholder="Enter your name"
                onChange={handleChange}
              />
            </div>
          )}

          <div style={s.inputGroup}>
            <label style={s.label}>Email Address</label>
            <input
              name="email"
              type="email"
              required
              style={{...s.input, ...theme.input}}
              placeholder="name@company.com"
              onChange={handleChange}
            />
          </div>

          {mode !== 'forgot' && (
            <div style={s.inputGroup}>
              <label style={s.label}>Password</label>
              <input
                name="password"
                type="password"
                required
                style={{...s.input, ...theme.input}}
                placeholder="••••••••"
                onChange={handleChange}
              />
            </div>
          )}

          <button type="submit" style={s.submitBtn} disabled={loading}>
            {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
          </button>
        </form>

        {/* Toggle Links */}
        <div style={s.footer}>
          {mode === 'login' ? (
            <>
              <p style={s.footerText}>Don't have an account? <span onClick={() => setMode('signup')} style={s.link}>Sign up</span></p>
              <p onClick={() => setMode('forgot')} style={s.link}>Forgot password?</p>
            </>
          ) : (
            <p style={s.footerText}>Already have an account? <span onClick={() => setMode('login')} style={s.link}>Log in</span></p>
          )}
        </div>
      </div>
    </div>
  );
};

// --- STYLES OBJECT ---
const s = {
  authPage: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    fontFamily: "'Inter', sans-serif"
  },
  authCard: {
    width: '400px',
    padding: '40px',
    borderRadius: '28px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    textAlign: 'center'
  },
  header: { marginBottom: '30px' },
  logoText: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#6366f1',
    margin: '0 0 10px 0',
    letterSpacing: '-1px'
  },
  subText: { fontSize: '14px', color: '#64748b', margin: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#64748b', marginLeft: '4px' },
  input: {
    padding: '14px 16px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    fontSize: '15px',
    outline: 'none',
    transition: 'all 0.2s ease'
  },
  submitBtn: {
    padding: '14px',
    background: '#6366f1',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'opacity 0.2s'
  },
  footer: { marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '10px' },
  footerText: { fontSize: '14px', color: '#64748b', margin: 0 },
  link: {
    color: '#6366f1',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'none',
    fontSize: '14px'
  }
};

export default AuthView;