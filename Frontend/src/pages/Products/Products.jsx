import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  ArrowUpRight, 
  AlertTriangle,
  DollarSign,
  Box,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';

const Products = () => {
  const { hasPermission } = useAuth();
  const { currency } = useSettings();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    sku: '', 
    category: '', 
    price: '', 
    stock: '', 
    minStock: '' 
  });
  const [editProduct, setEditProduct] = useState({ 
    name: '', 
    sku: '', 
    category: '', 
    price: '', 
    stock: '', 
    minStock: '' 
  });
  const [restockAmount, setRestockAmount] = useState('');

  const fetchProducts = async () => {
    try {
      const response = await api.get('/product');
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post('/product', {
        name: newProduct.name,
        sku: newProduct.sku,
        category: newProduct.category,
        imageUrl: newProduct.imageUrl,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        minStock: parseInt(newProduct.minStock)
      });
      toast.success('Product created successfully');
      setShowAddModal(false);
      setNewProduct({ name: '', sku: '', category: '', price: '', stock: '', minStock: '', imageUrl: '' });
      fetchProducts();
    } catch (error) {
      toast.error('Failed to create product');
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/product/${selectedProduct.id}`, {
        name: editProduct.name,
        sku: editProduct.sku,
        category: editProduct.category,
        imageUrl: editProduct.imageUrl,
        price: parseFloat(editProduct.price),
        stock: parseInt(editProduct.stock),
        minStock: parseInt(editProduct.minStock)
      });
      toast.success('Product updated successfully');
      setShowEditModal(false);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update product');
    }
  };

  const handleRestock = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/product/${selectedProduct.id}/restock`, { quantity: parseInt(restockAmount) });
      toast.success(`${selectedProduct.name} restocked by ${restockAmount} units`);
      setShowRestockModal(false);
      setRestockAmount('');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to restock product');
    }
  };

  const handleDeleteProduct = async (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-bold text-slate-900 dark:text-white">Are you sure you want to delete this product?</p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded">Cancel</button>
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await api.delete(`/product/${id}`);
                toast.success('Product deleted successfully');
                fetchProducts();
              } catch (error) {
                toast.error('Failed to delete product');
              }
            }}
            className="px-3 py-1.5 text-xs font-bold bg-rose-500 text-white rounded hover:bg-rose-600"
          >
            Delete
          </button>
        </div>
      </div>
    ), { duration: 5000, position: 'top-center' });
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImageUpload = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit) {
          setEditProduct({ ...editProduct, imageUrl: reader.result });
        } else {
          setNewProduct({ ...newProduct, imageUrl: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Inventory Management</h1>
          <p className="text-sm text-slate-700 mt-1 font-medium">Track stock levels, manage products, and set alerts.</p>
        </div>
        {hasPermission('products.create') && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="admin-btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            <span>Add Product</span>
          </button>
        )}
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="admin-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Package size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider">Total Products</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{products.length}</h3>
          </div>
        </div>
        <div className="admin-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider">Low Stock</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {products.filter(p => p.stock <= p.minStock).length}
            </h3>
          </div>
        </div>
        <div className="admin-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider">Inventory Value</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {currency}{products.reduce((acc, p) => acc + (p.price * p.stock), 0).toLocaleString()}
            </h3>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Search products..."
            className="admin-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="admin-btn-secondary flex items-center gap-2 flex-1 md:flex-none justify-center">
            <Filter size={16} />
            <span>Filter</span>
          </button>
          <button 
            onClick={fetchProducts}
            className="admin-btn-secondary p-2 flex items-center justify-center"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product Info</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock Level</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-4 py-6">
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-700 font-bold">
                    No products found matching your search.
                  </td>
                </tr>
              ) : filteredProducts.map((product) => {
                const isLowStock = product.stock <= product.minStock;
                const isOutOfStock = product.stock === 0;
                
                return (
                  <tr key={product.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded flex items-center justify-center font-bold text-xs ${
                          isOutOfStock 
                            ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' 
                            : isLowStock 
                              ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded" />
                          ) : (
                            <Package size={16} />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">{product.name}</p>
                          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">SKU: {product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400 rounded text-[10px] font-bold uppercase tracking-wider">
                        {product.category}
                      </span>
                    </td>
                    <td className="font-bold text-slate-900 dark:text-white">
                      {currency}{product.price.toLocaleString()}
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className={isLowStock ? 'text-amber-600' : 'text-slate-800'}>
                            {product.stock} units
                          </span>
                          <span className="text-slate-600">Min: {product.minStock}</span>
                        </div>
                        <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all ${
                              isOutOfStock ? 'bg-rose-500' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min((product.stock / (product.minStock * 2 || 1)) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      {isOutOfStock ? (
                        <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 text-xs font-bold">
                          <XCircle size={14} />
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-bold">
                          <AlertTriangle size={14} />
                          Low Stock
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                          <Box size={14} />
                          Healthy
                        </span>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {hasPermission('products.manage') && (
                          <>
                            <button 
                              onClick={() => {
                                setSelectedProduct(product);
                                setRestockAmount('');
                                setShowRestockModal(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                              title="Restock"
                            >
                              <ArrowUpRight size={16} />
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedProduct(product);
                                setEditProduct({ ...product });
                                setShowEditModal(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-lg rounded-lg shadow-xl overflow-hidden border border-slate-200"
              style={{ backgroundColor: 'var(--popup-color, white)' }}
            >
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New Product</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors"
                >
                  <Plus size={20} className="rotate-45" />
                </button>
              </div>
              
              <form onSubmit={handleCreateProduct} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider">Product Image</label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                        {newProduct.imageUrl ? (
                          <img src={newProduct.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <Package className="text-slate-400" size={24} />
                        )}
                      </div>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e)}
                        className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider">Product Name</label>
                    <input 
                      type="text"
                      required
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                      className="admin-input"
                      placeholder="e.g. Wireless Mouse"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider">SKU</label>
                    <input 
                      type="text"
                      required
                      value={newProduct.sku}
                      onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                      className="admin-input"
                      placeholder="WM-001"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider">Category</label>
                    <input 
                      type="text"
                      required
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                      className="admin-input"
                      placeholder="Electronics"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider">Price ({currency})</label>
                    <input 
                      type="number"
                      step="0.01"
                      required
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                      className="admin-input"
                      placeholder="29.99"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider">Initial Stock</label>
                    <input 
                      type="number"
                      required
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                      className="admin-input"
                      placeholder="100"
                    />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider">Low Stock Threshold</label>
                    <input 
                      type="number"
                      required
                      value={newProduct.minStock}
                      onChange={(e) => setNewProduct({...newProduct, minStock: e.target.value})}
                      className="admin-input"
                      placeholder="10"
                    />
                    <p className="text-[10px] text-slate-600 font-medium">We'll alert you when stock falls below this level.</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="admin-btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="admin-btn-primary flex-1"
                  >
                    Create Product
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Restock Modal */}
      <AnimatePresence>
        {showRestockModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
              onClick={() => setShowRestockModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-white dark:bg-[#1e293b] rounded-lg shadow-xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Restock Inventory</h3>
                <button 
                  onClick={() => setShowRestockModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors"
                >
                  <Plus size={20} className="rotate-45" />
                </button>
              </div>
              
              <form onSubmit={handleRestock} className="p-6 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg mb-2">
                  <div className="w-10 h-10 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                    <Package size={20} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedProduct?.name}</p>
                    <p className="text-xs text-slate-700 font-medium">Current Stock: {selectedProduct?.stock}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider">Quantity to Add</label>
                  <input 
                    type="number"
                    required
                    autoFocus
                    value={restockAmount}
                    onChange={(e) => setRestockAmount(e.target.value)}
                    className="admin-input text-lg font-bold text-center"
                    placeholder="0"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowRestockModal(false)}
                    className="admin-btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="admin-btn-primary flex-1"
                  >
                    Update Stock
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Product Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
              onClick={() => setShowEditModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#1e293b] rounded-lg shadow-xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Product</h3>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors"
                >
                  <Plus size={20} className="rotate-45" />
                </button>
              </div>
              
              <form onSubmit={handleEditProduct} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider">Product Image</label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                        {editProduct.imageUrl ? (
                          <img src={editProduct.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <Package className="text-slate-400" size={24} />
                        )}
                      </div>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, true)}
                        className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider">Product Name</label>
                    <input 
                      type="text"
                      required
                      value={editProduct.name}
                      onChange={(e) => setEditProduct({...editProduct, name: e.target.value})}
                      className="admin-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider">SKU</label>
                    <input 
                      type="text"
                      required
                      value={editProduct.sku}
                      onChange={(e) => setEditProduct({...editProduct, sku: e.target.value})}
                      className="admin-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider">Category</label>
                    <input 
                      type="text"
                      required
                      value={editProduct.category}
                      onChange={(e) => setEditProduct({...editProduct, category: e.target.value})}
                      className="admin-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider">Price ({currency})</label>
                    <input 
                      type="number"
                      step="0.01"
                      required
                      value={editProduct.price}
                      onChange={(e) => setEditProduct({...editProduct, price: e.target.value})}
                      className="admin-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider">Stock Quantity</label>
                    <input 
                      type="number"
                      required
                      value={editProduct.stock}
                      onChange={(e) => setEditProduct({...editProduct, stock: e.target.value})}
                      className="admin-input"
                    />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider">Low Stock Threshold</label>
                    <input 
                      type="number"
                      required
                      value={editProduct.minStock}
                      onChange={(e) => setEditProduct({...editProduct, minStock: e.target.value})}
                      className="admin-input"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="admin-btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="admin-btn-primary flex-1"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Products;
