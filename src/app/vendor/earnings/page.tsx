'use client';

import { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Wallet,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Filter,
} from 'lucide-react';
import VendorLayout from '@/components/layout/VendorLayout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface Transaction {
  id: string;
  type: 'order' | 'payout' | 'refund' | 'adjustment';
  description: string;
  amount: number;
  date: string;
  orderId?: string;
  status: 'completed' | 'pending' | 'processing';
}

interface PayoutSchedule {
  id: string;
  amount: number;
  date: string;
  status: 'scheduled' | 'processing' | 'completed';
}

const mockTransactions: Transaction[] = [
  { id: '1', type: 'order', description: 'Order #1234', amount: 850, date: '2024-01-15T14:30:00', orderId: '1234', status: 'completed' },
  { id: '2', type: 'order', description: 'Order #1235', amount: 1250, date: '2024-01-15T13:15:00', orderId: '1235', status: 'completed' },
  { id: '3', type: 'refund', description: 'Refund for Order #1230', amount: -420, date: '2024-01-15T12:00:00', orderId: '1230', status: 'completed' },
  { id: '4', type: 'order', description: 'Order #1236', amount: 680, date: '2024-01-15T11:45:00', orderId: '1236', status: 'completed' },
  { id: '5', type: 'payout', description: 'Weekly Payout', amount: -15000, date: '2024-01-14T00:00:00', status: 'completed' },
  { id: '6', type: 'order', description: 'Order #1237', amount: 950, date: '2024-01-14T20:30:00', orderId: '1237', status: 'completed' },
  { id: '7', type: 'adjustment', description: 'Platform fee adjustment', amount: -250, date: '2024-01-14T18:00:00', status: 'completed' },
  { id: '8', type: 'order', description: 'Order #1238', amount: 1100, date: '2024-01-14T16:15:00', orderId: '1238', status: 'completed' },
];

const mockPayouts: PayoutSchedule[] = [
  { id: '1', amount: 18500, date: '2024-01-21', status: 'scheduled' },
  { id: '2', amount: 15000, date: '2024-01-14', status: 'completed' },
  { id: '3', amount: 16200, date: '2024-01-07', status: 'completed' },
];

const weeklyEarnings = [
  { day: 'Mon', amount: 4500 },
  { day: 'Tue', amount: 3800 },
  { day: 'Wed', amount: 5200 },
  { day: 'Thu', amount: 4100 },
  { day: 'Fri', amount: 6800 },
  { day: 'Sat', amount: 8200 },
  { day: 'Sun', amount: 5900 },
];

export default function VendorEarningsPage() {
  const [dateRange, setDateRange] = useState('week');
  const [transactionFilter, setTransactionFilter] = useState<string>('all');

  const totalEarnings = weeklyEarnings.reduce((sum, d) => sum + d.amount, 0);
  const maxEarning = Math.max(...weeklyEarnings.map(d => d.amount));
  const pendingPayout = mockPayouts.find(p => p.status === 'scheduled')?.amount || 0;

  const filteredTransactions = mockTransactions.filter(t =>
    transactionFilter === 'all' || t.type === transactionFilter
  );

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'order': return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'payout': return <CreditCard className="h-4 w-4 text-blue-600" />;
      case 'refund': return <ArrowDownRight className="h-4 w-4 text-red-600" />;
      case 'adjustment': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Completed</span>;
      case 'processing':
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Processing</span>;
      case 'scheduled':
        return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">Scheduled</span>;
      default:
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">{status}</span>;
    }
  };

  return (
    <VendorLayout title="Earnings">
      <div className="space-y-6">
        {/* Date Range Selector */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            {['today', 'week', 'month', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === range
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Custom Range
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">This Week&apos;s Earnings</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalEarnings.toLocaleString()}</p>
                <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                  <ArrowUpRight className="h-4 w-4" />
                  15.2% vs last week
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Payout</p>
                <p className="text-2xl font-bold text-gray-900">₹{pendingPayout.toLocaleString()}</p>
                <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                  <Clock className="h-4 w-4" />
                  Next: Jan 21, 2024
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">408</p>
                <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                  <ArrowUpRight className="h-4 w-4" />
                  8.5% vs last week
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">₹{Math.round(totalEarnings / 408)}</p>
                <div className="flex items-center gap-1 text-sm text-red-600 mt-1">
                  <ArrowDownRight className="h-4 w-4" />
                  2.1% vs last week
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Earnings Chart */}
          <div className="lg:col-span-2">
            <Card>
              <h3 className="font-bold text-gray-900 mb-4">Daily Earnings</h3>
              <div className="h-64 flex items-end gap-4">
                {weeklyEarnings.map((data, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '200px' }}>
                      <div
                        className="absolute bottom-0 w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all"
                        style={{ height: `${(data.amount / maxEarning) * 100}%` }}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">{data.day}</p>
                      <p className="text-xs text-gray-500">₹{(data.amount / 1000).toFixed(1)}K</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Payout Schedule */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Payout Schedule</h3>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            <div className="space-y-3">
              {mockPayouts.map((payout) => (
                <div
                  key={payout.id}
                  className={`p-3 rounded-lg border ${
                    payout.status === 'scheduled' ? 'border-green-200 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">₹{payout.amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(payout.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    {getStatusBadge(payout.status)}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Transaction History */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Transaction History</h3>
            <div className="flex items-center gap-2">
              <select
                value={transactionFilter}
                onChange={(e) => setTransactionFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Transactions</option>
                <option value="order">Orders</option>
                <option value="payout">Payouts</option>
                <option value="refund">Refunds</option>
                <option value="adjustment">Adjustments</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Description</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gray-100 rounded">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <span className="text-sm capitalize text-gray-600">{transaction.type}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">{transaction.description}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(transaction.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(transaction.status)}</td>
                    <td className={`py-3 px-4 text-right font-medium ${
                      transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount >= 0 ? '+' : ''}₹{Math.abs(transaction.amount).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Bank Account Info */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Bank Account</h3>
                <p className="text-sm text-gray-500">HDFC Bank •••• 4521</p>
              </div>
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              Update
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </VendorLayout>
  );
}
