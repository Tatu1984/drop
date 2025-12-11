'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, Eye, RefreshCw, Milk, Clock, DollarSign,
  Package, MapPin, CheckCircle, XCircle, Star, Sunrise, Boxes
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

interface DairyStore {
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
  hasSubscription: boolean;
  joinedAt: string;
}

interface DairyStats {
  total: number;
  active: number;
  pending: number;
  totalRevenue: number;
  todayOrders: number;
  subscriptionOrders: number;
}

export default function DairyStoresPage() {
  const [stores, setStores] = useState<DairyStore[]>([]);
  const [stats, setStats] = useState<DairyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStore, setSelectedStore] = useState<DairyStore | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin-token');
      const params = new URLSearchParams({ type: 'MILK_DAIRY' });
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/admin/departments/hyperlocal?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        setStores(result.data.stores || []);
        setStats(result.data.stats || null);
      }
    } catch (err) {
      toast.error('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const handleAction = async (action: string, storeId: string) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/departments/hyperlocal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ vendorId: storeId, action }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(result.message);
        fetchStores();
      }
    } catch (err) {
      toast.error('Failed to perform action');
    } finally {
      setActionLoading(false);
      setShowApprovalModal(false);
    }
  };

  return (
    <AdminLayout title="Dairy & Milk Stores">
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-500">Manage dairy stores and milk delivery services</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchStores} loading={loading}><RefreshCw className="h-4 w-4" /></Button>
          <Button><Plus className="h-4 w-4" /> Add Store</Button>
        </div>
      </div>

      <div className="mb-6 p-4 bg-cyan-50 border border-cyan-200 rounded-lg flex items-start gap-3">
        <Sunrise className="h-5 w-5 text-cyan-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-cyan-800">Early Morning Delivery</h4>
          <p className="text-sm text-cyan-700">Dairy stores often offer subscription-based early morning milk delivery. Ensure proper scheduling support.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-100 rounded-lg"><Milk className="h-5 w-5 text-cyan-600" /></div>
            <div><p className="text-2xl font-bold">{stats?.total || 0}</p><p className="text-xs text-gray-500">Total</p></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="h-5 w-5 text-green-600" /></div>
            <div><p className="text-2xl font-bold text-green-600">{stats?.active || 0}</p><p className="text-xs text-gray-500">Active</p></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg"><DollarSign className="h-5 w-5 text-purple-600" /></div>
            <div><p className="text-2xl font-bold">{formatCurrency((stats?.totalRevenue || 0) / 1000)}K</p><p className="text-xs text-gray-500">Revenue</p></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><Package className="h-5 w-5 text-blue-600" /></div>
            <div><p className="text-2xl font-bold">{stats?.todayOrders || 0}</p><p className="text-xs text-gray-500">Today</p></div>
          </div>
        </Card>
      </div>

      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input placeholder="Search dairy stores..." value={search} onChange={(e) => setSearch(e.target.value)} leftIcon={<Search className="h-5 w-5 text-gray-400" />} />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center h-64"><RefreshCw className="h-8 w-8 animate-spin text-orange-500" /></div>
      ) : stores.length === 0 ? (
        <Card><div className="text-center py-12"><Milk className="h-12 w-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">No dairy stores found</p></div></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store) => (
            <Card key={store.id} padding="none" className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-32 bg-gradient-to-br from-cyan-100 to-cyan-50 flex items-center justify-center">
                <Milk className="h-16 w-16 text-cyan-300" />
                <div className="absolute top-2 right-2">
                  <Badge variant={store.status === 'active' ? 'success' : store.status === 'pending' ? 'warning' : 'error'}>{store.status}</Badge>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold">{store.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span>{store.rating?.toFixed(1) || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{store.address}</span>
                </div>
                <div className="flex gap-2 mt-4">
                  {store.status === 'pending' ? (
                    <Button size="sm" fullWidth onClick={() => { setSelectedStore(store); setShowApprovalModal(true); }}>Review</Button>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={() => { setSelectedStore(store); setShowDetailsModal(true); }}><Eye className="h-4 w-4" /></Button>
                      <Link href={`/admin/inventory/${store.id}`}>
                        <Button variant="outline" size="sm" title="Manage Inventory"><Boxes className="h-4 w-4" /></Button>
                      </Link>
                      <Button variant="outline" size="sm" onClick={() => handleAction(store.status === 'suspended' ? 'activate' : 'suspend', store.id)} className={store.status === 'suspended' ? 'text-green-600' : 'text-red-600'}>
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

      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} title="Store Details">
        {selectedStore && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-cyan-100 rounded-lg flex items-center justify-center"><Milk className="h-8 w-8 text-cyan-600" /></div>
              <div><h3 className="font-semibold text-xl">{selectedStore.name}</h3></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg"><p className="text-2xl font-bold">{selectedStore.orders}</p><p className="text-xs text-gray-500">Orders</p></div>
              <div className="text-center p-4 bg-gray-50 rounded-lg"><p className="text-2xl font-bold">{formatCurrency(selectedStore.revenue / 1000)}K</p><p className="text-xs text-gray-500">Revenue</p></div>
              <div className="text-center p-4 bg-gray-50 rounded-lg"><p className="text-2xl font-bold">{selectedStore.productCount}</p><p className="text-xs text-gray-500">Products</p></div>
            </div>
            <Button fullWidth onClick={() => setShowDetailsModal(false)}>Close</Button>
          </div>
        )}
      </Modal>

      <Modal isOpen={showApprovalModal} onClose={() => setShowApprovalModal(false)} title="Review Application">
        {selectedStore && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Milk className="h-12 w-12 text-cyan-400" />
              <div><h3 className="font-semibold">{selectedStore.name}</h3><p className="text-sm text-gray-500">Dairy Store Application</p></div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => handleAction('reject', selectedStore.id)} loading={actionLoading} className="text-red-600"><XCircle className="h-4 w-4" /> Reject</Button>
              <Button fullWidth onClick={() => handleAction('approve', selectedStore.id)} loading={actionLoading}><CheckCircle className="h-4 w-4" /> Approve</Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
