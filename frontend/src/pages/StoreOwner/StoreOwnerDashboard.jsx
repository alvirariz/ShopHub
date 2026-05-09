import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, DollarSign, TrendingUp, Clock } from 'lucide-react';
import api, { routes } from '../../services/api';

export default function StoreOwnerDashboard() {
  const [data, setData] = useState({
    lowStock: [],
    incomingOrders: [],
    sales: { totalRevenue: 0, totalOrders: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userName = localStorage.getItem('userName') || 'Store Owner';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [lowStockRes, ordersRes, salesRes] = await Promise.all([
          api.get(routes.products.lowStock),
          api.get(routes.orders.incoming),
          api.get(routes.storeOwner.sales)
        ]);

        setData({
          lowStock: lowStockRes.data?.products || [],
          incomingOrders: ordersRes.data?.orders || [],
          sales: salesRes.data || { totalRevenue: 0, totalOrders: 0 }
        });
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-500 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      </div>
    );
  }

  const recentOrders = [...data.incomingOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Welcome back 👋 {userName}</h1>
        <p className="text-slate-500 mt-2">Here is what's happening with your store today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card 1 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium">Low Stock Items</h3>
            <div className="p-2 bg-rose-100 text-rose-500 rounded-lg">
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900">{data.lowStock.length}</div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium">Incoming Orders</h3>
            <div className="p-2 bg-slate-100 text-slate-500 rounded-lg">
              <Package size={20} />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900">{data.incomingOrders.length}</div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium">Total Revenue</h3>
            <div className="p-2 bg-emerald-100 text-emerald-500 rounded-lg">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900">
            ${data.sales.totalRevenue?.toFixed(2) || '0.00'}
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium">Total Sales</h3>
            <div className="p-2 bg-blue-100 text-blue-500 rounded-lg">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900">{data.sales.totalOrders || 0}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center gap-2">
          <Clock className="text-rose-500" size={20} />
          <h2 className="text-lg font-bold text-slate-900">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="p-4 font-medium">Order ID</th>
                <th className="p-4 font-medium">Items Count</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700">
              {recentOrders.length > 0 ? (
                recentOrders.map(order => {
                  const id = order.id || order._id;
                  return (
                    <tr key={id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-mono text-slate-500">{id}</td>
                      <td className="p-4">{order.items?.length || 0} items</td>
                      <td className="p-4 font-medium">${order.totalAmount?.toFixed(2) || '0.00'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize
                          ${order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                            order.status === 'processing' ? 'bg-blue-100 text-blue-700' : 
                            order.status === 'shipped' ? 'bg-indigo-100 text-indigo-700' : 
                            order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 
                            'bg-slate-100 text-slate-700'}`}>
                          {order.status || 'unknown'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">
                    No recent orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
