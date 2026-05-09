import React, { useState, useEffect } from 'react';
import { apiRequest, routes } from '../../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Admin.css';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [graphs, setGraphs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await apiRequest({
          url: routes.admin.metrics,
          method: 'GET'
        });
        setMetrics(data.metrics);
        setGraphs(data.graphs);
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
    <div className="admin-container">
      <div className="admin-header">
        <h1>Platform Monitor</h1>
        <p>Overview of system performance and key metrics</p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Total Users</h3>
          <p className="metric-value">{metrics.totalUsers}</p>
        </div>
        <div className="metric-card">
          <h3>Total Orders</h3>
          <p className="metric-value">{metrics.totalOrders}</p>
        </div>
        <div className="metric-card">
          <h3>Total Products</h3>
          <p className="metric-value">{metrics.totalProducts}</p>
        </div>
        <div className="metric-card">
          <h3>Total Revenue</h3>
          <p className="metric-value">${metrics.totalRevenue?.toFixed(2) || '0.00'}</p>
        </div>
      </div>
      
      <div className="dashboard-content-grid">
        <div className="dashboard-left-col">
          <div className="metric-card">
            <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '16px', color: '#111', fontWeight: 600 }}>RECENT ACTIVITY (24 Hours)</h3>
            <div className="activity-row">
              <span>New Users:</span> <strong>{metrics.recentUsers}</strong>
            </div>
            <div className="activity-row">
              <span>New Orders:</span> <strong>{metrics.recentOrders}</strong>
            </div>
            <div className="activity-row">
              <span>Failed Logins:</span> <strong>12</strong>
            </div>
            <div className="activity-row">
              <span>Flagged Content:</span> <strong>3</strong>
            </div>
          </div>
          
          <div className="metric-card" style={{ textAlign: 'center', marginTop: '16px' }}>
            <h3 style={{ color: '#111', fontWeight: 600 }}>SYSTEM STATUS</h3>
            <p>All Systems Normal</p>
          </div>
        </div>

        <div className="dashboard-right-col">
          {graphs && (
            <>
              <div className="chart-container metric-card">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={graphs.monthlySales} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <XAxis dataKey="name" tick={{fontSize: 10}} interval="preserveStartEnd" />
                    <YAxis tick={{fontSize: 10}} />
                    <Tooltip />
                    <Line type="monotone" dataKey="sales" stroke="#d9425e" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="revenue" stroke="#ff7c92" strokeWidth={1} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="chart-container metric-card" style={{ marginTop: '16px' }}>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={graphs.recentActivity} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <XAxis dataKey="name" tick={{fontSize: 10}} interval="preserveStartEnd" />
                    <YAxis tick={{fontSize: 10}} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#d9425e" barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
