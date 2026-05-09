import React, { useState, useEffect } from 'react';
import { apiRequest, routes } from '../../services/api';
import './Admin.css';

export default function AdminStoreApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalConfig, setModalConfig] = useState(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await apiRequest({
        url: routes.admin.applications,
        method: 'GET'
      });
      setApplications(data.applications || []);
    } catch (err) {
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const openModal = (applicationId, action) => {
    setModalConfig({ applicationId, action });
  };

  const closeModal = () => {
    setModalConfig(null);
  };

  const handleConfirmAction = async () => {
    if (!modalConfig) return;
    const { applicationId, action } = modalConfig;
    
    // Figma shows a simple confirmation without a rejection reason input field.
    // If you want to add a text input for reject reason later, you can add it to the modal.
    const rejectReason = action === 'reject' ? 'Rejected by admin' : null;

    try {
      await apiRequest({
        url: routes.admin.manageApplication(applicationId),
        method: 'PATCH',
        data: { action, rejectReason }
      });
      fetchApplications();
    } catch (err) {
      alert(err.message || `Failed to ${action} application`);
    } finally {
      closeModal();
    }
  };

  return (
    <>
      <div className="admin-container">
      <div className="admin-header">
        <h1>Store Applications</h1>
        <p>Review and manage new store owner applications</p>
      </div>

      <div className="admin-table-container">
        <div className="admin-table-header">
          <h2>Pending Applications</h2>
        </div>

        {loading ? (
          <div className="loading-state">Loading applications...</div>
        ) : error ? (
          <div className="error-state">Error: {error}</div>
        ) : applications.length === 0 ? (
          <div className="empty-state">No pending applications at this time.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Store Name</th>
                <th>Business Type</th>
                <th>Date Applied</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app.id}>
                  <td>
                    <strong>{app.storeName}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>
                      {app.address}
                    </div>
                  </td>
                  <td style={{textTransform: 'capitalize'}}>{app.businessType}</td>
                  <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${app.status.toLowerCase()}`}>
                      {app.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-small btn-approve"
                        onClick={() => openModal(app.id, 'approve')}
                      >
                        Approve
                      </button>
                      <button 
                        className="btn-small btn-reject"
                        onClick={() => openModal(app.id, 'reject')}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      </div>

      {modalConfig && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h2>{modalConfig.action === 'reject' ? 'Reject this store ?' : 'Approve this store ?'}</h2>
            <p>You are about to {modalConfig.action} this store</p>
            <div className="admin-modal-actions">
              <button className="btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="btn-confirm-action" onClick={handleConfirmAction}>
                Yes, {modalConfig.action === 'reject' ? 'Reject' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
