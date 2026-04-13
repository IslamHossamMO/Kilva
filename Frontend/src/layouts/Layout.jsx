import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { motion, AnimatePresence } from 'framer-motion';
import AIAssistant from '../pages/AI/AIAssistant';
import { Bot, MessageSquare } from 'lucide-react';

const Layout = () => {
  const { user, loading, hasPermission } = useAuth();
  const { loading: settingsLoading, getSetting } = useSettings();
  const [aiOpen, setAiOpen] = useState(false);

  const primaryColor = getSetting('primaryColor', '#4f46e5');

  if (loading || settingsLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50/50">
        <div className="relative flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">Initializing System</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-[var(--secondary-color)] transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-8 scroll-smooth scrollbar-hide">
          <div className="max-w-[1200px] mx-auto pb-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={window.location.pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* AI Floating Action Button & Popup */}
      {hasPermission('ai.query') && (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
          <AnimatePresence>
            {aiOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="w-80 h-[450px] shadow-xl border border-slate-200 rounded-lg overflow-hidden mb-2 bg-white"
              >
                <AIAssistant onClose={() => setAiOpen(false)} />
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setAiOpen(!aiOpen)}
            className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-colors"
            style={{ backgroundColor: 'var(--primary-color)' }}
          >
            {aiOpen ? <MessageSquare size={20} /> : <Bot size={20} />}
          </button>
        </div>
      )}
    </div>
  );
};

export default Layout;
