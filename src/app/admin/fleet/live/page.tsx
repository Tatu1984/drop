'use client';

import { useState, useEffect, useCallback } from 'react';
import { MapPin, Users, Truck, Package, RefreshCw, Circle, Navigation, Phone, Star, AlertTriangle } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import type { LiveMapRider, LiveMapZone, LiveMapUnassignedOrder } from './LiveMap';

// Dynamically import the map component to avoid SSR issues with Leaflet
const LiveMap = dynamic(() => import('./LiveMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
      <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
    </div>
  ),
});

// Use the same types as LiveMap for consistency
type Rider = LiveMapRider;
type Zone = LiveMapZone;
type UnassignedOrder = LiveMapUnassignedOrder;

interface FleetData {
  riders: Rider[];
  zones: Zone[];
  unassignedOrders: UnassignedOrder[];
  stats: {
    totalRiders: number;
    online: number;
    busy: number;
    offline: number;
    unassignedOrders: number;
  };
}

export default function LiveFleetPage() {
  const [data, setData] = useState<FleetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [showRiderModal, setShowRiderModal] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'busy' | 'offline'>('all');

  const fetchFleetData = useCallback(async () => {
    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/fleet/live', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      } else {
        toast.error(result.error || 'Failed to load fleet data');
      }
    } catch (err) {
      console.error('Failed to fetch fleet data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFleetData();
  }, [fetchFleetData]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchFleetData, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchFleetData]);

  const handleRiderClick = (rider: Rider) => {
    setSelectedRider(rider);
    setShowRiderModal(true);
  };

  const stats = data?.stats || {
    totalRiders: 0,
    online: 0,
    busy: 0,
    offline: 0,
    unassignedOrders: 0,
  };

  const filteredRiders = data?.riders.filter(rider => {
    if (filterStatus === 'all') return true;
    return rider.status === filterStatus;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-orange-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <AdminLayout title="Live Fleet Tracking">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Riders</p>
              <p className="text-xl font-bold">{stats.totalRiders}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Circle className="h-5 w-5 text-green-600 fill-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Online</p>
              <p className="text-xl font-bold text-green-600">{stats.online}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Truck className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">On Delivery</p>
              <p className="text-xl font-bold text-orange-600">{stats.busy}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Circle className="h-5 w-5 text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Offline</p>
              <p className="text-xl font-bold text-gray-600">{stats.offline}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Unassigned</p>
              <p className="text-xl font-bold text-red-600">{stats.unassignedOrders}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Filter:</span>
            {['all', 'online', 'busy', 'offline'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as typeof filterStatus)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-gray-600">Auto-refresh (10s)</span>
            </label>
            <Button variant="outline" onClick={fetchFleetData} loading={loading}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <Card padding="none">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Live Map</h3>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Online</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span>Busy</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                  <span>Offline</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span>Unassigned Order</span>
                </div>
              </div>
            </div>
            <div className="h-[500px]">
              {loading && !data ? (
                <div className="h-full flex items-center justify-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
                </div>
              ) : (
                <LiveMap
                  riders={filteredRiders}
                  zones={data?.zones || []}
                  unassignedOrders={data?.unassignedOrders || []}
                  onRiderClick={handleRiderClick}
                />
              )}
            </div>
          </Card>
        </div>

        {/* Rider List */}
        <div>
          <Card padding="none">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Active Riders ({filteredRiders.length})</h3>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              {filteredRiders.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No riders found</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredRiders.map((rider) => (
                    <button
                      key={rider.id}
                      onClick={() => handleRiderClick(rider)}
                      className="w-full p-4 hover:bg-gray-50 text-left transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            {rider.avatar ? (
                              <img
                                src={rider.avatar}
                                alt={rider.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="font-semibold text-gray-600">
                                {rider.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${getStatusColor(rider.status)}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 truncate">{rider.name}</p>
                            {rider.activeOrder && (
                              <Badge variant="warning" size="sm">Delivering</Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">
                            {rider.vehicle} • {rider.zone || 'No zone'}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="h-3.5 w-3.5 fill-yellow-400" />
                            <span className="text-sm font-medium">{rider.rating?.toFixed(1) || 'N/A'}</span>
                          </div>
                          <p className="text-xs text-gray-400">{rider.totalDeliveries} trips</p>
                        </div>
                      </div>
                      {rider.activeOrder && (
                        <div className="mt-2 p-2 bg-orange-50 rounded-lg">
                          <p className="text-xs text-orange-700 font-medium">
                            Order #{rider.activeOrder.orderNumber}
                          </p>
                          <p className="text-xs text-orange-600 truncate">
                            {rider.activeOrder.pickup.name} → {rider.activeOrder.dropoff.address}
                          </p>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Unassigned Orders Alert */}
          {stats.unassignedOrders > 0 && (
            <Card className="mt-4 border-red-200 bg-red-50">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">
                    {stats.unassignedOrders} Unassigned Orders
                  </p>
                  <p className="text-sm text-red-600 mt-1">
                    Orders waiting for rider assignment. Consider enabling auto-assignment.
                  </p>
                  <Button size="sm" className="mt-2" onClick={() => window.location.href = '/admin/ai/assignment'}>
                    Configure Auto-Assignment
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Rider Detail Modal */}
      <Modal
        isOpen={showRiderModal}
        onClose={() => {
          setShowRiderModal(false);
          setSelectedRider(null);
        }}
        title="Rider Details"
      >
        {selectedRider && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  {selectedRider.avatar ? (
                    <img
                      src={selectedRider.avatar}
                      alt={selectedRider.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-gray-600">
                      {selectedRider.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white ${getStatusColor(selectedRider.status)}`} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{selectedRider.name}</h3>
                <Badge variant={
                  selectedRider.status === 'online' ? 'success' :
                  selectedRider.status === 'busy' ? 'warning' : 'default'
                }>
                  {selectedRider.status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <div className="flex items-center justify-center gap-1 text-yellow-500">
                  <Star className="h-5 w-5 fill-yellow-400" />
                  <span className="text-xl font-bold">{selectedRider.rating?.toFixed(1) || 'N/A'}</span>
                </div>
                <p className="text-xs text-gray-500">Rating</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-xl font-bold">{selectedRider.totalDeliveries}</p>
                <p className="text-xs text-gray-500">Total Deliveries</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{selectedRider.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Truck className="h-4 w-4" />
                <span>{selectedRider.vehicle} • {selectedRider.vehicleNumber}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{selectedRider.zone || 'No zone assigned'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Navigation className="h-4 w-4" />
                <span className="text-sm">
                  {selectedRider.lat.toFixed(4)}, {selectedRider.lng.toFixed(4)}
                </span>
              </div>
            </div>

            {selectedRider.activeOrder && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <h4 className="font-medium text-orange-800 mb-2">Current Delivery</h4>
                <div className="space-y-1 text-sm text-orange-700">
                  <p><strong>Order:</strong> #{selectedRider.activeOrder.orderNumber}</p>
                  <p><strong>Status:</strong> {selectedRider.activeOrder.status}</p>
                  <p><strong>Pickup:</strong> {selectedRider.activeOrder.pickup.name}</p>
                  <p><strong>Dropoff:</strong> {selectedRider.activeOrder.dropoff.address}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => window.open(`tel:${selectedRider.phone}`)}
              >
                <Phone className="h-4 w-4" />
                Call Rider
              </Button>
              <Button
                fullWidth
                onClick={() => {
                  setShowRiderModal(false);
                  window.location.href = `/admin/riders?search=${selectedRider.phone}`;
                }}
              >
                View Profile
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
