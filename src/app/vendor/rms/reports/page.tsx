'use client';

import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ShoppingBag,
  Calendar,
  Download,
  Filter,
  ChevronDown,
  Clock,
  Utensils,
  CreditCard,
  Percent,
  Target,
  Award,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import Button from '@/components/ui/Button';

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
  avgTicket: number;
  covers: number;
}

interface TopItem {
  name: string;
  quantity: number;
  revenue: number;
  margin: number;
}

interface StaffPerformance {
  name: string;
  role: string;
  sales: number;
  tips: number;
  avgTicket: number;
  tablesServed: number;
}

const mockSalesData: SalesData[] = [
  { date: 'Mon', revenue: 45000, orders: 85, avgTicket: 529, covers: 156 },
  { date: 'Tue', revenue: 38000, orders: 72, avgTicket: 528, covers: 132 },
  { date: 'Wed', revenue: 52000, orders: 95, avgTicket: 547, covers: 178 },
  { date: 'Thu', revenue: 48000, orders: 88, avgTicket: 545, covers: 165 },
  { date: 'Fri', revenue: 72000, orders: 125, avgTicket: 576, covers: 245 },
  { date: 'Sat', revenue: 85000, orders: 145, avgTicket: 586, covers: 290 },
  { date: 'Sun', revenue: 68000, orders: 118, avgTicket: 576, covers: 235 },
];

const mockTopItems: TopItem[] = [
  { name: 'Butter Chicken', quantity: 145, revenue: 60900, margin: 68 },
  { name: 'Paneer Tikka', quantity: 128, revenue: 40960, margin: 72 },
  { name: 'Chicken Biryani', quantity: 115, revenue: 51750, margin: 65 },
  { name: 'Dal Makhani', quantity: 98, revenue: 27440, margin: 75 },
  { name: 'Garlic Naan', quantity: 320, revenue: 19200, margin: 82 },
];

const mockStaffPerformance: StaffPerformance[] = [
  { name: 'Priya Sharma', role: 'Server', sales: 125000, tips: 8500, avgTicket: 2450, tablesServed: 52 },
  { name: 'Amit Verma', role: 'Server', sales: 118000, tips: 7800, avgTicket: 2380, tablesServed: 48 },
  { name: 'Ravi Singh', role: 'Bartender', sales: 85000, tips: 6200, avgTicket: 850, tablesServed: 0 },
  { name: 'Neha Gupta', role: 'Server', sales: 95000, tips: 6500, avgTicket: 2250, tablesServed: 42 },
];

const paymentMethods = [
  { method: 'UPI', amount: 245000, percentage: 48 },
  { method: 'Credit Card', amount: 155000, percentage: 30 },
  { method: 'Debit Card', amount: 65000, percentage: 13 },
  { method: 'Cash', amount: 45000, percentage: 9 },
];

