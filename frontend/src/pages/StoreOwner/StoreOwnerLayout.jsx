import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../components/Sidebar.css'; // Reuse the sidebar styles

export default function StoreOwnerLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/store-owner' },
    { name: 'My Products', path: '/store-owner/products' },
    { name: 'Inventory', path: '/store-owner/inventory' },
    { name: 'Orders', path: '/store-owner/orders' },
    { name: 'Sales Report', path: '/store-owner/sales' },
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar" aria-label="Store Owner navigation">
        <div className="sidebar-logo">ShopHub</div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/store-owner'}
              className={({ isActive }) =>
                `sidebar-nav-link${isActive ? ' active' : ''}`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-divider" role="separator" />

        <div className="sidebar-bottom">
          <button
            onClick={handleLogout}
            className="sidebar-bottom-link"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
