'use client';

import { useState, useEffect } from 'react';
import { Users, Search, Plus, RefreshCw, Edit2, Trash2, Filter } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface UserSegment {
  id: string;
  name: string;
  description: string;
  rules: {
    field: string;
    operator: string;
    value: string;
  }[];
  userCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export default function UserSegmentsPage() {
  const [segments, setSegments] = useState<UserSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchSegments();
  }, []);

  const fetchSegments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/marketing/segments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSegments(data.data.segments);
      }
    } catch (error) {
      console.error('Failed to fetch segments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSegments = segments.filter(segment =>
    segment.name.toLowerCase().includes(search.toLowerCase()) ||
    segment.description.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: segments.length,
    active: segments.filter(s => s.status === 'active').length,
    totalUsers: segments.reduce((sum, s) => sum + s.userCount, 0),
    avgSize: segments.length > 0
      ? Math.round(segments.reduce((sum, s) => sum + s.userCount, 0) / segments.length)
      : 0,
  };

  return (
    <AdminLayout title="User Segments">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Filter className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Segments</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Filter className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-xl font-bold">{stats.active}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-xl font-bold">{stats.totalUsers.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg. Size</p>
              <p className="text-xl font-bold">{stats.avgSize.toLocaleString()}</p>
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
              placeholder="Search segments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchSegments}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Segment
            </Button>
          </div>
        </div>
      </Card>

      {/* Segments Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : filteredSegments.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center h-48 text-gray-500">
            <Users className="h-12 w-12 mb-2" />
            <p>No segments found</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSegments.map((segment) => (
            <Card key={segment.id}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{segment.name}</h3>
                  <p className="text-sm text-gray-500">{segment.description}</p>
                </div>
                <Badge
                  variant={segment.status === 'active' ? 'success' : 'default'}
                  size="sm"
                >
                  {segment.status}
                </Badge>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-lg font-bold text-gray-900">
                  {segment.userCount.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500">users</span>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-xs font-medium text-gray-500 uppercase">Rules</p>
                {segment.rules.map((rule, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-700">{rule.field}</span>
                    <span className="text-gray-500">{rule.operator}</span>
                    <span className="px-2 py-0.5 bg-orange-100 rounded text-orange-700">{rule.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-3 border-t">
                <Button variant="outline" size="sm" fullWidth>
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" fullWidth>
                  <Trash2 className="h-4 w-4 mr-1 text-red-500" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
