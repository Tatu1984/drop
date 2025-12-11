'use client';

import { useState } from 'react';
import { Package, DollarSign, TrendingUp, Clock, Star, AlertTriangle, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import VendorLayout from '@/components/layout/VendorLayout';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  items: { name: string; qty: number }[];
  total: number;
  status: 'new' | 'preparing' | 'ready' | 'picked_up';
  time: string;
}

const mockOrders: Order[] = [
  { id: '1', orderNumber: '#DRP001234', customerName: 'Rahul S.', items: [{ name: 'Butter Chicken', qty: 2 }, { name: 'Naan', qty: 4 }], total: 650, status: 'new', time: '2 mins ago' },
  { id: '2', orderNumber: '#DRP001235', customerName: 'Priya M.', items: [{ name: 'Paneer Tikka', qty: 1 }, { name: 'Dal Makhani', qty: 1 }], total: 420, status: 'preparing', time: '8 mins ago' },
  { id: '3', orderNumber: '#DRP001236', customerName: 'Amit K.', items: [{ name: 'Biryani', qty: 3 }], total: 750, status: 'ready', time: '15 mins ago' },
];

const stats = {
  todayOrders: 45,
  todayRevenue: 28500,
  avgRating: 4.6,
  avgPrepTime: 22,
  pendingOrders: 5,
  completedOrders: 40,
};

export default function VendorDashboardPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        toast.success(`Order ${order.orderNumber} marked as ${newStatus.replace('_', ' ')}`);
        return { ...order, status: newStatus };
      }
      return order;
    }));
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'new': return 'bg-red-100 text-red-700 border-red-200';
      case 'preparing': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'ready': return 'bg-green-100 text-green-700 border-green-200';
      case 'picked_up': return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <VendorLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Today&apos;s Orders</p>
                <p className="text-2xl font-bold">{stats.todayOrders}</p>
                <p className="text-xs text-green-600">+12% vs yesterday</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Today&apos;s Revenue</p>
                <p className="text-2xl font-bold">₹{stats.todayRevenue.toLocaleString()}</p>
                <p className="text-xs text-green-600">+8% vs yesterday</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Rating</p>
                <p className="text-2xl font-bold">{stats.avgRating}</p>
                <p className="text-xs text-gray-500">Last 30 days</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Prep Time</p>
                <p className="text-2xl font-bold">{stats.avgPrepTime} min</p>
                <p className="text-xs text-green-600">-3 mins vs avg</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Order Status Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="bg-red-50 border-red-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-700">{stats.pendingOrders}</p>
                <p className="text-sm text-red-600">Orders need attention</p>
              </div>
            </div>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-yellow-700">3</p>
                <p className="text-sm text-yellow-600">Being prepared</p>
              </div>
            </div>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-700">{stats.completedOrders}</p>
                <p className="text-sm text-green-600">Completed today</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Active Orders */}
        <Card padding="none">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-lg">Active Orders</h3>
            <Button variant="ghost" size="sm">
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="divide-y">
            {orders.map((order) => (
              <div key={order.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{order.orderNumber}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full border ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{order.customerName}</p>
                    <p className="text-sm text-gray-500 truncate">
                      {order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm font-medium">₹{order.total}</span>
                      <span className="text-xs text-gray-400">{order.time}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {order.status === 'new' && (
                      <>
                        <Button size="sm" onClick={() => updateOrderStatus(order.id, 'preparing')}>
                          Accept
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 border-red-200">
                          Reject
                        </Button>
                      </>
                    )}
                    {order.status === 'preparing' && (
                      <Button size="sm" onClick={() => updateOrderStatus(order.id, 'ready')}>
                        Mark Ready
                      </Button>
                    )}
                    {order.status === 'ready' && (
                      <Button variant="outline" size="sm" disabled>
                        Waiting for pickup
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Popular Items */}
          <Card>
            <h3 className="font-semibold mb-4">Top Selling Items Today</h3>
            <div className="space-y-3">
              {[
                { name: 'Butter Chicken', orders: 28, revenue: 8400 },
                { name: 'Paneer Tikka', orders: 22, revenue: 5500 },
                { name: 'Chicken Biryani', orders: 18, revenue: 4500 },
                { name: 'Dal Makhani', orders: 15, revenue: 2250 },
                { name: 'Garlic Naan', orders: 45, revenue: 2700 },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                      {i + 1}
                    </span>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{item.revenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{item.orders} orders</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Reviews */}
          <Card>
            <h3 className="font-semibold mb-4">Recent Reviews</h3>
            <div className="space-y-4">
              {[
                { name: 'Rahul S.', rating: 5, comment: 'Amazing food! Best butter chicken in town.', time: '2h ago' },
                { name: 'Priya M.', rating: 4, comment: 'Good taste but delivery was slightly delayed.', time: '5h ago' },
                { name: 'Amit K.', rating: 5, comment: 'Fresh and delicious. Will order again!', time: '1d ago' },
              ].map((review, i) => (
                <div key={i} className="pb-4 border-b last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{review.name}</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className={`h-4 w-4 ${j < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{review.comment}</p>
                  <p className="text-xs text-gray-400 mt-1">{review.time}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </VendorLayout>
  );
}
