'use client';

import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, Users, ShoppingBag, Store, Bike, MapPin, Clock, Star, Target, RefreshCw } from 'lucide-react';
import Card from '@/components/ui/Card';
import Tabs from '@/components/ui/Tabs';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import AdminLayout from '@/components/layout/AdminLayout';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface AnalyticsData {
  kpis: {
    avgOrderValue: number;
    avgOrderChange: number;
    completionRate: number;
    completionChange: number;
    avgDeliveryTime: number;
    deliveryChange: number;
    satisfaction: number;
    satisfactionChange: number;
  };
  hourlyDistribution: Array<{ hour: string; orders: number }>;
  topVendors: Array<{ name: string; orders: number; revenue: number; rating: number; growth: number }>;
  topRiders: Array<{ name: string; deliveries: number; rating: number; onTime: number }>;
  zonePerformance: Array<{ zone: string; orders: number; revenue: number; avgDeliveryTime: number }>;
  quickStats: {
    newUsers: number;
    newUsersChange: number;
    activeVendors: number;
    newVendors: number;
    activeRiders: number;
    onlineRiders: number;
  };
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('month');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'vendors', label: 'Vendors' },
    { id: 'riders', label: 'Riders' },
    { id: 'zones', label: 'Zones' },
  ];

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin-token');
      const params = new URLSearchParams({ period: dateRange });

      const res = await fetch(`/api/admin/analytics?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      } else {
        toast.error(result.error || 'Failed to load analytics');
      }
    } catch (err) {
      toast.error('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const kpis = data?.kpis || {
    avgOrderValue: 0,
    avgOrderChange: 0,
    completionRate: 0,
    completionChange: 0,
    avgDeliveryTime: 0,
    deliveryChange: 0,
    satisfaction: 0,
    satisfactionChange: 0,
  };

  const hourlyDistribution = data?.hourlyDistribution || [];
  const topVendors = data?.topVendors || [];
  const topRiders = data?.topRiders || [];
  const zonePerformance = data?.zonePerformance || [];
  const quickStats = data?.quickStats || {
    newUsers: 0,
    newUsersChange: 0,
    activeVendors: 0,
    newVendors: 0,
    activeRiders: 0,
    onlineRiders: 0,
  };

  const kpiCards = [
    { label: 'Avg Order Value', value: formatCurrency(kpis.avgOrderValue), change: kpis.avgOrderChange, icon: ShoppingBag },
    { label: 'Order Completion Rate', value: `${kpis.completionRate}%`, change: kpis.completionChange, icon: Target },
    { label: 'Avg Delivery Time', value: `${kpis.avgDeliveryTime} min`, change: kpis.deliveryChange, icon: Clock },
    { label: 'Customer Satisfaction', value: `${kpis.satisfaction}/5`, change: kpis.satisfactionChange, icon: Star },
  ];

  const maxHourlyOrders = Math.max(...hourlyDistribution.map(d => d.orders), 1);

  return (
    <AdminLayout title="Analytics & Insights">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">Business intelligence</p>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="quarter">Last 3 months</option>
            <option value="year">Last 12 months</option>
          </select>
          <Button variant="outline" onClick={fetchAnalytics} loading={loading}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{kpi.label}</p>
                <p className="text-2xl font-bold">{kpi.value}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <kpi.icon className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              kpi.change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {kpi.change > 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>{Math.abs(kpi.change)}% vs last period</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border">
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
                  {/* Hourly Distribution */}
                  <div>
                    <h3 className="font-semibold mb-4">Hourly Order Distribution</h3>
                    {hourlyDistribution.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">No data available</div>
                    ) : (
                      <div className="flex items-end justify-between h-48 gap-1">
                        {hourlyDistribution.map((item) => (
                          <div key={item.hour} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-xs text-gray-500">{item.orders}</span>
                            <div
                              className="w-full bg-gradient-to-t from-orange-500 to-orange-300 rounded-t"
                              style={{ height: `${(item.orders / maxHourlyOrders) * 100}%`, minHeight: '4px' }}
                            />
                            <span className="text-xs text-gray-600 -rotate-45 origin-left">
                              {item.hour}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <div className="flex items-center gap-3">
                        <Users className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="text-sm text-gray-500">New Users</p>
                          <p className="text-xl font-bold">{quickStats.newUsers.toLocaleString()}</p>
                          <p className="text-xs text-green-600">+{quickStats.newUsersChange}% this month</p>
                        </div>
                      </div>
                    </Card>
                    <Card>
                      <div className="flex items-center gap-3">
                        <Store className="h-8 w-8 text-green-500" />
                        <div>
                          <p className="text-sm text-gray-500">Active Vendors</p>
                          <p className="text-xl font-bold">{quickStats.activeVendors}</p>
                          <p className="text-xs text-green-600">+{quickStats.newVendors} new this week</p>
                        </div>
                      </div>
                    </Card>
                    <Card>
                      <div className="flex items-center gap-3">
                        <Bike className="h-8 w-8 text-orange-500" />
                        <div>
                          <p className="text-sm text-gray-500">Active Riders</p>
                          <p className="text-xl font-bold">{quickStats.activeRiders}</p>
                          <p className="text-xs text-gray-600">{quickStats.onlineRiders} online now</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === 'vendors' && (
                <div>
                  <h3 className="font-semibold mb-4">Top Performing Vendors</h3>
                  {topVendors.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No vendor data</div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Vendor</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Orders</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Revenue</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Rating</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Growth</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {topVendors.map((vendor, index) => (
                          <tr key={vendor.name} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <span className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-sm font-bold text-orange-600">
                                  {index + 1}
                                </span>
                                <span className="font-medium">{vendor.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">{vendor.orders}</td>
                            <td className="px-4 py-3">{formatCurrency(vendor.revenue)}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                <span>{vendor.rating.toFixed(1)}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-green-600">+{vendor.growth}%</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {activeTab === 'riders' && (
                <div>
                  <h3 className="font-semibold mb-4">Top Performing Riders</h3>
                  {topRiders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No rider data</div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Rider</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Deliveries</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Rating</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">On-Time %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {topRiders.map((rider, index) => (
                          <tr key={rider.name} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-sm font-bold text-green-600">
                                  {index + 1}
                                </span>
                                <span className="font-medium">{rider.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">{rider.deliveries}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                <span>{rider.rating.toFixed(1)}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="success">{rider.onTime}%</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {activeTab === 'zones' && (
                <div>
                  <h3 className="font-semibold mb-4">Zone Performance</h3>
                  {zonePerformance.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No zone data</div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Zone</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Orders</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Revenue</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Avg Delivery</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {zonePerformance.map((zone) => (
                          <tr key={zone.zone} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">{zone.zone}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">{zone.orders.toLocaleString()}</td>
                            <td className="px-4 py-3">{formatCurrency(zone.revenue)}</td>
                            <td className="px-4 py-3">
                              <Badge variant={zone.avgDeliveryTime <= 28 ? 'success' : 'warning'}>
                                {zone.avgDeliveryTime} min
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
