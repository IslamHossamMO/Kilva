import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Potentially verify token or fetch user info here
    }
    setLoading(false);
  }, []);

  const login = async (identifier, password) => {
    try {
      const response = await api.post('/auth/login', { identifier, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data || 'Login failed' 
      };
    }
  };

  const register = async (data) => {
    try {
      const response = await api.post('/auth/register', data);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    
    // SuperAdmin or Owner has all permissions
    if (user.roles?.includes('SuperAdmin') || user.roles?.includes('Owner')) {
      return true;
    }

    if (!user.permissions) return false;

    // Direct match
    if (user.permissions.includes(permission)) return true;

    // Hierarchical checks
    const [module, action] = permission.split('.');
    
    if (action === 'view') {
      return (
        user.permissions.includes(`${module}.create`) || 
        user.permissions.includes(`${module}.manage`) ||
        user.permissions.includes(`${module}.view`)
      );
    }

    if (action === 'create') {
      return (
        user.permissions.includes(`${module}.manage`) ||
        user.permissions.includes(`${module}.create`)
      );
    }

    return false;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
