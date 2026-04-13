import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';

const Orders = () => {
  const { hasPermission } = useAuth();
  const { currency } = useSettings();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [newOrder, setNewOrder] = useState({
    customerName: '',
    items: [{ productId: '', quantity: 1 }]
  });

  const fetchData = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        api.get('/order'),
        api.get('/product')
      ]);
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        customerName: newOrder.customerName,
        items: newOrder.items.map(item => ({
          productId: parseInt(item.productId),
          quantity: parseInt(item.quantity)
        }))
      };
      await api.post('/order', payload);
      toast.success('Order created successfully');
      setShowAddModal(false);
      setNewOrder({ customerName: '', items: [{ productId: '', quantity: 1 }] });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data || 'Failed to create order');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/order/${id}/status`, { status });
      toast.success(`Order status updated to ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredOrders = orders.filter(o =>
    o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.toString().includes(searchTerm)
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30';
      case 'Cancelled': return 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/30';
      case 'InProgress': return 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30';
      default: return 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Order Management</h1>
          <p className="text-sm text-slate-700 mt-1 font-medium">Track sales, manage order lifecycles, and view receipts.</p>
        </div>
        {hasPermission('orders.create') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="admin-btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            <span>New Order</span>
          </button>
        )}
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="admin-card p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <ShoppingCart size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider">Total</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{orders.length}</p>
          </div>
        </div>
        <div className="admin-card p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider">Pending</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{orders.filter(o => o.status === 'InProgress').length}</p>
          </div>
        </div>
        <div className="admin-card p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider">Done</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{orders.filter(o => o.status === 'Completed').length}</p>
          </div>
        </div>
        <div className="admin-card p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <XCircle size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider">Cancelled</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{orders.filter(o => o.status === 'Cancelled').length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Orders Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                placeholder="Search by ID or customer..."
                className="admin-input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="admin-btn-secondary flex items-center gap-2">
              <Filter size={16} />
              <span className="hidden sm:inline">Filter</span>
            </button>
          </div>

          <div className="admin-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [1, 2, 3, 4, 5].map(i => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={5} className="p-4"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full"></div></td>
                      </tr>
                    ))
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-slate-700 font-bold">No orders found.</td>
                    </tr>
                  ) : filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`cursor-pointer transition-colors ${selectedOrder?.id === order.id
                          ? 'bg-blue-50/50 dark:bg-blue-900/10'
                          : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                        }`}
                    >
                      <td className="font-bold text-blue-600 dark:text-blue-400">#{order.id}</td>
                      <td className="font-bold text-slate-900 dark:text-white">{order.customerName}</td>
                      <td className="text-slate-700 dark:text-slate-400 font-medium">{format(new Date(order.createdAt), 'MMM dd, yyyy')}</td>
                      <td className="font-bold text-slate-900 dark:text-white">{currency}{(order.totalPrice || 0).toLocaleString()}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Order Details Panel */}
        <div className="lg:col-span-4 sticky top-6">
          <div className="admin-card overflow-hidden flex flex-col min-h-[400px]">
            {selectedOrder ? (
              <>
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Order Details #{selectedOrder.id}</h3>
                  <button onClick={() => setSelectedOrder(null)} className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors">
                    <XCircle size={18} />
                  </button>
                </div>

                <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                  {/* Status Actions */}
                  <div className="flex items-center justify-between p-3 rounded bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Current Status</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedOrder.status}</p>
                    </div>
                    {selectedOrder.status === 'InProgress' && hasPermission('orders.manage') && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateStatus(selectedOrder.id, 'Completed')}
                          className="p-1.5 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors shadow-sm"
                          title="Mark Completed"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                        <button
                          onClick={() => updateStatus(selectedOrder.id, 'Cancelled')}
                          className="p-1.5 bg-rose-500 text-white rounded hover:bg-rose-600 transition-colors shadow-sm"
                          title="Cancel Order"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Customer</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedOrder.customerName}</p>
                    <p className="text-xs text-slate-700 font-medium">{format(new Date(selectedOrder.createdAt), 'MMMM d, yyyy @ h:mm a')}</p>
                  </div>

                  {/* Items List */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Order Summary</p>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 border-y border-slate-100 dark:border-slate-800">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="py-3 flex justify-between items-start">
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-700">
                              x{item.quantity}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.productName}</p>
                              <p className="text-[10px] text-slate-500">{currency}{item.unitPrice} / unit</p>
                            </div>
                          </div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{currency}{(item.quantity * item.unitPrice).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="pt-2">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-xs text-slate-500">Subtotal</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{currency}{(selectedOrder.totalPrice || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">Total Amount</span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{currency}{(selectedOrder.totalPrice || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
                  <button className="admin-btn-secondary w-full flex items-center justify-center gap-2 text-xs">
                    <FileText size={14} />
                    <span>Download Receipt</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4 text-slate-300 dark:text-slate-700">
                  <Eye size={32} />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">No Order Selected</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[200px] mx-auto">
                  Select an order from the list to view its full details and manage its status.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Order Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#1e293b] rounded-lg shadow-xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create New Order</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                  <Plus size={20} className="rotate-45" />
                </button>
              </div>

              <form onSubmit={handleCreateOrder} className="p-6 space-y-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Customer Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text" required value={newOrder.customerName}
                      onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                      className="admin-input pl-10" placeholder="e.g. John Doe"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Order Items</label>
                    <button
                      type="button"
                      onClick={() => setNewOrder({ ...newOrder, items: [...newOrder.items, { productId: '', quantity: 1 }] })}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      + Add Item
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 scrollbar-hide">
                    {newOrder.items.map((item, index) => (
                      <div key={index} className="flex gap-3 items-end p-3 rounded bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                        <div className="flex-1 space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Product</label>
                          <select
                            required value={item.productId}
                            onChange={(e) => {
                              const items = [...newOrder.items];
                              items[index].productId = e.target.value;
                              setNewOrder({ ...newOrder, items });
                            }}
                            className="admin-input"
                          >
                            <option value="">Select product</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id} disabled={p.stockQuantity <= 0}>
                                {p.name} ({currency}{p.price}) - {p.stockQuantity > 0 ? `${p.stockQuantity} in stock` : 'Out of stock'}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="w-24 space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Qty</label>
                          <input
                            type="number" min="1" required value={item.quantity}
                            onChange={(e) => {
                              const items = [...newOrder.items];
                              items[index].quantity = e.target.value;
                              setNewOrder({ ...newOrder, items });
                            }}
                            className="admin-input"
                          />
                        </div>
                        {newOrder.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const items = newOrder.items.filter((_, i) => i !== index);
                              setNewOrder({ ...newOrder, items });
                            }}
                            className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddModal(false)} className="admin-btn-secondary flex-1">Cancel</button>
                  <button type="submit" className="admin-btn-primary flex-1">Create Order</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Orders;
