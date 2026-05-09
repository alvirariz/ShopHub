import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const NAV_ITEMS = [
  { label: 'Platform Monitor', path: '/admin/dashboard' },
  { label: 'Manage Users', path: '/admin/users' },
  { label: 'Store Applications', path: '/admin/applications' }
];

export default function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    navigate('/auth/login'); // Redirect to normal login on logout
  };

  return (
    <aside className="sidebar" aria-label="Admin navigation">
      <div className="sidebar-header">
        <div className="sidebar-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }} onClick={() => navigate('/admin/dashboard')}>
          <span>ShopHub</span>
          <span style={{ 
            fontSize: '1rem', 
            color: '#FF4D6D', 
            textShadow: 'none', 
            marginTop: '-4px',
            fontFamily: 'Inter, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            fontWeight: '600'
          }}>
            Admin
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ label, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `sidebar-nav-link${isActive ? ' active' : ''}`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-divider" role="separator" />

      <div className="sidebar-bottom">
        <button className="sidebar-bottom-link" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}
