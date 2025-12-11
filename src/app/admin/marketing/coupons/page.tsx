'use client';

import { useState, useEffect } from 'react';
import { Gift, Search, Plus, RefreshCw, Edit2, Trash2, Copy, CheckCircle, Eye } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Coupon {
  id: string;
  code: string;
  description: string;
  type: 'percentage' | 'flat';
  value: number;
  minOrder: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'disabled';
  applicableTo: string[];
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [couponCode, setCouponCode] = useState('');
  const [couponDescription, setCouponDescription] = useState('');
  const [couponType, setCouponType] = useState<'percentage' | 'flat'>('percentage');
  const [couponValue, setCouponValue] = useState('10');
  const [minOrder, setMinOrder] = useState('199');
  const [maxDiscount, setMaxDiscount] = useState('100');
  const [usageLimit, setUsageLimit] = useState('1000');

  useEffect(() => {
    fetchCoupons();
  }, [statusFilter]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin-token');
      const res = await fetch(`/api/admin/marketing/coupons?status=${statusFilter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setCoupons(data.data.coupons);
      }
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const openCreateModal = () => {
    setCouponCode('');
    setCouponDescription('');
    setCouponType('percentage');
    setCouponValue('10');
    setMinOrder('199');
    setMaxDiscount('100');
    setUsageLimit('1000');
    setShowCreateModal(true);
  };

  const viewCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setShowViewModal(true);
  };

  const createCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Coupon code is required');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/marketing/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: couponCode.toUpperCase(),
          description: couponDescription,
          type: couponType,
          value: parseFloat(couponValue),
          minOrder: parseFloat(minOrder),
          maxDiscount: parseFloat(maxDiscount),
          usageLimit: parseInt(usageLimit),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Coupon created successfully');
        setCoupons(prev => [data.data.coupon, ...prev]);
        setShowCreateModal(false);
      } else {
        toast.error(data.error || 'Failed to create coupon');
      }
    } catch (error) {
      toast.error('Failed to create coupon');
    } finally {
      setSaving(false);
    }
  };

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(search.toLowerCase()) ||
    coupon.description.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge variant="success" size="sm">Active</Badge>;
      case 'expired': return <Badge variant="error" size="sm">Expired</Badge>;
      case 'disabled': return <Badge variant="default" size="sm">Disabled</Badge>;
      default: return <Badge size="sm">{status}</Badge>;
    }
  };

  const stats = {
    total: coupons.length,
    active: coupons.filter(c => c.status === 'active').length,
    totalUsage: coupons.reduce((sum, c) => sum + c.usedCount, 0),
    avgDiscount: coupons.length > 0
      ? coupons.reduce((sum, c) => sum + c.value, 0) / coupons.length
      : 0,
  };

  return (
    <AdminLayout title="Coupons">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Gift className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Coupons</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-xl font-bold">{stats.active}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Gift className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Usage</p>
              <p className="text-xl font-bold">{stats.totalUsage}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Gift className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg. Discount</p>
              <p className="text-xl font-bold">{stats.avgDiscount.toFixed(0)}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4 flex-1 w-full sm:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search coupons..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4 mr-2" />
            Create Coupon
          </Button>
        </div>
      </Card>

      {/* Coupons Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : filteredCoupons.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center h-48 text-gray-500">
            <Gift className="h-12 w-12 mb-2" />
            <p>No coupons found</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCoupons.map((coupon) => (
            <Card key={coupon.id}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-orange-100 rounded-lg font-mono font-bold text-orange-600">
                    {coupon.code}
                  </div>
                  <button
                    onClick={() => handleCopyCode(coupon.code)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {copiedCode === coupon.code ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {getStatusBadge(coupon.status)}
              </div>

              <p className="text-sm text-gray-600 mb-4">{coupon.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Discount</span>
                  <span className="font-medium">
                    {coupon.type === 'percentage' ? `${coupon.value}%` : formatCurrency(coupon.value)}
                    {coupon.maxDiscount && ` (max ${formatCurrency(coupon.maxDiscount)})`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Min. Order</span>
                  <span className="font-medium">{formatCurrency(coupon.minOrder)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Usage</span>
                  <span className="font-medium">{coupon.usedCount} / {coupon.usageLimit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Valid Till</span>
                  <span className="font-medium">{new Date(coupon.endDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {coupon.applicableTo.map(cat => (
                  <span key={cat} className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                    {cat}
                  </span>
                ))}
              </div>

              <div className="flex gap-2 pt-3 border-t">
                <Button variant="outline" size="sm" fullWidth onClick={() => viewCoupon(coupon)}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" fullWidth>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" fullWidth>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Coupon Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Coupon"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Coupon Code
            </label>
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="e.g., SAVE20"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 uppercase"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={couponDescription}
              onChange={(e) => setCouponDescription(e.target.value)}
              placeholder="e.g., 20% off on first order"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Type
              </label>
              <select
                value={couponType}
                onChange={(e) => setCouponType(e.target.value as 'percentage' | 'flat')}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Value
              </label>
              <input
                type="number"
                value={couponValue}
                onChange={(e) => setCouponValue(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Order
              </label>
              <input
                type="number"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Discount
              </label>
              <input
                type="number"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usage Limit
            </label>
            <input
              type="number"
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" fullWidth onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button fullWidth onClick={createCoupon} loading={saving}>
              Create Coupon
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Coupon Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Coupon Details"
      >
        {selectedCoupon && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b">
              <div className="px-4 py-2 bg-orange-100 rounded-lg font-mono font-bold text-orange-600 text-lg">
                {selectedCoupon.code}
              </div>
              {getStatusBadge(selectedCoupon.status)}
            </div>

            <p className="text-gray-600">{selectedCoupon.description}</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Discount</p>
                <p className="font-medium">
                  {selectedCoupon.type === 'percentage' ? `${selectedCoupon.value}%` : formatCurrency(selectedCoupon.value)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Max Discount</p>
                <p className="font-medium">{selectedCoupon.maxDiscount ? formatCurrency(selectedCoupon.maxDiscount) : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Minimum Order</p>
                <p className="font-medium">{formatCurrency(selectedCoupon.minOrder)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Usage</p>
                <p className="font-medium">{selectedCoupon.usedCount} / {selectedCoupon.usageLimit}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Valid From</p>
                <p className="font-medium">{new Date(selectedCoupon.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Valid Till</p>
                <p className="font-medium">{new Date(selectedCoupon.endDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">Applicable To</p>
              <div className="flex flex-wrap gap-2">
                {selectedCoupon.applicableTo.map(cat => (
                  <Badge key={cat} variant="info" size="sm">{cat}</Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" fullWidth onClick={() => setShowViewModal(false)}>
                Close
              </Button>
              <Button fullWidth>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Coupon
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
