import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Save, 
  Shield, 
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phoneNumber: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || ''
      });
    }
  }, [user]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/auth/profile', profileData);
      const updatedUser = { ...user, ...profileData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    
    setLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password changed successfully');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Account Profile</h1>
        <p className="text-sm text-slate-700 font-medium mt-1">Manage your personal information and security settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Summary Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="admin-card p-8 text-center">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-4xl font-bold shadow-inner">
                {user?.fullName?.charAt(0)}
              </div>
              <button className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center shadow-lg border-4 border-white hover:scale-110 transition-transform">
                <Camera size={18} />
              </button>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{user?.fullName}</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{user?.roles?.[0] || 'User'}</p>
            
            <div className="mt-8 pt-8 border-t border-slate-50 flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 font-bold">Status</span>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase">Active</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 font-bold">Member Since</span>
                <span className="text-slate-700 font-bold">Apr 2026</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setShowPasswordModal(true)}
            className="w-full py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm group"
          >
            <KeyRound size={18} className="text-indigo-600 group-hover:rotate-12 transition-transform" />
            Change Password
          </button>
        </div>

        {/* Right Column - Edit Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleUpdateProfile} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Personal Information</h3>
              <p className="text-sm font-medium text-slate-500">Update your account details and contact information.</p>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                  <input 
                    required 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold text-slate-700"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input 
                      required 
                      type="email"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold text-slate-700"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Phone Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input 
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold text-slate-700"
                      value={profileData.phoneNumber}
                      onChange={(e) => setProfileData({...profileData, phoneNumber: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full sm:w-auto px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  <Save size={20} />
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPasswordModal(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-10"
            >
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Update Password</h2>
              <p className="text-slate-500 font-medium mb-8">Ensure your account is using a strong, unique password.</p>
              
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Current Password</label>
                  <div className="relative">
                    <input 
                      required 
                      type={showPass.current ? "text" : "password"}
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold text-slate-700"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    />
                    <button type="button" onClick={() => setShowPass({...showPass, current: !showPass.current})} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPass.current ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">New Password</label>
                  <div className="relative">
                    <input 
                      required 
                      type={showPass.new ? "text" : "password"}
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold text-slate-700"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    />
                    <button type="button" onClick={() => setShowPass({...showPass, new: !showPass.new})} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPass.new ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Confirm New Password</label>
                  <div className="relative">
                    <input 
                      required 
                      type={showPass.confirm ? "text" : "password"}
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold text-slate-700"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    />
                    <button type="button" onClick={() => setShowPass({...showPass, confirm: !showPass.confirm})} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPass.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">Cancel</button>
                  <button type="submit" disabled={loading} className="flex-2 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">Update Password</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
