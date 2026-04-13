import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
  Truck,
  Plus,
  Search,
  Filter,
  MapPin,
  User,
  Navigation,
  Clock,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Calendar,
  Box,
  Map as MapIcon,
  ChevronRight,
  Info,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';

const MapPicker = ({ onLocationSelect, initialPos }) => {
  const mapRef = React.useRef(null);
  const markerRef = React.useRef(null);

  useEffect(() => {
    if (!window.L) return;

    const center = initialPos || [30.0444, 31.2357]; // Default to Cairo or initial
    const map = window.L.map('map-picker').setView(center, 13);
    mapRef.current = map;

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const marker = window.L.marker(center, { draggable: true }).addTo(map);
    markerRef.current = marker;

    marker.on('dragend', () => {
      const { lat, lng } = marker.getLatLng();
      onLocationSelect(lat, lng);
    });

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      onLocationSelect(lat, lng);
    });

    return () => map.remove();
  }, []);

  return <div id="map-picker" className="h-64 w-full rounded-lg border border-slate-200 z-0"></div>;
};

const Deliveries = () => {
  const { hasPermission } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);

  const [newDelivery, setNewDelivery] = useState({
    driverName: '',
    routeName: '',
    latitude: '',
    longitude: '',
    orderIds: []
  });

  const fetchDeliveries = async () => {
    try {
      const response = await api.get('/delivery');
      setDeliveries(response.data);
    } catch (error) {
      toast.error('Failed to fetch deliveries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleCreateDelivery = async (e) => {
    e.preventDefault();
    try {
      await api.post('/delivery', {
        ...newDelivery,
        latitude: parseFloat(newDelivery.latitude),
        longitude: parseFloat(newDelivery.longitude)
      });
      toast.success('Delivery task created successfully');
      setShowAddModal(false);
      setNewDelivery({ driverName: '', routeName: '', latitude: '', longitude: '', orderIds: [] });
      fetchDeliveries();
    } catch (error) {
      toast.error('Failed to create delivery');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/delivery/${id}/status`, { status });
      toast.success(`Delivery status updated to ${status}`);
      fetchDeliveries();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredDeliveries = deliveries.filter(d =>
    d.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.routeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30';
      case 'Cancelled': return 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/30';
      case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30';
      case 'InTransit': return 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800/30';
      default: return 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Delivery Logistics</h1>
          <p className="text-sm text-slate-700 mt-1 font-medium">Manage drivers, routes, and track delivery status in real-time.</p>
        </div>
        {hasPermission('deliveries.create') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="admin-btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Schedule Delivery
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Deliveries List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                placeholder="Search by driver or route..."
                className="admin-input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="admin-btn-secondary flex items-center gap-2">
              <MapIcon size={16} />
              <span className="hidden sm:inline">Map View</span>
            </button>
            <button
              onClick={fetchDeliveries}
              className="admin-btn-secondary p-2 flex items-center justify-center"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="admin-card h-40 animate-pulse bg-slate-50/50"></div>
              ))
            ) : filteredDeliveries.length === 0 ? (
              <div className="col-span-2 admin-card p-12 text-center">
                <p className="text-slate-600 font-bold">No deliveries found matching your search.</p>
              </div>
            ) : (
              filteredDeliveries.map((delivery) => (
                <motion.div
                  layout
                  key={delivery.id}
                  onClick={() => setSelectedDelivery(delivery)}
                  className={`admin-card p-5 cursor-pointer transition-all border-2 ${selectedDelivery?.id === delivery.id
                      ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/30'
                      : 'border-transparent hover:border-slate-200'
                    }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedDelivery?.id === delivery.id ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                      <Truck size={20} />
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(delivery.status)}`}>
                      {delivery.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{delivery.driverName}</h3>
                      <p className="text-xs text-slate-700 font-medium mt-0.5">
                        Route: {delivery.routeName}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-slate-500" />
                        <span className="text-[10px] font-bold font-mono text-slate-600">
                          {(delivery.latitude || 0).toFixed(4)}, {(delivery.longitude || 0).toFixed(4)}
                        </span>
                      </div>
                      <ChevronRight size={16} className={selectedDelivery?.id === delivery.id ? 'text-blue-500' : 'text-slate-300'} />
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Info Panel */}
        <div className="lg:col-span-4 sticky top-6">
          <AnimatePresence mode="wait">
            {selectedDelivery ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="admin-card overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Task Overview</h3>
                  <button onClick={() => setSelectedDelivery(null)} className="p-1 text-slate-500 hover:text-slate-800 transition-colors">
                    <XCircle size={18} />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                      <User size={32} />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white">{selectedDelivery.driverName}</h4>
                    <p className="text-sm text-slate-700 font-medium">{selectedDelivery.routeName}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800 text-center">
                      <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">Status</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedDelivery.status}</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800 text-center">
                      <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">Assigned</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{format(new Date(selectedDelivery.createdAt), 'MMM d')}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Live Tracking</p>
                    <div className="h-40 bg-slate-100 dark:bg-slate-900 rounded-xl relative overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
                      <div className="relative flex flex-col items-center">
                        <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-md flex items-center justify-center text-blue-600 animate-bounce">
                          <MapPin size={20} />
                        </div>
                        <span className="mt-2 text-[10px] font-bold text-blue-600 bg-white dark:bg-slate-800 px-2 py-1 rounded-full shadow-sm">
                          {(selectedDelivery.latitude || 0).toFixed(2)}, {(selectedDelivery.longitude || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    {selectedDelivery.status === 'Pending' && hasPermission('deliveries.manage') && (
                      <button
                        onClick={() => updateStatus(selectedDelivery.id, 'InTransit')}
                        className="flex-1 admin-btn-primary flex items-center justify-center gap-2 py-3"
                      >
                        <Navigation size={18} /> Start Transit
                      </button>
                    )}
                    {selectedDelivery.status === 'InTransit' && hasPermission('deliveries.manage') && (
                      <button
                        onClick={() => updateStatus(selectedDelivery.id, 'Delivered')}
                        className="flex-1 bg-emerald-600 text-white rounded-md font-bold text-sm hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 py-3 shadow-sm"
                      >
                        <CheckCircle2 size={18} /> Mark Delivered
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-64 admin-card border-dashed flex flex-col items-center justify-center text-center p-8">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4 text-slate-300">
                  <Navigation size={24} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Track Deliveries</h3>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-400 mt-1">Select a delivery task to see live coordinates and manage status.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Schedule Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative w-full max-w-md bg-white dark:bg-[#1e293b] rounded-lg shadow-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Schedule Delivery</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-slate-800 transition-colors"><XCircle size={20} /></button>
              </div>

              <form onSubmit={handleCreateDelivery} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider">Driver Name</label>
                  <input required className="admin-input" placeholder="e.g. Mike Ross" value={newDelivery.driverName} onChange={e => setNewDelivery({ ...newDelivery, driverName: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider">Route Name</label>
                  <input required className="admin-input" placeholder="e.g. North Sector 4" value={newDelivery.routeName} onChange={e => setNewDelivery({ ...newDelivery, routeName: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider">Select Location on Map</label>
                  <MapPicker
                    onLocationSelect={(lat, lng) => setNewDelivery({ ...newDelivery, latitude: lat, longitude: lng })}
                  />
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="p-2 bg-slate-50 rounded border border-slate-100">
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Latitude</p>
                      <p className="text-xs font-mono font-bold text-slate-700">{newDelivery.latitude || '0.0000'}</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-100">
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Longitude</p>
                      <p className="text-xs font-mono font-bold text-slate-700">{newDelivery.longitude || '0.0000'}</p>
                    </div>
                  </div>
                </div>
                <div className="pt-2 flex gap-3">
                  <button type="button" onClick={() => setShowAddModal(false)} className="admin-btn-secondary flex-1">Cancel</button>
                  <button type="submit" className="admin-btn-primary flex-1">Start Delivery</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Deliveries;
