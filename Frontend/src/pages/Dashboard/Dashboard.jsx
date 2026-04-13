import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Activity as ActivityIcon,
  Wallet,
  Users,
  Truck
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => (
  <div className="admin-card p-6">
    <div className="flex items-center justify-between mb-4">
      <div className={cn("p-2 rounded-md", color)}>
        <Icon size={20} />
      </div>
      {trend && (
        <span className={cn(
          "text-xs font-bold px-2 py-0.5 rounded-full",
          trend === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
        )}>
          {trend === 'up' ? '↑' : '↓'} {trendValue}%
        </span>
      )}
    </div>
    <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">{title}</p>
    <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</h3>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 bg-slate-100 rounded-lg"></div>
        ))}
      </div>
    );
  }

  const chartData = stats?.chartData || [];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-700 mt-1 font-medium">Overview of your business performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="admin-btn-secondary flex items-center gap-2">
            Download Report
          </button>
          <button className="admin-btn-primary flex items-center gap-2">
            New Order <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${stats?.totalRevenue.toLocaleString()}`}
          icon={TrendingUp}
          color="bg-blue-50 text-blue-600"
          trend="up"
          trendValue="12.5"
        />
        <StatCard
          title="Total Expenses"
          value={`$${stats?.totalExpenses.toLocaleString()}`}
          icon={TrendingDown}
          color="bg-slate-50 text-slate-600"
          trend="down"
          trendValue="4.2"
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders}
          icon={ShoppingCart}
          color="bg-blue-50 text-blue-600"
          trend="up"
          trendValue="8.1"
        />
        <StatCard
          title="Low Stock"
          value={stats?.lowStockProducts.length}
          icon={AlertTriangle}
          color="bg-orange-50 text-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 admin-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Revenue Performance</h3>
            <select className="admin-input !w-40">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-80 w-full min-h-[320px]">
            {stats && (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fill="#dbeafe"
                    fillOpacity={0.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="admin-card p-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {(stats?.recentActivities || []).map((activity, idx) => {
              let ActivityIconType = ActivityIcon;
              let iconColor = 'text-slate-600 bg-slate-50';
              
              if (activity.type === 'Order') {
                ActivityIconType = ShoppingCart;
                iconColor = 'text-emerald-600 bg-emerald-50';
              } else if (activity.type === 'Expense') {
                ActivityIconType = Wallet;
                iconColor = 'text-rose-600 bg-rose-50';
              } else if (activity.type === 'Product' || activity.type === 'Inventory') {
                ActivityIconType = Package;
                iconColor = 'text-blue-600 bg-blue-50';
              } else if (activity.type === 'User') {
                ActivityIconType = Users;
                iconColor = 'text-purple-600 bg-purple-50';
              }

              return (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn("p-2 rounded-lg", iconColor)}>
                    <ActivityIconType size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{activity.title}</p>
                    <p className="text-xs text-slate-700 font-medium">
                      {format(new Date(activity.createdAt), 'MMM d, h:mm a')} {activity.detail && `• ${activity.detail}`}
                    </p>
                  </div>
                </div>
                {activity.amount && (
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{activity.amount}</span>
                )}
              </div>
            )})}
          </div>
          <button className="w-full mt-8 py-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors border-t border-slate-100 pt-4">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
