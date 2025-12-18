'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign,
  Users,
  UtensilsCrossed,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  ChefHat,
  CalendarDays,
  ArrowRight,
  Package,
  Loader2,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import RMSLayout from '@/components/layout/RMSLayout';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface DashboardStats {
  todayRevenue: number;
  todayCovers: number;
  avgCheck: number;
  tableOccupancy: number;
  openOrders: number;
  kitchenQueue: number;
  upcomingReservations: number;
  avgPrepTime: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  tableNumber: string;
  items: number;
  total: number;
  status: string;
  time: string;
}

interface KitchenAlert {
  id: string;
  type: 'delayed' | 'rush' | 'allergy';
  message: string;
  tableNumber: string;
  time: string;
}

interface TopItem {
  name: string;
  quantity: number;
  revenue: number;
}

export default function RMSDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    todayRevenue: 0,
    todayCovers: 0,
    avgCheck: 0,
    tableOccupancy: 0,
    openOrders: 0,
    kitchenQueue: 0,
    upcomingReservations: 0,
    avgPrepTime: 18,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [hourlySales, setHourlySales] = useState<{ hour: string; sales: number }[]>([]);
  const [salesGrowth, setSalesGrowth] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('vendor-token');
      const outletId = localStorage.getItem('vendor-outletId');

      if (!token || !outletId) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`/api/rms/analytics/dashboard?outletId=${outletId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || 'Failed to fetch dashboard data');
        return;
      }

      const data = result.data;

      // Map API data to stats
      setStats({
        todayRevenue: data.sales?.totalSales || 0,
        todayCovers: data.sales?.totalCovers || 0,
        avgCheck: data.sales?.averageCheck || 0,
        tableOccupancy: data.tables?.occupancyRate || 0,
        openOrders: data.activeOrders?.count || 0,
        kitchenQueue: data.activeOrders?.count || 0,
        upcomingReservations: data.upcomingReservations?.length || 0,
        avgPrepTime: 18,
      });

      setSalesGrowth(data.sales?.salesGrowth || 0);

      // Map recent orders
      if (data.activeOrders?.orders) {
        setRecentOrders(
          data.activeOrders.orders.slice(0, 4).map((order: any) => ({
            id: order.id,
            orderNumber: order.orderNumber,
            tableNumber: order.tableNumber,
            items: 0,
            total: order.total,
            status: order.status,
            time: `${order.minutesOpen} min`,
          }))
        );
      }

      // Set top items
      if (data.topItems) {
        setTopItems(data.topItems);
      }

      // Set hourly sales
      if (data.hourlySales) {
        setHourlySales(data.hourlySales);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-100 text-blue-700';
      case 'PREPARING': return 'bg-yellow-100 text-yellow-700';
      case 'READY': return 'bg-green-100 text-green-700';
      case 'SERVED': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'delayed': return 'bg-red-50 border-red-200 text-red-700';
      case 'allergy': return 'bg-purple-50 border-purple-200 text-purple-700';
      case 'rush': return 'bg-orange-50 border-orange-200 text-orange-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  if (loading) {
    return (
      <RMSLayout title="Dashboard" subtitle="Restaurant overview for today">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      </RMSLayout>
    );
  }

  return (
    <RMSLayout title="Dashboard" subtitle="Restaurant overview for today">
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Today&apos;s Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.todayRevenue.toLocaleString()}</p>
                <div className={`flex items-center gap-1 text-xs ${salesGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {salesGrowth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <span>{salesGrowth >= 0 ? '+' : ''}{salesGrowth.toFixed(1)}% vs yesterday</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Covers Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayCovers}</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>+8% vs yesterday</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Average Check</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.avgCheck}</p>
                <div className="flex items-center gap-1 text-xs text-red-600">
                  <TrendingDown className="h-3 w-3" />
                  <span>-3% vs yesterday</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <UtensilsCrossed className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Table Occupancy</p>
                <p className="text-2xl font-bold text-gray-900">{stats.tableOccupancy}%</p>
                <p className="text-xs text-gray-500">12 of 18 occupied</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <UtensilsCrossed className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/vendor/rms/orders">
            <Card className="bg-blue-50 border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <UtensilsCrossed className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-700">{stats.openOrders}</p>
                  <p className="text-sm text-blue-600">Open Orders</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/vendor/rms/kds">
            <Card className="bg-yellow-50 border-yellow-200 hover:bg-yellow-100 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <ChefHat className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-700">{stats.kitchenQueue}</p>
                  <p className="text-sm text-yellow-600">Kitchen Queue</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/vendor/rms/reservations">
            <Card className="bg-purple-50 border-purple-200 hover:bg-purple-100 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <CalendarDays className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-700">{stats.upcomingReservations}</p>
                  <p className="text-sm text-purple-600">Reservations</p>
                </div>
              </div>
            </Card>
          </Link>

          <Card className="bg-green-50 border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">{stats.avgPrepTime} min</p>
                <p className="text-sm text-green-600">Avg Prep Time</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <Card padding="none" className="lg:col-span-2">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-lg text-gray-900">Recent Orders</h3>
              <Link href="/vendor/rms/orders">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="divide-y">
              {recentOrders.map((order) => (
                <div key={order.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center font-semibold text-gray-700">
                        {order.tableNumber}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{order.orderNumber}</p>
                        <p className="text-sm text-gray-500">{order.items} items</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₹{order.total.toLocaleString()}</p>
                      <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Kitchen Alerts */}
          <Card padding="none">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-lg text-gray-900">Kitchen Alerts</h3>
              <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                {kitchenAlerts.length} Active
              </span>
            </div>
            <div className="p-4 space-y-3">
              {kitchenAlerts.map((alert) => (
                <div key={alert.id} className={`p-3 rounded-lg border ${getAlertColor(alert.type)}`}>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs opacity-75">
                        <span>{alert.tableNumber}</span>
                        <span>&bull;</span>
                        <span>{alert.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/vendor/rms/pos">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                  <UtensilsCrossed className="h-6 w-6 text-orange-600" />
                </div>
                <p className="font-semibold text-gray-900">Open POS</p>
                <p className="text-sm text-gray-500">Take new order</p>
              </div>
            </Card>
          </Link>

          <Link href="/vendor/rms/tables">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <p className="font-semibold text-gray-900">Table Map</p>
                <p className="text-sm text-gray-500">View floor plan</p>
              </div>
            </Card>
          </Link>

          <Link href="/vendor/rms/reservations">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                  <CalendarDays className="h-6 w-6 text-purple-600" />
                </div>
                <p className="font-semibold text-gray-900">Reservations</p>
                <p className="text-sm text-gray-500">Manage bookings</p>
              </div>
            </Card>
          </Link>

          <Link href="/vendor/rms/kds">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                  <ChefHat className="h-6 w-6 text-green-600" />
                </div>
                <p className="font-semibold text-gray-900">Kitchen Display</p>
                <p className="text-sm text-gray-500">View KDS</p>
              </div>
            </Card>
          </Link>
        </div>

        {/* Top Selling Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="font-semibold text-lg mb-4 text-gray-900">Top Selling Items Today</h3>
            <div className="space-y-3">
              {topItems.length > 0 ? (
                topItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-sm font-medium text-orange-600">
                        {i + 1}
                      </span>
                      <span className="font-medium text-gray-900">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₹{item.revenue.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{item.quantity} orders</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No sales data yet</p>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-lg mb-4 text-gray-900">Hourly Sales</h3>
            <div className="h-48 flex items-end gap-2">
              {hourlySales.length > 0 ? (
                hourlySales.map((item) => {
                  const maxValue = Math.max(...hourlySales.map(s => s.sales));
                  const height = maxValue > 0 ? (item.sales / maxValue) * 100 : 0;
                  return (
                    <div key={item.hour} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-orange-500 rounded-t transition-all hover:bg-orange-600"
                        style={{ height: `${height}%`, minHeight: item.sales > 0 ? '4px' : '0' }}
                        title={`₹${item.sales.toLocaleString()}`}
                      />
                      <span className="text-xs text-gray-500">{item.hour.split(':')[0]}</span>
                    </div>
                  );
                })
              ) : (
                <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
                  No sales data yet
                </div>
              )}
            </div>
            <p className="text-center text-xs text-gray-500 mt-2">Hour of day</p>
          </Card>
        </div>
      </div>
    </RMSLayout>
  );
}
