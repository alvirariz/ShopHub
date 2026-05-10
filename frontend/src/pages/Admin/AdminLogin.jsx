import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/authService';
import '../Auth/Auth.css'; // Reusing the same auth CSS

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await login(email, password);
      const { token, user } = data;

      // Restrict this login portal to ONLY admins
      if (user.role !== 'admin') {
        setError('Access Denied. Only administrators can use this portal.');
        setLoading(false);
        return;
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userRole', user.role);

      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ background: '#fdf0f3' }}>
      <div className="auth-card" style={{ borderTop: '4px solid var(--color-primary)' }}>
        <h1 className="auth-title">Admin Portal</h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '24px' }}>
          Secure access for platform administrators.
        </p>
        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <input 
              type="email" 
              placeholder="Admin Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <input 
              type="password" 
              placeholder="Admin Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-btn" disabled={loading} style={{ background: '#111' }}>
            {loading ? 'Authenticating...' : 'Enter Admin Portal'}
          </button>
        </form>
      </div>
    </div>
  );
}
