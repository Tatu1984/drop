'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, Eye, RefreshCw, Building2, Clock, DollarSign, TrendingUp,
  Package, MapPin, CheckCircle, XCircle, Pill, Drumstick, Milk, PawPrint,
  Flower2, Store, Star, BarChart3
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import AdminLayout from '@/components/layout/AdminLayout';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface HyperlocalStore {
  id: string;
  name: string;
  image: string;
  type: string;
  rating: number;
  orders: number;
  revenue: number;
  status: 'active' | 'pending' | 'suspended';
  address: string;
  productCount: number;
  isVerified: boolean;
  avgDeliveryTime: number;
  joinedAt: string;
}

interface HyperlocalStats {
  total: number;
  active: number;
  pending: number;
  byCategory: {
    pharmacy: number;
    meat: number;
    dairy: number;
    pets: number;
    flowers: number;
    general: number;
  };
  totalRevenue: number;
  totalOrders: number;
  todayOrders: number;
}

const categoryInfo = [
  { type: 'PHARMACY', label: 'Pharmacy', icon: Pill, color: 'bg-blue-100 text-blue-600', href: '/admin/hyperlocal/pharmacy' },
  { type: 'MEAT_SHOP', label: 'Meat & Fish', icon: Drumstick, color: 'bg-red-100 text-red-600', href: '/admin/hyperlocal/meat' },
  { type: 'MILK_DAIRY', label: 'Dairy & Milk', icon: Milk, color: 'bg-cyan-100 text-cyan-600', href: '/admin/hyperlocal/dairy' },
  { type: 'PET_SUPPLIES', label: 'Pet Supplies', icon: PawPrint, color: 'bg-amber-100 text-amber-600', href: '/admin/hyperlocal/pets' },
  { type: 'FLOWERS', label: 'Flowers & Gifts', icon: Flower2, color: 'bg-pink-100 text-pink-600', href: '/admin/hyperlocal/flowers' },
  { type: 'GENERAL_STORE', label: 'General Store', icon: Store, color: 'bg-gray-100 text-gray-600', href: '/admin/hyperlocal/general' },
];

