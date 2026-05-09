import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import api, { routes } from '../../services/api';

export default function IncomingOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get(routes.orders.incoming);
      setOrders(response.data?.orders || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load incoming orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await api.put(routes.orders.updateStatus(orderId), { newStatus });
      
      // Update local state
      setOrders(orders.map(order => 
        (order.id === orderId || order._id === orderId) 
          ? { ...order, status: newStatus } 
          : order
      ));
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

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

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-slate-100 text-slate-800 rounded-lg shadow-sm">
          <ShoppingCart size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Incoming Orders</h1>
          <p className="text-slate-500 mt-1">Manage and update customer order statuses.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="p-4 font-medium">Order ID</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Items</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700">
              {orders.length > 0 ? (
                orders.map(order => {
                  const id = order.id || order._id;
                  return (
                    <tr key={id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-mono text-slate-500">{id}</td>
                      <td className="p-4">
                        <div className="font-medium text-slate-900">{order.customer?.name || 'Unknown'}</div>
                        <div className="text-slate-500 text-xs">{order.customer?.email || ''}</div>
                      </td>
                      <td className="p-4">{order.items?.length || 0} items</td>
                      <td className="p-4 font-medium">${order.total?.toFixed(2) || '0.00'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize
                          ${order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                            order.status === 'processing' ? 'bg-blue-100 text-blue-700' : 
                            order.status === 'confirmed' ? 'bg-indigo-100 text-indigo-700' : 
                            order.status === 'shipped' ? 'bg-purple-100 text-purple-700' : 
                            order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 
                            'bg-slate-100 text-slate-700'}`}>
                          {order.status || 'unknown'}
                        </span>
                      </td>
                      <td className="p-4">
                        <select 
                          className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-rose-500 focus:border-rose-500 block w-full p-2 disabled:opacity-50"
                          value={order.status || 'pending'}
                          onChange={(e) => handleStatusChange(id, e.target.value)}
                          disabled={updatingId === id}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    No incoming orders at the moment.
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
