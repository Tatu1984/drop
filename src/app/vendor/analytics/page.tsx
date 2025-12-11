'use client';

import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  Clock,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Star,
} from 'lucide-react';
import VendorLayout from '@/components/layout/VendorLayout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface DailyStat {
  day: string;
  orders: number;
  revenue: number;
}

const weeklyData: DailyStat[] = [
  { day: 'Mon', orders: 45, revenue: 28500 },
  { day: 'Tue', orders: 38, revenue: 24200 },
  { day: 'Wed', orders: 52, revenue: 33100 },
  { day: 'Thu', orders: 48, revenue: 30600 },
  { day: 'Fri', orders: 72, revenue: 45800 },
  { day: 'Sat', orders: 85, revenue: 54200 },
  { day: 'Sun', orders: 68, revenue: 43400 },
];

const topItems = [
  { name: 'Butter Chicken', orders: 145, revenue: 60900, change: 12 },
  { name: 'Paneer Tikka', orders: 128, revenue: 40960, change: 8 },
  { name: 'Chicken Biryani', orders: 115, revenue: 51750, change: -3 },
  { name: 'Dal Makhani', orders: 98, revenue: 27440, change: 15 },
  { name: 'Garlic Naan', orders: 320, revenue: 19200, change: 5 },
];

const hourlyOrders = [
  { hour: '11AM', orders: 5 },
  { hour: '12PM', orders: 12 },
  { hour: '1PM', orders: 18 },
  { hour: '2PM', orders: 15 },
  { hour: '3PM', orders: 8 },
  { hour: '4PM', orders: 4 },
  { hour: '5PM', orders: 6 },
  { hour: '6PM', orders: 10 },
  { hour: '7PM', orders: 22 },
  { hour: '8PM', orders: 28 },
  { hour: '9PM', orders: 25 },
  { hour: '10PM', orders: 15 },
];

export default function VendorAnalyticsPage() {
  const [dateRange, setDateRange] = useState('week');

  const totalRevenue = weeklyData.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = weeklyData.reduce((sum, d) => sum + d.orders, 0);
  const avgOrderValue = Math.round(totalRevenue / totalOrders);
  const maxRevenue = Math.max(...weeklyData.map(d => d.revenue));
  const maxHourlyOrders = Math.max(...hourlyOrders.map(h => h.orders));

  return (
    <VendorLayout title="Analytics">
      <div className="space-y-6">
        {/* Date Range Selector */}
        <div className="flex items-center justify-between">
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
          <Button variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Custom Range
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
                <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                  <ArrowUpRight className="h-4 w-4" />
                  12.5% vs last week
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
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                  <ArrowUpRight className="h-4 w-4" />
                  8.3% vs last week
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">₹{avgOrderValue}</p>
                <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                  <ArrowUpRight className="h-4 w-4" />
                  3.8% vs last week
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
                <p className="text-sm text-gray-500">Customer Rating</p>
                <p className="text-2xl font-bold text-gray-900">4.6</p>
                <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                  Based on 245 reviews
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card>
            <h3 className="font-bold text-gray-900 mb-4">Revenue This Week</h3>
            <div className="h-64 flex items-end gap-4">
              {weeklyData.map((data, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '200px' }}>
                    <div
                      className="absolute bottom-0 w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all"
                      style={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">{data.day}</p>
                    <p className="text-xs text-gray-500">₹{(data.revenue / 1000).toFixed(0)}K</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Peak Hours */}
          <Card>
            <h3 className="font-bold text-gray-900 mb-4">Orders by Hour</h3>
            <div className="h-64 flex items-end gap-1">
              {hourlyOrders.map((data, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-400 rounded-t hover:bg-blue-500 transition-colors"
                    style={{ height: `${(data.orders / maxHourlyOrders) * 180}px` }}
                    title={`${data.hour}: ${data.orders} orders`}
                  />
                  <p className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left whitespace-nowrap">
                    {data.hour}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Top Selling Items */}
        <Card>
          <h3 className="font-bold text-gray-900 mb-4">Top Selling Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Rank</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Item</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Orders</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Revenue</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Trend</th>
                </tr>
              </thead>
              <tbody>
                {topItems.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="text-lg">{['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][idx]}</span>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">{item.name}</td>
                    <td className="py-3 px-4 text-gray-600">{item.orders}</td>
                    <td className="py-3 px-4 text-gray-900 font-medium">₹{item.revenue.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`flex items-center gap-1 text-sm ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.change >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                        {Math.abs(item.change)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="text-center">
              <Clock className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-900">18 min</p>
              <p className="text-sm text-gray-500">Avg Prep Time</p>
              <p className="text-xs text-green-600 mt-1">3 min faster than avg</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <Package className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-900">94%</p>
              <p className="text-sm text-gray-500">Order Acceptance</p>
              <p className="text-xs text-green-600 mt-1">Above platform average</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <Users className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-900">68%</p>
              <p className="text-sm text-gray-500">Repeat Customers</p>
              <p className="text-xs text-green-600 mt-1">+5% from last month</p>
            </div>
          </Card>
        </div>
      </div>
    </VendorLayout>
  );
}
