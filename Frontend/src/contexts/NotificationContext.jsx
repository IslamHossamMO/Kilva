import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../api/axios';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const response = await api.get('/notification');
      const data = response.data;
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notification/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const addNotification = (notif) => {
    const newNotif = { id: Date.now(), isRead: false, createdAt: new Date(), ...notif };
    setNotifications(prev => [newNotif, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, addNotification, refresh: fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
