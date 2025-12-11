'use client';

import { useState, useEffect } from 'react';
import { Users, Search, RefreshCw, Gift, TrendingUp, DollarSign } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';

interface Referral {
  id: string;
  referrerName: string;
  referrerPhone: string;
  referredName: string;
  referredPhone: string;
  code: string;
  status: 'pending' | 'completed' | 'expired';
  referrerReward: number;
  referredReward: number;
  createdAt: string;
  completedAt?: string;
}

interface ReferralSettings {
  referrerReward: number;
  referredReward: number;
  minOrderValue: number;
  expiryDays: number;
  maxReferralsPerUser: number;
}

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [settings, setSettings] = useState<ReferralSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [view, setView] = useState<'referrals' | 'settings'>('referrals');

  useEffect(() => {
    fetchReferrals();
  }, [statusFilter]);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin-token');
      const res = await fetch(`/api/admin/marketing/referrals?status=${statusFilter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setReferrals(data.data.referrals);
        setSettings(data.data.settings);
      }
    } catch (error) {
      console.error('Failed to fetch referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReferrals = referrals.filter(ref =>
    ref.referrerName.toLowerCase().includes(search.toLowerCase()) ||
    ref.referredName.toLowerCase().includes(search.toLowerCase()) ||
    ref.code.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge variant="success" size="sm">Completed</Badge>;
      case 'pending': return <Badge variant="warning" size="sm">Pending</Badge>;
      case 'expired': return <Badge variant="error" size="sm">Expired</Badge>;
      default: return <Badge size="sm">{status}</Badge>;
    }
  };

  const stats = {
    total: referrals.length,
    completed: referrals.filter(r => r.status === 'completed').length,
    pending: referrals.filter(r => r.status === 'pending').length,
    totalRewards: referrals
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + r.referrerReward + r.referredReward, 0),
  };

  return (
    <AdminLayout title="Referral Program">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Referrals</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Successful</p>
              <p className="text-xl font-bold">{stats.completed}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-xl font-bold">{stats.pending}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Rewards Paid</p>
              <p className="text-xl font-bold">{formatCurrency(stats.totalRewards)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={view === 'referrals' ? 'primary' : 'outline'}
              onClick={() => setView('referrals')}
            >
              Referrals
            </Button>
            <Button
              variant={view === 'settings' ? 'primary' : 'outline'}
              onClick={() => setView('settings')}
            >
              Settings
            </Button>
          </div>
          {view === 'referrals' && (
            <div className="flex gap-4 flex-1 justify-end w-full sm:w-auto">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
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
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          )}
        </div>
      </Card>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : view === 'settings' && settings ? (
        <Card>
          <h3 className="font-semibold text-gray-900 mb-6">Referral Program Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referrer Reward
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">₹</span>
                <input
                  type="number"
                  value={settings.referrerReward}
                  onChange={(e) => setSettings({ ...settings, referrerReward: parseInt(e.target.value) })}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Amount credited to referrer on successful referral</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New User Reward
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">₹</span>
                <input
                  type="number"
                  value={settings.referredReward}
                  onChange={(e) => setSettings({ ...settings, referredReward: parseInt(e.target.value) })}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Discount for referred new user</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Order Value
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">₹</span>
                <input
                  type="number"
                  value={settings.minOrderValue}
                  onChange={(e) => setSettings({ ...settings, minOrderValue: parseInt(e.target.value) })}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Min order for referral to be valid</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Days
              </label>
              <input
                type="number"
                value={settings.expiryDays}
                onChange={(e) => setSettings({ ...settings, expiryDays: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-xs text-gray-500 mt-1">Days until referral expires</p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t flex justify-end">
            <Button>Save Settings</Button>
          </div>
        </Card>
      ) : (
        <Card padding="none">
          {filteredReferrals.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Users className="h-12 w-12 mb-2" />
              <p>No referrals found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referrer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referred</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rewards</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredReferrals.map((ref) => (
                    <tr key={ref.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{ref.referrerName}</p>
                          <p className="text-sm text-gray-500">{ref.referrerPhone}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{ref.referredName}</p>
                          <p className="text-sm text-gray-500">{ref.referredPhone}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{ref.code}</span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="space-y-1">
                          <p>Referrer: {formatCurrency(ref.referrerReward)}</p>
                          <p>New User: {formatCurrency(ref.referredReward)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(ref.status)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(ref.createdAt).toLocaleDateString()}
                      </td>
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
