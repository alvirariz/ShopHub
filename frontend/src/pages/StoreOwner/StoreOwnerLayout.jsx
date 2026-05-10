import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Package, ClipboardList, Inbox, BarChart3, LogOut, Menu, X } from 'lucide-react';

export default function StoreOwnerLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  // Starts expanded by default
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
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${
          isCollapsed ? 'w-16' : 'w-64'
        } bg-white flex flex-col transition-all duration-300 ease-in-out shrink-0 shadow-[2px_0_12px_rgba(0,0,0,0.02)] z-20 border-r border-slate-100`}
        aria-label="Store Owner navigation"
      >
        {/* Header */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-4 border-b border-slate-100 h-16`}>
          {!isCollapsed && (
            <div className="flex flex-col ml-2">
              <span className="font-extrabold text-xl tracking-wide text-[#800020] drop-shadow-[1px_1px_0px_#ff9ee0]">ShopHub</span>
              <span className="text-[10px] uppercase tracking-widest text-rose-500 font-semibold -mt-1">Store Owner</span>
            </div>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/store-owner'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm ${
                    isActive 
                      ? 'bg-[#FFF0F2] text-[#800020] shadow-[0_2px_8px_rgba(128,0,32,0.05)]' 
                      : 'text-slate-500 hover:bg-[#FFF0F2] hover:text-[#800020]'
                  } ${isCollapsed ? 'justify-center' : ''}`
                }
                title={isCollapsed ? item.name : ''}
              >
                <Icon size={20} className="shrink-0" />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-xl transition-all duration-200 font-medium text-sm text-slate-500 hover:bg-[#FFF0F2] hover:text-[#800020] ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title={isCollapsed ? 'Logout' : ''}
          >
            <LogOut size={20} className="shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
