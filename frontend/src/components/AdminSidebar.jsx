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
    window.location.href = '/admin/login'; // Redirect to admin login on logout
  };

  return (
    <aside className="sidebar" aria-label="Admin navigation">
      <div className="sidebar-logo">ShopHub Admin</div>

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
