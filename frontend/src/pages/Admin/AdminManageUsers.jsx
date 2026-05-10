import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUsers, updateUserStatus } from '../../services/adminService';
import './Admin.css';

export default function AdminManageUsers() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalConfig, setModalConfig] = useState(null);

  const fetchUsers = async (query = '') => {
    setLoading(true);
    try {
      const data = await getUsers(query);
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message || 'Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(searchQuery);
  };

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
      fetchUsers(searchQuery);
    } catch (err) {
      alert(err.message || `Failed to ${action} user`);
    } finally {
      closeModal();
    }
  };

  return (
    <>
      <div className="admin-container">
      <div className="admin-header">
        <h1>Manage User Accounts</h1>
        <p>Search and manage platform users</p>
      </div>

      <div className="admin-table-container">
        <div className="admin-table-header">
          <h2>User Directory</h2>
          <form onSubmit={handleSearch} className="admin-search-form">
            <input 
              type="text" 
              className="admin-search-input"
              placeholder="Search by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="admin-search-btn">Search</button>
          </form>
        </div>

        {loading ? (
          <div className="loading-state">Loading users...</div>
        ) : error ? (
          <div className="error-state">Error: {error}</div>
        ) : users.length === 0 ? (
          <div className="empty-state">No users found.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>
                    <Link to={`/admin/users/${user.id}`} className="admin-user-link">
                      <strong>{user.name}</strong>
                    </Link>
                  </td>
                  <td>{user.email}</td>
                  <td style={{textTransform: 'capitalize'}}>{user.role}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${user.isSuspended ? 'suspended' : 'active'}`}>
                      {user.isSuspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {user.isSuspended ? (
                        <button 
                          className="btn-small btn-reactivate"
                          onClick={() => openModal(user.id, true)}
                        >
                          Reactivate
                        </button>
                      ) : (
                        <button 
                          className="btn-small btn-suspend"
                          onClick={() => openModal(user.id, false)}
                        >
                          Suspend
                        </button>
                      )}
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
