import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { routes } from '../../services/api';
import './Auth.css';

export default function RegisterCustomerPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [preferences, setPreferences] = useState({
    categories: [],
    priceRange: { min: 0, max: 50000 },
    brands: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registeredUserId, setRegisteredUserId] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCategoryToggle = (category) => {
    setPreferences(prev => {
      const isSelected = prev.categories.includes(category);
      if (isSelected) {
        return { ...prev, categories: prev.categories.filter(c => c !== category) };
      }
      return { ...prev, categories: [...prev.categories, category] };
    });
  };

  const handleBrandToggle = (brand) => {
    setPreferences(prev => {
      const isSelected = prev.brands.includes(brand);
      if (isSelected) {
        return { ...prev, brands: prev.brands.filter(b => b !== brand) };
      }
      return { ...prev, brands: [...prev.brands, brand] };
    });
  };

  const CATEGORIES = [
    "Electronics", "Clothing", "Home & Lifestyle",
    "Beauty", "Sports", "Books", "Groceries", "Toys"
  ];

  const BRANDS = [
    "Samsung", "Apple", "Nike", "Adidas", "H&M", "Zara", "Nestle", "IKEA"
  ];

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post(routes.auth.registerCustomer, formData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userRole', user.role);

      setRegisteredUserId(user.id);
      setStep(2); // Move to questionnaire
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      if (registeredUserId) {
        await api.post(routes.preferences.save(registeredUserId), {
          preferences: {
            categories: preferences.categories,
            priceRange: preferences.priceRange,
            brands: preferences.brands
          }
        });
      }
      navigate('/for-you');
    } catch (err) {
      console.error("Failed to save preferences:", err);
      navigate('/for-you');
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => {
    if (step === 1) return null;
    return (
      <div className="pref-progress">
        STEP {step - 1} OF 3
      </div>
    );
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={step >= 2 ? { maxWidth: '600px', padding: '3rem' } : {}}>
        {renderProgressBar()}

        {step === 1 && (
          <>
            <h1 className="auth-title">Register as Customer</h1>
            <form onSubmit={handleRegister} className="auth-form">
              <div className="form-group">
                <input 
                  type="text" 
                  name="name"
                  placeholder="Enter full name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <input 
                  type="email" 
                  name="email"
                  placeholder="Enter email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <input 
                  type="password" 
                  name="password"
                  placeholder="Enter password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              {error && <div className="auth-error">{error}</div>}

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>
            
            <div className="auth-footer">
              <p>Already have an account?</p>
              <div className="auth-links">
                <Link to="/auth/login">Login Here</Link>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="pref-step">
            <h1 className="pref-title">What do you usually shop for?</h1>
            <div className="pref-pills">
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  className={`pref-pill ${preferences.categories.includes(category) ? 'active' : ''}`}
                  onClick={() => handleCategoryToggle(category)}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="pref-navigation">
              <button className="pref-skip" onClick={() => setStep(3)}>Skip for now</button>
              <button className="pref-next" onClick={() => setStep(3)}>Next &rarr;</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="pref-step">
            <h1 className="pref-title">What's your typical budget per item?</h1>
            <div className="budget-slider-container">
              <div className="budget-values">
                <span>PKR {preferences.priceRange.min}</span>
                <span>PKR {preferences.priceRange.max === 50000 ? '50,000+' : preferences.priceRange.max}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="50000" 
                step="1000"
                value={preferences.priceRange.max}
                onChange={(e) => setPreferences({ ...preferences, priceRange: { ...preferences.priceRange, max: parseInt(e.target.value) } })}
                className="budget-slider"
              />
            </div>
            <div className="pref-navigation">
              <button className="pref-skip" onClick={() => setStep(4)}>Skip for now</button>
              <button className="pref-next" onClick={() => setStep(4)}>Next &rarr;</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="pref-step">
            <h1 className="pref-title">Any brands you love?</h1>
            <div className="pref-pills">
              {BRANDS.map(brand => (
                <button
                  key={brand}
                  className={`pref-pill ${preferences.brands.includes(brand) ? 'active' : ''}`}
                  onClick={() => handleBrandToggle(brand)}
                >
                  {brand}
                </button>
              ))}
            </div>
            <div className="pref-navigation">
              <button className="pref-skip" onClick={handlePreferencesSubmit} disabled={loading}>
                Skip for now
              </button>
              <button className="pref-next" onClick={handlePreferencesSubmit} disabled={loading}>
                {loading ? 'Saving...' : 'Finish!'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
