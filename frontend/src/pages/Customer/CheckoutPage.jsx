import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { routes } from '../../services/api';
import { getCart } from '../../services/cartService';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState(null);
  const [error, setError] = useState('');

  // Form State
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    address: '',
    city: '',
    zipCode: '',
    method: 'Standard',
  });

  const [paymentInfo, setPaymentInfo] = useState({
    method: 'Credit Card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  const userId = localStorage.getItem('userId') || '3';

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const data = await getCart(userId);
        if (!data.cartItems || data.cartItems.length === 0) {
          navigate('/cart'); // Redirect if cart is empty
        }
        setCart(data);
      } catch (err) {
        setError('Failed to load cart for checkout.');
      }
    };
    fetchCart();
  }, [userId, navigate]);

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentInfo((prev) => ({ ...prev, [name]: value }));
  };

  const proceedToPayment = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const submitOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Backend expects: userId, shippingAddress, shippingMethod
      const fullAddress = `${shippingInfo.fullName}, ${shippingInfo.address}, ${shippingInfo.city} ${shippingInfo.zipCode}`;
      
      await api.post(routes.orders.checkout, {
        userId: parseInt(userId),
        shippingAddress: fullAddress,
        shippingMethod: shippingInfo.method
      });
      
      setStep(3); // Success step
    } catch (err) {
      setError(err.message || 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount) => `RS ${Number(amount).toLocaleString('en-IN')}`;

  const calculateTotal = () => {
    if (!cart?.cartItems) return 0;
    return cart.cartItems.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );
  };

  if (error && step !== 3) {
    return <div className="checkout-error">{error}</div>;
  }

  return (
    <div className="checkout-page">
      {step < 3 && (
        <div className="checkout-header">
          <h1>Checkout</h1>
          <div className="step-indicator">
            <span className={step >= 1 ? 'active' : ''}>1. Shipping</span>
            <span className="separator">&gt;</span>
            <span className={step >= 2 ? 'active' : ''}>2. Payment</span>
          </div>
        </div>
      )}

      <div className="checkout-content">
        {step === 1 && (
          <form className="checkout-form" onSubmit={proceedToPayment}>
            <h2>Shipping Details</h2>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="fullName" required value={shippingInfo.fullName} onChange={handleShippingChange} />
            </div>
            <div className="form-group">
              <label>Street Address</label>
              <input type="text" name="address" required value={shippingInfo.address} onChange={handleShippingChange} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input type="text" name="city" required value={shippingInfo.city} onChange={handleShippingChange} />
              </div>
              <div className="form-group">
                <label>Zip Code</label>
                <input type="text" name="zipCode" required value={shippingInfo.zipCode} onChange={handleShippingChange} />
              </div>
            </div>
            <div className="form-group">
              <label>Shipping Method</label>
              <select name="method" value={shippingInfo.method} onChange={handleShippingChange}>
                <option value="Standard">Standard Delivery (3-5 days)</option>
                <option value="Express">Express Delivery (1-2 days)</option>
              </select>
            </div>
            <button type="submit" className="next-btn">Continue to Payment</button>
          </form>
        )}

        {step === 2 && (
          <form className="checkout-form" onSubmit={submitOrder}>
            <h2>Payment Details</h2>
            <div className="form-group">
              <label>Payment Method</label>
              <select name="method" value={paymentInfo.method} onChange={handlePaymentChange}>
                <option value="Credit Card">Credit Card / Mastercard</option>
                <option value="Cash on Delivery">Cash on Delivery</option>
              </select>
            </div>
            
            {paymentInfo.method === 'Credit Card' && (
              <>
                <div className="form-group">
                  <label>Card Number</label>
                  <input type="text" name="cardNumber" required value={paymentInfo.cardNumber} onChange={handlePaymentChange} placeholder="0000 0000 0000 0000" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input type="text" name="expiryDate" required value={paymentInfo.expiryDate} onChange={handlePaymentChange} placeholder="MM/YY" />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input type="text" name="cvv" required value={paymentInfo.cvv} onChange={handlePaymentChange} placeholder="123" />
                  </div>
                </div>
              </>
            )}

            <div className="form-actions">
              <button type="button" className="back-btn" onClick={() => setStep(1)}>Back</button>
              <button type="submit" className="place-order-btn" disabled={loading}>
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
            {error && <p className="error-text">{error}</p>}
          </form>
        )}

        {step === 3 && (
          <div className="success-container">
            <div className="success-icon">✓</div>
            <h2>Order Placed Successfully!</h2>
            <p>Thank you for your purchase. Your order is being processed.</p>
            <button className="continue-shopping-btn" onClick={() => navigate('/for-you')}>
              Continue Shopping
            </button>
          </div>
        )}

        {step < 3 && cart && (
          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="summary-items">
              {cart.cartItems.map(item => (
                <div key={item.id} className="summary-item">
                  <span>{item.quantity}x {item.product.name}</span>
                  <span>{formatPrice(item.quantity * item.product.price)}</span>
                </div>
              ))}
            </div>
            <div className="summary-total">
              <strong>Total</strong>
              <strong>{formatPrice(calculateTotal())}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
