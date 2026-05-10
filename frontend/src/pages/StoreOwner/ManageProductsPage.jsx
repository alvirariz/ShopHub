import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit2, XCircle, Save, X, EyeOff, Trash2, Eye } from 'lucide-react';
import api, { routes } from '../../services/api';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function ManageProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Forms state
  const [addForm, setAddForm] = useState({ name: '', description: '', price: '', category: '', stock: '', image: null });
  const [editForm, setEditForm] = useState({ name: '', description: '', price: '', stock: '', image: null });
  const [submitting, setSubmitting] = useState(false);
  const [dialog, setDialog] = useState({ isOpen: false, type: '', productId: null });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const storeId = localStorage.getItem('userId');
      const response = await api.get(routes.products.browse, {
        params: { storeId, includeWithdrawn: true }
      });
      setProducts(response.data?.products || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('name', addForm.name);
      formData.append('category', addForm.category);
      formData.append('price', addForm.price);
      formData.append('stock', addForm.stock);
      formData.append('storeId', localStorage.getItem('userId'));
      if (addForm.image) {
        formData.append('image', addForm.image);
      }
      
      await api.post(routes.products.create, formData, {
        headers: { 'Content-Type': undefined }
      });
      setShowAddForm(false);
      setAddForm({ name: '', description: '', price: '', category: '', stock: '', image: null });
      fetchProducts(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to add product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdrawClick = (id, action) => {
    setDialog({ isOpen: true, type: action, productId: id });
  };

  const handleWithdraw = async (id, action) => {
    try {
      await api.put(routes.products.withdraw(id), { action });
      
      // Backend might filter out withdrawn items on browse route
      setProducts(prevProducts => {
        if (action === 'delete') {
          return prevProducts.filter(p => (p.id || p._id) !== id);
        } else if (action === 'relist') {
          return prevProducts.map(p => 
            (p.id || p._id) === id ? { ...p, isWithdrawn: false } : p
          );
        } else {
          return prevProducts.map(p => 
            (p.id || p._id) === id ? { ...p, isWithdrawn: true } : p
          );
        }
      });
      
      setDialog({ isOpen: false, type: '', productId: null });
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to withdraw product');
    }
  };

  const startEditing = (product) => {
    const id = product.id || product._id;
    setEditingId(id);
    setEditForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      stock: product.stockQuantity || '',
      image: null
    });
  };

  const handleEditSubmit = async (id) => {
    try {
      setSubmitting(true);
      const formData = new FormData();
      if (editForm.name) formData.append('name', editForm.name);
      if (editForm.price) formData.append('price', editForm.price);
      if (editForm.stock) formData.append('stock', editForm.stock);
      if (editForm.image) formData.append('image', editForm.image);

      await api.put(routes.products.edit(id), formData, {
        headers: { 'Content-Type': undefined }
      });
      setEditingId(null);
      fetchProducts(); // Refresh
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="page-header flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1>Manage Products</h1>
          <p>Add, update, or remove products from your store catalogue</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          style={{ backgroundColor: '#c4566a' }}
        >
          {showAddForm ? <X size={20} /> : <Plus size={20} />}
          {showAddForm ? 'Cancel' : 'Add New Product'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg border border-red-200 mb-8">
          {error}
        </div>
      )}

      {/* Add Product Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 animate-fade-in">
          <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Add New Product</h2>
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
              <input required type="text" className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-rose-500 focus:border-rose-500" value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})} />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea required className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-rose-500 focus:border-rose-500 h-24" value={addForm.description} onChange={e => setAddForm({...addForm, description: e.target.value})}></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price (RS)</label>
              <input required type="number" step="0.01" min="0" className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-rose-500 focus:border-rose-500" value={addForm.price} onChange={e => setAddForm({...addForm, price: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stock Quantity</label>
              <input required type="number" min="0" className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-rose-500 focus:border-rose-500" value={addForm.stock} onChange={e => setAddForm({...addForm, stock: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <input required type="text" className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-rose-500 focus:border-rose-500" value={addForm.category} onChange={e => setAddForm({...addForm, category: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Product Image</label>
              <input required type="file" accept="image/*" className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-rose-500 focus:border-rose-500" onChange={e => setAddForm({...addForm, image: e.target.files[0]})} />
            </div>
            <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-2">
              <button type="button" onClick={() => setShowAddForm(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Cancel</button>
              <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                {submitting ? 'Creating...' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="p-4 font-medium">Product</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Stock</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700">
              {products.length > 0 ? (
                products.map(product => {
                  const id = product.id || product._id;
                  const isEditing = editingId === id;
                  const isDelisted = product.isWithdrawn === true;

                  return (
                    <React.Fragment key={id}>
                      <tr className={`border-b border-slate-100 transition-colors ${isDelisted ? 'bg-slate-50 opacity-75' : 'hover:bg-slate-50'}`}>
                        <td className="p-4">
                          <div className="flex items-center gap-4">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
                            ) : (
                              <div className="w-12 h-12 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400">
                                <Package size={20} />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-slate-900 line-clamp-1 max-w-[200px]">{product.name}</div>
                              <div className="text-slate-500 text-xs mt-0.5 truncate w-48">{product.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-medium">RS {product.price?.toFixed(2)}</td>
                        <td className="p-4">
                          <span className={`${product.stockQuantity <= 5 ? 'text-rose-600 font-bold' : ''}`}>
                            {product.stockQuantity}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize
                            ${isDelisted ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-700'}`}>
                            {isDelisted ? 'Delisted' : 'Active'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => startEditing(product)}
                              disabled={isDelisted || isEditing}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-30"
                              title="Edit"
                            >
                              <Edit2 size={18} />
                            </button>
                            {isDelisted && (
                              <button 
                                onClick={() => handleWithdrawClick(id, "relist")}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Relist Product"
                              >
                                <Eye size={18} />
                              </button>
                            )}
                            <button 
                              onClick={() => handleWithdrawClick(id, "delist")}
                              disabled={isDelisted}
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-30"
                              title="Delist"
                            >
                              <EyeOff size={18} />
                            </button>
                            <button 
                              onClick={() => handleWithdrawClick(id, "delete")}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Inline Edit Form */}
                      {isEditing && (
                        <tr className="bg-blue-50/50 border-b border-slate-200">
                          <td colSpan="5" className="p-6">
                            <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
                              <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                                <Edit2 size={16} className="text-blue-500" />
                                Edit Product
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-2">
                                  <label className="block text-xs text-slate-500 mb-1">Name</label>
                                  <input type="text" className="w-full border-slate-300 rounded p-2 text-sm" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                                </div>
                                <div>
                                  <label className="block text-xs text-slate-500 mb-1">Price</label>
                                  <input type="number" step="0.01" className="w-full border-slate-300 rounded p-2 text-sm" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} />
                                </div>
                                <div>
                                  <label className="block text-xs text-slate-500 mb-1">Stock</label>
                                  <input type="number" className="w-full border-slate-300 rounded p-2 text-sm" value={editForm.stock} onChange={e => setEditForm({...editForm, stock: e.target.value})} />
                                </div>
                                <div>
                                  <label className="block text-xs text-slate-500 mb-1">Update Image</label>
                                  <input type="file" accept="image/*" className="w-full border-slate-300 rounded p-1 text-sm" onChange={e => setEditForm({...editForm, image: e.target.files[0]})} />
                                </div>
                                <div className="md:col-span-4">
                                  <label className="block text-xs text-slate-500 mb-1">Description</label>
                                  <textarea className="w-full border-slate-300 rounded p-2 text-sm h-16" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})}></textarea>
                                </div>
                              </div>
                              <div className="flex justify-end gap-2 mt-4">
                                <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded transition-colors">Cancel</button>
                                <button onClick={() => handleEditSubmit(id)} disabled={submitting} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-medium transition-colors disabled:opacity-50">
                                  <Save size={14} />
                                  {submitting ? 'Saving...' : 'Save Changes'}
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">
                    No products found. Add your first product to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog 
        isOpen={dialog.isOpen}
        icon={dialog.type === 'delete' ? Trash2 : (dialog.type === 'relist' ? Eye : EyeOff)}
        iconBgColor={dialog.type === 'delete' ? 'bg-rose-100 text-rose-500' : (dialog.type === 'relist' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600')}
        title={dialog.type === 'delete' ? 'Delete this product?' : (dialog.type === 'relist' ? 'Relist this product?' : 'Delist this product?')}
        message={dialog.type === 'delete' ? 'You are about to permanently delete this product' : (dialog.type === 'relist' ? 'This product will become visible to customers again' : 'You are about to delist this product')}
        confirmText={dialog.type === 'delete' ? 'Yes, Delete' : (dialog.type === 'relist' ? 'Yes, Relist' : 'Yes, Delist')}
        onConfirm={() => handleWithdraw(dialog.productId, dialog.type)}
        onCancel={() => setDialog({ isOpen: false, type: '', productId: null })}
      />
    </div>
  );
}
