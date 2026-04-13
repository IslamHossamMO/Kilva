import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  Shield, 
  Plus, 
  Check, 
  X, 
  Trash2, 
  Lock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const Roles = () => {
  const { hasPermission } = useAuth();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [newRoleName, setNewRoleName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const fetchData = async () => {
    try {
      const rolesRes = await api.get('/role');
      setRoles(rolesRes.data);
      
      if (hasPermission('permissions.view')) {
        const permsRes = await api.get('/role/permissions');
        setPermissions(permsRes.data);
      }
    } catch (error) {
      toast.error('Failed to fetch roles or permissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateRole = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/role', { name: newRoleName });
      const roleId = response.data.id;
      
      if (selectedPermissions.length > 0) {
        await api.post(`/role/${roleId}/permissions`, { permissionIds: selectedPermissions });
      }
      
      toast.success('Role created successfully');
      setShowAddModal(false);
      setNewRoleName('');
      setSelectedPermissions([]);
      fetchData();
    } catch (error) {
      toast.error('Failed to create role');
    }
  };

  const handleDeleteRole = async (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-bold text-slate-900 dark:text-white">Are you sure you want to delete this role?</p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded">Cancel</button>
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await api.delete(`/role/${id}`);
                toast.success('Role deleted successfully');
                fetchData();
              } catch (error) {
                toast.error('Failed to delete role');
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

  const togglePermission = (permId) => {
    setSelectedPermissions(prev => 
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Roles & Permissions</h1>
          <p className="text-sm text-slate-700 mt-1 font-medium">Manage user roles and their associated access levels.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="admin-btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          <span>New Role</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Roles List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="admin-card overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-300">Available Roles</h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="p-4 animate-pulse space-y-2">
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2"></div>
                    <div className="h-3 bg-slate-50 dark:bg-slate-900 rounded w-1/4"></div>
                  </div>
                ))
              ) : roles.map((role) => (
                <div
                  key={role.id}
                  className={`p-4 transition-colors cursor-pointer flex items-center justify-between group ${
                    editingRole?.id === role.id 
                      ? 'bg-slate-50 dark:bg-slate-800/50' 
                      : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                  }`}
                  onClick={() => {
                    setEditingRole(role);
                    setSelectedPermissions((role.permissions || []).map(p => p.id));
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded flex items-center justify-center ${
                      editingRole?.id === role.id 
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-200 dark:text-slate-700'
                    }`}>
                      <Shield size={16} />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${
                        editingRole?.id === role.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-slate-300'
                      }`}>{role.name}</p>
                      <p className="text-xs text-slate-700 font-medium">{(role.permissions || []).length} permissions</p>
                    </div>
                  </div>
                  {role.name !== 'SuperAdmin' && role.name !== 'Owner' && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRole(role.id);
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Permissions Editor */}
        <div className="lg:col-span-8">
          <div className="admin-card h-full flex flex-col min-h-[500px]">
            {editingRole ? (
              <>
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Permissions: {editingRole.name}</h3>
                    <p className="text-xs text-slate-700 dark:text-slate-400 mt-0.5 font-medium">Group access by business section.</p>
                  </div>
                  {editingRole.name !== 'SuperAdmin' && editingRole.name !== 'Owner' && (
                    <button 
                      onClick={async () => {
                        try {
                          await api.post(`/role/${editingRole.id}/permissions`, { permissionIds: selectedPermissions });
                          toast.success('Permissions updated successfully');
                          fetchData();
                        } catch (error) {
                          toast.error('Failed to update permissions');
                        }
                      }}
                      className="admin-btn-primary py-1.5 text-xs"
                    >
                      Save Changes
                    </button>
                  )}
                </div>
                <div className="p-6 flex-1 overflow-y-auto">
                  <div className="space-y-6">
                    {(() => {
                      const sections = [
                        { id: 'sales', name: 'Sales', module: 'orders' },
                        { id: 'inventory', name: 'Inventory', module: 'products' },
                        { id: 'logistics', name: 'Logistics', module: 'deliveries' },
                        { id: 'attendance', name: 'Attendance', module: 'attendance' },
                        { id: 'finance', name: 'Finance', module: 'expenses' },
                        { id: 'team', name: 'Team & Access', module: 'users', extra: ['roles', 'permissions', 'audit-logs', 'dashboard'] },
                        { id: 'settings', name: 'Business Settings', module: 'settings' }
                      ];

                      return sections.map(section => {
                        const isReadOnlyRole = editingRole.name === 'SuperAdmin' || editingRole.name === 'Owner';
                        
                        // Determine current level
                        const hasView = (mod) => permissions.some(p => p.name === `${mod}.view` && selectedPermissions.includes(p.id));
                        const hasCreate = (mod) => permissions.some(p => p.name === `${mod}.create` && selectedPermissions.includes(p.id));
                        const hasManage = (mod) => permissions.some(p => p.name === `${mod}.manage` && selectedPermissions.includes(p.id));

                        let currentLevel = 'none';
                        if (hasManage(section.module)) currentLevel = 'full';
                        else if (hasCreate(section.module)) currentLevel = 'write';
                        else if (hasView(section.module)) currentLevel = 'read';

                        const setLevel = (level) => {
                          if (isReadOnlyRole) return;
                          
                          const modules = [section.module, ...(section.extra || [])];
                          let nextPerms = [...selectedPermissions];

                          modules.forEach(m => {
                            const vPerm = permissions.find(p => p.name === `${m}.view`);
                            const cPerm = permissions.find(p => p.name === `${m}.create`);
                            const mPerm = permissions.find(p => p.name === `${m}.manage`);

                            // Remove all existing for this module first
                            if (vPerm) nextPerms = nextPerms.filter(id => id !== vPerm.id);
                            if (cPerm) nextPerms = nextPerms.filter(id => id !== cPerm.id);
                            if (mPerm) nextPerms = nextPerms.filter(id => id !== mPerm.id);

                            if (level === 'read') {
                              if (vPerm) nextPerms.push(vPerm.id);
                            } else if (level === 'write') {
                              if (vPerm) nextPerms.push(vPerm.id);
                              if (cPerm) nextPerms.push(cPerm.id);
                              // Fallback if .create is missing but .manage exists
                              else if (mPerm) nextPerms.push(mPerm.id); 
                            } else if (level === 'full') {
                              if (vPerm) nextPerms.push(vPerm.id);
                              if (cPerm) nextPerms.push(cPerm.id);
                              if (mPerm) nextPerms.push(mPerm.id);
                            }
                          });

                          setSelectedPermissions([...new Set(nextPerms)]);
                        };

                        return (
                          <div key={section.id} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{section.name}</h4>
                              <div className="flex bg-white dark:bg-slate-800 rounded-md p-1 border border-slate-200 dark:border-slate-700">
                                {[
                                  { id: 'none', label: 'None' },
                                  { id: 'read', label: 'Read Only' },
                                  { id: 'write', label: 'Read/Write' },
                                  { id: 'full', label: 'Full Access' }
                                ].map(opt => {
                                  // Special check for active state logic
                                  let isActive = currentLevel === opt.id;
                                  if (opt.id === 'write' && currentLevel === 'full') isActive = false;
                                  
                                  return (
                                    <button
                                      key={opt.id}
                                      onClick={() => setLevel(opt.id)}
                                      disabled={isReadOnlyRole}
                                      className={`px-3 py-1 scale-90 text-[10px] font-bold rounded transition-all ${
                                        isActive
                                          ? 'bg-blue-600 text-white'
                                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-700'
                                      }`}
                                    >
                                      {opt.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium">
                              {currentLevel === 'none' && 'No access to this section.'}
                              {currentLevel === 'read' && 'User can view data but cannot change anything.'}
                              {currentLevel === 'write' && 'User can view and create records, but cannot delete or manage critical settings.'}
                              {currentLevel === 'full' && 'Total administrative control over this section.'}
                            </p>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4 text-slate-300 dark:text-slate-700">
                  <Shield size={32} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Role Selected</h3>
                <p className="text-xs text-slate-700 dark:text-slate-400 mt-1 max-w-[200px] mx-auto font-medium">
                  Select a role from the left to manage its permissions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Role Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-white dark:bg-[#1e293b] rounded-lg shadow-xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create New Role</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleCreateRole} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider">Role Name</label>
                  <input 
                    type="text"
                    required
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    className="admin-input"
                    placeholder="e.g. Manager, Sales Representative"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider">Access Categories</label>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-1 scrollbar-hide">
                    {(() => {
                      const sections = [
                        { id: 'sales', name: 'Sales', module: 'orders' },
                        { id: 'inventory', name: 'Inventory', module: 'products' },
                        { id: 'logistics', name: 'Logistics', module: 'deliveries' },
                        { id: 'attendance', name: 'Attendance', module: 'attendance' },
                        { id: 'finance', name: 'Finance', module: 'expenses' },
                        { id: 'team', name: 'Team Access', module: 'users', extra: ['roles', 'permissions', 'audit-logs', 'dashboard'] },
                        { id: 'settings', name: 'Business Settings', module: 'settings' }
                      ];

                      return sections.map(section => {
                        const hasView = (mod) => permissions.some(p => p.name === `${mod}.view` && selectedPermissions.includes(p.id));
                        return (
                          <div 
                            key={section.id}
                            onClick={() => {
                              const modules = [section.module, ...(section.extra || [])];
                              let nextPerms = [...selectedPermissions];
                              const isGranting = !hasView(section.module);

                              modules.forEach(m => {
                                const vPerm = permissions.find(p => p.name === `${m}.view`);
                                if (vPerm) {
                                  if (isGranting) {
                                    if (!nextPerms.includes(vPerm.id)) nextPerms.push(vPerm.id);
                                  } else {
                                    // Strip all module perms
                                    const cPerm = permissions.find(p => p.name === `${m}.create`);
                                    const mPerm = permissions.find(p => p.name === `${m}.manage`);
                                    nextPerms = nextPerms.filter(id => id !== vPerm.id && id !== (cPerm?.id || -1) && id !== (mPerm?.id || -1));
                                  }
                                }
                              });
                              setSelectedPermissions([...new Set(nextPerms)]);
                            }}
                            className={`p-2 rounded border text-xs cursor-pointer transition-all flex items-center justify-between ${
                              hasView(section.module)
                                ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'
                                : 'bg-white border-slate-100 text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400'
                            }`}
                          >
                            <span className="font-bold">{section.name} (View Default)</span>
                            <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${
                              hasView(section.module) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300 dark:bg-slate-800 dark:border-slate-700'
                            }`}>
                              {hasView(section.module) && <Check size={10} strokeWidth={4} />}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="admin-btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="admin-btn-primary flex-1"
                  >
                    Create Role
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Roles;