export default function HyperlocalPage() {
  const [stores, setStores] = useState<HyperlocalStore[]>([]);
  const [stats, setStats] = useState<HyperlocalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedStore, setSelectedStore] = useState<HyperlocalStore | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingStore, setAddingStore] = useState(false);

  // Form states
  const [storeName, setStoreName] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [storeType, setStoreType] = useState('PHARMACY');

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin-token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
      });
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (typeFilter !== 'all') params.set('type', typeFilter);

      const res = await fetch(`/api/admin/departments/hyperlocal?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        setStores(result.data.stores || []);
        setStats(result.data.stats || null);
        setTotalPages(result.data.pagination?.totalPages || 1);
      } else {
        toast.error(result.error || 'Failed to load stores');
      }
    } catch (err) {
      toast.error('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, statusFilter, typeFilter]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, typeFilter]);

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

  const getCategoryInfo = (type: string) => {
    return categoryInfo.find(c => c.type === type) || categoryInfo[5];
  };

  const resetAddForm = () => {
    setStoreName('');
    setStorePhone('');
    setStoreAddress('');
    setStoreType('PHARMACY');
  };

  const openAddStoreModal = () => {
    resetAddForm();
    setShowAddModal(true);
  };

  const handleAddStore = async () => {
    if (!storeName.trim()) {
      toast.error('Store name is required');
      return;
    }
    if (!storePhone.trim()) {
      toast.error('Phone number is required');
      return;
    }

    try {
      setAddingStore(true);
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/departments/hyperlocal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'create',
          name: storeName,
          phone: storePhone,
          address: storeAddress,
          type: storeType,
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Store added successfully');
        setShowAddModal(false);
        resetAddForm();
        fetchStores();
      } else {
        toast.error(result.error || 'Failed to add store');
      }
    } catch (err) {
      toast.error('Failed to add store');
    } finally {
      setAddingStore(false);
    }
  };

  return (
    <AdminLayout title="Hyperlocal Commerce">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-gray-500">
            Manage hyperlocal stores - pharmacy, meat, dairy, pets, and more
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchStores} loading={loading}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={openAddStoreModal}>
            <Plus className="h-4 w-4" />
            Add Store
          </Button>
        </div>
      </div>

      {/* Category Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {categoryInfo.map((cat) => (
          <Link key={cat.type} href={cat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex flex-col items-center text-center">
                <div className={`p-3 rounded-lg ${cat.color} mb-2`}>
                  <cat.icon className="h-6 w-6" />
                </div>
                <p className="font-medium text-sm">{cat.label}</p>
                <p className="text-xs text-gray-500">
                  {stats?.byCategory?.[cat.type.toLowerCase().replace('_', '') as keyof typeof stats.byCategory] || 0} stores
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Building2 className="h-5 w-5 text-indigo-600" />
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
              <p className="text-xs text-gray-500">Today&apos;s Orders</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search stores..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-5 w-5 text-gray-400" />}
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Categories</option>
            {categoryInfo.map(cat => (
              <option key={cat.type} value={cat.type}>{cat.label}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending Approval</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </Card>

      {/* Stores Grid */}
      {loading && stores.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : stores.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hyperlocal stores found</p>
            <Button className="mt-4" onClick={openAddStoreModal}>
              <Plus className="h-4 w-4" />
              Add Your First Store
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store) => {
            const catInfo = getCategoryInfo(store.type);
            return (
              <Card key={store.id} padding="none" className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-32 bg-gray-200">
                  {store.image ? (
                    <Image
                      src={store.image}
                      alt={store.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${catInfo.color.replace('text-', 'bg-').replace('-600', '-50')}`}>
                      <catInfo.icon className={`h-16 w-16 ${catInfo.color.split(' ')[1].replace('-600', '-300')}`} />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Badge
                      variant={
                        store.status === 'active' ? 'success' :
                        store.status === 'pending' ? 'warning' : 'error'
                      }
                    >
                      {store.status}
                    </Badge>
                  </div>
                  <div className="absolute top-2 left-2">
                    <Badge variant="default" className={catInfo.color}>
                      <catInfo.icon className="h-3 w-3" />
                      {catInfo.label}
                    </Badge>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{store.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span>{store.rating?.toFixed(1) || 'N/A'}</span>
                        <span className="text-gray-300">|</span>
                        <span>{store.productCount} products</span>
                      </div>
                    </div>
                    {store.isVerified && (
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-sm mb-3 py-2 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold">{store.orders}</p>
                      <p className="text-xs text-gray-500">Orders</p>
                    </div>
                    <div>
                      <p className="font-semibold">{formatCurrency(store.revenue / 1000)}K</p>
                      <p className="text-xs text-gray-500">Revenue</p>
                    </div>
                    <div>
                      <p className="font-semibold">{store.avgDeliveryTime}m</p>
                      <p className="text-xs text-gray-500">Delivery</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{store.address || 'No address'}</span>
                  </div>

                  <div className="flex gap-2">
                    {store.status === 'pending' ? (
                      <Button
                        size="sm"
                        fullWidth
                        onClick={() => {
                          setSelectedStore(store);
                          setShowApprovalModal(true);
                        }}
                      >
                        Review Application
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedStore(store);
                            setShowDetailsModal(true);
                          }}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction(
                            store.status === 'suspended' ? 'activate' : 'suspend',
                            store.id
                          )}
                          className={store.status === 'suspended' ? 'text-green-600' : 'text-red-600'}
                        >
                          {store.status === 'suspended' ? 'Activate' : 'Suspend'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Store Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedStore(null);
        }}
        title="Store Details"
        size="lg"
      >
        {selectedStore && (
          <div className="space-y-6">
            {(() => {
              const catInfo = getCategoryInfo(selectedStore.type);
              return (
                <>
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${catInfo.color}`}>
                      <catInfo.icon className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl">{selectedStore.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={selectedStore.status === 'active' ? 'success' : 'error'}>
                          {selectedStore.status}
                        </Badge>
                        <span className="text-gray-500">{catInfo.label}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
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
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold">{selectedStore.rating?.toFixed(1)}</p>
                      <p className="text-xs text-gray-500">Rating</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Address</span>
                      <span>{selectedStore.address}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Avg Delivery Time</span>
                      <span>{selectedStore.avgDeliveryTime} mins</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-500">Joined</span>
                      <span>{new Date(selectedStore.joinedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <Button fullWidth onClick={() => setShowDetailsModal(false)}>
                    Close
                  </Button>
                </>
              );
            })()}
          </div>
        )}
      </Modal>

      {/* Approval Modal */}
      <Modal
        isOpen={showApprovalModal}
        onClose={() => {
          setShowApprovalModal(false);
          setSelectedStore(null);
        }}
        title="Review Store Application"
      >
        {selectedStore && (
          <div className="space-y-4">
            {(() => {
              const catInfo = getCategoryInfo(selectedStore.type);
              return (
                <>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${catInfo.color}`}>
                      <catInfo.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{selectedStore.name}</h3>
                      <p className="text-sm text-gray-500">{catInfo.label} Application</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Address</span>
                      <span>{selectedStore.address || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Products Listed</span>
                      <span>{selectedStore.productCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Applied On</span>
                      <span>{new Date(selectedStore.joinedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => handleAction('reject', selectedStore.id)}
                      loading={actionLoading}
                      className="text-red-600"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      fullWidth
                      onClick={() => handleAction('approve', selectedStore.id)}
                      loading={actionLoading}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </Modal>

      {/* Add Store Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetAddForm();
        }}
        title="Add New Hyperlocal Store"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Name *
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter store name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={storePhone}
                onChange={(e) => setStorePhone(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="+91 9876543210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Type *
              </label>
              <select
                value={storeType}
                onChange={(e) => setStoreType(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {categoryInfo.map(cat => (
                  <option key={cat.type} value={cat.type}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={2}
                placeholder="Enter full address"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                setShowAddModal(false);
                resetAddForm();
              }}
            >
              Cancel
            </Button>
            <Button fullWidth onClick={handleAddStore} loading={addingStore}>
              <Plus className="h-4 w-4" />
              Add Store
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
