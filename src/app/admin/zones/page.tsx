'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, MapPin, Users, Clock, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import AdminLayout from '@/components/layout/AdminLayout';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

// Dynamically import the map component to avoid SSR issues with Leaflet
const ZoneMap = dynamic(() => import('./ZoneMap'), {
  ssr: false,
  loading: () => (
    <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
      <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
    </div>
  ),
});

interface Zone {
  id: string;
  name: string;
  area: string;
  status: 'active' | 'inactive' | 'surge';
  riders: number;
  activeOrders: number;
  avgDeliveryTime: number;
  surgeMultiplier: number;
  coordinates: { lat: number; lng: number };
  radius: number;
}

interface ZonesData {
  zones: Zone[];
  stats: {
    totalZones: number;
    activeZones: number;
    totalRiders: number;
    avgDeliveryTime: number;
    surgeZones: number;
  };
}

export default function AdminZonesPage() {
  const [data, setData] = useState<ZonesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form state for zone modal
  const [zoneName, setZoneName] = useState('');
  const [zoneArea, setZoneArea] = useState('');
  const [zoneLat, setZoneLat] = useState('12.9716');
  const [zoneLng, setZoneLng] = useState('77.5946');
  const [zoneRadius, setZoneRadius] = useState('3');
  const [zoneStatus, setZoneStatus] = useState('active');
  const [zoneDeliveryFee, setZoneDeliveryFee] = useState('40');

  // Surge settings state
  const [minSurge, setMinSurge] = useState('1.2');
  const [maxSurge, setMaxSurge] = useState('2.5');
  const [surgeThreshold, setSurgeThreshold] = useState('3');

  const fetchZones = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin-token');
      const params = new URLSearchParams();
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/zones?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      } else {
        toast.error(result.error || 'Failed to load zones');
      }
    } catch (err) {
      toast.error('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  const toggleSurge = async (zone: Zone) => {
    try {
      const token = localStorage.getItem('admin-token');
      const action = zone.status === 'surge' ? 'end-surge' : 'start-surge';
      const res = await fetch('/api/admin/zones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ zoneId: zone.id, action }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(`${zone.name} ${zone.status === 'surge' ? 'surge deactivated' : 'surge activated'}`);
        fetchZones();
      } else {
        toast.error(result.error || 'Action failed');
      }
    } catch (err) {
      toast.error('Failed to toggle surge');
    }
  };

  const toggleZoneStatus = async (zone: Zone) => {
    try {
      const token = localStorage.getItem('admin-token');
      const action = zone.status === 'inactive' ? 'activate' : 'deactivate';
      const res = await fetch('/api/admin/zones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ zoneId: zone.id, action }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(`${zone.name} ${zone.status === 'inactive' ? 'activated' : 'deactivated'}`);
        fetchZones();
      } else {
        toast.error(result.error || 'Action failed');
      }
    } catch (err) {
      toast.error('Failed to toggle zone status');
    }
  };

  // Reset form when opening modal
  const openZoneModal = (zone?: Zone) => {
    if (zone) {
      setSelectedZone(zone);
      setZoneName(zone.name);
      setZoneArea(zone.area);
      setZoneLat(String(zone.coordinates.lat));
      setZoneLng(String(zone.coordinates.lng));
      setZoneRadius(String(zone.radius));
      setZoneStatus(zone.status === 'inactive' ? 'inactive' : 'active');
      setZoneDeliveryFee('40');
    } else {
      setSelectedZone(null);
      setZoneName('');
      setZoneArea('');
      setZoneLat('12.9716');
      setZoneLng('77.5946');
      setZoneRadius('3');
      setZoneStatus('active');
      setZoneDeliveryFee('40');
    }
    setShowZoneModal(true);
  };

  const saveZone = async () => {
    if (!zoneName.trim()) {
      toast.error('Zone name is required');
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem('admin-token');

      const zoneData = {
        name: zoneName,
        area: zoneArea || zoneName,
        polygon: {
          type: 'Polygon',
          coordinates: [[[parseFloat(zoneLng), parseFloat(zoneLat)]]]
        },
        deliveryFee: parseFloat(zoneDeliveryFee),
        isActive: zoneStatus === 'active',
      };

      if (selectedZone) {
        // Update existing zone
        const res = await fetch('/api/admin/zones', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id: selectedZone.id, ...zoneData }),
        });
        const result = await res.json();
        if (result.success) {
          toast.success('Zone updated successfully');
          setShowZoneModal(false);
          fetchZones();
        } else {
          toast.error(result.error || 'Failed to update zone');
        }
      } else {
        // Create new zone
        const res = await fetch('/api/admin/zones', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(zoneData),
        });
        const result = await res.json();
        if (result.success) {
          toast.success('Zone created successfully');
          setShowZoneModal(false);
          fetchZones();
        } else {
          toast.error(result.error || 'Failed to create zone');
        }
      }
    } catch (err) {
      toast.error('Failed to save zone');
    } finally {
      setActionLoading(false);
    }
  };

  const saveSurgeSettings = async () => {
    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/zones', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: 'surge-settings',
          minSurge: parseFloat(minSurge),
          maxSurge: parseFloat(maxSurge),
          surgeThreshold: parseInt(surgeThreshold),
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Surge settings saved!');
      } else {
        toast.error(result.error || 'Failed to save settings');
      }
    } catch (err) {
      toast.error('Failed to save settings');
    }
  };

  const deleteZone = async (zone: Zone) => {
    if (!confirm(`Are you sure you want to delete ${zone.name}?`)) return;

    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch(`/api/admin/zones?id=${zone.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Zone deleted successfully');
        fetchZones();
      } else {
        toast.error(result.error || 'Failed to delete zone');
      }
    } catch (err) {
      toast.error('Failed to delete zone');
    }
  };

  const getStatusBadge = (status: string, surgeMultiplier: number) => {
    if (status === 'surge') {
      return <Badge variant="warning">{surgeMultiplier}x Surge</Badge>;
    }
    return <Badge variant={status === 'active' ? 'success' : 'error'}>{status}</Badge>;
  };

  const zones = data?.zones || [];
  const stats = data?.stats || {
    totalZones: 0,
    activeZones: 0,
    totalRiders: 0,
    avgDeliveryTime: 0,
    surgeZones: 0,
  };

  const filteredZones = zones.filter(z => z.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout title="Zone Management">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Zones</p>
                <p className="text-2xl font-bold">{stats.totalZones}</p>
              </div>
              <MapPin className="h-8 w-8 text-blue-500" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Zones</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeZones}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Riders</p>
                <p className="text-2xl font-bold">{stats.totalRiders}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Delivery</p>
                <p className="text-2xl font-bold">{stats.avgDeliveryTime} min</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Surge Zones</p>
                <p className="text-2xl font-bold text-red-600">{stats.surgeZones}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </Card>
        </div>

        {/* Zone Coverage Map */}
        <Card padding="none">
          <div className="p-4 border-b flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Zone Coverage Map</h3>
              <p className="text-sm text-gray-500">Click on zones to view details</p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-4 text-xs mr-4">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Active</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span>Surge</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                  <span>Inactive</span>
                </div>
              </div>
              <Button variant="outline" onClick={fetchZones} loading={loading}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button onClick={() => openZoneModal()}>
                <Plus className="h-4 w-4" />
                Add Zone
              </Button>
            </div>
          </div>
          <div className="h-80">
            <ZoneMap zones={zones} onZoneClick={(zone) => openZoneModal(zone)} />
          </div>
        </Card>

        {/* Zones List */}
        <Card padding="none">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">All Zones</h3>
            <div className="w-64">
              <Input
                placeholder="Search zones..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="h-5 w-5 text-gray-400" />}
              />
            </div>
          </div>
          {loading && !data ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : filteredZones.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No zones found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Zone</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Area</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Riders</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Active Orders</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Avg Delivery</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Radius</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredZones.map((zone) => (
                    <tr key={zone.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            zone.status === 'active' ? 'bg-green-500' :
                            zone.status === 'surge' ? 'bg-yellow-500 animate-pulse' : 'bg-gray-400'
                          }`} />
                          <span className="font-medium">{zone.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-600">{zone.area}</td>
                      <td className="px-4 py-4">{getStatusBadge(zone.status, zone.surgeMultiplier)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          {zone.riders}
                        </div>
                      </td>
                      <td className="px-4 py-4">{zone.activeOrders}</td>
                      <td className="px-4 py-4">
                        <span className={zone.avgDeliveryTime > 30 ? 'text-red-600' : 'text-green-600'}>
                          {zone.avgDeliveryTime} min
                        </span>
                      </td>
                      <td className="px-4 py-4">{zone.radius} km</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleSurge(zone)}
                            className={`px-2 py-1 text-xs rounded ${
                              zone.status === 'surge'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {zone.status === 'surge' ? 'End Surge' : 'Surge'}
                          </button>
                          <button
                            onClick={() => openZoneModal(zone)}
                            className="p-2 hover:bg-gray-100 rounded"
                            title="Edit zone"
                          >
                            <Edit2 className="h-4 w-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => deleteZone(zone)}
                            className="p-2 hover:bg-gray-100 rounded"
                            title="Delete zone"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Surge Pricing Settings */}
        <Card>
          <h3 className="font-semibold mb-4">Surge Pricing Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Surge Multiplier
              </label>
              <Input
                type="number"
                step="0.1"
                value={minSurge}
                onChange={(e) => setMinSurge(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Surge Multiplier
              </label>
              <Input
                type="number"
                step="0.1"
                value={maxSurge}
                onChange={(e) => setMaxSurge(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto-Surge Threshold (Orders/Rider)
              </label>
              <Input
                type="number"
                value={surgeThreshold}
                onChange={(e) => setSurgeThreshold(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={saveSurgeSettings}>Save Settings</Button>
          </div>
        </Card>
      </div>

      {/* Zone Modal */}
      <Modal
        isOpen={showZoneModal}
        onClose={() => {
          setShowZoneModal(false);
          setSelectedZone(null);
        }}
        title={selectedZone ? 'Edit Zone' : 'Add New Zone'}
      >
        <div className="space-y-4">
          <Input
            label="Zone Name"
            placeholder="e.g., Indiranagar"
            value={zoneName}
            onChange={(e) => setZoneName(e.target.value)}
          />
          <Input
            label="Area"
            placeholder="e.g., Central Bangalore"
            value={zoneArea}
            onChange={(e) => setZoneArea(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Latitude"
              type="number"
              step="0.0001"
              value={zoneLat}
              onChange={(e) => setZoneLat(e.target.value)}
            />
            <Input
              label="Longitude"
              type="number"
              step="0.0001"
              value={zoneLng}
              onChange={(e) => setZoneLng(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Radius (km)"
              type="number"
              step="0.5"
              value={zoneRadius}
              onChange={(e) => setZoneRadius(e.target.value)}
            />
            <Input
              label="Delivery Fee (Rs)"
              type="number"
              value={zoneDeliveryFee}
              onChange={(e) => setZoneDeliveryFee(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              className="w-full px-4 py-2 border rounded-lg"
              value={zoneStatus}
              onChange={(e) => setZoneStatus(e.target.value)}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={() => {
              setShowZoneModal(false);
              setSelectedZone(null);
            }}>
              Cancel
            </Button>
            <Button fullWidth loading={actionLoading} onClick={saveZone}>
              {selectedZone ? 'Update Zone' : 'Create Zone'}
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
