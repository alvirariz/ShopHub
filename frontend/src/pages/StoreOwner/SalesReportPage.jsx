import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, ShoppingBag, Trophy, Calendar } from 'lucide-react';
import { getSales, getInsights } from '../../services/storeOwnerService';

export default function SalesReportPage() {
  const [data, setData] = useState({ sales: null, insights: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filter, setFilter] = useState('7');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (filter === 'custom') {
      if (startDate && endDate) {
        fetchReports();
      }
    } else {
      fetchReports();
    }
  }, [filter, startDate, endDate]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = filter === 'custom' ? { startDate, endDate } : { days: filter };

      const [salesData, insightsData] = await Promise.all([
        getSales(params),
        getInsights(params)
      ]);
      setData({
        sales: salesData || {},
        insights: insightsData || {}
      });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load sales report');
    } finally {
      setLoading(false);
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

  const { sales, insights } = data;
  const recentSales = Array.isArray(sales?.recentOrders) ? sales.recentOrders : [];
  const topProduct = insights?.topProduct || { name: 'N/A', sold: 0 };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="page-header">
        <h1>Sales & Insights</h1>
        <p>Detailed performance metrics for your store.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        {['7', '30', 'monthly', 'custom'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
              filter === f 
                ? 'bg-rose-50 text-rose-600 border-rose-200' 
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f === '7' ? '7 Days' : f === '30' ? '30 Days' : f === 'monthly' ? 'Monthly' : 'Custom'}
          </button>
        ))}

        {filter === 'custom' && (
          <div className="flex flex-wrap items-center gap-2 ml-0 sm:ml-4">
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-rose-300"
            />
            <span className="text-slate-400">to</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-rose-300"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Total Revenue */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div className="flex items-center gap-3 text-slate-500 font-medium mb-4">
            <TrendingUp size={20} className="text-rose-600" />
            Total Revenue
          </div>
          <div className="text-4xl font-bold text-slate-900">
            RS {sales?.totalRevenue?.toFixed(2) || '0.00'}
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div className="flex items-center gap-3 text-slate-500 font-medium mb-4">
            <ShoppingBag size={20} className="text-rose-400" />
            Total Orders
          </div>
          <div className="text-4xl font-bold text-slate-900">
            {sales?.totalOrders || 0}
          </div>
        </div>

        {/* Card 3: Top Selling Product */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div className="flex items-center gap-3 text-slate-500 font-medium mb-4">
            <Trophy size={20} className="text-rose-500" />
            Top Selling Product
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 line-clamp-1" title={topProduct.name}>
              {topProduct.name}
            </div>
            <div className="text-sm text-slate-500 mt-1">
              {topProduct.sold} units sold
            </div>
          </div>
        </div>
      </div>

      {/* Sales Breakdown Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar size={18} className="text-slate-400" />
            Recent Sales Breakdown
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="p-4 font-medium">Order ID</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700">
              {recentSales.length > 0 ? (
                recentSales.map(order => {
                  const id = order.id || order._id;
                  const dateObj = new Date(order.createdAt);
                  return (
                    <tr key={id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-mono text-slate-500">{id}</td>
                      <td className="p-4">
                        {isNaN(dateObj.getTime()) ? 'Unknown date' : dateObj.toLocaleDateString()}
                      </td>
                      <td className="p-4 capitalize">{order.status || 'unknown'}</td>
                      <td className="p-4 font-medium text-right">RS {order.total?.toFixed(2) || '0.00'}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">
                    No recent sales data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Insights Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 size={18} className="text-rose-500" />
            Customer Insights
          </h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 rounded-lg p-5 border border-slate-100">
            <h3 className="text-slate-500 text-sm font-medium mb-1">New Customers</h3>
            <div className="text-3xl font-bold text-slate-900">{insights?.newCustomers || 0}</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-5 border border-slate-100">
            <h3 className="text-slate-500 text-sm font-medium mb-1">Returning Customers</h3>
            <div className="text-3xl font-bold text-slate-900">{insights?.returningCustomers || 0}</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-5 border border-slate-100 md:col-span-2">
            <h3 className="text-slate-500 text-sm font-medium mb-3">Popular Categories</h3>
            <div className="flex flex-wrap gap-2">
              {insights?.popularCategories?.length > 0 ? (
                insights.popularCategories.map((cat, idx) => (
                  <span key={idx} className="bg-rose-50 text-rose-600 px-3 py-1.5 rounded-md text-sm font-medium">
                    {cat}
                  </span>
                ))
              ) : (
                <span className="text-slate-500 text-sm">Not enough data to determine popular categories yet.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
