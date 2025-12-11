'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Search, Download, CheckCircle, Clock, XCircle, RefreshCw, Calendar, Store, Eye } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface VendorPayout {
  id: string;
  vendorName: string;
  vendorType: string;
  amount: number;
  orders: number;
  commission: number;
  netAmount: number;
  period: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  bankAccount: string;
  scheduledDate: string;
  paidAt?: string;
}

export default function VendorPayoutsPage() {
  const [payouts, setPayouts] = useState<VendorPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayouts, setSelectedPayouts] = useState<string[]>([]);
  const [selectedPayout, setSelectedPayout] = useState<VendorPayout | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPayouts();
  }, [statusFilter]);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin-token');
      const res = await fetch(`/api/admin/finance/vendor-payouts?status=${statusFilter}`, {
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
    payout.vendorName.toLowerCase().includes(search.toLowerCase())
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
    totalPending: payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.netAmount, 0),
    totalProcessing: payouts.filter(p => p.status === 'processing').reduce((sum, p) => sum + p.netAmount, 0),
    totalPaid: payouts.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.netAmount, 0),
    pendingCount: payouts.filter(p => p.status === 'pending').length,
  };

  const handleSelectAll = () => {
    if (selectedPayouts.length === filteredPayouts.filter(p => p.status === 'pending').length) {
      setSelectedPayouts([]);
    } else {
      setSelectedPayouts(filteredPayouts.filter(p => p.status === 'pending').map(p => p.id));
    }
  };

  const handleProcessSelected = async () => {
    try {
      setProcessing(true);
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/finance/vendor-payouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          payoutIds: selectedPayouts,
          action: 'process',
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${selectedPayouts.length} payouts processed successfully`);
        setPayouts(prev => prev.map(p =>
          selectedPayouts.includes(p.id) ? { ...p, status: 'processing' } : p
        ));
        setSelectedPayouts([]);
      } else {
        toast.error(data.error || 'Failed to process payouts');
      }
    } catch (error) {
      toast.error('Failed to process payouts');
    } finally {
      setProcessing(false);
    }
  };

  const handlePaySingle = async (payout: VendorPayout) => {
    try {
      setProcessing(true);
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/finance/vendor-payouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          payoutIds: [payout.id],
          action: 'process',
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Payout to ${payout.vendorName} processed`);
        setPayouts(prev => prev.map(p =>
          p.id === payout.id ? { ...p, status: 'processing' } : p
        ));
        setShowViewModal(false);
      } else {
        toast.error(data.error || 'Failed to process payout');
      }
    } catch (error) {
      toast.error('Failed to process payout');
    } finally {
      setProcessing(false);
    }
  };

  const viewPayout = (payout: VendorPayout) => {
    setSelectedPayout(payout);
    setShowViewModal(true);
  };

  return (
    <AdminLayout title="Vendor Payouts">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-xl font-bold">{formatCurrency(stats.totalPending)}</p>
              <p className="text-xs text-gray-400">{stats.pendingCount} vendors</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <RefreshCw className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Processing</p>
              <p className="text-xl font-bold">{formatCurrency(stats.totalProcessing)}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Paid This Month</p>
              <p className="text-xl font-bold">{formatCurrency(stats.totalPaid)}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Store className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Vendors</p>
              <p className="text-xl font-bold">{payouts.length}</p>
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
                placeholder="Search vendors..."
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
              <option value="failed">Failed</option>
            </select>
          </div>
          <div className="flex gap-2">
            {selectedPayouts.length > 0 && (
              <Button onClick={handleProcessSelected} loading={processing}>
                Process Selected ({selectedPayouts.length})
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
                      checked={selectedPayouts.length === filteredPayouts.filter(p => p.status === 'pending').length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Payout</th>
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
                        <p className="font-medium text-gray-900">{payout.vendorName}</p>
                        <p className="text-sm text-gray-500">{payout.vendorType}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{payout.period}</td>
                    <td className="px-4 py-3 text-sm font-medium">{payout.orders}</td>
                    <td className="px-4 py-3 text-sm">{formatCurrency(payout.amount)}</td>
                    <td className="px-4 py-3 text-sm text-red-600">-{formatCurrency(payout.commission)}</td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600">{formatCurrency(payout.netAmount)}</td>
                    <td className="px-4 py-3">{getStatusBadge(payout.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => viewPayout(payout)}>
                          <Eye className="h-3 w-3" />
                        </Button>
                        {payout.status === 'pending' && (
                          <Button size="sm" onClick={() => handlePaySingle(payout)}>Pay</Button>
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

      {/* View Payout Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Payout Details"
      >
        {selectedPayout && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Store className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{selectedPayout.vendorName}</h3>
                <p className="text-gray-500">{selectedPayout.vendorType}</p>
              </div>
              {getStatusBadge(selectedPayout.status)}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Period</p>
                <p className="font-medium">{selectedPayout.period}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="font-medium">{selectedPayout.orders}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gross Amount</p>
                <p className="font-medium">{formatCurrency(selectedPayout.amount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Commission</p>
                <p className="font-medium text-red-600">-{formatCurrency(selectedPayout.commission)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Net Payout</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedPayout.netAmount)}</p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Bank Account</p>
              <p className="font-mono">{selectedPayout.bankAccount}</p>
              <p className="text-xs text-gray-400 mt-1">Scheduled: {new Date(selectedPayout.scheduledDate).toLocaleDateString()}</p>
            </div>

            {selectedPayout.status === 'pending' && (
              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" fullWidth onClick={() => setShowViewModal(false)}>
                  Cancel
                </Button>
                <Button fullWidth onClick={() => handlePaySingle(selectedPayout)} loading={processing}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Process Payout
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
