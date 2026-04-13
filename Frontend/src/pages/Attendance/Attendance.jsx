import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  Calendar, 
  UserCheck, 
  UserX, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  TrendingDown,
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';

const Attendance = () => {
  const { hasPermission } = useAuth();
  const { currency } = useSettings();
  const [users, setUsers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('daily'); // 'daily' or 'monthly'
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const usersRes = await api.get('/user');
      setUsers(usersRes.data);

      if (view === 'daily') {
        const attendanceRes = await api.get(`/attendance/date/${format(selectedDate, 'yyyy-MM-dd')}`);
        setAttendance(attendanceRes.data);
      } else {
        const summaryRes = await api.get(`/attendance/summary?month=${selectedDate.getMonth() + 1}&year=${selectedDate.getFullYear()}`);
        setSummary(summaryRes.data);
      }
    } catch (error) {
      toast.error('Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate, view]);

  const handleToggleAttendance = async (userId, currentlyAbsent) => {
    try {
      await api.post('/attendance', {
        userId,
        date: format(selectedDate, 'yyyy-MM-dd'),
        isAbsent: !currentlyAbsent,
        note: !currentlyAbsent ? 'Marked absent by admin' : ''
      });
      toast.success(currentlyAbsent ? 'Marked as present' : 'Marked as absent');
      fetchData();
    } catch (error) {
      toast.error('Failed to update attendance');
    }
  };

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.position?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAttendanceForUser = (userId) => {
    return attendance.find(a => a.userId === userId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Staff Attendance</h1>
          <p className="text-sm text-slate-700 mt-1 font-medium">Track daily presence and manage monthly salary deductions.</p>
        </div>
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg self-start">
          <button 
            onClick={() => setView('daily')}
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${view === 'daily' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Daily Tracker
          </button>
          <button 
            onClick={() => setView('monthly')}
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${view === 'monthly' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Monthly Summary
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Search staff by name or position..."
            className="admin-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-xl shadow-sm">
          <button 
            onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-2 px-3">
            <Calendar size={16} className="text-blue-500" />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {view === 'daily' ? format(selectedDate, 'MMMM d, yyyy') : format(selectedDate, 'MMMM yyyy')}
            </span>
          </div>
          <button 
            onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'daily' ? (
          <motion.div 
            key="daily"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="admin-card h-32 animate-pulse bg-slate-50/50"></div>)
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map(user => {
                const record = getAttendanceForUser(user.id);
                const isAbsent = record?.isAbsent || false;
                
                return (
                  <div key={user.id} className={`admin-card p-5 border-2 transition-all ${isAbsent ? 'border-rose-100 bg-rose-50/30' : 'border-transparent'}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600">
                          {user.fullName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{user.fullName}</h3>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{user.position || 'Staff'}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleToggleAttendance(user.id, isAbsent)}
                        disabled={!hasPermission('attendance.manage')}
                        className={`p-2 rounded-lg transition-all ${isAbsent 
                          ? 'bg-rose-100 text-rose-600 hover:bg-rose-200 opacity-100' 
                          : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'} ${!hasPermission('attendance.manage') ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={isAbsent ? 'Mark as Present' : 'Mark as Absent'}
                      >
                        {isAbsent ? <UserX size={20} /> : <UserCheck size={20} />}
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <Wallet size={14} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-600">Salary: {currency}{user.salary || 0}</span>
                      </div>
                      {isAbsent && (
                        <div className="flex items-center gap-1.5 text-rose-600">
                          <TrendingDown size={14} />
                          <span className="text-xs font-bold">-{currency}{(user.salary * 0.1).toFixed(0)} (10%)</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full admin-card p-12 text-center">
                <AlertCircle className="mx-auto text-slate-300 mb-4" size={48} />
                <p className="text-slate-600 font-bold">No staff members found.</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="monthly"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="admin-card overflow-hidden"
          >
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Base Salary</th>
                  <th>Absences</th>
                  <th>Total Deduction</th>
                  <th>Final Salary</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [1, 2, 3].map(i => <tr key={i} className="animate-pulse"><td colSpan="6" className="h-16 bg-slate-50/50"></td></tr>)
                ) : summary.length > 0 ? (
                  summary.map((item) => (
                    <tr key={item.userId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="font-bold text-slate-900 dark:text-white">{item.userFullName}</td>
                      <td className="font-mono font-bold text-slate-700">{currency}{item.baseSalary}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.totalAbsences > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500'}`}>
                          {item.totalAbsences} Days
                        </span>
                      </td>
                      <td className="font-mono font-bold text-rose-600">-{currency}{item.totalDeductions}</td>
                      <td className="font-mono font-bold text-emerald-600">{currency}{item.finalSalary}</td>
                      <td>
                        {item.totalAbsences === 0 ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase">
                            <CheckCircle2 size={12} /> Perfect
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 uppercase">
                            <Clock size={12} /> Deducted
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-500 font-bold">No data available for this month.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Attendance;
