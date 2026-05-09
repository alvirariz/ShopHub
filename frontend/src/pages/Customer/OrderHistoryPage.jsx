import React, { useState, useEffect } from 'react';
import api, { routes } from '../../services/api';
import './OrderHistoryPage.css';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trackingData, setTrackingData] = useState(null);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) {
        setError('Please log in to view your orders.');
        setLoading(false);
        return;
      }
      try {
        const response = await api.get(routes.orders.history(userId));
        setOrders(response.data.orders || []);
      } catch (err) {
        setError(err.message || 'Failed to load order history.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  const handleTrackOrder = async (orderId) => {
    try {
      const response = await api.get(routes.orders.track(orderId));
      setTrackingData(response.data);
    } catch (err) {
      alert(err.message || 'Failed to track order');
    }
  };

  const closeTrackingModal = () => {
    setTrackingData(null);
  };

  const formatPrice = (amount) => `RS ${Number(amount).toLocaleString('en-IN')}`;
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  if (loading) return <div className="orders-status">Loading orders...</div>;
  if (error) return <div className="orders-status error">{error}</div>;

  return (
    <div className="order-history-page">
      <h1 className="page-title">Order History</h1>

      {orders.length === 0 ? (
        <div className="empty-state">You haven't placed any orders yet.</div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div>
                  <span className="order-label">Order #{order.id}</span>
                  <span className="order-date">{formatDate(order.createdAt)}</span>
                </div>
                <div className={`order-status status-${order.status.toLowerCase()}`}>
                  {order.status.toUpperCase()}
                </div>
              </div>

              <div className="order-items">
                {order.items.map((item) => (
                  <div key={item.id} className="order-item-row">
                    <img 
                      src={item.product.imageUrl || `https://picsum.photos/seed/${item.productId}/80/80`} 
                      alt={item.product.name} 
                      className="order-item-img"
                    />
                    <div className="order-item-info">
                      <h4>{item.product.name}</h4>
                      <p>Qty: {item.quantity}</p>
                    </div>
                    <div className="order-item-price">
                      {formatPrice(item.price)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-footer">
                <div className="order-total">
                  Total: <strong>{formatPrice(order.total)}</strong>
                </div>
                <button 
                  className="track-btn"
                  onClick={() => handleTrackOrder(order.id)}
                >
                  Track Order
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {trackingData && (
        <div className="tracking-modal-overlay" onClick={closeTrackingModal}>
          <div className="tracking-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Tracking Information</h2>
              <button className="close-btn" onClick={closeTrackingModal}>&times;</button>
            </div>
            <div className="modal-body">
              <p><strong>Status:</strong> {trackingData.fulfillmentStatus.status.toUpperCase()}</p>
              <p><strong>Message:</strong> {trackingData.message}</p>
              
              {typeof trackingData.trackingInfo === 'string' ? (
                <div className="tracking-notice">{trackingData.trackingInfo}</div>
              ) : (
                <div className="tracking-details">
                  <p><strong>Shipping Method:</strong> {trackingData.trackingInfo.shippingMethod}</p>
                  <p><strong>Shipping Address:</strong> {trackingData.trackingInfo.shippingAddress}</p>
                  <p><strong>Est. Delivery:</strong> {formatDate(trackingData.trackingInfo.estimatedDelivery)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
