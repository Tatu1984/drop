'use client';

import { useState, useEffect } from 'react';
import { Bike, Search, Filter, MapPin, Phone, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface BikeRider {
  id: string;
  name: string;
  phone: string;
  vehicleNumber: string;
  vehicleModel: string;
  isOnline: boolean;
  isAvailable: boolean;
  currentLocation: string;
  todayDeliveries: number;
  rating: number;
  status: 'active' | 'maintenance' | 'offline';
}

export default function BikeFleetPage() {
  const [riders, setRiders] = useState<BikeRider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchBikeFleet();
  }, [statusFilter]);

  const fetchBikeFleet = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin-token');
      const res = await fetch(`/api/admin/fleet/bike?status=${statusFilter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setRiders(data.data.riders);
      }
    } catch (error) {
      console.error('Failed to fetch bike fleet:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRiders = riders.filter(rider =>
    rider.name.toLowerCase().includes(search.toLowerCase()) ||
    rider.vehicleNumber.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: riders.length,
    online: riders.filter(r => r.isOnline).length,
    available: riders.filter(r => r.isAvailable).length,
    maintenance: riders.filter(r => r.status === 'maintenance').length,
  };

  return (
    <AdminLayout title="Bike Fleet">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Bike className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Bikes</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Online</p>
              <p className="text-xl font-bold">{stats.online}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Bike className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Available</p>
              <p className="text-xl font-bold">{stats.available}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Maintenance</p>
              <p className="text-xl font-bold">{stats.maintenance}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or vehicle number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <Button variant="outline" onClick={fetchBikeFleet}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Fleet List */}
      <Card padding="none">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : filteredRiders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Bike className="h-12 w-12 mb-2" />
            <p>No bike riders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rider</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deliveries</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredRiders.map((rider) => (
                  <tr key={rider.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{rider.name}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {rider.phone}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{rider.vehicleNumber}</p>
                        <p className="text-sm text-gray-500">{rider.vehicleModel}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {rider.isOnline ? (
                          <Badge variant="success" size="sm">Online</Badge>
                        ) : (
                          <Badge variant="default" size="sm">Offline</Badge>
                        )}
                        {rider.status === 'maintenance' && (
                          <Badge variant="warning" size="sm">Maintenance</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {rider.currentLocation || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{rider.todayDeliveries}</td>
                    <td className="px-4 py-3 text-sm font-medium">{rider.rating.toFixed(1)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">View</Button>
                        <Button variant="outline" size="sm">Track</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AdminLayout>
  );
}
