'use client';

import { useState, useEffect } from 'react';
import { Bell, Search, Plus, RefreshCw, Send, Users, Clock, CheckCircle } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'promotional' | 'transactional' | 'system';
  targetSegment: string;
  sentCount: number;
  openCount: number;
  clickCount: number;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [statusFilter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin-token');
      const res = await fetch(`/api/admin/marketing/notifications?status=${statusFilter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data.notifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = notifications.filter(notif =>
    notif.title.toLowerCase().includes(search.toLowerCase()) ||
    notif.body.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent': return <Badge variant="success" size="sm">Sent</Badge>;
      case 'scheduled': return <Badge variant="info" size="sm">Scheduled</Badge>;
      case 'draft': return <Badge variant="warning" size="sm">Draft</Badge>;
      case 'failed': return <Badge variant="error" size="sm">Failed</Badge>;
      default: return <Badge size="sm">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'promotional': return <Badge variant="info" size="sm">Promo</Badge>;
      case 'transactional': return <Badge variant="default" size="sm">Trans</Badge>;
      case 'system': return <Badge variant="warning" size="sm">System</Badge>;
      default: return <Badge size="sm">{type}</Badge>;
    }
  };

  const stats = {
    total: notifications.length,
    sent: notifications.filter(n => n.status === 'sent').length,
    totalDelivered: notifications.reduce((sum, n) => sum + n.sentCount, 0),
    avgOpenRate: notifications.filter(n => n.sentCount > 0).length > 0
      ? (notifications.reduce((sum, n) => sum + (n.sentCount > 0 ? n.openCount / n.sentCount : 0), 0) /
         notifications.filter(n => n.sentCount > 0).length * 100)
      : 0,
  };

  return (
    <AdminLayout title="Push Notifications">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Bell className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Campaigns</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Send className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Sent</p>
              <p className="text-xl font-bold">{stats.sent}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Delivered</p>
              <p className="text-xl font-bold">{stats.totalDelivered.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg. Open Rate</p>
              <p className="text-xl font-bold">{stats.avgOpenRate.toFixed(1)}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4 flex-1 w-full sm:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
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
              <option value="sent">Sent</option>
              <option value="scheduled">Scheduled</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Notification
          </Button>
        </div>
      </Card>

      {/* Notifications List */}
      <Card padding="none">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Bell className="h-12 w-12 mb-2" />
            <p>No notifications found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notification</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Segment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Open Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredNotifications.map((notif) => (
                  <tr key={notif.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="max-w-xs">
                        <p className="font-medium text-gray-900 truncate">{notif.title}</p>
                        <p className="text-sm text-gray-500 truncate">{notif.body}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">{getTypeBadge(notif.type)}</td>
                    <td className="px-4 py-3 text-sm">{notif.targetSegment}</td>
                    <td className="px-4 py-3 text-sm">{notif.sentCount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">
                      {notif.sentCount > 0
                        ? `${((notif.openCount / notif.sentCount) * 100).toFixed(1)}%`
                        : '-'}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(notif.status)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {notif.sentAt
                        ? new Date(notif.sentAt).toLocaleDateString()
                        : notif.scheduledAt
                        ? `Scheduled: ${new Date(notif.scheduledAt).toLocaleDateString()}`
                        : new Date(notif.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {notif.status === 'draft' && (
                          <Button variant="primary" size="sm">Send</Button>
                        )}
                        <Button variant="outline" size="sm">View</Button>
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
