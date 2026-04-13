import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  History, 
  Search, 
  Filter, 
  User, 
  Calendar, 
  Activity, 
  Database,
  ArrowRight,
  ShieldAlert,
  Clock,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/audit-logs');
      setLogs(response.data);
    } catch (error) {
      console.error('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(l => 
    l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.entity.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionColor = (action) => {
    if (action.includes('Create') || action.includes('Add')) return 'text-emerald-600 bg-emerald-50';
    if (action.includes('Delete') || action.includes('Remove')) return 'text-rose-600 bg-rose-50';
    if (action.includes('Update') || action.includes('Edit')) return 'text-amber-600 bg-amber-50';
    return 'text-blue-600 bg-blue-50';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">System Audit Logs</h1>
          <p className="text-sm text-slate-700 mt-1 font-medium">Transparency and accountability for every action performed.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-lg">
          <ShieldAlert size={16} className="text-amber-600" />
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Immutable Record</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Search by action or entity..."
            className="admin-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="admin-btn-secondary flex items-center gap-2">
          <Filter size={16} />
          <span className="hidden sm:inline">Filter</span>
        </button>
        <button 
          onClick={fetchLogs}
          className="admin-btn-secondary p-2 flex items-center justify-center"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Logs Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="px-6">Event Detail</th>
                <th className="px-6">Entity</th>
                <th className="px-6">User</th>
                <th className="px-6">Timestamp</th>
                <th className="text-right px-6">Ref</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3, 4, 5, 6].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full"></div></td>
                  </tr>
                ))
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-600 font-bold">No logs found matching your search.</td>
                </tr>
              ) : filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getActionColor(log.action)}`}>
                        <Activity size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{log.action}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">#{log.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
                      <Database size={14} className="text-slate-400" />
                      {log.entity}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
                      <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <User size={10} />
                      </div>
                      {log.userId || 'System'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        <Calendar size={12} className="text-slate-400" />
                        {format(new Date(log.createdAt), 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-medium text-slate-500">
                        <Clock size={10} />
                        {format(new Date(log.createdAt), 'HH:mm:ss')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                      <ExternalLink size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
