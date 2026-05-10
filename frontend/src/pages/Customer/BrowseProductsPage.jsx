import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { browseProducts, searchProducts } from '../../services/productService';
import { addToCart } from '../../services/cartService';
import { addToWishlist } from '../../services/wishlistService';
import { useCompare } from '../../contexts/CompareContext';
import ToastNotification from '../../components/ToastNotification';
import './BrowseProductsPage.css';

export default function BrowseProductsPage() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Search & Filter State
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(true);

  const [addingToCart, setAddingToCart] = useState(null);
  const [toast, setToast] = useState({ isVisible: false, message: '' });
  const { toggleCompare, isSelected } = useCompare();
  
  const navigate = useNavigate();

  const fetchProducts = async (searchQuery = '') => {
    try {
      setLoading(true);
      setError('');
      let data;
      
      if (searchQuery) {
        data = await searchProducts(searchQuery);
      } else {
        data = await browseProducts();
      }

      setAllProducts(data.products || []);
    } catch (err) {
      setError(err.message || 'Failed to load products');
      setAllProducts([]);
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
    e.stopPropagation();
    try {
      setAddingToCart(product.id || product._id);
      const userId = localStorage.getItem('userId');
      await addToCart(userId, product.id || product._id, 1);
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
      await addToWishlist(userId, product.id || product._id);
      setToast({ isVisible: true, message: 'Added to wishlist! ❤️' });
      setTimeout(() => setToast({ isVisible: false, message: '' }), 2000);
    } catch (err) {
      alert(err.message || 'Failed to add to wishlist');
    }
  };

  const handleCompareToggle = (e, product) => {
    e.stopPropagation();
    toggleCompare(product);
  };

  const formatPrice = (amount) => `RS ${Number(amount).toLocaleString('en-IN')}`;

  const categories = ['Electronics', 'Clothing', 'Home', 'Beauty', 'Sports'];

  // Apply filters and sorting locally
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Category Filter
    if (category) {
      result = result.filter(p => p.category?.toLowerCase() === category.toLowerCase());
    }

    // Price Filter
    result = result.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);

    // Rating Filter
    if (minRating > 0) {
      result = result.filter(p => (p.rating || 0) >= minRating);
    }

    // In Stock Filter
    if (inStockOnly) {
      result = result.filter(p => p.stockQuantity > 0 || p.stock > 0);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'rating_desc':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
        default:
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });

    return result;
  }, [allProducts, category, priceRange, minRating, inStockOnly, sortBy]);

  return (
    <div className="browse-products-page">
      <div className="browse-header-tools">
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
      <div className="customer-banner-header">
        <h1>Browse Products</h1>
      </div>

      <div className="browse-layout">
        <aside className="filter-sidebar">
          <div className="filter-sidebar-header">
            <h2>Filters</h2>
            <button 
              className="toggle-filters-btn" 
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? '− Minimize' : '+ Expand'}
            </button>
          </div>
          
          {showFilters && (
            <div className="filter-content">
              <div className="sidebar-section">
                <h3>Sort By</h3>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Highest Rated</option>
            </select>
          </div>

          <div className="sidebar-section">
            <h3>Categories</h3>
            <div className="category-list">
              <button 
                className={`category-btn ${category === '' ? 'active' : ''}`}
                onClick={() => setCategory('')}
              >
                All Categories
              </button>
              {categories.map(c => (
                <button 
                  key={c}
                  className={`category-btn ${category === c ? 'active' : ''}`}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Price Range (RS)</h3>
            <div className="price-inputs">
              <input 
                type="number" 
                min="0" 
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) || 0 })}
                placeholder="Min"
              />
              <span>-</span>
              <input 
                type="number" 
                min="0" 
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) || 0 })}
                placeholder="Max"
              />
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Minimum Rating</h3>
            <div className="rating-filter">
              {[4, 3, 2, 1].map(star => (
                <label key={star} className="rating-label">
                  <input 
                    type="radio" 
                    name="rating" 
                    checked={minRating === star}
                    onChange={() => setMinRating(star)}
                  />
                  <span>{'★'.repeat(star)}{'☆'.repeat(5-star)} & Up</span>
                </label>
              ))}
              <label className="rating-label">
                <input 
                  type="radio" 
                  name="rating" 
                  checked={minRating === 0}
                  onChange={() => setMinRating(0)}
                />
                <span>Show All</span>
              </label>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Availability</h3>
            <label className="availability-label">
              <input 
                type="checkbox" 
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
              />
              <span>In Stock Only</span>
            </label>
          </div>
          
          <button 
            className="reset-filters-btn"
            onClick={() => {
              setCategory('');
              setPriceRange({ min: 0, max: 100000 });
              setMinRating(0);
              setInStockOnly(false);
              setSortBy('newest');
            }}
          >
            Reset Filters
          </button>
          </div>
          )}
        </aside>

        <main className="products-area">
          {loading && <div className="status-message">Loading products...</div>}
          {error && <div className="status-message error">{error}</div>}

          {!loading && !error && (
            <>
              <div className="results-count">
                Showing {filteredProducts.length} products
              </div>
              <div className="products-grid">
                {filteredProducts.map((product) => (
                  <div 
                    key={product.id || product._id} 
                    className={`product-card ${isSelected(product.id || product._id) ? 'selected-for-compare' : ''}`}
                    onClick={() => navigate(`/products/${product.id || product._id}`)}
                  >
                    <div className="product-image-container">
                      <img 
                        src={product.imageUrl || `https://picsum.photos/seed/${product.id || product._id}/300/300`} 
                        alt={product.name} 
                        className="product-image"
                      />
                      <button 
                        className={`compare-check-btn ${isSelected(product.id || product._id) ? 'checked' : ''}`}
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
                        disabled={addingToCart === (product.id || product._id) || (product.stockQuantity <= 0 && product.stock <= 0)}
                      >
                        {addingToCart === (product.id || product._id)
                          ? 'Adding...' 
                          : (product.stockQuantity <= 0 && product.stock <= 0)
                            ? 'Out of Stock' 
                            : 'Add To Cart'}
                      </button>
                    </div>
                  </div>
                ))}
                {filteredProducts.length === 0 && <div className="status-message">No products match your filters.</div>}
              </div>
            </>
          )}
        </main>
      </div>
      <ToastNotification isVisible={toast.isVisible} message={toast.message} />
    </div>
  );
}
