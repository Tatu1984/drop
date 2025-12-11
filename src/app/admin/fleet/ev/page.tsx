'use client';

import { useState, useEffect } from 'react';
import { Zap, Search, Battery, MapPin, Phone, CheckCircle, AlertTriangle, RefreshCw, BatteryCharging, BatteryLow } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface EVRider {
  id: string;
  name: string;
  phone: string;
  vehicleNumber: string;
  vehicleModel: string;
  batteryLevel: number;
  range: number;
  isOnline: boolean;
  isAvailable: boolean;
  isCharging: boolean;
  currentLocation: string;
  todayDeliveries: number;
  rating: number;
}

export default function EVFleetPage() {
  const [riders, setRiders] = useState<EVRider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [batteryFilter, setBatteryFilter] = useState('all');

  useEffect(() => {
    fetchEVFleet();
  }, [batteryFilter]);

  const fetchEVFleet = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin-token');
      const res = await fetch(`/api/admin/fleet/ev?battery=${batteryFilter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setRiders(data.data.riders);
      }
    } catch (error) {
      console.error('Failed to fetch EV fleet:', error);
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
    charging: riders.filter(r => r.isCharging).length,
    lowBattery: riders.filter(r => r.batteryLevel < 20).length,
  };

  const getBatteryIcon = (level: number, isCharging: boolean) => {
    if (isCharging) return <BatteryCharging className="h-4 w-4 text-green-500" />;
    if (level < 20) return <BatteryLow className="h-4 w-4 text-red-500" />;
    return <Battery className="h-4 w-4 text-green-500" />;
  };

  const getBatteryColor = (level: number) => {
    if (level < 20) return 'bg-red-500';
    if (level < 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <AdminLayout title="EV Fleet">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total EVs</p>
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
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <BatteryCharging className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Charging</p>
              <p className="text-xl font-bold">{stats.charging}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Low Battery</p>
              <p className="text-xl font-bold">{stats.lowBattery}</p>
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
            value={batteryFilter}
            onChange={(e) => setBatteryFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Battery Levels</option>
            <option value="full">Full (80%+)</option>
            <option value="medium">Medium (20-80%)</option>
            <option value="low">Low (Under 20%)</option>
            <option value="charging">Charging</option>
          </select>
          <Button variant="outline" onClick={fetchEVFleet}>
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
            <Zap className="h-12 w-12 mb-2" />
            <p>No EV riders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rider</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Battery</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deliveries</th>
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
                      <div className="flex items-center gap-2">
                        {getBatteryIcon(rider.batteryLevel, rider.isCharging)}
                        <div className="flex-1 max-w-[100px]">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getBatteryColor(rider.batteryLevel)} transition-all`}
                              style={{ width: `${rider.batteryLevel}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{rider.batteryLevel}% - {rider.range}km</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {rider.isCharging ? (
                          <Badge variant="warning" size="sm">Charging</Badge>
                        ) : rider.isOnline ? (
                          <Badge variant="success" size="sm">Online</Badge>
                        ) : (
                          <Badge variant="default" size="sm">Offline</Badge>
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
