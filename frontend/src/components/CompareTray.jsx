import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCompare } from '../contexts/CompareContext';
import './CompareTray.css';

export default function CompareTray() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show the tray if we are already on the compare page, or if it's empty
  if (compareList.length === 0 || location.pathname === '/compare') {
    return null;
  }

  const handleGoToCompare = () => {
    if (compareList.length < 2) {
      alert('Please select at least 2 products to compare.');
      return;
    }
    const ids = compareList.map(p => p.id).join(',');
    navigate(`/compare?ids=${ids}`);
  };

  return (
    <div className="global-compare-tray">
      <div className="tray-content">
        <div className="tray-info">
          <span className="tray-count">{compareList.length}</span>
          <span className="tray-text">Product{compareList.length > 1 ? 's' : ''} Selected for Comparison</span>
        </div>
        
        <div className="tray-items">
          {compareList.map((product) => (
            <div key={product.id} className="tray-item">
              <img 
                src={product.imageUrl || `https://picsum.photos/seed/${product.id}/40/40`} 
                alt={product.name} 
              />
              <span className="tray-item-name">{product.name}</span>
              <button 
                className="tray-item-remove" 
                onClick={() => removeFromCompare(product.id)}
                title="Remove from comparison"
              >
                &times;
              </button>
            </div>
          ))}
        </div>

        <div className="tray-actions">
          <button className="tray-clear-btn" onClick={clearCompare}>Clear</button>
          <button 
            className="tray-compare-btn" 
            onClick={handleGoToCompare}
            disabled={compareList.length < 2}
          >
            Compare Now
          </button>
        </div>
      </div>
    </div>
  );
}
