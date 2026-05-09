import React, { useState, useEffect } from 'react';
import { ClipboardList, CheckCircle, AlertCircle } from 'lucide-react';
import api, { routes } from '../../services/api';

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for tracking input values per row
  const [stockInputs, setStockInputs] = useState({});
  const [updating, setUpdating] = useState({});
  const [statusMessage, setStatusMessage] = useState({});

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const storeId = localStorage.getItem('userId');
      const response = await api.get(routes.products.browse, {
        params: { storeId }
      });
      const itemsData = response.data?.products || [];
      setItems(itemsData);
      
      // Initialize stock inputs
      const initialInputs = {};
      itemsData.forEach(item => {
        initialInputs[item.id || item._id] = item.stock || 0;
      });
      setStockInputs(initialInputs);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (id, value) => {
    setStockInputs(prev => ({ ...prev, [id]: value }));
  };

  const handleUpdateStock = async (id) => {
    const newValue = parseInt(stockInputs[id], 10);
    if (isNaN(newValue) || newValue < 0) {
      setStatusMessage({ ...statusMessage, [id]: { type: 'error', text: 'Invalid quantity' } });
      return;
    }

    try {
      setUpdating(prev => ({ ...prev, [id]: true }));
      setStatusMessage({ ...statusMessage, [id]: null });
      
      await api.put(routes.products.updateStock(id), { stock: newValue });
      
      setStatusMessage({ ...statusMessage, [id]: { type: 'success', text: 'Stock updated!' } });
      
      // Update local state smoothly
      setItems(items.map(item => 
        (item.id === id || item._id === id) ? { ...item, stock: newValue } : item
      ));

      // Clear success message after 3 seconds
      setTimeout(() => {
        setStatusMessage(prev => ({ ...prev, [id]: null }));
      }, 3000);

    } catch (err) {
      setStatusMessage({ 
        ...statusMessage, 
        [id]: { type: 'error', text: err.response?.data?.message || err.message || 'Failed to update' } 
      });
    } finally {
      setUpdating(prev => ({ ...prev, [id]: false }));
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
      <div className="page-header">
        <h1>Inventory Management</h1>
        <p>Monitor and update your low stock items.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="p-4 font-medium">Product Name</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Current Stock</th>
                <th className="p-4 font-medium">Update Stock</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700">
              {items.length > 0 ? (
                items.map(item => {
                  const id = item.id || item._id;
                  const isUpdating = updating[id];
                  const status = statusMessage[id];

                  return (
                    <tr key={id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-slate-900">{item.name || 'Unnamed Product'}</div>
                        <div className="text-slate-500 text-xs font-mono mt-1">ID: {id}</div>
                      </td>
                      <td className="p-4 capitalize">{item.category || 'N/A'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium 
                          ${item.stock <= 5 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                          {item.stock !== undefined ? item.stock : 0} in stock
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              min="0"
                              className="w-24 bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-rose-500 focus:border-rose-500 p-2 disabled:opacity-50"
                              value={stockInputs[id] !== undefined ? stockInputs[id] : ''}
                              onChange={(e) => handleInputChange(id, e.target.value)}
                              disabled={isUpdating}
                            />
                              <button
                                onClick={() => handleUpdateStock(id)}
                                disabled={isUpdating}
                                className="text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                                style={{ backgroundColor: '#c4566a' }}
                              >
                              {isUpdating ? 'Saving...' : 'Update'}
                            </button>
                          </div>
                          {status && (
                            <div className={`flex items-center gap-1 text-xs ${status.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {status.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                              <span>{status.text}</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">
                    No products found in your inventory. Head over to 'Manage Products' to add some!
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
