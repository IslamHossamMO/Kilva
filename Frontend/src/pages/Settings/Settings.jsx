import React, { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import {
  Settings as SettingsIcon,
  Palette,
  Globe,
  Bell,
  Shield,
  Building,
  Upload,
  Check,
  Save,
  Moon,
  Sun,
  Layout,
  Type
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const Settings = () => {
  const { settings, currency, updateSetting, updateCurrency, refreshSettings } = useSettings();
  const [loading, setLoading] = useState(false);

  const [localSettings, setLocalSettings] = useState({
    companyName: settings.companyName || 'My Business',
    primaryColor: settings.primaryColor || '#2563eb',
    secondaryColor: settings.secondaryColor || '#f8fafc',
    popupColor: settings.popupColor || '#ffffff',
    currency: currency || '$',
    notificationsEnabled: settings.notificationsEnabled === 'true',
    companyLogo: settings.companyLogo || ''
  });

  const handleSave = async (key, value) => {
    setLoading(true);
    try {
      await updateSetting(key, value.toString());
      toast.success(`${key} updated successfully`);
    } catch (error) {
      toast.error('Failed to update setting');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setLocalSettings({ ...localSettings, companyLogo: base64String });
        handleSave('companyLogo', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const primaryColors = [
    { name: 'Blue', value: '#2563eb' },
    { name: 'Indigo', value: '#4f46e5' },
    { name: 'Slate', value: '#0f172a' },
    { name: 'Emerald', value: '#059669' },
    { name: 'Rose', value: '#e11d48' },
    { name: 'Orange', value: '#ea580c' },
  ];

  const secondaryColors = [
    { name: 'Slate 50', value: '#f8fafc' },
    { name: 'Gray 50', value: '#f9fafb' },
    { name: 'Blue 50', value: '#eff6ff' },
    { name: 'Sky 50', value: '#f0f9ff' },
    { name: 'Neutral 50', value: '#fafafa' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-sm text-slate-700 mt-1 font-medium">Manage your company branding and preferences.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Branding Section */}
        <section className="admin-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
            <Building size={20} className="text-slate-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Branding</h3>
          </div>
          <div className="p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Company Name</label>
                <div className="flex gap-2">
                  <input
                    className="admin-input"
                    value={localSettings.companyName}
                    onChange={(e) => setLocalSettings({ ...localSettings, companyName: e.target.value })}
                  />
                  <button
                    onClick={() => handleSave('companyName', localSettings.companyName)}
                    className="admin-btn-primary !px-3"
                  >
                    <Save size={16} />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Company Logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden">
                    {localSettings.companyLogo ? (
                      <img src={localSettings.companyLogo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Upload size={20} className="text-slate-300" />
                    )}
                  </div>
                  <label className="admin-btn-secondary cursor-pointer">
                    Upload Image
                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-700">Primary Branding Color</label>
              <div className="flex flex-wrap gap-3">
                {primaryColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => {
                      setLocalSettings({ ...localSettings, primaryColor: color.value });
                      handleSave('primaryColor', color.value);
                    }}
                    className={`w-10 h-10 rounded-md transition-all relative flex items-center justify-center ${localSettings.primaryColor === color.value ? 'ring-2 ring-offset-2 ring-slate-400' : 'hover:opacity-80'
                      }`}
                    style={{ backgroundColor: color.value }}
                  >
                    {localSettings.primaryColor === color.value && <Check className="text-white" size={16} />}
                  </button>
                ))}
                <input
                  type="color"
                  value={localSettings.primaryColor}
                  onChange={(e) => {
                    setLocalSettings({ ...localSettings, primaryColor: e.target.value });
                  }}
                  onBlur={(e) => handleSave('primaryColor', e.target.value)}
                  className="w-10 h-10 p-0.5 rounded-md border border-slate-200 cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-700">Background Tint (Secondary)</label>
              <div className="flex flex-wrap gap-3">
                {secondaryColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => {
                      setLocalSettings({ ...localSettings, secondaryColor: color.value });
                      handleSave('secondaryColor', color.value);
                    }}
                    className={`w-10 h-10 rounded-md border transition-all relative flex items-center justify-center ${localSettings.secondaryColor === color.value ? 'ring-2 ring-offset-2 ring-slate-400 border-transparent' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    style={{ backgroundColor: color.value }}
                  >
                    {localSettings.secondaryColor === color.value && <Check className="text-slate-600" size={16} />}
                  </button>
                ))}
                <input
                  type="color"
                  value={localSettings.secondaryColor}
                  onChange={(e) => setLocalSettings({ ...localSettings, secondaryColor: e.target.value })}
                  onBlur={(e) => handleSave('secondaryColor', e.target.value)}
                  className="w-10 h-10 p-0.5 rounded-md border border-slate-200 cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-700">Popups & Modals Color</label>
              <div className="flex flex-wrap gap-3">
                <input
                  type="color"
                  value={localSettings.popupColor}
                  onChange={(e) => setLocalSettings({ ...localSettings, popupColor: e.target.value })}
                  onBlur={(e) => handleSave('popupColor', e.target.value)}
                  className="w-10 h-10 p-0.5 rounded-md border border-slate-200 cursor-pointer"
                />
                <span className="text-xs text-slate-500 flex items-center">Choose a base color for dialogs and alerts.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Preferences Section */}
        <section className="admin-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <Palette size={20} className="text-slate-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Preferences</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700">Regional Currency</p>
                <select
                  className="admin-input"
                  value={localSettings.currency}
                  onChange={async (e) => {
                    const newCurrency = e.target.value;
                    setLocalSettings({ ...localSettings, currency: newCurrency });
                    setLoading(true);
                    try {
                      await updateCurrency(newCurrency);
                      toast.success('Currency updated successfully');
                    } catch (error) {
                      toast.error('Failed to update currency');
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  <option value="$">USD ($)</option>
                  <option value="€">EUR (€)</option>
                  <option value="£">GBP (£)</option>
                  <option value="E£">EGP (E£)</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden opacity-60">
          <div className="p-8 border-b border-slate-50 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Shield size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Security & Privacy</h3>
              <p className="text-sm font-medium text-slate-500">Manage API keys and access control policies.</p>
            </div>
          </div>
          <div className="p-8 text-center py-12">
            <p className="font-bold text-slate-400">Advanced security options are currently being updated.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
