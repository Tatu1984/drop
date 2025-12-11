'use client';

import { useState } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, Download, ChevronRight, IndianRupee, Clock, Package } from 'lucide-react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import Badge from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';

const weeklyData = [
  { day: 'Mon', earnings: 850, orders: 12 },
  { day: 'Tue', earnings: 1200, orders: 18 },
  { day: 'Wed', earnings: 950, orders: 14 },
  { day: 'Thu', earnings: 1100, orders: 16 },
  { day: 'Fri', earnings: 1450, orders: 22 },
  { day: 'Sat', earnings: 1800, orders: 28 },
  { day: 'Sun', earnings: 1650, orders: 25 },
];

const transactions = [
  { id: '1', type: 'order', description: 'Order #ORD1234', amount: 45, time: '10:30 AM' },
  { id: '2', type: 'order', description: 'Order #ORD1235', amount: 55, time: '11:45 AM' },
  { id: '3', type: 'tip', description: 'Tip from customer', amount: 20, time: '12:00 PM' },
  { id: '4', type: 'order', description: 'Order #ORD1236', amount: 40, time: '1:30 PM' },
  { id: '5', type: 'incentive', description: 'Peak hour bonus', amount: 50, time: '2:00 PM' },
  { id: '6', type: 'order', description: 'Order #ORD1237', amount: 60, time: '3:15 PM' },
];

const payouts = [
  { id: '1', date: 'Jan 15, 2024', amount: 8500, status: 'completed' },
  { id: '2', date: 'Jan 8, 2024', amount: 7200, status: 'completed' },
  { id: '3', date: 'Jan 1, 2024', amount: 9100, status: 'completed' },
];

export default function RiderEarningsPage() {
  const [activeTab, setActiveTab] = useState('today');
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const tabs = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
  ];

  const todayEarnings = 520;
  const todayOrders = 8;
  const weekEarnings = weeklyData.reduce((acc, d) => acc + d.earnings, 0);
  const weekOrders = weeklyData.reduce((acc, d) => acc + d.orders, 0);

  const maxEarning = Math.max(...weeklyData.map(d => d.earnings));

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
        <div className="px-4 py-4 flex items-center gap-4">
          <Link href="/rider">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-lg font-semibold">Earnings</h1>
        </div>

        <div className="px-4 pb-6">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
            className="mb-4"
          />
          <div className="text-center">
            <p className="text-white/70 text-sm">
              {activeTab === 'today' ? "Today's" : activeTab === 'week' ? "This Week's" : "This Month's"} Earnings
            </p>
            <p className="text-4xl font-bold mt-1">
              {formatCurrency(activeTab === 'today' ? todayEarnings : weekEarnings)}
            </p>
            <p className="text-white/70 text-sm mt-1">
              {activeTab === 'today' ? todayOrders : weekOrders} orders completed
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center">
            <Package className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <p className="text-lg font-bold">{todayOrders}</p>
            <p className="text-xs text-gray-500">Orders</p>
          </Card>
          <Card className="text-center">
            <Clock className="h-5 w-5 text-orange-500 mx-auto mb-1" />
            <p className="text-lg font-bold">6.5h</p>
            <p className="text-xs text-gray-500">Online</p>
          </Card>
          <Card className="text-center">
            <IndianRupee className="h-5 w-5 text-green-500 mx-auto mb-1" />
            <p className="text-lg font-bold">₹65</p>
            <p className="text-xs text-gray-500">Per Order</p>
          </Card>
        </div>

        {/* Weekly Chart */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Weekly Overview</h3>
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <TrendingUp className="h-4 w-4" />
              <span>+12% vs last week</span>
            </div>
          </div>
          <div className="flex items-end justify-between h-32 gap-2">
            {weeklyData.map((data) => (
              <div key={data.day} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-green-500 rounded-t transition-all"
                  style={{ height: `${(data.earnings / maxEarning) * 100}%` }}
                />
                <span className="text-xs text-gray-500">{data.day}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Today's Transactions */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Today's Transactions</h3>
            <span className="text-sm text-gray-500">{transactions.length} items</span>
          </div>
          <div className="space-y-3">
            {transactions.map((txn) => (
              <div key={txn.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      txn.type === 'tip'
                        ? 'bg-yellow-100 text-yellow-600'
                        : txn.type === 'incentive'
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-green-100 text-green-600'
                    }`}
                  >
                    <IndianRupee className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{txn.description}</p>
                    <p className="text-xs text-gray-500">{txn.time}</p>
                  </div>
                </div>
                <span className="font-semibold text-green-600">+₹{txn.amount}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Payout History */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Payout History</h3>
            <Link href="/rider/payouts" className="text-sm text-orange-500">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {payouts.map((payout) => (
              <div key={payout.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium">{formatCurrency(payout.amount)}</p>
                  <p className="text-xs text-gray-500">{payout.date}</p>
                </div>
                <Badge variant="success">Paid</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Download Statement */}
        <Button variant="outline" fullWidth>
          <Download className="h-4 w-4" />
          Download Earnings Statement
        </Button>
      </div>
    </div>
  );
}
