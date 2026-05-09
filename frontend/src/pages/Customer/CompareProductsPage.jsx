import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addToCart } from '../../services/cartService';
import { compareProducts } from '../../services/productService';
import { useCompare } from '../../contexts/CompareContext';
import './CompareProductsPage.css';

export default function CompareProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToCart, setAddingToCart] = useState(null);
  const { compareList, removeFromCompare } = useCompare();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompareProducts = async () => {
      if (!compareList || compareList.length === 0) {
        setError('No products selected for comparison.');
        setLoading(false);
        return;
      }
      try {
        const ids = compareList.map(p => p.id).join(',');
        const data = await compareProducts(ids);
        setProducts(data.products || []);
      } catch (err) {
        setError(err.message || 'Failed to load comparison data.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompareProducts();
  }, [compareList]);

  const handleAddToCart = async (product) => {
    try {
      setAddingToCart(product.id);
      const userId = localStorage.getItem('userId');
      await addToCart(userId, product.id, 1);
      alert('Added to cart!');
    } catch (err) {
      alert('Failed to add item to cart: ' + (err.message || 'Unknown error'));
    } finally {
      setAddingToCart(null);
    }
  };

  const handleRemove = (productId) => {
    removeFromCompare(productId);
    if (compareList.length <= 1) {
      navigate('/products');
    }
  };

  const formatPrice = (amount) => `RS ${Number(amount).toLocaleString('en-IN')}`;

  if (loading) return <div className="compare-status">Loading comparison...</div>;
  if (error) return <div className="compare-status error">{error}</div>;

  return (
    <div className="compare-products-page">
      <div className="compare-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h1>Compare Products</h1>
      </div>

      <div className="compare-table-container">
        <table className="compare-table">
          <thead>
            <tr>
              <th className="feature-col">Features</th>
              {products.map(product => (
                <th key={product.id} className="product-col">
                  <button className="remove-col-btn" onClick={() => handleRemove(product.id)}>&times;</button>
                  <img 
                    src={product.imageUrl || `https://picsum.photos/seed/${product.id}/150/150`} 
                    alt={product.name} 
                  />
                  <h3>{product.name}</h3>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="feature-col">Price</td>
              {products.map(product => (
                <td key={product.id} className="price-cell">{formatPrice(product.price)}</td>
              ))}
            </tr>
            <tr>
              <td className="feature-col">Rating</td>
              {products.map(product => (
                <td key={product.id}>
                  {'★'.repeat(Math.round(product.rating || 5))}{'☆'.repeat(5 - Math.round(product.rating || 5))}
                </td>
              ))}
            </tr>
            <tr>
              <td className="feature-col">Category</td>
              {products.map(product => (
                <td key={product.id}>{product.category}</td>
              ))}
            </tr>
            <tr>
              <td className="feature-col">Stock Status</td>
              {products.map(product => (
                <td key={product.id}>
                  {product.stock > 0 ? (
                    <span className="in-stock">In Stock ({product.stock})</span>
                  ) : (
                    <span className="out-of-stock">Out of Stock</span>
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <td className="feature-col">Description</td>
              {products.map(product => (
                <td key={product.id} className="desc-cell">{product.description}</td>
              ))}
            </tr>
            <tr>
              <td className="feature-col">Action</td>
              {products.map(product => (
                <td key={product.id}>
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => handleAddToCart(product)}
                    disabled={addingToCart === product.id || product.stock <= 0}
                  >
                    {addingToCart === product.id ? 'Adding...' : 'Add To Cart'}
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile view: Render as vertical product cards */}
      <div className="mobile-compare-cards">
        {products.map(product => (
          <div className="mobile-compare-card" key={product.id}>
            <button className="remove-card-btn" onClick={() => handleRemove(product.id)}>&times;</button>
            <div className="card-header">
              <img 
                src={product.imageUrl || `https://picsum.photos/seed/${product.id}/150/150`} 
                alt={product.name} 
              />
              <h3>{product.name}</h3>
            </div>
            
            <div className="feature-row">
              <span className="feature-label">Price</span>
              <span className="feature-value price-cell">{formatPrice(product.price)}</span>
            </div>
            
            <div className="feature-row">
              <span className="feature-label">Rating</span>
              <span className="feature-value">
                {'★'.repeat(Math.round(product.rating || 5))}{'☆'.repeat(5 - Math.round(product.rating || 5))}
              </span>
            </div>
            
            <div className="feature-row">
              <span className="feature-label">Category</span>
              <span className="feature-value">{product.category}</span>
            </div>
            
            <div className="feature-row">
              <span className="feature-label">Stock Status</span>
              <span className="feature-value">
                {product.stock > 0 ? (
                  <span className="in-stock">In Stock ({product.stock})</span>
                ) : (
                  <span className="out-of-stock">Out of Stock</span>
                )}
              </span>
            </div>
            
            <div className="feature-row">
              <span className="feature-label">Description</span>
              <span className="feature-value desc-cell">{product.description}</span>
            </div>
            
            <div className="card-actions">
              <button 
                className="add-to-cart-btn"
                onClick={() => handleAddToCart(product)}
                disabled={addingToCart === product.id || product.stock <= 0}
              >
                {addingToCart === product.id ? 'Adding...' : 'Add To Cart'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
