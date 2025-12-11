'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Eye, Edit2, Star, MapPin, Store, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import AdminLayout from '@/components/layout/AdminLayout';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Vendor {
  id: string;
  name: string;
  type: string;
  image: string;
  rating: number;
  orders: number;
  revenue: number;
  status: 'active' | 'pending' | 'suspended';
  address: string;
  phone: string;
  joinedAt: string;
  isVerified: boolean;
}

interface VendorsData {
  vendors: Vendor[];
  stats: {
    total: number;
    active: number;
    pending: number;
    suspended: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function AdminVendorsPage() {
  const [data, setData] = useState<VendorsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [addingVendor, setAddingVendor] = useState(false);
  const [editingVendor, setEditingVendor] = useState(false);

  // Form states
  const [vendorName, setVendorName] = useState('');
  const [vendorType, setVendorType] = useState('RESTAURANT');
  const [vendorPhone, setVendorPhone] = useState('');
  const [vendorAddress, setVendorAddress] = useState('');
  const [vendorEmail, setVendorEmail] = useState('');

  const fetchVendors = useCallback(async () => {
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

      const res = await fetch(`/api/admin/vendors?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      } else {
        toast.error(result.error || 'Failed to load vendors');
      }
    } catch (err) {
      toast.error('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, statusFilter, typeFilter]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, typeFilter]);

  const handleApprove = async () => {
    if (!selectedVendor) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/vendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ vendorId: selectedVendor.id, action: 'approve' }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Vendor approved');
        fetchVendors();
      } else {
        toast.error(result.error || 'Action failed');
      }
    } catch (err) {
      toast.error('Failed to approve vendor');
    } finally {
      setActionLoading(false);
      setShowApprovalModal(false);
      setSelectedVendor(null);
    }
  };

  const handleReject = async () => {
    if (!selectedVendor) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/vendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ vendorId: selectedVendor.id, action: 'reject' }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Vendor rejected');
        fetchVendors();
      } else {
        toast.error(result.error || 'Action failed');
      }
    } catch (err) {
      toast.error('Failed to reject vendor');
    } finally {
      setActionLoading(false);
      setShowApprovalModal(false);
      setSelectedVendor(null);
    }
  };

  const handleSuspend = async (vendor: Vendor) => {
    try {
      const token = localStorage.getItem('admin-token');
      const action = vendor.status === 'suspended' ? 'activate' : 'suspend';
      const res = await fetch('/api/admin/vendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ vendorId: vendor.id, action }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(vendor.status === 'suspended' ? 'Vendor activated' : 'Vendor suspended');
        fetchVendors();
      } else {
        toast.error(result.error || 'Action failed');
      }
    } catch (err) {
      toast.error('Failed to perform action');
    }
  };

  const vendorTypes = ['RESTAURANT', 'GROCERY', 'WINE_SHOP', 'PHARMACY', 'MEAT_SHOP'];
  const vendors = data?.vendors || [];
  const stats = data?.stats || { total: 0, active: 0, pending: 0, suspended: 0 };

  const resetForm = () => {
    setVendorName('');
    setVendorType('RESTAURANT');
    setVendorPhone('');
    setVendorAddress('');
    setVendorEmail('');
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setVendorName(vendor.name);
    setVendorType(vendor.type);
    setVendorPhone(vendor.phone || '');
    setVendorAddress(vendor.address || '');
    setShowEditModal(true);
  };

  const handleAddVendor = async () => {
    if (!vendorName.trim()) {
      toast.error('Vendor name is required');
      return;
    }
    if (!vendorPhone.trim()) {
      toast.error('Phone number is required');
      return;
    }

    try {
      setAddingVendor(true);
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/vendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'create',
          name: vendorName,
          type: vendorType,
          phone: vendorPhone,
          address: vendorAddress,
          email: vendorEmail,
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Vendor added successfully');
        setShowAddModal(false);
        resetForm();
        fetchVendors();
      } else {
        toast.error(result.error || 'Failed to add vendor');
      }
    } catch (err) {
      toast.error('Failed to add vendor');
    } finally {
      setAddingVendor(false);
    }
  };

  const handleEditVendor = async () => {
    if (!selectedVendor) return;
    if (!vendorName.trim()) {
      toast.error('Vendor name is required');
      return;
    }

    try {
      setEditingVendor(true);
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/vendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'update',
          vendorId: selectedVendor.id,
          name: vendorName,
          type: vendorType,
          phone: vendorPhone,
          address: vendorAddress,
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Vendor updated successfully');
        setShowEditModal(false);
        setSelectedVendor(null);
        resetForm();
        fetchVendors();
      } else {
        toast.error(result.error || 'Failed to update vendor');
      }
    } catch (err) {
      toast.error('Failed to update vendor');
    } finally {
      setEditingVendor(false);
    }
  };

  return (
    <AdminLayout title="Vendor Management">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{stats.total} total vendors</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchVendors} loading={loading}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={openAddModal}>
            <Plus className="h-4 w-4" />
            Add Vendor
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <p className="text-sm text-gray-500">Total Vendors</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Pending Approval</p>
          <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Suspended</p>
          <p className="text-2xl font-bold text-red-600">{stats.suspended}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search vendors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-5 w-5 text-gray-400" />}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500"
          >
            <option value="all">All Types</option>
            {vendorTypes.map(type => (
              <option key={type} value={type}>{type.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Vendors Grid */}
      {loading && !data ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : vendors.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-gray-500">
            No vendors found
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendors.map((vendor) => (
            <Card key={vendor.id} padding="none" className="overflow-hidden">
              <div className="relative h-32 bg-gray-200">
                {vendor.image ? (
                  <Image
                    src={vendor.image}
                    alt={vendor.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Store className="h-12 w-12 text-gray-300" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge
                    variant={
                      vendor.status === 'active' ? 'success' :
                      vendor.status === 'pending' ? 'warning' : 'error'
                    }
                  >
                    {vendor.status}
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{vendor.name}</h3>
                    <p className="text-xs text-gray-500">{vendor.type.replace('_', ' ')}</p>
                  </div>
                  {vendor.isVerified && (
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span>{vendor.rating?.toFixed(1) || 'N/A'}</span>
                  </div>
                  <span>{vendor.orders} orders</span>
                  <span>{formatCurrency(vendor.revenue / 1000)}K</span>
                </div>

                <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{vendor.address || 'No address'}</span>
                </div>

                <div className="flex gap-2">
                  {vendor.status === 'pending' ? (
                    <Button
                      size="sm"
                      fullWidth
                      onClick={() => {
                        setSelectedVendor(vendor);
                        setShowApprovalModal(true);
                      }}
                    >
                      Review
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedVendor(vendor);
                          setShowVendorModal(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEditModal(vendor)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuspend(vendor)}
                        className={vendor.status === 'suspended' ? 'text-green-600' : 'text-red-600'}
                      >
                        {vendor.status === 'suspended' ? 'Activate' : 'Suspend'}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Vendor Details Modal */}
      <Modal
        isOpen={showVendorModal}
        onClose={() => {
          setShowVendorModal(false);
          setSelectedVendor(null);
        }}
        title="Vendor Details"
      >
        {selectedVendor && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg relative overflow-hidden">
                {selectedVendor.image ? (
                  <Image
                    src={selectedVendor.image}
                    alt={selectedVendor.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Store className="h-8 w-8 text-gray-300" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{selectedVendor.name}</h3>
                <p className="text-sm text-gray-500">{selectedVendor.type.replace('_', ' ')}</p>
                <Badge
                  variant={selectedVendor.status === 'active' ? 'success' : 'error'}
                >
                  {selectedVendor.status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xl font-bold">{selectedVendor.orders}</p>
                <p className="text-xs text-gray-500">Orders</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xl font-bold">{formatCurrency(selectedVendor.revenue / 1000)}K</p>
                <p className="text-xs text-gray-500">Revenue</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xl font-bold">{selectedVendor.rating?.toFixed(1) || 'N/A'}</p>
                <p className="text-xs text-gray-500">Rating</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Address</span>
                <span>{selectedVendor.address || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Phone</span>
                <span>{selectedVendor.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Joined</span>
                <span>{new Date(selectedVendor.joinedAt).toLocaleDateString()}</span>
              </div>
            </div>

            <Button fullWidth onClick={() => setShowVendorModal(false)}>
              Close
            </Button>
          </div>
        )}
      </Modal>

      {/* Approval Modal */}
      <Modal
        isOpen={showApprovalModal}
        onClose={() => {
          setShowApprovalModal(false);
          setSelectedVendor(null);
        }}
        title="Review Vendor Application"
      >
        {selectedVendor && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Store className="h-12 w-12 text-gray-400" />
              <div>
                <h3 className="font-semibold">{selectedVendor.name}</h3>
                <p className="text-sm text-gray-500">{selectedVendor.type.replace('_', ' ')}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between">
                <span className="text-gray-500">Address</span>
                <span>{selectedVendor.address || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phone</span>
                <span>{selectedVendor.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Applied On</span>
                <span>{new Date(selectedVendor.joinedAt).toLocaleDateString()}</span>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Review the vendor details and approve or reject the application.
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={handleReject}
                loading={actionLoading}
                className="text-red-600"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
              <Button fullWidth onClick={handleApprove} loading={actionLoading}>
                <CheckCircle className="h-4 w-4" />
                Approve
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Vendor Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add New Vendor"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor Name *
            </label>
            <input
              type="text"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter vendor name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor Type *
            </label>
            <select
              value={vendorType}
              onChange={(e) => setVendorType(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {vendorTypes.map(type => (
                <option key={type} value={type}>{type.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              value={vendorPhone}
              onChange={(e) => setVendorPhone(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="+91 9876543210"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={vendorEmail}
              onChange={(e) => setVendorEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="vendor@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              value={vendorAddress}
              onChange={(e) => setVendorAddress(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows={2}
              placeholder="Enter full address"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button fullWidth onClick={handleAddVendor} loading={addingVendor}>
              <Plus className="h-4 w-4" />
              Add Vendor
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Vendor Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedVendor(null);
          resetForm();
        }}
        title="Edit Vendor"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor Name *
            </label>
            <input
              type="text"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter vendor name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor Type *
            </label>
            <select
              value={vendorType}
              onChange={(e) => setVendorType(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {vendorTypes.map(type => (
                <option key={type} value={type}>{type.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              value={vendorPhone}
              onChange={(e) => setVendorPhone(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="+91 9876543210"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              value={vendorAddress}
              onChange={(e) => setVendorAddress(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows={2}
              placeholder="Enter full address"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                setShowEditModal(false);
                setSelectedVendor(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button fullWidth onClick={handleEditVendor} loading={editingVendor}>
              <Edit2 className="h-4 w-4" />
              Update Vendor
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
