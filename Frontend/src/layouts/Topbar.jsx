import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { useNotifications } from '../contexts/NotificationContext';
import { 
  Bell, 
  Search, 
  LogOut, 
  User, 
  ChevronDown, 
  Shield, 
  Building,
  Menu,
  Clock,
  X,
  Info,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Topbar = () => {
  const { user, logout, hasPermission } = useAuth();
  const { getSetting } = useSettings();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();

  const companyName = getSetting('companyName', 'Nexus Admin');

  const getNotifIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertTriangle size={14} className="text-amber-500" />;
      case 'success': return <CheckCircle2 size={14} className="text-emerald-500" />;
      case 'error': return <X size={14} className="text-rose-500" />;
      default: return <Info size={14} className="text-blue-500" />;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30 transition-all">
      <div className="flex items-center gap-4">
        <button className="lg:hidden text-slate-500 hover:text-slate-700 transition-colors p-1.5 hover:bg-slate-50 rounded-md">
          <Menu size={20} />
        </button>
        <div className="hidden lg:flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Business Intelligence</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button 
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-md transition-all"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-4 h-4 bg-rose-500 rounded-full border-2 border-white text-[8px] font-bold text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-slate-200 py-1 z-50 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Notifications</h3>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">{unreadCount} New</span>
                </div>
                <div className="max-h-96 overflow-y-auto scrollbar-hide">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell size={24} className="mx-auto text-slate-200 mb-2" />
                      <p className="text-xs text-slate-400">All caught up!</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        onClick={() => markAsRead(n.id)}
                        className={cn(
                          "px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50 last:border-0",
                          !n.isRead && "bg-blue-50/30"
                        )}
                      >
                        <div className="flex gap-3">
                          <div className="mt-0.5">{getNotifIcon(n.type)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">{n.title}</p>
                            <p className="text-xs text-slate-600 line-clamp-2 leading-tight">{n.message}</p>
                            <div className="flex items-center gap-1.5 mt-2 text-[10px] font-medium text-slate-400">
                              <Clock size={10} />
                              {format(new Date(n.createdAt), 'h:mm a')}
                            </div>
                          </div>
                          {!n.isRead && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1"></div>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <button className="w-full py-2 text-center text-xs font-bold text-blue-600 hover:bg-slate-50 border-t border-slate-100 transition-colors">
                  View All Activity
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-6 w-px bg-slate-200 mx-1"></div>

        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 p-1 hover:bg-slate-50 rounded-md transition-all group"
          >
            <div className="w-8 h-8 rounded bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs border border-slate-200 group-hover:bg-slate-200 transition-colors">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-slate-700 leading-none">{user?.fullName}</p>
            </div>
            <ChevronDown size={14} className={cn("text-slate-400 transition-transform duration-200", dropdownOpen && "rotate-180")} />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-slate-200 py-1 z-50"
              >
                <div className="px-4 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account</p>
                  <p className="text-sm font-bold text-slate-700 truncate mt-1">{user?.email}</p>
                </div>

                <button 
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/profile');
                  }}
                  className="w-full px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                >
                  <User size={16} className="text-slate-400" />
                  Profile
                </button>
                {hasPermission('settings.view') && (
                  <button 
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/settings');
                    }}
                    className="w-full px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                  >
                    <Building size={16} className="text-slate-400" />
                    Settings
                  </button>
                )}
                
                <div className="h-px bg-slate-100 my-1"></div>
                
                <button 
                  onClick={logout}
                  className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors font-medium"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
