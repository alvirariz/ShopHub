import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { browseProducts, searchProducts, filterProducts } from '../../services/productService';
import { addToCart } from '../../services/cartService';
import { useCompare } from '../../contexts/CompareContext';
import './BrowseProductsPage.css';

export default function BrowseProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Search & Filter State
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [addingToCart, setAddingToCart] = useState(null);
  const { toggleCompare, isSelected } = useCompare();
  
  const navigate = useNavigate();

  const fetchProducts = async (searchQuery = '', filterCategory = '') => {
    try {
      setLoading(true);
      setError('');
      let data;
      
      if (searchQuery) {
        data = await searchProducts(searchQuery);
      } else if (filterCategory) {
        data = await filterProducts(filterCategory);
      } else {
        data = await browseProducts();
      }

      setProducts(data.products || []);
    } catch (err) {
      setError(err.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(keyword, '');
    setCategory('');
  };

  const handleCategoryFilter = (selectedCategory) => {
    setCategory(selectedCategory);
    setKeyword('');
    fetchProducts('', selectedCategory);
  };

  const handleAddToCart = async (product, e) => {
    e.stopPropagation();
    try {
      setAddingToCart(product.id);
      const userId = localStorage.getItem('userId');
      await addToCart(userId, product.id, 1);
    } catch (err) {
      alert('Failed to add item to cart: ' + (err.message || 'Unknown error'));
    } finally {
      setAddingToCart(null);
    }
  };

  const handleCompareToggle = (e, product) => {
    e.stopPropagation();
    toggleCompare(product);
  };

  const formatPrice = (amount) => `RS ${Number(amount).toLocaleString('en-IN')}`;

  const categories = ['Electronics', 'Clothing', 'Home', 'Beauty', 'Sports'];

  return (
    <div className="browse-products-page">
      <div className="browse-header">
        <h1>Browse Products</h1>
        
        <form className="search-form" onSubmit={handleSearch}>
          <input 
            type="text" 
            placeholder="Search by name, brand..." 
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button type="submit" className="search-btn">Search</button>
        </form>
      </div>

      <div className="filters-bar">
        <button 
          className={`filter-pill ${category === '' ? 'active' : ''}`}
          onClick={() => handleCategoryFilter('')}
        >
          All
        </button>
        {categories.map(c => (
          <button 
            key={c}
            className={`filter-pill ${category === c ? 'active' : ''}`}
            onClick={() => handleCategoryFilter(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {loading && <div className="status-message">Loading products...</div>}
      {error && <div className="status-message error">{error}</div>}

      {!loading && !error && (
        <div className="products-grid">
          {products.map((product) => (
            <div 
              key={product.id} 
              className={`product-card ${isSelected(product.id) ? 'selected-for-compare' : ''}`}
              onClick={() => navigate(`/products/${product.id}`)}
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
          {products.length === 0 && <div className="status-message">No products found.</div>}
        </div>
      )}
    </div>
  );
}
