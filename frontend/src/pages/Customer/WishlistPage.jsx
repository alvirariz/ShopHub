import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWishlist, removeFromWishlist } from '../../services/wishlistService';
import { addToCart } from '../../services/cartService';
import ToastNotification from '../../components/ToastNotification';
import './WishlistPage.css';

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ isVisible: false, message: '' });
  const navigate = useNavigate();

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!userId) {
        setError('Please log in to view your wishlist.');
        setLoading(false);
        return;
      }
      try {
        const data = await getWishlist(userId);
        setWishlistItems(data.items || []);
      } catch (err) {
        setError(err.message || 'Failed to load wishlist.');
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [userId]);

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(userId, productId);
      setWishlistItems(prev => prev.filter(item => item.productId !== productId));
    } catch (err) {
      alert(err.message || 'Failed to remove product from wishlist (Backend Bug Expected)');
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(userId, product.id, 1);
      setToast({ isVisible: true, message: 'Added to cart! 🛒' });
      setTimeout(() => setToast({ isVisible: false, message: '' }), 2000);
    } catch (err) {
      alert(err.message || 'Failed to add item to cart');
    }
  };

  const formatPrice = (amount) => `RS ${Number(amount).toLocaleString('en-IN')}`;

  if (loading) return <div className="wishlist-status">Loading wishlist...</div>;
  if (error) return <div className="wishlist-status error">{error}</div>;

  return (
    <div className="wishlist-page">
      <div className="customer-banner-header">
        <h1>My Wishlist</h1>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="empty-state">
          <h2>Your wishlist is empty</h2>
          <p>Explore our products and find something you love!</p>
          <button className="primary-btn" onClick={() => navigate('/products')}>Browse Products</button>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlistItems.map((item) => (
            <div key={item.id} className="wishlist-card">
              <div className="wishlist-image-container" onClick={() => navigate(`/products/${item.productId}`)}>
                <img 
                  src={item.product.imageUrl || `https://picsum.photos/seed/${item.productId}/300/300`} 
                  alt={item.product.name} 
                  className="wishlist-image"
                />
                <button 
                  className="remove-btn"
                  onClick={(e) => { e.stopPropagation(); handleRemove(item.productId); }}
                  title="Remove from wishlist"
                >
                  &times;
                </button>
              </div>
              <div className="wishlist-info">
                <h3 className="wishlist-title" onClick={() => navigate(`/products/${item.productId}`)}>
                  {item.product.name}
                </h3>
                <div className="wishlist-price">{formatPrice(item.product.price)}</div>
                <button 
                  className="add-to-cart-btn"
                  onClick={() => handleAddToCart(item.product)}
                  disabled={item.product.stock <= 0}
                >
                  {item.product.stock <= 0 ? 'Out of Stock' : 'Add To Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <ToastNotification isVisible={toast.isVisible} message={toast.message} />
    </div>
  );
}
