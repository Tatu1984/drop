'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Package,
  Truck,
  DollarSign,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import AdminLayout from '@/components/layout/AdminLayout';
import { formatCurrency } from '@/lib/utils';

interface DashboardData {
  stats: {
    todayRevenue: number;
    revenueGrowth: number;
    totalOrders: number;
    ordersGrowth: number;
    activeUsers: number;
    usersGrowth: number;
    onlineRiders: number;
    ridersChange: number;
  };
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customer: string;
    vendor: string;
    total: number;
    status: string;
    time: string;
  }>;
  statusSummary: {
    pending: number;
    confirmed: number;
    preparing: number;
    picked_up: number;
    out_for_delivery: number;
    delivered: number;
    cancelled: number;
  };
  topVendors: Array<{
    id: string;
    name: string;
    orders: number;
    rating: number;
  }>;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        setData(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to load dashboard');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
      DELIVERED: 'success',
      OUT_FOR_DELIVERY: 'info',
      PICKED_UP: 'info',
      PREPARING: 'warning',
      CONFIRMED: 'warning',
      PENDING: 'error',
      CANCELLED: 'error',
    };
    const labels: Record<string, string> = {
      DELIVERED: 'Delivered',
      OUT_FOR_DELIVERY: 'On the way',
      PICKED_UP: 'Picked up',
      PREPARING: 'Preparing',
      CONFIRMED: 'Confirmed',
      PENDING: 'Pending',
      CANCELLED: 'Cancelled',
    };
    return (
      <Badge variant={variants[status] || 'default'} size="sm">
        {labels[status] || status}
      </Badge>
    );
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff} min ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)} hr ago`;
    return date.toLocaleDateString();
  };

  if (loading && !data) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      </AdminLayout>
    );
  }

  if (error && !data) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-red-500">{error}</p>
          <button onClick={fetchDashboard} className="px-4 py-2 bg-orange-500 text-white rounded-lg">
            Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  const stats = data?.stats || {
    todayRevenue: 0,
    revenueGrowth: 0,
    totalOrders: 0,
    ordersGrowth: 0,
    activeUsers: 0,
    usersGrowth: 0,
    onlineRiders: 0,
    ridersChange: 0,
  };

  const statusSummary = data?.statusSummary || {
    pending: 0,
    confirmed: 0,
    preparing: 0,
    picked_up: 0,
    out_for_delivery: 0,
    delivered: 0,
    cancelled: 0,
  };

  return (
    <AdminLayout title="Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Today&apos;s Revenue</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(stats.todayRevenue)}
              </p>
              <div className={`flex items-center gap-1 text-sm mt-2 ${stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.revenueGrowth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span>{stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth}%</span>
              </div>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 lg:h-6 lg:w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 mt-1">{stats.totalOrders}</p>
              <div className={`flex items-center gap-1 text-sm mt-2 ${stats.ordersGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.ordersGrowth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span>{stats.ordersGrowth >= 0 ? '+' : ''}{stats.ordersGrowth}%</span>
              </div>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Users</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 mt-1">{stats.activeUsers.toLocaleString()}</p>
              <div className={`flex items-center gap-1 text-sm mt-2 ${stats.usersGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.usersGrowth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span>{stats.usersGrowth >= 0 ? '+' : ''}{stats.usersGrowth}%</span>
              </div>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 lg:h-6 lg:w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Online Riders</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 mt-1">{stats.onlineRiders}</p>
              <div className={`flex items-center gap-1 text-sm mt-2 ${stats.ridersChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.ridersChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span>{stats.ridersChange >= 0 ? '+' : ''}{stats.ridersChange} from yesterday</span>
              </div>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Truck className="h-5 w-5 lg:h-6 lg:w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts & Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2" padding="none">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Recent Orders</h3>
            <Link href="/admin/orders" className="text-sm text-orange-500">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Order ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">
                    Vendor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(data?.recentOrders || []).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No recent orders
                    </td>
                  </tr>
                ) : (
                  data?.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {order.customer}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">
                        {order.vendor}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
                        {formatTime(order.time)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Order Status Summary */}
        <Card padding="none">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">Order Status</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                <span className="text-sm text-gray-600">Pending</span>
              </div>
              <span className="font-semibold">{statusSummary.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full" />
                <span className="text-sm text-gray-600">Preparing</span>
              </div>
              <span className="font-semibold">{statusSummary.preparing}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-sm text-gray-600">On the way</span>
              </div>
              <span className="font-semibold">{statusSummary.out_for_delivery + statusSummary.picked_up}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm text-gray-600">Delivered</span>
              </div>
              <span className="font-semibold">{statusSummary.delivered}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-sm text-gray-600">Cancelled</span>
              </div>
              <span className="font-semibold">{statusSummary.cancelled}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Vendors */}
      <Card padding="none">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Top Vendors</h3>
          <Link href="/admin/vendors" className="text-sm text-orange-500">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Vendor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Orders
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Rating
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(data?.topVendors || []).length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                    No vendors yet
                  </td>
                </tr>
              ) : (
                data?.topVendors.map((vendor, index) => (
                  <tr key={vendor.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-900">
                          {vendor.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {vendor.orders}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {vendor.rating.toFixed(1)} / 5
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminLayout>
  );
}
