'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, Eye, RefreshCw, Drumstick, Clock, DollarSign,
  Package, MapPin, CheckCircle, XCircle, Star, Thermometer, Boxes
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import AdminLayout from '@/components/layout/AdminLayout';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface MeatStore {
  id: string;
  name: string;
  image: string;
  rating: number;
  orders: number;
  revenue: number;
  status: 'active' | 'pending' | 'suspended';
  address: string;
  productCount: number;
  isVerified: boolean;
  avgDeliveryTime: number;
  hasColdStorage: boolean;
  joinedAt: string;
}

interface MeatStats {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  totalRevenue: number;
  totalOrders: number;
  todayOrders: number;
}

export default function MeatStoresPage() {
  const [stores, setStores] = useState<MeatStore[]>([]);
  const [stats, setStats] = useState<MeatStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStore, setSelectedStore] = useState<MeatStore | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin-token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        type: 'MEAT_SHOP',
      });
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/admin/departments/hyperlocal?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        setStores(result.data.stores || []);
        setStats(result.data.stats || null);
        setTotalPages(result.data.pagination?.totalPages || 1);
      } else {
        toast.error(result.error || 'Failed to load meat stores');
      }
    } catch (err) {
      toast.error('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, statusFilter]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleAction = async (action: string, storeId: string) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/departments/hyperlocal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ vendorId: storeId, action }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(result.message || 'Action completed');
        fetchStores();
      } else {
        toast.error(result.error || 'Action failed');
      }
    } catch (err) {
      toast.error('Failed to perform action');
    } finally {
      setActionLoading(false);
      setShowApprovalModal(false);
      setSelectedStore(null);
    }
  };

  return (
    <AdminLayout title="Meat & Fish Stores">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <p className="text-gray-500">Manage meat shops and fish markets</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchStores} loading={loading}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button>
            <Plus className="h-4 w-4" />
            Add Store
          </Button>
        </div>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
        <Thermometer className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-blue-800">Cold Chain Compliance</h4>
          <p className="text-sm text-blue-700">
            Ensure all meat and fish stores have proper cold storage facilities and follow food safety guidelines.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Drumstick className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.total || 0}</p>
              <p className="text-xs text-gray-500">Total Stores</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats?.active || 0}</p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency((stats?.totalRevenue || 0) / 1000)}K</p>
              <p className="text-xs text-gray-500">Revenue</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.todayOrders || 0}</p>
              <p className="text-xs text-gray-500">Today</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search meat stores..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-5 w-5 text-gray-400" />}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </Card>

      {loading && stores.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : stores.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Drumstick className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No meat stores found</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store) => (
            <Card key={store.id} padding="none" className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-32 bg-gray-200">
                {store.image ? (
                  <Image src={store.image} alt={store.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-100 to-red-50">
                    <Drumstick className="h-16 w-16 text-red-300" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant={store.status === 'active' ? 'success' : store.status === 'pending' ? 'warning' : 'error'}>
                    {store.status}
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{store.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span>{store.rating?.toFixed(1) || 'N/A'}</span>
                  <span className="text-gray-300">|</span>
                  <span>{store.productCount} items</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{store.address}</span>
                </div>
                <div className="flex gap-2 mt-4">
                  {store.status === 'pending' ? (
                    <Button size="sm" fullWidth onClick={() => { setSelectedStore(store); setShowApprovalModal(true); }}>
                      Review
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={() => { setSelectedStore(store); setShowDetailsModal(true); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Link href={`/admin/inventory/${store.id}`}>
                        <Button variant="outline" size="sm" title="Manage Inventory">
                          <Boxes className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(store.status === 'suspended' ? 'activate' : 'suspend', store.id)}
                        className={store.status === 'suspended' ? 'text-green-600' : 'text-red-600'}
                      >
                        {store.status === 'suspended' ? 'Activate' : 'Suspend'}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showDetailsModal} onClose={() => { setShowDetailsModal(false); setSelectedStore(null); }} title="Store Details">
        {selectedStore && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center">
                <Drumstick className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-xl">{selectedStore.name}</h3>
                <Badge variant={selectedStore.status === 'active' ? 'success' : 'error'}>{selectedStore.status}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold">{selectedStore.orders}</p>
                <p className="text-xs text-gray-500">Orders</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold">{formatCurrency(selectedStore.revenue / 1000)}K</p>
                <p className="text-xs text-gray-500">Revenue</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold">{selectedStore.productCount}</p>
                <p className="text-xs text-gray-500">Products</p>
              </div>
            </div>
            <Button fullWidth onClick={() => setShowDetailsModal(false)}>Close</Button>
          </div>
        )}
      </Modal>

      <Modal isOpen={showApprovalModal} onClose={() => { setShowApprovalModal(false); setSelectedStore(null); }} title="Review Application">
        {selectedStore && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Drumstick className="h-12 w-12 text-red-400" />
              <div>
                <h3 className="font-semibold">{selectedStore.name}</h3>
                <p className="text-sm text-gray-500">Meat & Fish Store Application</p>
              </div>
            </div>
            <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between">
                <span className="text-gray-500">Address</span>
                <span>{selectedStore.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Products</span>
                <span>{selectedStore.productCount}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => handleAction('reject', selectedStore.id)} loading={actionLoading} className="text-red-600">
                <XCircle className="h-4 w-4" /> Reject
              </Button>
              <Button fullWidth onClick={() => handleAction('approve', selectedStore.id)} loading={actionLoading}>
                <CheckCircle className="h-4 w-4" /> Approve
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
