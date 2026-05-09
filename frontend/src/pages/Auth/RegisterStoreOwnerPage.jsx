import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerStoreOwner } from '../../services/authService';
import './Auth.css';

export default function RegisterStoreOwnerPage() {
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', storeName: '', businessType: '', address: '' 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = await registerStoreOwner(formData);
      setSuccess(data.message || 'Application submitted successfully!');
      setTimeout(() => navigate('/auth/login'), 3000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card store-owner-card">
        <h1 className="auth-title">Register as Store Owner</h1>
        {success ? (
          <div className="auth-success">
            {success}
            <p>Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-group">
              <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <input type="text" name="storeName" placeholder="Store Name" value={formData.storeName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <input type="text" name="businessType" placeholder="Business Type" value={formData.businessType} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <input type="text" name="address" placeholder="Business Address" value={formData.address} onChange={handleChange} required />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Submitting Application...' : 'Apply Now'}
            </button>
          </form>
        )}
        
        <div className="auth-footer">
          <p>Already have an account?</p>
          <div className="auth-links">
            <Link to="/auth/login">Login Here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
