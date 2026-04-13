import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({});
  const [currency, setCurrency] = useState('$');
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [settingRes, companyRes] = await Promise.all([
        api.get('/setting'),
        api.get('/company/me')
      ]);
      
      const settingsMap = (settingRes.data || []).reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});
      setSettings(settingsMap);
      if (companyRes.data && companyRes.data.currency) {
        setCurrency(companyRes.data.currency);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      // Don't toast error here as it might be a silent failure for some roles
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSettings();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Apply theme and colors to document root
    const root = document.documentElement;
    const primary = settings.primaryColor || '#2563eb';
    const secondary = settings.secondaryColor || '#f8fafc';
    const popup = settings.popupColor || '#ffffff';

    // Always remove dark mode as requested
    root.classList.remove('dark');

    root.style.setProperty('--primary-color', primary);
    root.style.setProperty('--secondary-color', secondary);
    root.style.setProperty('--popup-color', popup);
  }, [settings]);

  const updateSetting = async (key, value) => {
    try {
      await api.put('/setting', { key, value });
      setSettings((prev) => ({ ...prev, [key]: value }));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data || 'Update failed' };
    }
  };

  const getSetting = (key, defaultValue = null) => {
    return settings[key] ?? defaultValue;
  };

  const updateCurrency = async (newCurrency) => {
    try {
      await api.put('/company', { currency: newCurrency });
      setCurrency(newCurrency);
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, currency, loading, getSetting, updateSetting, updateCurrency, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
