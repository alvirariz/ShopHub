import React, { useState, useEffect } from 'react';
import { getMetrics } from '../../services/adminService';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, Legend, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './Admin.css';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [graphs, setGraphs] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await getMetrics();
        setMetrics(data.metrics);
        setGraphs(data.graphs);
        setRecentTransactions(data.recentTransactions || []);
      } catch (err) {
        setError(err.message || 'Failed to load metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) return <div className="loading-state">Loading dashboard...</div>;
  if (error) return <div className="error-state">Error: {error}</div>;
  if (!metrics) return null;

  return (
    <div className="admin-container admin-dashboard-page">
      <div className="admin-header dashboard-header">
        <div className="header-text">
          <h1>Platform Monitor</h1>
          <p>Real-time overview of system performance and key metrics</p>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <h3>Total Users</h3>
            <span className="metric-icon">👥</span>
          </div>
          <p className="metric-value">{metrics.totalUsers}</p>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <h3>Total Orders</h3>
            <span className="metric-icon">📦</span>
          </div>
          <p className="metric-value">{metrics.totalOrders}</p>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <h3>Total Products</h3>
            <span className="metric-icon">🛍️</span>
          </div>
          <p className="metric-value">{metrics.totalProducts}</p>
        </div>
        <div className="metric-card highlight-card">
          <div className="metric-header">
            <h3>Total Revenue</h3>
            <span className="metric-icon">💳</span>
          </div>
          <p className="metric-value">Rs {metrics.totalRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}</p>
        </div>
      </div>

      <div className="dashboard-content-grid">
        <div className="dashboard-left-col">
          <div className="details-card activity-card">
            <div className="card-header">
              <h3>Recent Activity (24H)</h3>
            </div>
            <div className="activity-list">
              <div className="activity-row">
                <span className="info-label">New Users</span>
                <span className="info-value">{metrics.recentUsers}</span>
              </div>
              <div className="activity-row">
                <span className="info-label">New Orders</span>
                <span className="info-value">{metrics.recentOrders}</span>
              </div>
              <div className="activity-row">
                <span className="info-label">Failed Logins</span>
                <span className="info-value">12</span>
              </div>
              <div className="activity-row">
                <span className="info-label">Flagged Content</span>
                <span className="info-value">3</span>
              </div>
            </div>
          </div>

          <div className="details-card status-card">
            <div className="card-header">
              <h3>System Status</h3>
            </div>
            <div className="status-display">
              <div className="status-badge-inline active" style={{ width: '100%', textAlign: 'center' }}>
                All Systems Normal
              </div>
            </div>
          </div>

          <div className="details-card" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="card-header">
              <h3>Recent Transactions</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table" style={{ minWidth: '100%', fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '8px', fontSize: '0.7rem' }}>Customer</th>
                    <th style={{ padding: '8px', fontSize: '0.7rem' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map(tx => (
                    <tr key={tx.id}>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ fontWeight: 600, color: '#2C181D' }}>{tx.customer?.name || 'Unknown'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#888' }}>
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px', fontWeight: 600, color: '#800020' }}>
                        Rs {tx.total?.toLocaleString() || '0'}
                      </td>
                    </tr>
                  ))}
                  {recentTransactions.length === 0 && (
                    <tr>
                      <td colSpan="2" style={{ padding: '12px 8px', textAlign: 'center', color: '#888' }}>No recent transactions</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="dashboard-right-col">
          {graphs && (
            <>
              <div className="details-card chart-card">
                <div className="card-header">
                  <h3>Revenue & Sales (Year to Date)</h3>
                </div>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={graphs.monthlySales} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#888' }} interval="preserveStartEnd" axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Line type="monotone" dataKey="sales" name="Total Orders" stroke="#2C181D" strokeWidth={3} dot={{ r: 4, fill: '#2C181D' }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="revenue" name="Revenue (Rs)" stroke="#C4566A" strokeWidth={3} dot={{ r: 4, fill: '#C4566A' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="details-card chart-card">
                <div className="card-header">
                  <h3>Order Volume (Last 10 Days)</h3>
                </div>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={graphs.recentActivity} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#888' }} interval="preserveStartEnd" axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: 'rgba(196, 86, 106, 0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="value" name="Orders" fill="#C4566A" radius={[4, 4, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="details-card chart-card">
                <div className="card-header">
                  <h3>User Demographics</h3>
                </div>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={graphs.userRoles}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {graphs.userRoles?.map((entry, index) => {
                           const colors = ['#C4566A', '#2C181D', '#800020'];
                           return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                        })}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
