import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { routes } from '../../services/api';
import { addToCart } from '../../services/cartService';
import './ProductDetailsPage.css';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  
  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(routes.products.details(id));
        setProduct(response.data);
        
        // Fetch reviews
        try {
          const reviewsRes = await api.get(routes.reviews.byProduct(id));
          setReviews(reviewsRes.data.reviews || []);
        } catch (err) {
          console.error("Failed to fetch reviews", err);
          setReviews([]);
        }

      } catch (err) {
        setError(err.message || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => {
      const newQty = prev + delta;
      if (newQty < 1) return 1;
      if (product && newQty > product.stock) return product.stock;
      return newQty;
    });
  };

  const handleAddToCart = async () => {
    if (!product || product.stock < 1) return;
    
    try {
      setAddingToCart(true);
      const userId = localStorage.getItem('userId') || '3';
      await addToCart(userId, product.id, quantity);
      // Optional: Add a toast notification here
      alert('Added to cart successfully!');
    } catch (err) {
      alert('Failed to add item to cart: ' + (err.message || 'Unknown error'));
    } finally {
      setAddingToCart(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    setReviewError('');
    setReviewSuccess('');
    
    const customerId = localStorage.getItem('userId');
    if (!customerId) {
      setReviewError('You must be logged in to submit a review.');
      setSubmittingReview(false);
      return;
    }

    try {
      const payload = {
        customerId: parseInt(customerId),
        productId: parseInt(id),
        rating: parseInt(reviewForm.rating),
        title: reviewForm.title,
        body: reviewForm.body
      };
      
      const response = await api.post(routes.reviews.root, payload);
      setReviewSuccess('Review submitted successfully!');
      setReviews([response.data.review, ...reviews]);
      setReviewForm({ rating: 5, title: '', body: '' });
    } catch (err) {
      setReviewError(err.response?.data?.message || err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatPrice = (amount) => `RS ${Number(amount).toLocaleString('en-IN')}`;

  if (loading) return <div className="details-loading">Loading product...</div>;
  if (error) return <div className="details-error">{error}</div>;
  if (!product) return <div className="details-error">Product not found.</div>;

  return (
    <div className="product-details-page">
      <button className="back-button" onClick={() => navigate(-1)}>
        &larr; Back
      </button>

      <div className="product-details-container">
        <div className="product-image-section">
          <img 
            src={product.imageUrl || `https://picsum.photos/seed/${product.id}/600/600`} 
            alt={product.name} 
            className="main-product-image"
          />
        </div>

        <div className="product-info-section">
          <h1 className="product-title-large">{product.name}</h1>
          <p className="product-brand">{product.brand}</p>
          
          <div className="product-rating-large">
            {'★'.repeat(Math.round(product.rating || 5))}{'☆'.repeat(5 - Math.round(product.rating || 5))}
            <span className="review-count">({product.reviews?.length || 0} reviews)</span>
          </div>
          
          <h2 className="product-price-large">{formatPrice(product.price)}</h2>
          
          <div className="product-description">
            <p>{product.description || 'This is a beautiful product available exclusively at ShopHub.'}</p>
          </div>

          <div className="stock-status">
            {product.stock > 0 ? (
              <span className="in-stock">In Stock ({product.stock} available)</span>
            ) : (
              <span className="out-of-stock">Out of Stock</span>
            )}
          </div>

          <div className="cart-actions">
            <div className="quantity-selector">
              <button 
                onClick={() => handleQuantityChange(-1)} 
                disabled={quantity <= 1}
                className="qty-btn"
              >
                -
              </button>
              <span className="qty-display">{quantity}</span>
              <button 
                onClick={() => handleQuantityChange(1)} 
                disabled={quantity >= product.stock}
                className="qty-btn"
              >
                +
              </button>
            </div>

            <button 
              className="add-to-cart-large-btn"
              onClick={handleAddToCart}
              disabled={addingToCart || product.stock <= 0}
            >
              {addingToCart ? 'Adding...' : 'Add To Cart'}
            </button>
          </div>
        </div>
      </div>

      <div className="product-reviews-section">
        <h2>Customer Reviews</h2>
        
        <div className="reviews-container">
          <div className="reviews-list">
            {reviews.length === 0 ? (
              <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <div className="review-rating">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                    <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="review-title">{review.title}</h4>
                  <p className="review-body">{review.body}</p>
                </div>
              ))
            )}
          </div>

          <div className="review-form-container">
            <h3>Write a Review</h3>
            <form onSubmit={handleReviewSubmit} className="review-form">
              <div className="form-group">
                <label>Rating</label>
                <select 
                  value={reviewForm.rating} 
                  onChange={(e) => setReviewForm({...reviewForm, rating: e.target.value})}
                >
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
              <div className="form-group">
                <label>Title</label>
                <input 
                  type="text" 
                  value={reviewForm.title} 
                  onChange={(e) => setReviewForm({...reviewForm, title: e.target.value})}
                  required 
                  placeholder="Summarize your review"
                />
              </div>
              <div className="form-group">
                <label>Review</label>
                <textarea 
                  value={reviewForm.body} 
                  onChange={(e) => setReviewForm({...reviewForm, body: e.target.value})}
                  required 
                  placeholder="What did you like or dislike?"
                  rows="4"
                ></textarea>
              </div>

              {reviewError && <div className="review-error">{reviewError}</div>}
              {reviewSuccess && <div className="review-success">{reviewSuccess}</div>}

              <button type="submit" className="submit-review-btn" disabled={submittingReview}>
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
