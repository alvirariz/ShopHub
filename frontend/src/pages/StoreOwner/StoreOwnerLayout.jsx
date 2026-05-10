import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Package, ClipboardList, Inbox, BarChart3, LogOut, Menu, X } from 'lucide-react';
import '../../components/Sidebar.css'; // Reuse the sidebar styles

export default function StoreOwnerLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/store-owner', icon: LayoutDashboard },
    { name: 'My Products', path: '/store-owner/products', icon: Package },
    { name: 'Inventory', path: '/store-owner/inventory', icon: ClipboardList },
    { name: 'Orders', path: '/store-owner/orders', icon: Inbox },
    { name: 'Sales Report', path: '/store-owner/sales', icon: BarChart3 },
  ];

  return (
    <div className="app-layout">
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`} aria-label="Store Owner navigation">
        <div className="sidebar-header">
          <div className="sidebar-logo" style={{ display: 'flex', flexDirection: 'column' }}>
            {isCollapsed ? 'SH' : (
              <>
                ShopHub
                <span style={{ fontSize: '0.65rem', textShadow: 'none', color: '#c4566a', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '-4px' }}>Store Owner</span>
              </>
            )}
          </div>
          <button className="toggle-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/store-owner'}
              className={({ isActive }) =>
                `sidebar-nav-link${isActive ? ' active' : ''}`
              }
              title={isCollapsed ? item.name : ''}
            >
              <Icon size={20} />
              <span className="link-text">{item.name}</span>
            </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-divider" role="separator" />

        <div className="sidebar-bottom">
          <button
            onClick={handleLogout}
            className="sidebar-bottom-link"
            title={isCollapsed ? 'Logout' : ''}
          >
            <LogOut size={20} />
            <span className="link-text">Logout</span>
          </button>
        </div>
      </aside>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
