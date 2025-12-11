'use client';

import { useState, useEffect } from 'react';
import { Zap, Truck, RefreshCw, CheckCircle, Clock, MapPin, Settings } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';

interface AssignmentStats {
  totalAssignments: number;
  autoAssigned: number;
  manualAssigned: number;
  avgAssignmentTime: number;
  successRate: number;
}

interface AssignmentSettings {
  enabled: boolean;
  maxDistance: number;
  maxWaitTime: number;
  prioritizeRating: boolean;
  prioritizeProximity: boolean;
  allowBatching: boolean;
  batchWindow: number;
}

interface RecentAssignment {
  id: string;
  orderNumber: string;
  riderName: string;
  vendorName: string;
  distance: number;
  assignmentTime: number;
  method: 'auto' | 'manual';
  status: 'assigned' | 'accepted' | 'rejected' | 'timeout';
  timestamp: string;
}

export default function AutoAssignmentPage() {
  const [stats, setStats] = useState<AssignmentStats | null>(null);
  const [settings, setSettings] = useState<AssignmentSettings | null>(null);
  const [recentAssignments, setRecentAssignments] = useState<RecentAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'overview' | 'settings'>('overview');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/ai/assignment', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.data.stats);
        setSettings(data.data.settings);
        setRecentAssignments(data.data.recentAssignments);
      }
    } catch (error) {
      console.error('Failed to fetch assignment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'assigned': return <Badge variant="info" size="sm">Assigned</Badge>;
      case 'accepted': return <Badge variant="success" size="sm">Accepted</Badge>;
      case 'rejected': return <Badge variant="error" size="sm">Rejected</Badge>;
      case 'timeout': return <Badge variant="warning" size="sm">Timeout</Badge>;
      default: return <Badge size="sm">{status}</Badge>;
    }
  };

  const handleToggle = (key: keyof AssignmentSettings) => {
    if (settings) {
      setSettings({ ...settings, [key]: !settings[key] });
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/ai/assignment', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Assignment settings saved successfully');
        setSettings(data.data.settings);
      } else {
        toast.error(data.error || 'Failed to save settings');
      }
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Auto-Assignment">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-xl font-bold">{stats.totalAssignments}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Auto</p>
                <p className="text-xl font-bold">{stats.autoAssigned}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Truck className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Manual</p>
                <p className="text-xl font-bold">{stats.manualAssigned}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Time</p>
                <p className="text-xl font-bold">{stats.avgAssignmentTime}s</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Success Rate</p>
                <p className="text-xl font-bold">{stats.successRate}%</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Controls */}
      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={view === 'overview' ? 'primary' : 'outline'}
              onClick={() => setView('overview')}
            >
              Overview
            </Button>
            <Button
              variant={view === 'settings' ? 'primary' : 'outline'}
              onClick={() => setView('settings')}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : view === 'settings' && settings ? (
        <Card>
          <h3 className="font-semibold text-gray-900 mb-6">Assignment Algorithm Settings</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Auto-Assignment Enabled</p>
                <p className="text-sm text-gray-500">Automatically assign riders to orders</p>
              </div>
              <button
                onClick={() => handleToggle('enabled')}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.enabled ? 'bg-orange-500' : 'bg-gray-300'
                }`}
              >
                <span className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  settings.enabled ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Assignment Distance (km)
                </label>
                <input
                  type="number"
                  value={settings.maxDistance}
                  onChange={(e) => setSettings({ ...settings, maxDistance: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Wait Time (seconds)
                </label>
                <input
                  type="number"
                  value={settings.maxWaitTime}
                  onChange={(e) => setSettings({ ...settings, maxWaitTime: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Prioritize by Rating</p>
                <p className="text-sm text-gray-500">Assign to higher-rated riders first</p>
              </div>
              <button
                onClick={() => handleToggle('prioritizeRating')}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.prioritizeRating ? 'bg-orange-500' : 'bg-gray-300'
                }`}
              >
                <span className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  settings.prioritizeRating ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Prioritize by Proximity</p>
                <p className="text-sm text-gray-500">Assign to nearest riders first</p>
              </div>
              <button
                onClick={() => handleToggle('prioritizeProximity')}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.prioritizeProximity ? 'bg-orange-500' : 'bg-gray-300'
                }`}
              >
                <span className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  settings.prioritizeProximity ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Order Batching</p>
                <p className="text-sm text-gray-500">Allow multiple orders per rider</p>
              </div>
              <button
                onClick={() => handleToggle('allowBatching')}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.allowBatching ? 'bg-orange-500' : 'bg-gray-300'
                }`}
              >
                <span className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  settings.allowBatching ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="pt-4 border-t flex justify-end">
              <Button onClick={saveSettings} loading={saving}>Save Settings</Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card padding="none">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">Recent Assignments</h3>
          </div>
          {recentAssignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500">
              <Truck className="h-12 w-12 mb-2" />
              <p>No recent assignments</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rider</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Distance</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentAssignments.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">{assignment.orderNumber}</td>
                      <td className="px-4 py-3 text-sm">{assignment.riderName}</td>
                      <td className="px-4 py-3 text-sm">{assignment.vendorName}</td>
                      <td className="px-4 py-3 text-sm">{assignment.distance} km</td>
                      <td className="px-4 py-3 text-sm">{assignment.assignmentTime}s</td>
                      <td className="px-4 py-3">
                        <Badge variant={assignment.method === 'auto' ? 'success' : 'info'} size="sm">
                          {assignment.method}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(assignment.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </AdminLayout>
  );
}
