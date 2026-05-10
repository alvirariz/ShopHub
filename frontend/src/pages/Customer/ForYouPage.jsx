import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addToCart } from '../../services/cartService';
import { addToWishlist } from '../../services/wishlistService';
import { browseProducts, searchProducts } from '../../services/productService';
import { getRecommendations } from '../../services/preferenceService';
import { useCompare } from '../../contexts/CompareContext';
import ToastNotification from '../../components/ToastNotification';
import './ForYouPage.css';

export default function ForYouPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [toast, setToast] = useState({ isVisible: false, message: '' });
  const { toggleCompare, isSelected } = useCompare();
  const navigate = useNavigate();

  const fetchProducts = async (searchQuery = '') => {
    try {
      setLoading(true);
      setError(null);
      let data;
      const userId = localStorage.getItem('userId');

      if (searchQuery) {
        data = await searchProducts(searchQuery);
      } else if (userId) {
        data = await getRecommendations(userId);
      } else {
        data = await browseProducts();
      }
      
      setProducts(data.recommendations || data.products || []);
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
      const userId = localStorage.getItem('userId');
      await addToCart(userId, product.id, 1);
      setToast({ isVisible: true, message: 'Added to cart! 🛒' });
      setTimeout(() => setToast({ isVisible: false, message: '' }), 2000);
    } catch (err) {
      alert('Failed to add item to cart: ' + (err.message || 'Unknown error'));
    } finally {
      setAddingToCart(null);
    }
  };

  const handleAddToWishlist = async (product, e) => {
    e.stopPropagation();
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        alert('Please log in to add to wishlist');
        return;
      }
      await addToWishlist(userId, product.id);
      setToast({ isVisible: true, message: 'Added to wishlist! ❤️' });
      setTimeout(() => setToast({ isVisible: false, message: '' }), 2000);
    } catch (err) {
      alert(err.message || 'Failed to add to wishlist');
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
      <div className="for-you-top-bar">
        <form className="search-form" onSubmit={handleSearch}>
          <input 
            type="text" 
            placeholder="Search products..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button type="submit" className="search-btn">Search</button>
        </form>
      </div>

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
                <button 
                  className="quick-wishlist-btn"
                  onClick={(e) => handleAddToWishlist(product, e)}
                  title="Add to Wishlist"
                >
                  ♡
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
      <ToastNotification isVisible={toast.isVisible} message={toast.message} />
    </div>
  );
}
