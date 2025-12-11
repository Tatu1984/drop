'use client';

import { useState, useEffect } from 'react';
import { Bot, TrendingUp, TrendingDown, RefreshCw, Calendar, MapPin, Clock } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';

interface HourlyPrediction {
  hour: string;
  predictedOrders: number;
  predictedRidersNeeded: number;
}

interface ZonePrediction {
  id: string;
  name: string;
  predictedOrders: number;
  currentRiders: number;
  requiredRiders: number;
  riderShortage: number;
  peakHours: string[];
  demandTrend: 'increasing' | 'stable' | 'decreasing';
  confidenceScore: number;
}

interface CategoryPrediction {
  category: string;
  predictedOrders: number;
  growth: number;
}

interface DemandStats {
  totalPredictedOrders: number;
  totalRidersNeeded: number;
  zonesWithShortage: number;
  avgConfidence: number;
}

export default function DemandPredictionPage() {
  const [stats, setStats] = useState<DemandStats | null>(null);
  const [zonePredictions, setZonePredictions] = useState<ZonePrediction[]>([]);
  const [hourlyPredictions, setHourlyPredictions] = useState<HourlyPrediction[]>([]);
  const [categoryPredictions, setCategoryPredictions] = useState<CategoryPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningPrediction, setRunningPrediction] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchPredictions();
  }, [selectedDate]);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin-token');
      const res = await fetch(`/api/admin/ai/demand?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.data.stats);
        setZonePredictions(data.data.zonePredictions);
        setHourlyPredictions(data.data.hourlyPredictions);
        setCategoryPredictions(data.data.categoryPredictions);
      }
    } catch (error) {
      console.error('Failed to fetch predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const runPrediction = async () => {
    try {
      setRunningPrediction(true);
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/ai/demand', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ date: selectedDate }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Prediction model executed successfully');
        // Refresh data after running prediction
        await fetchPredictions();
      } else {
        toast.error(data.error || 'Failed to run prediction');
      }
    } catch (error) {
      console.error('Failed to run prediction:', error);
      toast.error('Failed to run prediction');
    } finally {
      setRunningPrediction(false);
    }
  };

  const getDemandBadge = (trend: string) => {
    switch (trend) {
      case 'increasing': return <Badge variant="error" size="sm">High</Badge>;
      case 'stable': return <Badge variant="warning" size="sm">Medium</Badge>;
      case 'decreasing': return <Badge variant="success" size="sm">Low</Badge>;
      default: return <Badge size="sm">{trend}</Badge>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <span className="text-gray-500">-</span>;
    }
  };

  const displayStats = stats || {
    totalPredictedOrders: 0,
    totalRidersNeeded: 0,
    zonesWithShortage: 0,
    avgConfidence: 0,
  };

  // Find peak hour from hourly predictions
  const peakHour = hourlyPredictions.length > 0
    ? hourlyPredictions.reduce((max, p) => p.predictedOrders > max.predictedOrders ? p : max, hourlyPredictions[0]).hour
    : '00:00';

  return (
    <AdminLayout title="Demand Prediction">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Bot className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Predicted Orders</p>
              <p className="text-xl font-bold">{displayStats.totalPredictedOrders}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <MapPin className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Zones with Shortage</p>
              <p className="text-xl font-bold">{displayStats.zonesWithShortage}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg Confidence</p>
              <p className="text-xl font-bold">{displayStats.avgConfidence}%</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Peak Hour</p>
              <p className="text-xl font-bold">{peakHour}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <Calendar className="h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchPredictions} loading={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={runPrediction} loading={runningPrediction}>
              <Bot className="h-4 w-4 mr-2" />
              Run Prediction
            </Button>
          </div>
        </div>
      </Card>

      {/* Zone Demand */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card padding="none">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">Zone-wise Demand</h3>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : zonePredictions.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-500">
              No zone predictions available
            </div>
          ) : (
            <div className="divide-y">
              {zonePredictions.map((zone) => (
                <div key={zone.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{zone.name}</p>
                    <p className="text-sm text-gray-500">Peak: {zone.peakHours.join(', ')}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      {getDemandBadge(zone.demandTrend)}
                      <span className="text-sm text-gray-500">{zone.confidenceScore}% conf.</span>
                    </div>
                    <p className="text-sm">
                      <span className="text-gray-500">Orders: </span>
                      <span className="font-medium">{zone.predictedOrders}</span>
                      <span className="text-gray-400 mx-1">|</span>
                      <span className={zone.riderShortage > 0 ? 'text-red-500' : 'text-green-500'}>
                        {zone.currentRiders}/{zone.requiredRiders} riders
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card padding="none">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">Hourly Predictions</h3>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : hourlyPredictions.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-500">
              No hourly predictions available
            </div>
          ) : (
            <div className="overflow-x-auto max-h-96">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Hour</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Predicted Orders</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Riders Needed</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {hourlyPredictions.map((pred, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm font-medium">{pred.hour}</td>
                      <td className="px-4 py-2 text-sm">{pred.predictedOrders}</td>
                      <td className="px-4 py-2 text-sm">{pred.predictedRidersNeeded}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Category Predictions */}
      <Card padding="none">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-900">Category-wise Predictions</h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : categoryPredictions.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500">
            No category predictions available
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 divide-x">
            {categoryPredictions.map((cat, idx) => (
              <div key={idx} className="p-4 text-center">
                <p className="text-sm text-gray-500">{cat.category}</p>
                <p className="text-xl font-bold">{cat.predictedOrders}</p>
                <p className={`text-sm ${cat.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {cat.growth >= 0 ? '+' : ''}{cat.growth}%
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </AdminLayout>
  );
}
