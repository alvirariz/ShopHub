import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, ShoppingBag, ShoppingCart, Heart, Clock, Bell, Menu, X, LogIn, LogOut } from 'lucide-react';
import './Sidebar.css';

const NAV_ITEMS = [
  { label: 'For You Page', path: '/for-you', icon: Home },
  { label: 'Browse Products', path: '/products', icon: ShoppingBag },
  { label: 'Shopping Cart', path: '/cart', icon: ShoppingCart },
  { label: 'My Wishlist', path: '/wishlist', icon: Heart },
  { label: 'Order History', path: '/orders', icon: Clock },
  { label: 'Notifications', path: '/notifications', icon: Bell },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isLoggedIn = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    window.location.href = '/products'; // Force reload to update nav state and go to products
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`} aria-label="Main navigation">
      <div className="sidebar-header">
        <div className="sidebar-logo">ShopHub</div>
        <button className="toggle-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.filter(item => 
          isLoggedIn || ['Browse Products', 'Shopping Cart'].includes(item.label)
        ).map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `sidebar-nav-link${isActive ? ' active' : ''}`
            }
            title={isCollapsed ? label : ''}
          >
            <Icon size={20} />
            <span className="link-text">{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-divider" role="separator" />

      <div className="sidebar-bottom">
        {!isLoggedIn ? (
          <button
            className="sidebar-bottom-link"
            onClick={() => navigate('/auth/login')}
            title={isCollapsed ? 'Sign Up / Login' : ''}
          >
            <LogIn size={20} />
            <span className="link-text">Sign Up / Login</span>
          </button>
        ) : (
          <button className="sidebar-bottom-link" onClick={handleLogout} title={isCollapsed ? 'Logout' : ''}>
            <LogOut size={20} />
            <span className="link-text">Logout</span>
          </button>
        )}
      </div>
    </aside>
  );
}
