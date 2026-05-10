import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserDetails, updateUserStatus } from '../../services/adminService';
import './Admin.css';

export default function AdminUserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalConfig, setModalConfig] = useState(null);

  const fetchUserDetails = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUserDetails(id);
      setUser(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

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
      await updateUserStatus(userId, { action });
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
          <div className="header-left">
            <button className="btn-back" onClick={() => navigate('/admin/users')}>← Back</button>
            <h2>User Details: {user.name}</h2>
          </div>
        </div>

        <div className="user-details-content">
          <div className="details-card main-info-card">
            <div className="card-header">
              <h3>Account Information</h3>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">User ID</span>
                <span className="info-value">#{user.id}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Full Name</span>
                <span className="info-value">{user.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email Address</span>
                <span className="info-value">{user.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">System Role</span>
                <span className="info-value role-badge">{user.role}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Date Joined</span>
                <span className="info-value">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="details-card-row">
            <div className="details-card status-card">
              <div className="card-header">
                <h3>Current Status</h3>
              </div>
              <div className="status-display">
                <div className={`status-badge-inline ${user.isSuspended ? 'suspended' : 'active'}`}>
                  {user.isSuspended ? 'Account Suspended' : 'Account Active'}
                </div>
              </div>
              
              <div className="status-actions">
                {user.isSuspended ? (
                  <button 
                    className="btn-large btn-reactivate"
                    onClick={() => openModal(user.id, true)}
                  >
                    Reactivate User
                  </button>
                ) : (
                  <button 
                    className="btn-large btn-suspend-outline"
                    onClick={() => openModal(user.id, false)}
                  >
                    Suspend User
                  </button>
                )}
              </div>
            </div>

            <div className="details-card activity-card">
              <div className="card-header">
                <h3>Account Activity</h3>
              </div>
              <div className="activity-stats">
                <div className="stat-column">
                  <div className="info-item">
                    <span className="info-label">Total Orders</span>
                    <span className="info-value metric-large">{user.totalOrders}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Last Order Date</span>
                    <span className="info-value">{user.lastOrderDate ? new Date(user.lastOrderDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
                <div className="stat-column">
                  <div className="info-item">
                    <span className="info-label">Total Spent</span>
                    <span className="info-value metric-large">Rs {user.totalSpent?.toLocaleString() || 0}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Wishlist / Reviews</span>
                    <span className="info-value">{user.wishlistCount} / {user.reviewsCount}</span>
                  </div>
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
