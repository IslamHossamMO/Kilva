import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  FileText, 
  Trash2, 
  Edit2,
  TrendingDown,
  PieChart,
  ArrowDownCircle,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';

const Expenses = () => {
  const { hasPermission } = useAuth();
  const { currency } = useSettings();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: '', date: format(new Date(), 'yyyy-MM-dd') });

  const fetchExpenses = async () => {
    try {
      const response = await api.get('/expense');
      setExpenses(response.data);
    } catch (error) {
      toast.error('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    try {
      await api.post('/expense', {
        title: newExpense.description,
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
        date: new Date(newExpense.date).toISOString()
      });
      toast.success('Expense recorded successfully');
      setShowAddModal(false);
      setNewExpense({ description: '', amount: '', category: '', date: format(new Date(), 'yyyy-MM-dd') });
      fetchExpenses();
    } catch (error) {
      toast.error('Failed to record expense');
    }
  };

  const handleDeleteExpense = async (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-bold text-slate-900 dark:text-white">Are you sure you want to delete this expense?</p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded">Cancel</button>
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await api.delete(`/expense/${id}`);
                toast.success('Expense deleted successfully');
                fetchExpenses();
              } catch (error) {
                toast.error('Failed to delete expense');
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

  const filteredExpenses = expenses.filter(e => 
    e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = ['Rent', 'Utilities', 'Salaries', 'Supplies', 'Marketing', 'Maintenance', 'Other'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Expense Tracking</h1>
          <p className="text-sm text-slate-700 mt-1 font-medium">Monitor your spending and categorize business costs.</p>
        </div>
        {hasPermission('expenses.create') && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="admin-btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            <span>Record Expense</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="admin-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <TrendingDown size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider">Total Monthly</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {currency}{expenses.reduce((acc, e) => acc + e.amount, 0).toLocaleString()}
            </h3>
          </div>
        </div>
        <div className="admin-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <PieChart size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider">Main Category</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Operations</h3>
          </div>
        </div>
        <div className="admin-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ArrowDownCircle size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider">Budget Status</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Healthy</h3>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Search expenses..."
            className="admin-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="admin-btn-secondary flex items-center gap-2 w-full md:w-auto justify-center">
          <Filter size={16} />
          <span>Date Range</span>
        </button>
      </div>

      {/* Expenses Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Expense Details</th>
                <th>Category</th>
                <th>Date</th>
                <th className="text-right">Amount</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="p-4"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full"></div></td>
                  </tr>
                ))
              ) : filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-700 font-bold">No expenses found.</td>
                </tr>
              ) : filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 flex items-center justify-center group-hover:text-rose-500 transition-colors">
                        <FileText size={16} />
                      </div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{expense.title}</p>
                    </div>
                  </td>
                  <td>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400 rounded text-[10px] font-bold uppercase tracking-wider">
                      {expense.category}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                      <Calendar size={14} />
                      {format(new Date(expense.date), 'MMM d, yyyy')}
                    </div>
                  </td>
                  <td className="text-right font-bold text-slate-900 dark:text-white">
                    {currency}{expense.amount.toLocaleString()}
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {hasPermission('expenses.manage') && (
                        <>
                          <button className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-white dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors">
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
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
              className="relative w-full max-w-md bg-white dark:bg-[#1e293b] rounded-lg shadow-xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Record Expense</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
                  <XCircle size={20} />
                </button>
              </div>
              
              <form onSubmit={handleCreateExpense} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider">Description</label>
                  <input 
                    required value={newExpense.description}
                    onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                    className="admin-input" placeholder="e.g. Office Rent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider">Amount ({currency})</label>
                    <input 
                      type="number" step="0.01" required value={newExpense.amount}
                      onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                      className="admin-input font-bold" placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider">Date</label>
                    <input 
                      type="date" required value={newExpense.date}
                      onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                      className="admin-input"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider">Category</label>
                  <select 
                    required value={newExpense.category}
                    onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                    className="admin-input"
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddModal(false)} className="admin-btn-secondary flex-1">Cancel</button>
                  <button type="submit" className="admin-btn-primary flex-1">Save Expense</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Expenses;
