'use client';

import { useState, useEffect } from 'react';
import { Gift, Users, TrendingUp, RefreshCw, Settings, BarChart3 } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';

interface PersonalizationStats {
  totalRecommendations: number;
  conversionRate: number;
  revenueImpact: number;
  activeUsers: number;
}

interface PersonalizationModel {
  id: string;
  name: string;
  type: 'collaborative' | 'content_based' | 'hybrid';
  accuracy: number;
  status: 'active' | 'training' | 'inactive';
  lastTrained: string;
  features: string[];
}

interface TopRecommendation {
  id: string;
  productName: string;
  vendorName: string;
  recommendedTo: number;
  conversions: number;
  conversionRate: number;
}

export default function PersonalizationPage() {
  const [stats, setStats] = useState<PersonalizationStats | null>(null);
  const [models, setModels] = useState<PersonalizationModel[]>([]);
  const [topRecommendations, setTopRecommendations] = useState<TopRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'overview' | 'models'>('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/ai/personalization', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.data.stats);
        setModels(data.data.models);
        setTopRecommendations(data.data.topRecommendations);
      }
    } catch (error) {
      console.error('Failed to fetch personalization data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getModelStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge variant="success" size="sm">Active</Badge>;
      case 'training': return <Badge variant="warning" size="sm">Training</Badge>;
      case 'inactive': return <Badge variant="default" size="sm">Inactive</Badge>;
      default: return <Badge size="sm">{status}</Badge>;
    }
  };

  const getModelTypeBadge = (type: string) => {
    switch (type) {
      case 'collaborative': return <Badge variant="info" size="sm">Collaborative</Badge>;
      case 'content_based': return <Badge variant="warning" size="sm">Content-Based</Badge>;
      case 'hybrid': return <Badge variant="success" size="sm">Hybrid</Badge>;
      default: return <Badge size="sm">{type}</Badge>;
    }
  };

  return (
    <AdminLayout title="Personalization">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Gift className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Recommendations</p>
                <p className="text-xl font-bold">{stats.totalRecommendations.toLocaleString()}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Conversion Rate</p>
                <p className="text-xl font-bold">{stats.conversionRate}%</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Revenue Impact</p>
                <p className="text-xl font-bold">{formatCurrency(stats.revenueImpact)}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Users</p>
                <p className="text-xl font-bold">{stats.activeUsers.toLocaleString()}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Controls */}
      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={view === 'overview' ? 'primary' : 'outline'}
              onClick={() => setView('overview')}
            >
              Overview
            </Button>
            <Button
              variant={view === 'models' ? 'primary' : 'outline'}
              onClick={() => setView('models')}
            >
              <Settings className="h-4 w-4 mr-2" />
              Models
            </Button>
          </div>
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : view === 'models' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {models.map((model) => (
            <Card key={model.id}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{model.name}</h3>
                  <div className="flex gap-2 mt-1">
                    {getModelTypeBadge(model.type)}
                    {getModelStatusBadge(model.status)}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{model.accuracy}%</p>
                  <p className="text-xs text-gray-500">Accuracy</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Features</p>
                <div className="flex flex-wrap gap-1">
                  {model.features.map((feature, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-sm text-gray-500 mb-4">
                Last trained: {new Date(model.lastTrained).toLocaleDateString()}
              </div>

              <div className="flex gap-2 pt-3 border-t">
                {model.status === 'active' ? (
                  <Button variant="outline" size="sm" fullWidth>Retrain</Button>
                ) : (
                  <Button variant="primary" size="sm" fullWidth>Activate</Button>
                )}
                <Button variant="outline" size="sm" fullWidth>Configure</Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card padding="none">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">Top Performing Recommendations</h3>
          </div>
          {topRecommendations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500">
              <Gift className="h-12 w-12 mb-2" />
              <p>No recommendation data yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shown To</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conversions</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {topRecommendations.map((rec) => (
                    <tr key={rec.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{rec.productName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{rec.vendorName}</td>
                      <td className="px-4 py-3 text-sm">{rec.recommendedTo.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm">{rec.conversions.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`font-medium ${rec.conversionRate > 10 ? 'text-green-600' : 'text-gray-600'}`}>
                          {rec.conversionRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </AdminLayout>
  );
}
