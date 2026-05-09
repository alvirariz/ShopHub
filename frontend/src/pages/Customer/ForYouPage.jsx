import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { routes } from '../../services/api';
import { addToCart } from '../../services/cartService';
import { useCompare } from '../../contexts/CompareContext';
import './ForYouPage.css';

export default function ForYouPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(null);
  const [keyword, setKeyword] = useState('');
  const { toggleCompare, isSelected } = useCompare();
  const navigate = useNavigate();

  const fetchProducts = async (searchQuery = '') => {
    try {
      setLoading(true);
      setError(null);
      let endpoint = routes.products.browse;
      let params = {};
      
      const userId = localStorage.getItem('userId');

      if (searchQuery) {
        endpoint = routes.products.search;
        params.keyword = searchQuery;
      } else if (userId) {
        endpoint = routes.preferences.recommendations(userId);
      }
      
      const response = await api.get(endpoint, { params });
      
      // The recommendations endpoint returns `{ recommendations: [] }`
      // The browse/search endpoint returns `{ products: [] }`
      setProducts(response.data.recommendations || response.data.products || []);
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(keyword);
  };

  const handleAddToCart = async (product, e) => {
    e.stopPropagation(); // Prevent navigating to details page
    try {
      setAddingToCart(product.id);
      const userId = localStorage.getItem('userId') || '3';
      await addToCart(userId, product.id, 1);
      // Show success feedback if needed
    } catch (err) {
      alert('Failed to add item to cart: ' + (err.message || 'Unknown error'));
    } finally {
      setAddingToCart(null);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  const handleCompareToggle = (e, product) => {
    e.stopPropagation();
    toggleCompare(product);
  };

  const formatPrice = (amount) => `RS ${Number(amount).toLocaleString('en-IN')}`;

  return (
    <div className="for-you-page">
      <form className="search-bar-container" onSubmit={handleSearch}>
        <input 
          type="text" 
          className="search-input" 
          placeholder="Search Shophub..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </form>

      <div className="for-you-header">
        <h1>FOR YOU:</h1>
      </div>

      {loading && <div className="loading-state">Loading products...</div>}
      {error && <div className="error-state">{error}</div>}

      {!loading && !error && (
        <div className="products-grid">
          {products.map((product) => (
            <div 
              key={product.id} 
              className={`product-card ${isSelected(product.id) ? 'selected-for-compare' : ''}`}
              onClick={() => handleProductClick(product.id)}
            >
              <div className="product-image-container">
                <img 
                  src={product.imageUrl || `https://picsum.photos/seed/${product.id}/300/300`} 
                  alt={product.name} 
                  className="product-image"
                />
                <button 
                  className={`compare-check-btn ${isSelected(product.id) ? 'checked' : ''}`}
                  onClick={(e) => handleCompareToggle(e, product)}
                  title="Select for comparison"
                >
                  ✓ Compare
                </button>
              </div>
              <div className="product-info">
                <h3 className="product-title">{product.name}</h3>
                <div className="product-rating">
                  {'★'.repeat(Math.round(product.rating || 5))}{'☆'.repeat(5 - Math.round(product.rating || 5))}
                </div>
                <div className="product-price">{formatPrice(product.price)}</div>
                <button 
                  className="add-to-cart-btn"
                  onClick={(e) => handleAddToCart(product, e)}
                  disabled={addingToCart === product.id || product.stock <= 0}
                >
                  {addingToCart === product.id 
                    ? 'Adding...' 
                    : product.stock <= 0 
                      ? 'Out of Stock' 
                      : 'Add To Cart'}
                </button>
              </div>
            </div>
          ))}
          {products.length === 0 && <div className="no-products">No products available at the moment.</div>}
        </div>
      )}
    </div>
  );
}
