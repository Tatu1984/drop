'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Search, Download, CheckCircle, Clock, RefreshCw, Truck, Wallet } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';

interface RiderPayout {
  id: string;
  riderName: string;
  phone: string;
  deliveries: number;
  baseEarning: number;
  incentives: number;
  tips: number;
  totalEarning: number;
  period: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  bankAccount: string;
  upiId?: string;
}

export default function RiderPayoutsPage() {
  const [payouts, setPayouts] = useState<RiderPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayouts, setSelectedPayouts] = useState<string[]>([]);

  useEffect(() => {
    fetchPayouts();
  }, [statusFilter]);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin-token');
      const res = await fetch(`/api/admin/finance/rider-payouts?status=${statusFilter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPayouts(data.data.payouts);
      }
    } catch (error) {
      console.error('Failed to fetch payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayouts = payouts.filter(payout =>
    payout.riderName.toLowerCase().includes(search.toLowerCase()) ||
    payout.phone.includes(search)
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge variant="success" size="sm">Completed</Badge>;
      case 'processing': return <Badge variant="info" size="sm">Processing</Badge>;
      case 'pending': return <Badge variant="warning" size="sm">Pending</Badge>;
      case 'failed': return <Badge variant="error" size="sm">Failed</Badge>;
      default: return <Badge size="sm">{status}</Badge>;
    }
  };

  const stats = {
    totalPending: payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.totalEarning, 0),
    totalPaid: payouts.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.totalEarning, 0),
    pendingCount: payouts.filter(p => p.status === 'pending').length,
    totalDeliveries: payouts.reduce((sum, p) => sum + p.deliveries, 0),
  };

  const handleSelectAll = () => {
    if (selectedPayouts.length === filteredPayouts.filter(p => p.status === 'pending').length) {
      setSelectedPayouts([]);
    } else {
      setSelectedPayouts(filteredPayouts.filter(p => p.status === 'pending').map(p => p.id));
    }
  };

  const handleProcessSelected = async () => {
    alert(`Processing ${selectedPayouts.length} payouts`);
  };

  return (
    <AdminLayout title="Rider Payouts">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Payouts</p>
              <p className="text-xl font-bold">{formatCurrency(stats.totalPending)}</p>
              <p className="text-xs text-gray-400">{stats.pendingCount} riders</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Paid This Week</p>
              <p className="text-xl font-bold">{formatCurrency(stats.totalPaid)}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Truck className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Deliveries</p>
              <p className="text-xl font-bold">{stats.totalDeliveries}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Wallet className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg. Earning</p>
              <p className="text-xl font-bold">
                {formatCurrency(payouts.length > 0 ? payouts.reduce((sum, p) => sum + p.totalEarning, 0) / payouts.length : 0)}
              </p>
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
                placeholder="Search riders..."
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
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="flex gap-2">
            {selectedPayouts.length > 0 && (
              <Button onClick={handleProcessSelected}>
                Pay Selected ({selectedPayouts.length})
              </Button>
            )}
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Payouts Table */}
      <Card padding="none">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : filteredPayouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <CreditCard className="h-12 w-12 mb-2" />
            <p>No payouts found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedPayouts.length === filteredPayouts.filter(p => p.status === 'pending').length && filteredPayouts.filter(p => p.status === 'pending').length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rider</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deliveries</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Incentives</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tips</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPayouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {payout.status === 'pending' && (
                        <input
                          type="checkbox"
                          checked={selectedPayouts.includes(payout.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPayouts([...selectedPayouts, payout.id]);
                            } else {
                              setSelectedPayouts(selectedPayouts.filter(id => id !== payout.id));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{payout.riderName}</p>
                        <p className="text-sm text-gray-500">{payout.phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{payout.period}</td>
                    <td className="px-4 py-3 text-sm font-medium">{payout.deliveries}</td>
                    <td className="px-4 py-3 text-sm">{formatCurrency(payout.baseEarning)}</td>
                    <td className="px-4 py-3 text-sm text-green-600">+{formatCurrency(payout.incentives)}</td>
                    <td className="px-4 py-3 text-sm text-blue-600">+{formatCurrency(payout.tips)}</td>
                    <td className="px-4 py-3 text-sm font-bold">{formatCurrency(payout.totalEarning)}</td>
                    <td className="px-4 py-3">{getStatusBadge(payout.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">View</Button>
                        {payout.status === 'pending' && (
                          <Button size="sm">Pay</Button>
                        )}
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
