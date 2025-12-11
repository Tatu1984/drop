'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, Eye, RefreshCw, Pill, Clock, DollarSign,
  Package, MapPin, CheckCircle, XCircle, Star, AlertTriangle,
  FileText, Shield, Boxes
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

interface Pharmacy {
  id: string;
  name: string;
  image: string;
  rating: number;
  orders: number;
  revenue: number;
  status: 'active' | 'pending' | 'suspended';
  address: string;
  phone: string;
  productCount: number;
  isVerified: boolean;
  avgDeliveryTime: number;
  licenseNumber: string;
  licenseExpiry: string;
  hasPharmacist: boolean;
  prescriptionRequired: number;
  joinedAt: string;
}

interface PharmacyStats {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  totalRevenue: number;
  totalOrders: number;
  todayOrders: number;
  prescriptionOrders: number;
}

export default function PharmacyPage() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [stats, setStats] = useState<PharmacyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPharmacies = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin-token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        type: 'PHARMACY',
      });
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/admin/hyperlocal/pharmacy?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        setPharmacies(result.data.stores || []);
        setStats(result.data.stats || null);
        setTotalPages(result.data.pagination?.totalPages || 1);
      } else {
        toast.error(result.error || 'Failed to load pharmacies');
      }
    } catch (err) {
      toast.error('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, statusFilter]);

  useEffect(() => {
    fetchPharmacies();
  }, [fetchPharmacies]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleAction = async (action: string, pharmacyId: string) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/hyperlocal/pharmacy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ vendorId: pharmacyId, action }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(result.message || 'Action completed');
        fetchPharmacies();
      } else {
        toast.error(result.error || 'Action failed');
      }
    } catch (err) {
      toast.error('Failed to perform action');
    } finally {
      setActionLoading(false);
      setShowApprovalModal(false);
      setSelectedPharmacy(null);
    }
  };

  return (
    <AdminLayout title="Pharmacy Management">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-gray-500">
            Manage pharmacies and medical stores
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchPharmacies} loading={loading}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button>
            <Plus className="h-4 w-4" />
            Add Pharmacy
          </Button>
        </div>
      </div>

      {/* Compliance Notice */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
        <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-blue-800">Medical Compliance</h4>
          <p className="text-sm text-blue-700">
            Pharmacies must have valid drug license and registered pharmacist.
            Prescription medications require valid prescription upload from customers.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Pill className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.total || 0}</p>
              <p className="text-xs text-gray-500">Total Pharmacies</p>
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
            <div className="p-2 bg-amber-100 rounded-lg">
              <FileText className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.prescriptionOrders || 0}</p>
              <p className="text-xs text-gray-500">Rx Orders</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search pharmacies..."
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
        </div>
      </Card>

      {/* Pharmacies Grid */}
      {loading && pharmacies.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : pharmacies.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Pill className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No pharmacies found</p>
            <Button className="mt-4">
              <Plus className="h-4 w-4" />
              Add Your First Pharmacy
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pharmacies.map((pharmacy) => (
            <Card key={pharmacy.id} padding="none" className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-32 bg-gray-200">
                {pharmacy.image ? (
                  <Image
                    src={pharmacy.image}
                    alt={pharmacy.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50">
                    <Pill className="h-16 w-16 text-blue-300" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                  <Badge
                    variant={
                      pharmacy.status === 'active' ? 'success' :
                      pharmacy.status === 'pending' ? 'warning' : 'error'
                    }
                  >
                    {pharmacy.status}
                  </Badge>
                </div>
                {pharmacy.hasPharmacist && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="info">
                      <Shield className="h-3 w-3" />
                      Licensed
                    </Badge>
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{pharmacy.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span>{pharmacy.rating?.toFixed(1) || 'N/A'}</span>
                      <span className="text-gray-300">|</span>
                      <span>{pharmacy.productCount} products</span>
                    </div>
                  </div>
                  {pharmacy.isVerified && (
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-sm mb-3 py-2 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{pharmacy.orders}</p>
                    <p className="text-xs text-gray-500">Orders</p>
                  </div>
                  <div>
                    <p className="font-semibold">{formatCurrency(pharmacy.revenue / 1000)}K</p>
                    <p className="text-xs text-gray-500">Revenue</p>
                  </div>
                  <div>
                    <p className="font-semibold">{pharmacy.prescriptionRequired}</p>
                    <p className="text-xs text-gray-500">Rx Items</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{pharmacy.address || 'No address'}</span>
                </div>

                <div className="flex gap-2">
                  {pharmacy.status === 'pending' ? (
                    <Button
                      size="sm"
                      fullWidth
                      onClick={() => {
                        setSelectedPharmacy(pharmacy);
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
                          setSelectedPharmacy(pharmacy);
                          setShowDetailsModal(true);
                        }}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Link href={`/admin/inventory/${pharmacy.id}`}>
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
                        onClick={() => handleAction(
                          pharmacy.status === 'suspended' ? 'activate' : 'suspend',
                          pharmacy.id
                        )}
                        className={pharmacy.status === 'suspended' ? 'text-green-600' : 'text-red-600'}
                      >
                        {pharmacy.status === 'suspended' ? 'Activate' : 'Suspend'}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedPharmacy(null);
        }}
        title="Pharmacy Details"
        size="lg"
      >
        {selectedPharmacy && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                <Pill className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-xl">{selectedPharmacy.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={selectedPharmacy.status === 'active' ? 'success' : 'error'}>
                    {selectedPharmacy.status}
                  </Badge>
                  {selectedPharmacy.hasPharmacist && (
                    <Badge variant="info">Licensed Pharmacist</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold">{selectedPharmacy.orders}</p>
                <p className="text-xs text-gray-500">Orders</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold">{formatCurrency(selectedPharmacy.revenue / 1000)}K</p>
                <p className="text-xs text-gray-500">Revenue</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold">{selectedPharmacy.productCount}</p>
                <p className="text-xs text-gray-500">Products</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold">{selectedPharmacy.rating?.toFixed(1)}</p>
                <p className="text-xs text-gray-500">Rating</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">License Information</h4>
              <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Drug License Number</span>
                  <span className="font-mono">{selectedPharmacy.licenseNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">License Expiry</span>
                  <span>{selectedPharmacy.licenseExpiry ? new Date(selectedPharmacy.licenseExpiry).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Registered Pharmacist</span>
                  <span>{selectedPharmacy.hasPharmacist ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            <Button fullWidth onClick={() => setShowDetailsModal(false)}>
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
          setSelectedPharmacy(null);
        }}
        title="Review Pharmacy Application"
      >
        {selectedPharmacy && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Pill className="h-12 w-12 text-blue-400" />
              <div>
                <h3 className="font-semibold">{selectedPharmacy.name}</h3>
                <p className="text-sm text-gray-500">Pharmacy Application</p>
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Verification Required</p>
                  <p className="text-sm text-amber-700">
                    Ensure the drug license and pharmacist registration are valid before approving.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between">
                <span className="text-gray-500">Address</span>
                <span>{selectedPharmacy.address || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">License Number</span>
                <span className="font-mono">{selectedPharmacy.licenseNumber || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Has Pharmacist</span>
                <span>{selectedPharmacy.hasPharmacist ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Products Listed</span>
                <span>{selectedPharmacy.productCount}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => handleAction('reject', selectedPharmacy.id)}
                loading={actionLoading}
                className="text-red-600"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
              <Button
                fullWidth
                onClick={() => handleAction('approve', selectedPharmacy.id)}
                loading={actionLoading}
              >
                <CheckCircle className="h-4 w-4" />
                Approve
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
