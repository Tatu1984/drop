'use client';

import { useState, useEffect } from 'react';
import { Percent, Search, TrendingUp, Download, RefreshCw, Edit2, Save, X } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';

interface CategoryCommission {
  id: string;
  category: string;
  categoryLabel: string;
  commissionRate: number;
  vendorCount: number;
  totalOrders: number;
  totalCommission: number;
  avgOrderValue: number;
}

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<CategoryCommission[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  useEffect(() => {
    fetchCommissions();
  }, []);

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/finance/commissions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setCommissions(data.data.commissions);
      }
    } catch (error) {
      console.error('Failed to fetch commissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (commission: CategoryCommission) => {
    setEditingId(commission.id);
    setEditValue(commission.commissionRate);
  };

  const handleSave = async (id: string) => {
    try {
      const token = localStorage.getItem('admin-token');
      await fetch('/api/admin/finance/commissions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, rate: editValue }),
      });
      setCommissions(commissions.map(c =>
        c.id === id ? { ...c, commissionRate: editValue } : c
      ));
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update commission:', error);
    }
  };

  const stats = {
    totalCommission: commissions.reduce((sum, c) => sum + c.totalCommission, 0),
    avgRate: commissions.length > 0
      ? commissions.reduce((sum, c) => sum + c.commissionRate, 0) / commissions.length
      : 0,
    totalOrders: commissions.reduce((sum, c) => sum + c.totalOrders, 0),
    totalVendors: commissions.reduce((sum, c) => sum + c.vendorCount, 0),
  };

  return (
    <AdminLayout title="Commission Rates">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Commission</p>
              <p className="text-xl font-bold">{formatCurrency(stats.totalCommission)}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Percent className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg. Rate</p>
              <p className="text-xl font-bold">{stats.avgRate.toFixed(1)}%</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-xl font-bold">{stats.totalOrders.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Vendors</p>
              <p className="text-xl font-bold">{stats.totalVendors}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Commission Rates Table */}
      <Card padding="none">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Category-wise Commission Rates</h3>
          <Button variant="outline" size="sm" onClick={fetchCommissions}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendors</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Orders</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg. Order</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission Earned</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {commissions.map((commission) => (
                  <tr key={commission.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{commission.categoryLabel}</p>
                        <p className="text-sm text-gray-500">{commission.category}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {editingId === commission.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(parseFloat(e.target.value))}
                            className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                            min="0"
                            max="100"
                            step="0.5"
                          />
                          <span className="text-gray-500">%</span>
                        </div>
                      ) : (
                        <Badge variant="info" size="sm">{commission.commissionRate}%</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">{commission.vendorCount}</td>
                    <td className="px-4 py-3 text-sm">{commission.totalOrders.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">{formatCurrency(commission.avgOrderValue)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-green-600">
                      {formatCurrency(commission.totalCommission)}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === commission.id ? (
                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleSave(commission.id)}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingId(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(commission)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AdminLayout>
  );
}
