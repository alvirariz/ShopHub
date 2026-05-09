import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiRequest, routes } from '../../services/api';
import './Admin.css';

export default function AdminUserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalConfig, setModalConfig] = useState(null);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const data = await apiRequest({
        url: routes.admin.userDetails(id),
        method: 'GET'
      });
      setUser(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const openModal = (userId, currentStatus) => {
    setModalConfig({ userId, currentStatus });
  };

  const closeModal = () => {
    setModalConfig(null);
  };

  const handleConfirmAction = async () => {
    if (!modalConfig) return;
    const { userId, currentStatus } = modalConfig;
    const action = currentStatus ? 'reactivate' : 'suspend';

    try {
      await apiRequest({
        url: routes.admin.userStatus(userId),
        method: 'PATCH',
        data: { action }
      });
      fetchUserDetails();
    } catch (err) {
      alert(err.message || `Failed to ${action} user`);
    } finally {
      closeModal();
    }
  };

  if (loading) return <div className="admin-container"><div className="loading-state">Loading user details...</div></div>;
  if (error) return <div className="admin-container"><div className="error-state">Error: {error}</div></div>;
  if (!user) return <div className="admin-container"><div className="empty-state">User not found</div></div>;

  return (
    <>
      <div className="admin-container admin-user-details-page">
        <div className="user-details-header">
          <button className="btn-back" onClick={() => navigate('/admin/users')}>Back</button>
          <h2>User Details: {user.name}</h2>
        </div>

        <div className="user-details-content">
          <div className="details-card">
            <h3>ACCOUNT INFORMATION</h3>
            <p><strong>User ID:</strong> #{user.id}</p>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> <span style={{ textTransform: 'capitalize' }}>{user.role}</span></p>
            <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
            <p><strong>Last Login:</strong> N/A</p>
          </div>

          <div className="details-card-row">
            <div className="details-card status-card">
              <h3>Current Status:</h3>
              <div className={`status-badge-large ${user.isSuspended ? 'suspended' : 'active'}`}>
                {user.isSuspended ? 'Suspended' : 'Active'}
              </div>
              
              {user.isSuspended ? (
                <button 
                  className="btn-large btn-reactivate"
                  onClick={() => openModal(user.id, true)}
                >
                  Reactivate User
                </button>
              ) : (
                <button 
                  className="btn-large btn-suspend"
                  onClick={() => openModal(user.id, false)}
                >
                  Suspend User
                </button>
              )}
            </div>

            <div className="details-card activity-card">
              <h3>ACCOUNT ACTIVITY</h3>
              <div className="activity-stats">
                <div className="stat-column">
                  <p><strong>Total Orders:</strong> {user.totalOrders}</p>
                  <p><strong>Last Order:</strong> {user.lastOrderDate ? new Date(user.lastOrderDate).toLocaleDateString() : 'Never'}</p>
                  <p><strong>Wishlist:</strong> {user.wishlistCount} items</p>
                </div>
                <div className="stat-column">
                  <p><strong>Total Spent:</strong> Rs {user.totalSpent?.toLocaleString() || 0}</p>
                  <p><strong>Reviews:</strong> {user.reviewsCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {modalConfig && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h2>{modalConfig.currentStatus ? 'Reactivate User ?' : 'Suspend User ?'}</h2>
            <p>You are about to {modalConfig.currentStatus ? 'reactivate' : 'suspend'} this user</p>
            <div className="admin-modal-actions">
              <button className="btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="btn-confirm-action" onClick={handleConfirmAction}>
                Yes, {modalConfig.currentStatus ? 'Reactivate' : 'Suspend'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