const hourlyData = [
  { hour: '11AM', revenue: 15000, covers: 25 },
  { hour: '12PM', revenue: 35000, covers: 58 },
  { hour: '1PM', revenue: 48000, covers: 82 },
  { hour: '2PM', revenue: 32000, covers: 54 },
  { hour: '3PM', revenue: 12000, covers: 20 },
  { hour: '4PM', revenue: 8000, covers: 12 },
  { hour: '5PM', revenue: 15000, covers: 22 },
  { hour: '6PM', revenue: 28000, covers: 45 },
  { hour: '7PM', revenue: 55000, covers: 95 },
  { hour: '8PM', revenue: 68000, covers: 115 },
  { hour: '9PM', revenue: 52000, covers: 88 },
  { hour: '10PM', revenue: 35000, covers: 58 },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'items' | 'staff' | 'inventory'>('overview');
  const [dateRange, setDateRange] = useState('week');
  const [comparisonPeriod, setComparisonPeriod] = useState('prev_week');

  const totalRevenue = mockSalesData.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = mockSalesData.reduce((sum, d) => sum + d.orders, 0);
  const totalCovers = mockSalesData.reduce((sum, d) => sum + d.covers, 0);
  const avgTicket = Math.round(totalRevenue / totalOrders);

  const revenueChange = 12.5;
  const ordersChange = 8.3;
  const coversChange = 15.2;
  const ticketChange = 3.8;

  const maxRevenue = Math.max(...mockSalesData.map(d => d.revenue));
  const maxHourlyRevenue = Math.max(...hourlyData.map(d => d.revenue));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600">Track performance and gain insights</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
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
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
              <div className={`flex items-center gap-1 text-sm mt-1 ${revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {revenueChange >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                {Math.abs(revenueChange)}% vs last week
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
              <div className={`flex items-center gap-1 text-sm mt-1 ${ordersChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {ordersChange >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                {Math.abs(ordersChange)}% vs last week
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Covers</p>
              <p className="text-2xl font-bold text-gray-900">{totalCovers}</p>
              <div className={`flex items-center gap-1 text-sm mt-1 ${coversChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {coversChange >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                {Math.abs(coversChange)}% vs last week
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Ticket</p>
              <p className="text-2xl font-bold text-gray-900">₹{avgTicket}</p>
              <div className={`flex items-center gap-1 text-sm mt-1 ${ticketChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {ticketChange >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                {Math.abs(ticketChange)}% vs last week
              </div>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Target className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'sales', label: 'Sales Analysis', icon: TrendingUp },
              { id: 'items', label: 'Item Performance', icon: Utensils },
              { id: 'staff', label: 'Staff Performance', icon: Users },
              { id: 'inventory', label: 'Inventory Report', icon: ShoppingBag },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="p-4 space-y-6">
            {/* Revenue Chart */}
            <div>
              <h3 className="font-medium text-gray-900 mb-4">Revenue This Week</h3>
              <div className="h-64 flex items-end gap-4">
                {mockSalesData.map((data, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '200px' }}>
                      <div
                        className="absolute bottom-0 w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg transition-all"
                        style={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">{data.date}</p>
                      <p className="text-xs text-gray-500">₹{(data.revenue / 1000).toFixed(0)}K</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payment Methods */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-medium text-gray-900 mb-4">Payment Methods</h3>
                <div className="space-y-3">
                  {paymentMethods.map((pm, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-700">{pm.method}</span>
                        <span className="font-medium text-gray-900">₹{pm.amount.toLocaleString()} ({pm.percentage}%)</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            idx === 0 ? 'bg-blue-500' :
                            idx === 1 ? 'bg-green-500' :
                            idx === 2 ? 'bg-yellow-500' : 'bg-gray-500'
                          }`}
                          style={{ width: `${pm.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hourly Distribution */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-medium text-gray-900 mb-4">Hourly Sales Distribution</h3>
                <div className="h-40 flex items-end gap-1">
                  {hourlyData.map((data, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-orange-400 rounded-t transition-all hover:bg-orange-500"
                        style={{ height: `${(data.revenue / maxHourlyRevenue) * 120}px` }}
                        title={`${data.hour}: ₹${data.revenue.toLocaleString()}`}
                      />
                      <p className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-left">
                        {data.hour}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Items Quick View */}
            <div>
              <h3 className="font-medium text-gray-900 mb-4">Top Selling Items</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {mockTopItems.map((item, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-2xl mb-2">{['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][idx]}</div>
                    <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                    <p className="text-lg font-bold text-orange-600">{item.quantity}</p>
                    <p className="text-xs text-gray-500">₹{item.revenue.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sales Analysis Tab */}
        {activeTab === 'sales' && (
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Ticket</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Covers</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rev/Cover</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockSalesData.map((data, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-4 font-medium text-gray-900">{data.date}</td>
                      <td className="px-4 py-4 text-green-600 font-medium">₹{data.revenue.toLocaleString()}</td>
                      <td className="px-4 py-4 text-gray-600">{data.orders}</td>
                      <td className="px-4 py-4 text-gray-900">₹{data.avgTicket}</td>
                      <td className="px-4 py-4 text-gray-600">{data.covers}</td>
                      <td className="px-4 py-4 text-gray-900">₹{Math.round(data.revenue / data.covers)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100">
                  <tr>
                    <td className="px-4 py-3 font-bold text-gray-900">Total</td>
                    <td className="px-4 py-3 font-bold text-green-600">₹{totalRevenue.toLocaleString()}</td>
                    <td className="px-4 py-3 font-bold text-gray-900">{totalOrders}</td>
                    <td className="px-4 py-3 font-bold text-gray-900">₹{avgTicket}</td>
                    <td className="px-4 py-3 font-bold text-gray-900">{totalCovers}</td>
                    <td className="px-4 py-3 font-bold text-gray-900">₹{Math.round(totalRevenue / totalCovers)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Order Type Breakdown */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { type: 'Dine-In', revenue: 320000, orders: 450, percentage: 62 },
                { type: 'Takeaway', revenue: 120000, orders: 180, percentage: 24 },
                { type: 'Delivery', revenue: 68000, orders: 98, percentage: 14 },
              ].map((orderType, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{orderType.type}</span>
                    <span className="text-sm text-gray-500">{orderType.percentage}%</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">₹{orderType.revenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{orderType.orders} orders</p>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full bg-orange-500 rounded-full"
                      style={{ width: `${orderType.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Item Performance Tab */}
        {activeTab === 'items' && (
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty Sold</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Margin</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockTopItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <span className="text-lg">{['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][idx]}</span>
                      </td>
                      <td className="px-4 py-4 font-medium text-gray-900">{item.name}</td>
                      <td className="px-4 py-4 text-gray-600">{item.quantity}</td>
                      <td className="px-4 py-4 text-green-600 font-medium">₹{item.revenue.toLocaleString()}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.margin >= 70 ? 'bg-green-100 text-green-700' :
                          item.margin >= 60 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {item.margin}%
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-900 font-medium">
                        ₹{Math.round(item.revenue * item.margin / 100).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Category Breakdown */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-4">Sales by Category</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { category: 'Main Course', revenue: 185000, percentage: 45 },
                  { category: 'Starters', revenue: 82000, percentage: 20 },
                  { category: 'Breads', revenue: 45000, percentage: 11 },
                  { category: 'Beverages', revenue: 55000, percentage: 13 },
                  { category: 'Desserts', revenue: 28000, percentage: 7 },
                  { category: 'Others', revenue: 16000, percentage: 4 },
                ].map((cat, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600">{cat.category}</p>
                    <p className="text-xl font-bold text-gray-900">₹{(cat.revenue / 1000).toFixed(0)}K</p>
                    <p className="text-sm text-orange-600">{cat.percentage}% of sales</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Staff Performance Tab */}
        {activeTab === 'staff' && (
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff Member</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Sales</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tips Earned</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Ticket</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tables Served</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockStaffPerformance.map((staff, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-medium text-sm">
                            {staff.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="font-medium text-gray-900">{staff.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-600">{staff.role}</td>
                      <td className="px-4 py-4 text-green-600 font-medium">₹{staff.sales.toLocaleString()}</td>
                      <td className="px-4 py-4 text-orange-600 font-medium">₹{staff.tips.toLocaleString()}</td>
                      <td className="px-4 py-4 text-gray-900">₹{staff.avgTicket}</td>
                      <td className="px-4 py-4 text-gray-600">{staff.tablesServed || '-'}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                idx === 0 ? 'bg-green-500' : idx === 1 ? 'bg-blue-500' : 'bg-yellow-500'
                              }`}
                              style={{ width: `${85 - idx * 10}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{85 - idx * 10}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Staff Stats */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-sm text-green-600">Total Staff Sales</p>
                <p className="text-2xl font-bold text-green-700">
                  ₹{mockStaffPerformance.reduce((s, p) => s + p.sales, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4">
                <p className="text-sm text-orange-600">Total Tips</p>
                <p className="text-2xl font-bold text-orange-700">
                  ₹{mockStaffPerformance.reduce((s, p) => s + p.tips, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-blue-600">Avg Ticket (Staff)</p>
                <p className="text-2xl font-bold text-blue-700">
                  ₹{Math.round(mockStaffPerformance.reduce((s, p) => s + p.avgTicket, 0) / mockStaffPerformance.length)}
                </p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-sm text-purple-600">Tables Served</p>
                <p className="text-2xl font-bold text-purple-700">
                  {mockStaffPerformance.reduce((s, p) => s + p.tablesServed, 0)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Report Tab */}
        {activeTab === 'inventory' && (
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <p className="text-sm text-red-600">Total Waste</p>
                <p className="text-2xl font-bold text-red-700">₹12,450</p>
                <p className="text-xs text-red-500">2.4% of COGS</p>
              </div>
              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                <p className="text-sm text-yellow-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-yellow-700">8</p>
                <p className="text-xs text-yellow-500">Needs reorder</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-sm text-blue-600">Stock Value</p>
                <p className="text-2xl font-bold text-blue-700">₹2,85,000</p>
                <p className="text-xs text-blue-500">Current inventory</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <p className="text-sm text-green-600">Food Cost %</p>
                <p className="text-2xl font-bold text-green-700">28.5%</p>
                <p className="text-xs text-green-500">Target: 30%</p>
              </div>
            </div>

            <h4 className="font-medium text-gray-900 mb-4">Waste Report</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[
                    { item: 'Tomatoes', category: 'Vegetables', qty: '5 kg', value: 200, reason: 'Spoilage' },
                    { item: 'Chicken', category: 'Meat', qty: '2 kg', value: 560, reason: 'Expired' },
                    { item: 'Paneer', category: 'Dairy', qty: '1 kg', value: 320, reason: 'Preparation Error' },
                    { item: 'Bread', category: 'Bakery', qty: '10 pcs', value: 150, reason: 'Stale' },
                  ].map((waste, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-4 font-medium text-gray-900">{waste.item}</td>
                      <td className="px-4 py-4 text-gray-600">{waste.category}</td>
                      <td className="px-4 py-4 text-gray-600">{waste.qty}</td>
                      <td className="px-4 py-4 text-red-600 font-medium">₹{waste.value}</td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">{waste.reason}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
