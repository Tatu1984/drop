'use client';

import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, DollarSign, Download, Calendar, ArrowUpRight, ArrowDownLeft, CreditCard, Wallet, Building2, RefreshCw } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import Badge from '@/components/ui/Badge';
import AdminLayout from '@/components/layout/AdminLayout';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  description: string;
  amount: number;
  method: string;
  time: string;
}

interface Payout {
  id: string;
  type: 'vendor' | 'rider';
  name: string;
  amount: number;
  status: 'completed' | 'pending';
  date: string;
}

interface FinanceData {
  stats: {
    totalRevenue: number;
    todayRevenue: number;
    commission: number;
    pendingPayouts: number;
    growth: number;
  };
  revenueTrend: Array<{ month: string; revenue: number }>;
  transactions: Transaction[];
  payouts: Payout[];
  paymentDistribution: Array<{ method: string; percentage: number; color: string }>;
}

export default function AdminFinancePage() {
  const [data, setData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('week');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'payouts', label: 'Payouts' },
  ];

  const fetchFinance = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin-token');
      const params = new URLSearchParams({ period: dateRange });

      const res = await fetch(`/api/admin/finance?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      } else {
        toast.error(result.error || 'Failed to load finance data');
      }
    } catch (err) {
      toast.error('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchFinance();
  }, [fetchFinance]);

  const stats = data?.stats || {
    totalRevenue: 0,
    todayRevenue: 0,
    commission: 0,
    pendingPayouts: 0,
    growth: 0,
  };

  const revenueTrend = data?.revenueTrend || [];
  const transactions = data?.transactions || [];
  const payouts = data?.payouts || [];
  const paymentDistribution = data?.paymentDistribution || [];
  const maxRevenue = Math.max(...revenueTrend.map(d => d.revenue), 1);

  return (
    <AdminLayout title="Finance & Revenue">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">Manage payments and payouts</p>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <Button variant="outline" onClick={fetchFinance} loading={loading}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
            <TrendingUp className="h-4 w-4" />
            <span>+{stats.growth}% vs last month</span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today&apos;s Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.todayRevenue)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Commission Earned</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.commission)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Wallet className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Payouts</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.pendingPayouts)}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Building2 className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border mb-6">
        <div className="border-b px-4">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        <div className="p-6">
          {loading && !data ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Revenue Chart */}
                  <div>
                    <h3 className="font-semibold mb-4">Revenue Trend</h3>
                    {revenueTrend.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">No revenue data</div>
                    ) : (
                      <div className="flex items-end justify-between h-48 gap-4">
                        {revenueTrend.map((item) => (
                          <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {formatCurrency(item.revenue / 1000)}K
                            </span>
                            <div
                              className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t transition-all"
                              style={{ height: `${(item.revenue / maxRevenue) * 100}%`, minHeight: '4px' }}
                            />
                            <span className="text-xs text-gray-600">{item.month}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Payment Methods */}
                  <div>
                    <h3 className="font-semibold mb-4">Payment Methods Distribution</h3>
                    <div className="grid grid-cols-4 gap-4">
                      {paymentDistribution.map((item) => (
                        <Card key={item.method}>
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${item.color}`} />
                            <div>
                              <p className="font-medium">{item.method}</p>
                              <p className="text-2xl font-bold">{item.percentage}%</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'transactions' && (
                <div>
                  {transactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No transactions found</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Transaction</th>
                            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Method</th>
                            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Time</th>
                            <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {transactions.map((txn) => (
                            <tr key={txn.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    txn.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                                  }`}>
                                    {txn.type === 'credit' ? (
                                      <ArrowDownLeft className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <ArrowUpRight className="h-4 w-4 text-red-600" />
                                    )}
                                  </div>
                                  <span>{txn.description}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <Badge variant="default" size="sm">{txn.method}</Badge>
                              </td>
                              <td className="px-4 py-3 text-gray-500">{txn.time}</td>
                              <td className={`px-4 py-3 text-right font-semibold ${
                                txn.type === 'credit' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'payouts' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Pending Payouts</h3>
                    <Button size="sm">
                      Process All
                    </Button>
                  </div>
                  {payouts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No payouts found</div>
                  ) : (
                    <div className="space-y-3">
                      {payouts.map((payout) => (
                        <div key={payout.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              payout.type === 'vendor' ? 'bg-blue-100' : 'bg-green-100'
                            }`}>
                              {payout.type === 'vendor' ? (
                                <Building2 className="h-5 w-5 text-blue-600" />
                              ) : (
                                <CreditCard className="h-5 w-5 text-green-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{payout.name}</p>
                              <p className="text-xs text-gray-500">{payout.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-bold">{formatCurrency(payout.amount)}</span>
                            {payout.status === 'pending' ? (
                              <Button size="sm">Pay Now</Button>
                            ) : (
                              <Badge variant="success">Paid</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
