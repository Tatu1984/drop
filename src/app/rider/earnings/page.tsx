'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, Download, ChevronRight, IndianRupee, Clock, Package, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import Badge from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface EarningsData {
  totalEarnings: number;
  totalOrders: number;
  avgPerOrder: number;
  onlineHours: number;
  weeklyData?: Array<{ day: string; earnings: number; orders: number }>;
  transactions?: Array<{
    id: string;
    type: string;
    description: string;
    amount: number;
    time: string;
  }>;
  payouts?: Array<{
    id: string;
    date: string;
    amount: number;
    status: string;
  }>;
}

export default function RiderEarningsPage() {
  const [activeTab, setActiveTab] = useState('today');
  const [isLoading, setIsLoading] = useState(true);
  const [earningsData, setEarningsData] = useState<EarningsData>({
    totalEarnings: 0,
    totalOrders: 0,
    avgPerOrder: 0,
    onlineHours: 0,
    weeklyData: [],
    transactions: [],
    payouts: [],
  });

  const tabs = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
  ];

  // Fetch earnings data
  const fetchEarnings = async (period: string) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('rider-token');
      if (!token) {
        toast.error('Please login to continue');
        return;
      }

      const response = await fetch(`/api/rider/earnings?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success && data.data) {
        setEarningsData(data.data);
      } else {
        toast.error(data.error || 'Failed to fetch earnings');
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
      toast.error('Failed to fetch earnings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings(activeTab);
  }, [activeTab]);

  const maxEarning = earningsData.weeklyData && earningsData.weeklyData.length > 0
    ? Math.max(...earningsData.weeklyData.map(d => d.earnings))
    : 1;

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
            {isLoading ? (
              <div className="py-4">
                <Loader2 className="h-8 w-8 animate-spin text-white mx-auto" />
              </div>
            ) : (
              <>
                <p className="text-white/70 text-sm">
                  {activeTab === 'today' ? "Today's" : activeTab === 'week' ? "This Week's" : "This Month's"} Earnings
                </p>
                <p className="text-4xl font-bold mt-1">
                  {formatCurrency(earningsData.totalEarnings)}
                </p>
                <p className="text-white/70 text-sm mt-1">
                  {earningsData.totalOrders} orders completed
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats */}
        {!isLoading && (
          <div className="grid grid-cols-3 gap-3">
            <Card className="text-center">
              <Package className="h-5 w-5 text-blue-500 mx-auto mb-1" />
              <p className="text-lg font-bold">{earningsData.totalOrders}</p>
              <p className="text-xs text-gray-500">Orders</p>
            </Card>
            <Card className="text-center">
              <Clock className="h-5 w-5 text-orange-500 mx-auto mb-1" />
              <p className="text-lg font-bold">{earningsData.onlineHours.toFixed(1)}h</p>
              <p className="text-xs text-gray-500">Online</p>
            </Card>
            <Card className="text-center">
              <IndianRupee className="h-5 w-5 text-green-500 mx-auto mb-1" />
              <p className="text-lg font-bold">₹{earningsData.avgPerOrder.toFixed(0)}</p>
              <p className="text-xs text-gray-500">Per Order</p>
            </Card>
          </div>
        )}

        {/* Weekly Chart */}
        {!isLoading && earningsData.weeklyData && earningsData.weeklyData.length > 0 && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Weekly Overview</h3>
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <TrendingUp className="h-4 w-4" />
                <span>Weekly Stats</span>
              </div>
            </div>
            <div className="flex items-end justify-between h-32 gap-2">
              {earningsData.weeklyData.map((data) => (
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
        )}

        {/* Today's Transactions */}
        {!isLoading && earningsData.transactions && earningsData.transactions.length > 0 && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Transactions</h3>
              <span className="text-sm text-gray-500">{earningsData.transactions.length} items</span>
            </div>
            <div className="space-y-3">
              {earningsData.transactions.map((txn) => (
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
        )}

        {/* Payout History */}
        {!isLoading && earningsData.payouts && earningsData.payouts.length > 0 && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Payout History</h3>
              <Link href="/rider/payouts" className="text-sm text-orange-500">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {earningsData.payouts.map((payout) => (
                <div key={payout.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{formatCurrency(payout.amount)}</p>
                    <p className="text-xs text-gray-500">{payout.date}</p>
                  </div>
                  <Badge variant={payout.status === 'completed' ? 'success' : 'warning'}>
                    {payout.status === 'completed' ? 'Paid' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Download Statement */}
        <Button variant="outline" fullWidth>
          <Download className="h-4 w-4" />
          Download Earnings Statement
        </Button>
      </div>
    </div>
  );
}
