import React, { useState, useEffect } from 'react';
import { getUserNotifications, markNotificationRead } from '../../services/notificationService';
import './NotificationsPage.css';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userId) {
        setError('Please log in to view notifications.');
        setLoading(false);
        return;
      }
      try {
        const data = await getUserNotifications(userId);
        setNotifications(data.notifications || []);
      } catch (err) {
        // Handle 404 or other errors
        if (err.status === 404) {
          setNotifications([]);
        } else {
          setError(err.message || 'Failed to load notifications.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userId]);

  const markAsRead = async (notificationId) => {
    try {
      await markNotificationRead(notificationId);
      setNotifications((prev) => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) return <div className="notifications-status">Loading notifications...</div>;
  if (error) return <div className="notifications-status error">{error}</div>;

  return (
    <div className="notifications-page">
      <h1 className="page-title">Notifications</h1>

      {notifications.length === 0 ? (
        <div className="empty-state">You have no new notifications.</div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`notification-card ${!notif.isRead ? 'unread' : ''}`}
            >
              <div className="notification-content">
                <div className="notification-icon">
                  {notif.type === 'order' ? '📦' : notif.type === 'system' ? '🔔' : '💬'}
                </div>
                <div className="notification-text">
                  <p>{notif.message}</p>
                  <span className="notification-date">{formatDate(notif.createdAt)}</span>
                </div>
              </div>
              
              {!notif.isRead && (
                <button 
                  className="mark-read-btn"
                  onClick={() => markAsRead(notif.id)}
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
