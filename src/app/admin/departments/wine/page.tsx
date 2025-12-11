'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, Eye, Edit2, Star, MapPin, CheckCircle, XCircle,
  RefreshCw, Wine, Clock, DollarSign, TrendingUp, Shield,
  Package, Percent, AlertTriangle, FileText, Calendar, Users, Boxes
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

interface WineStore {
  id: string;
  name: string;
  image: string;
  rating: number;
  totalRatings: number;
  orders: number;
  revenue: number;
  status: 'active' | 'pending' | 'suspended';
  address: string;
  phone: string;
  avgDeliveryTime: number;
  minimumOrder: number;
  commissionRate: number;
  isVerified: boolean;
  openingTime: string;
  closingTime: string;
  productCount: number;
  todayOrders: number;
  licenseNumber: string;
  licenseExpiry: string;
  licenseStatus: 'valid' | 'expiring' | 'expired';
  ageVerifiedOrders: number;
  rejectedOrders: number;
  joinedAt: string;
}

interface WineStats {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  totalRevenue: number;
  avgRating: number;
  totalOrders: number;
  todayOrders: number;
  expiringLicenses: number;
  ageVerificationRate: number;
}

export default function WineStoresPage() {
  const [stores, setStores] = useState<WineStore[]>([]);
  const [stats, setStats] = useState<WineStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [licenseFilter, setLicenseFilter] = useState('all');
  const [selectedStore, setSelectedStore] = useState<WineStore | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingStore, setAddingStore] = useState(false);

  // Form states
  const [storeName, setStoreName] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [storeOpeningTime, setStoreOpeningTime] = useState('10:00');
  const [storeClosingTime, setStoreClosingTime] = useState('22:00');

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin-token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        type: 'WINE_SHOP',
      });
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (licenseFilter !== 'all') params.set('license', licenseFilter);

      const res = await fetch(`/api/admin/departments/wine?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        setStores(result.data.stores || []);
        setStats(result.data.stats || null);
        setTotalPages(result.data.pagination?.totalPages || 1);
      } else {
        toast.error(result.error || 'Failed to load wine stores');
      }
    } catch (err) {
      toast.error('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, statusFilter, licenseFilter]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, licenseFilter]);

  const handleAction = async (action: string, storeId: string) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/departments/wine', {
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

  const getLicenseStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'success';
      case 'expiring': return 'warning';
      case 'expired': return 'error';
      default: return 'default';
    }
  };

  const resetAddForm = () => {
    setStoreName('');
    setStorePhone('');
    setStoreAddress('');
    setLicenseNumber('');
    setLicenseExpiry('');
    setStoreOpeningTime('10:00');
    setStoreClosingTime('22:00');
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
    if (!licenseNumber.trim()) {
      toast.error('License number is required');
      return;
    }

    try {
      setAddingStore(true);
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/departments/wine', {
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
          licenseNumber,
          licenseExpiry,
          openingTime: storeOpeningTime,
          closingTime: storeClosingTime,
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Wine store added successfully');
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

  const handleSendRenewalReminder = async () => {
    if (!selectedStore) return;
    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/departments/wine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'send_reminder',
          vendorId: selectedStore.id,
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Renewal reminder sent');
        setShowLicenseModal(false);
      } else {
        toast.error(result.error || 'Failed to send reminder');
      }
    } catch (err) {
      toast.error('Failed to send reminder');
    }
  };

  return (
    <AdminLayout title="Wine & Liquor Management">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-gray-500">
            Manage wine shops and liquor stores (Age-restricted)
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

      {/* Age Restriction Notice */}
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
        <Shield className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-amber-800">Age-Restricted Category</h4>
          <p className="text-sm text-amber-700">
            All orders require age verification. Customers must be 21+ years old.
            Ensure all vendors have valid liquor licenses before approval.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Wine className="h-5 w-5 text-purple-600" />
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
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency((stats?.totalRevenue || 0) / 1000)}K</p>
              <p className="text-xs text-gray-500">Revenue</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{stats?.expiringLicenses || 0}</p>
              <p className="text-xs text-gray-500">Expiring Licenses</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <Users className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.ageVerificationRate || 100}%</p>
              <p className="text-xs text-gray-500">Age Verified</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search wine stores..."
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
            <option value="pending">Pending Approval</option>
            <option value="suspended">Suspended</option>
          </select>
          <select
            value={licenseFilter}
            onChange={(e) => setLicenseFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Licenses</option>
            <option value="valid">Valid License</option>
            <option value="expiring">Expiring Soon</option>
            <option value="expired">Expired</option>
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
            <Wine className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No wine stores found</p>
            <Button className="mt-4" onClick={openAddStoreModal}>
              <Plus className="h-4 w-4" />
              Add Your First Store
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store) => (
            <Card key={store.id} padding="none" className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-36 bg-gray-200">
                {store.image ? (
                  <Image
                    src={store.image}
                    alt={store.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-50">
                    <Wine className="h-16 w-16 text-purple-300" />
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
                  <Badge variant={getLicenseStatusColor(store.licenseStatus)}>
                    <FileText className="h-3 w-3" />
                    License: {store.licenseStatus}
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
                    <Shield className="h-5 w-5 text-blue-500" />
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
                    <p className="font-semibold text-green-600">{store.ageVerifiedOrders}</p>
                    <p className="text-xs text-gray-500">Verified</p>
                  </div>
                </div>

                {store.licenseExpiry && (
                  <div className={`flex items-center gap-2 text-sm mb-3 p-2 rounded ${
                    store.licenseStatus === 'expired' ? 'bg-red-50 text-red-700' :
                    store.licenseStatus === 'expiring' ? 'bg-amber-50 text-amber-700' :
                    'bg-green-50 text-green-700'
                  }`}>
                    <Calendar className="h-4 w-4" />
                    <span>License expires: {new Date(store.licenseExpiry).toLocaleDateString()}</span>
                  </div>
                )}

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
                      <Link href={`/admin/inventory/${store.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          title="Manage Inventory"
                        >
                          <Boxes className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedStore(store);
                          setShowLicenseModal(true);
                        }}
                        title="License Details"
                      >
                        <FileText className="h-4 w-4" />
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
          ))}
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
        title="Wine Store Details"
        size="lg"
      >
        {selectedStore && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-200 rounded-lg relative overflow-hidden flex-shrink-0">
                {selectedStore.image ? (
                  <Image
                    src={selectedStore.image}
                    alt={selectedStore.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Wine className="h-10 w-10 text-gray-300" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-xl">{selectedStore.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={selectedStore.status === 'active' ? 'success' : 'error'}>
                    {selectedStore.status}
                  </Badge>
                  <Badge variant={getLicenseStatusColor(selectedStore.licenseStatus)}>
                    License: {selectedStore.licenseStatus}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold">{selectedStore.orders}</p>
                <p className="text-xs text-gray-500">Total Orders</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold">{formatCurrency(selectedStore.revenue / 1000)}K</p>
                <p className="text-xs text-gray-500">Revenue</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{selectedStore.ageVerifiedOrders}</p>
                <p className="text-xs text-gray-500">Age Verified</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{selectedStore.rejectedOrders}</p>
                <p className="text-xs text-gray-500">Rejected</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">License Information</h4>
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">License Number</span>
                  <span className="font-mono">{selectedStore.licenseNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Expiry Date</span>
                  <span>{selectedStore.licenseExpiry ? new Date(selectedStore.licenseExpiry).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <Badge variant={getLicenseStatusColor(selectedStore.licenseStatus)}>
                    {selectedStore.licenseStatus}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
              <Button fullWidth onClick={() => {
                setShowDetailsModal(false);
                setShowLicenseModal(true);
              }}>
                <FileText className="h-4 w-4" />
                View License
              </Button>
            </div>
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
        title="Review Wine Store Application"
      >
        {selectedStore && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Wine className="h-12 w-12 text-purple-400" />
              <div>
                <h3 className="font-semibold">{selectedStore.name}</h3>
                <p className="text-sm text-gray-500">Wine & Liquor Store Application</p>
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">License Verification Required</p>
                  <p className="text-sm text-amber-700">
                    Ensure the liquor license is valid and not expired before approving.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between">
                <span className="text-gray-500">Address</span>
                <span>{selectedStore.address || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">License Number</span>
                <span className="font-mono">{selectedStore.licenseNumber || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">License Expiry</span>
                <span>{selectedStore.licenseExpiry ? new Date(selectedStore.licenseExpiry).toLocaleDateString() : 'Not provided'}</span>
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
          </div>
        )}
      </Modal>

      {/* License Modal */}
      <Modal
        isOpen={showLicenseModal}
        onClose={() => {
          setShowLicenseModal(false);
          setSelectedStore(null);
        }}
        title="License Management"
      >
        {selectedStore && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{selectedStore.name}</h4>
              <Badge variant={getLicenseStatusColor(selectedStore.licenseStatus)}>
                {selectedStore.licenseStatus}
              </Badge>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
              <div>
                <label className="text-sm text-gray-500">License Number</label>
                <p className="font-mono text-lg">{selectedStore.licenseNumber || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Expiry Date</label>
                <p className="text-lg">{selectedStore.licenseExpiry ? new Date(selectedStore.licenseExpiry).toLocaleDateString() : 'Not provided'}</p>
              </div>
            </div>

            {selectedStore.licenseStatus === 'expired' && (
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Action Required:</strong> This store&apos;s license has expired.
                  Consider suspending operations until a valid license is provided.
                </p>
              </div>
            )}

            {selectedStore.licenseStatus === 'expiring' && (
              <div className="p-4 bg-amber-50 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Reminder:</strong> This store&apos;s license is expiring soon.
                  Send a renewal reminder to the vendor.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setShowLicenseModal(false)}>
                Close
              </Button>
              <Button fullWidth onClick={handleSendRenewalReminder}>
                Send Renewal Reminder
              </Button>
            </div>
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
        title="Add New Wine Store"
        size="lg"
      >
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-700">
                Wine & liquor stores require a valid liquor license. Ensure the license is verified before approving.
              </p>
            </div>
          </div>

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
                License Number *
              </label>
              <input
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., FL3-2024-12345"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Expiry Date
              </label>
              <input
                type="date"
                value={licenseExpiry}
                onChange={(e) => setLicenseExpiry(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opening Time
              </label>
              <input
                type="time"
                value={storeOpeningTime}
                onChange={(e) => setStoreOpeningTime(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Closing Time
              </label>
              <input
                type="time"
                value={storeClosingTime}
                onChange={(e) => setStoreClosingTime(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
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
