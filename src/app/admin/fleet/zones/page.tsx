'use client';

import { useState, useEffect } from 'react';
import { MapPin, Search, Users, Plus, RefreshCw, Edit2, Trash2 } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface Zone {
  id: string;
  name: string;
  area: string;
  ridersAssigned: number;
  ridersActive: number;
  ordersToday: number;
  avgDeliveryTime: number;
  demand: 'low' | 'medium' | 'high';
  status: 'active' | 'inactive';
}

export default function ZoneAssignmentPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/fleet/zones', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setZones(data.data.zones);
      }
    } catch (error) {
      console.error('Failed to fetch zones:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredZones = zones.filter(zone =>
    zone.name.toLowerCase().includes(search.toLowerCase()) ||
    zone.area.toLowerCase().includes(search.toLowerCase())
  );

  const getDemandBadge = (demand: string) => {
    switch (demand) {
      case 'high': return <Badge variant="error" size="sm">High Demand</Badge>;
      case 'medium': return <Badge variant="warning" size="sm">Medium</Badge>;
      case 'low': return <Badge variant="success" size="sm">Low</Badge>;
      default: return <Badge size="sm">{demand}</Badge>;
    }
  };

  const stats = {
    totalZones: zones.length,
    activeZones: zones.filter(z => z.status === 'active').length,
    totalRiders: zones.reduce((sum, z) => sum + z.ridersAssigned, 0),
    highDemand: zones.filter(z => z.demand === 'high').length,
  };

  return (
    <AdminLayout title="Zone Assignment">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Zones</p>
              <p className="text-xl font-bold">{stats.totalZones}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <MapPin className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Zones</p>
              <p className="text-xl font-bold">{stats.activeZones}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Riders Deployed</p>
              <p className="text-xl font-bold">{stats.totalRiders}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <MapPin className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">High Demand</p>
              <p className="text-xl font-bold">{stats.highDemand}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search zones..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchZones}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Zone
            </Button>
          </div>
        </div>
      </Card>

      {/* Zones Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : filteredZones.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center h-48 text-gray-500">
            <MapPin className="h-12 w-12 mb-2" />
            <p>No zones found</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredZones.map((zone) => (
            <Card key={zone.id}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    zone.status === 'active' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <MapPin className={`h-5 w-5 ${
                      zone.status === 'active' ? 'text-green-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{zone.name}</h3>
                    <p className="text-sm text-gray-500">{zone.area}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="p-1.5 hover:bg-gray-100 rounded">
                    <Edit2 className="h-4 w-4 text-gray-500" />
                  </button>
                  <button className="p-1.5 hover:bg-gray-100 rounded">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Riders</span>
                  <span className="font-medium">
                    <span className="text-green-600">{zone.ridersActive}</span>
                    <span className="text-gray-400"> / {zone.ridersAssigned}</span>
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Orders Today</span>
                  <span className="font-medium">{zone.ordersToday}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Avg. Delivery</span>
                  <span className="font-medium">{zone.avgDeliveryTime} min</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-500">Demand</span>
                  {getDemandBadge(zone.demand)}
                </div>
              </div>

              <div className="pt-4 border-t flex gap-2">
                <Button variant="outline" size="sm" fullWidth>View Map</Button>
                <Button variant="outline" size="sm" fullWidth>Assign Riders</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
