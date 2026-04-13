import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  Package, 
  ShoppingCart, 
  Wallet, 
  Truck, 
  Settings, 
  History, 
  Bot,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Sidebar = () => {
  const { hasPermission } = useAuth();
  const { getSetting } = useSettings();

  const navigation = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, permission: 'dashboard.view' },
    { name: 'Team', to: '/users', icon: Users, permission: 'users.view' },
    { name: 'Attendance', to: '/attendance', icon: Calendar, permission: 'users.view' },
    { name: 'Access', to: '/roles', icon: ShieldCheck, permission: 'roles.view' },
    { name: 'Inventory', to: '/products', icon: Package, permission: 'products.view' },
    { name: 'Sales', to: '/orders', icon: ShoppingCart, permission: 'orders.view' },
    { name: 'Finances', to: '/expenses', icon: Wallet, permission: 'expenses.view' },
    { name: 'Logistics', to: '/deliveries', icon: Truck, permission: 'deliveries.view' },
    { name: 'History', to: '/audit-logs', icon: History, permission: 'audit-logs.view' },
    { name: 'Branding', to: '/settings', icon: Settings, permission: 'settings.view' },
  ];

  const primaryColor = getSetting('primaryColor', '#2563eb');
  const companyName = getSetting('companyName', 'Nexus Admin');
  const companyLogo = getSetting('companyLogo');

  return (
    <aside 
      className="w-64 h-full border-r border-slate-200 flex flex-col text-slate-300 transition-colors duration-300"
      style={{ backgroundColor: 'color-mix(in srgb, var(--primary-color), black 80%)' }}
    >
      <div className="h-16 flex items-center gap-3 px-6 border-b border-white/10">
        <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-white font-bold text-sm">
          {companyLogo ? (
            <img src={companyLogo} alt="Logo" className="w-full h-full object-cover rounded" />
          ) : (
            companyName.charAt(0)
          )}
        </div>
        <span className="text-base font-bold text-white truncate">{companyName}</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-hide">
        {navigation.map((item) => {
          if (!hasPermission(item.permission)) return null;

          return (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) => cn(
                "group flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive 
                  ? "bg-white/10 text-white" 
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon 
                    size={18} 
                    className={cn(
                      "transition-colors",
                      isActive ? "text-white" : "text-white/40 group-hover:text-white/70"
                    )} 
                  />
                  {item.name}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700/50">
        <div className="bg-slate-800/50 rounded-lg p-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Support</p>
          <button className="w-full text-left text-xs text-slate-400 hover:text-white transition-colors py-1 flex items-center gap-2">
            <ShieldCheck size={14} /> Documentation
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
