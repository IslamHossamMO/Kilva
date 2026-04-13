import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  Users as UsersIcon, 
  UserPlus, 
  Search, 
  MoreVertical, 
  Mail, 
  Phone, 
  Shield, 
  Trash2, 
  Edit2,
  Filter,
  CheckCircle2,
  XCircle,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';

const Users = () => {
  const { hasPermission } = useAuth();
  const { currency } = useSettings();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ fullName: '', email: '', password: '', phoneNumber: '', salary: '', position: '' });
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [userRoleIds, setUserRoleIds] = useState([]);

  const fetchUsers = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        api.get('/user'),
        api.get('/role')
      ]);
      setUsers(usersRes.data);
      setAvailableRoles(rolesRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      // Pass an empty array for roleIds if your backend expects it
      await api.post('/user', { ...newUser, salary: parseFloat(newUser.salary) || 0, roleIds: [] });
      toast.success('User created successfully');
      setShowAddModal(false);
      setNewUser({ fullName: '', email: '', password: '', phoneNumber: '', salary: '', position: '' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data || 'Failed to create user');
    }
  };

  const handleDeleteUser = async (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-bold text-slate-900 dark:text-white">Are you sure you want to delete this user?</p>
        <div className="flex gap-2 justify-end">
          <button 
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded"
          >
            Cancel
          </button>
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await api.delete(`/user/${id}`);
                toast.success('User deleted successfully');
                fetchUsers();
              } catch (error) {
                toast.error('Failed to delete user');
              }
            }}
            className="px-3 py-1.5 text-xs font-bold bg-rose-500 text-white rounded hover:bg-rose-600"
          >
            Delete
          </button>
        </div>
      </div>
    ), { duration: 5000, position: 'top-center' });
  };

  const handleAssignRoles = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/user/${selectedUser.id}/roles`, { roleIds: userRoleIds });
      toast.success('Roles assigned successfully');
      setShowRoleModal(false);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to assign roles');
    }
  };

  const filteredUsers = users.filter(user => 
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Team Management</h1>
          <p className="text-sm text-slate-700 mt-1 font-medium">Manage your company's staff members and their access levels.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/attendance')}
            className="admin-btn-secondary flex items-center gap-2"
          >
            <Calendar size={18} />
            Tracker
          </button>
          {hasPermission('users.create') && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="admin-btn-primary flex items-center gap-2"
            >
              <UserPlus size={18} />
              Add Member
            </button>
          )}
        </div>
      </div>

      {/* Stats & Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="admin-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <UsersIcon size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Total Members</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{users.length}</p>
          </div>
        </div>
        <div className="md:col-span-2 admin-card p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search by name or email..."
              className="admin-input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="admin-card overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Contact Info</th>
              <th>Roles</th>
              <th>Position</th>
              <th>Salary</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1, 2, 3].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="7" className="h-16 bg-slate-50/50"></td>
                </tr>
              ))
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm">
                        {user.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{user.fullName}</p>
                        <p className="text-xs text-slate-700 font-medium">ID: {user.id.toString().slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-800 font-semibold">
                        <Mail size={12} className="text-slate-600" />
                        {user.email}
                      </div>
                      {user.phoneNumber && (
                        <div className="flex items-center gap-2 text-xs text-slate-800 font-semibold">
                          <Phone size={12} className="text-slate-600" />
                          {user.phoneNumber}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1.5">
                      {user.roles?.map((role, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[10px] font-bold uppercase">
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="text-xs font-semibold text-slate-700">{user.position || '-'}</td>
                  <td className="text-xs font-semibold text-slate-700">{user.salary ? `${currency}${user.salary}` : '-'}</td>
                  <td>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold uppercase">
                      <CheckCircle2 size={10} /> Active
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-2">
                      {hasPermission('users.manage') && (
                        <>
                          <button 
                            onClick={() => {
                              setSelectedUser(user);
                              setUserRoleIds(availableRoles.filter(r => user.roles?.includes(r.name)).map(r => r.id));
                              setShowRoleModal(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Manage Access"
                          >
                            <Shield size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Remove"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-4 py-12 text-center text-slate-600 font-bold">
                  No members found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal (Simplified) */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-bold text-slate-900 dark:text-white">Add New Member</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-slate-800"><XCircle size={20} /></button>
              </div>
              <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
                  <input 
                    required
                    className="admin-input"
                    value={newUser.fullName}
                    onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
                  <input 
                    type="email"
                    required
                    className="admin-input"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
                  <input 
                    type="password"
                    required
                    className="admin-input"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Phone Number</label>
                  <input 
                    className="admin-input"
                    value={newUser.phoneNumber}
                    onChange={(e) => setNewUser({...newUser, phoneNumber: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Position</label>
                  <input 
                    className="admin-input"
                    placeholder="e.g. Sales Manager"
                    value={newUser.position}
                    onChange={(e) => setNewUser({...newUser, position: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Salary</label>
                  <input 
                    type="number"
                    className="admin-input"
                    placeholder="e.g. 2000"
                    value={newUser.salary}
                    onChange={(e) => setNewUser({...newUser, salary: e.target.value})}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowAddModal(false)} className="admin-btn-secondary flex-1">Cancel</button>
                  <button type="submit" className="admin-btn-primary flex-1">Create Member</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Role Assignment Modal (Simplified) */}
      <AnimatePresence>
        {showRoleModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Manage Access</h3>
                  <p className="text-xs text-slate-500">{selectedUser.fullName}</p>
                </div>
                <button onClick={() => setShowRoleModal(false)} className="text-slate-400 hover:text-slate-600"><XCircle size={20} /></button>
              </div>
              <form onSubmit={handleAssignRoles} className="p-6 space-y-6">
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                  {availableRoles.map(role => (
                    <label key={role.id} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                      <input 
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        checked={userRoleIds.includes(role.id)}
                        onChange={(e) => {
                          if (e.target.checked) setUserRoleIds([...userRoleIds, role.id]);
                          else setUserRoleIds(userRoleIds.filter(id => id !== role.id));
                        }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-700">{role.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Access Level</p>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowRoleModal(false)} className="admin-btn-secondary flex-1">Cancel</button>
                  <button type="submit" className="admin-btn-primary flex-1">Save Access</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Users;
