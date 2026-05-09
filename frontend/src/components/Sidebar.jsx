import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const NAV_ITEMS = [
  { label: 'For You Page', path: '/for-you' },
  { label: 'Browse Products', path: '/products' },
  { label: 'Shopping Cart', path: '/cart' },
  { label: 'My Wishlist', path: '/wishlist' },
  { label: 'Order History', path: '/orders' },
  { label: 'Notifications', path: '/notifications' },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const isLoggedIn = !!localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    window.location.href = '/for-you'; // Force reload to update nav state
  };

  return (
    <aside className="sidebar" aria-label="Main navigation">
      <div className="sidebar-logo">ShopHub</div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ label, path }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
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
        {!isLoggedIn ? (
          <button
            className="sidebar-bottom-link"
            onClick={() => navigate('/auth/login')}
          >
            Sign Up / Login
          </button>
        ) : (
          <button className="sidebar-bottom-link" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </aside>
  );
}
