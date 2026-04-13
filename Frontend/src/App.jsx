import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './layouts/Layout';
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Users from './pages/Users/Users';
import Roles from './pages/Roles/Roles';
import Products from './pages/Products/Products';
import Orders from './pages/Orders/Orders';
import Expenses from './pages/Expenses/Expenses';
import Deliveries from './pages/Deliveries/Deliveries';
import Settings from './pages/Settings/Settings';
import AuditLogs from './pages/AuditLogs/AuditLogs';
import AIAssistant from './pages/AI/AIAssistant';
import Profile from './pages/Auth/Profile';
import Attendance from './pages/Attendance/Attendance';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';

// Simple placeholder components for now
const Placeholder = ({ name }) => (
  <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">{name} Module</h2>
    <p className="text-gray-500">The {name.toLowerCase()} management system is currently being initialized...</p>
    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-32 bg-gray-50 rounded-xl animate-pulse"></div>
      ))}
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <NotificationProvider>
          <ErrorBoundary>
            <Router>
              <Toaster position="top-right" />
              <Routes>
                <Route path="/login" element={<Login />} />
                
                <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<ProtectedRoute permission="dashboard.view"><Dashboard /></ProtectedRoute>} />
                  <Route path="users" element={<ProtectedRoute permission="users.view"><Users /></ProtectedRoute>} />
                  <Route path="attendance" element={<ProtectedRoute permission="attendance.view"><Attendance /></ProtectedRoute>} />
                  <Route path="roles" element={<ProtectedRoute permission="roles.view"><Roles /></ProtectedRoute>} />
                  <Route path="products" element={<ProtectedRoute permission="products.view"><Products /></ProtectedRoute>} />
                  <Route path="orders" element={<ProtectedRoute permission="orders.view"><Orders /></ProtectedRoute>} />
                  <Route path="expenses" element={<ProtectedRoute permission="expenses.view"><Expenses /></ProtectedRoute>} />
                  <Route path="deliveries" element={<ProtectedRoute permission="deliveries.view"><Deliveries /></ProtectedRoute>} />
                  <Route path="settings" element={<ProtectedRoute permission="settings.view"><Settings /></ProtectedRoute>} />
                  <Route path="audit-logs" element={<ProtectedRoute permission="audit-logs.view"><AuditLogs /></ProtectedRoute>} />
                  <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                </Route>

                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Router>
          </ErrorBoundary>
        </NotificationProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
