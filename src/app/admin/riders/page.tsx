'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Eye, Ban, Star, MapPin, Phone, Bike, ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock, RefreshCw, Plus, Mail } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import AdminLayout from '@/components/layout/AdminLayout';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Rider {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'online' | 'offline' | 'busy' | 'suspended' | 'pending';
  rating: number;
  totalDeliveries: number;
  todayDeliveries: number;
  earnings: number;
  todayEarnings: number;
  vehicle: string;
  vehicleNumber: string;
  zone: string;
  joinedAt: string;
  isVerified: boolean;
}

interface RidersData {
  riders: Rider[];
  stats: {
    total: number;
    online: number;
    busy: number;
    pending: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  online: 'success',
  busy: 'warning',
  offline: 'default',
  suspended: 'error',
  pending: 'info',
};

export default function AdminRidersPage() {
  const [data, setData] = useState<RidersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [showRiderModal, setShowRiderModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showAddRiderModal, setShowAddRiderModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Add rider form state
  const [newRider, setNewRider] = useState({
    name: '',
    phone: '',
    email: '',
    vehicleType: 'BIKE',
    vehicleNumber: '',
    assignedZone: '',
  });

  const fetchRiders = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin-token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      });
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/admin/riders?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      } else {
        toast.error(result.error || 'Failed to load riders');
      }
    } catch (err) {
      toast.error('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, statusFilter]);

  useEffect(() => {
    fetchRiders();
  }, [fetchRiders]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleApprove = async () => {
    if (!selectedRider) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/riders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ riderId: selectedRider.id, action: 'approve' }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Rider approved');
        fetchRiders();
      } else {
        toast.error(result.error || 'Action failed');
      }
    } catch (err) {
      toast.error('Failed to approve rider');
    } finally {
      setActionLoading(false);
      setShowApprovalModal(false);
      setSelectedRider(null);
    }
  };

  const handleReject = async () => {
    if (!selectedRider) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/riders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ riderId: selectedRider.id, action: 'reject' }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Application rejected');
        fetchRiders();
      } else {
        toast.error(result.error || 'Action failed');
      }
    } catch (err) {
      toast.error('Failed to reject rider');
    } finally {
      setActionLoading(false);
      setShowApprovalModal(false);
      setSelectedRider(null);
    }
  };

  const handleSuspend = async (rider: Rider) => {
    try {
      const token = localStorage.getItem('admin-token');
      const action = rider.status === 'suspended' ? 'activate' : 'suspend';
      const res = await fetch('/api/admin/riders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ riderId: rider.id, action }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(rider.status === 'suspended' ? 'Rider activated' : 'Rider suspended');
        fetchRiders();
      } else {
        toast.error(result.error || 'Action failed');
      }
    } catch (err) {
      toast.error('Failed to perform action');
    }
  };

  const handleAddRider = async () => {
    if (!newRider.name || !newRider.phone) {
      toast.error('Name and phone are required');
      return;
    }
    setActionLoading(true);
    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/riders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'create', ...newRider }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Rider added successfully');
        setShowAddRiderModal(false);
        setNewRider({
          name: '',
          phone: '',
          email: '',
          vehicleType: 'BIKE',
          vehicleNumber: '',
          assignedZone: '',
        });
        fetchRiders();
      } else {
        toast.error(result.error || 'Failed to add rider');
      }
    } catch (err) {
      toast.error('Failed to add rider');
    } finally {
      setActionLoading(false);
    }
  };

  const riders = data?.riders || [];
  const stats = data?.stats || { total: 0, online: 0, busy: 0, pending: 0 };
  const pagination = data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  return (
    <AdminLayout title="Rider Management">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{stats.total} total riders</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchRiders} loading={loading}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setShowAddRiderModal(true)}>
            <Plus className="h-4 w-4" />
            Add Rider
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <p className="text-sm text-gray-500">Total Riders</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Online Now</p>
          <p className="text-2xl font-bold text-green-600">{stats.online}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">On Delivery</p>
          <p className="text-2xl font-bold text-orange-600">{stats.busy}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Pending Approval</p>
          <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search riders..."
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
            <option value="online">Online</option>
            <option value="busy">Busy</option>
            <option value="offline">Offline</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </Card>

      {/* Riders Table */}
      <Card padding="none">
        {loading && !data ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Rider</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Performance</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {riders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No riders found
                      </td>
                    </tr>
                  ) : (
                    riders.map((rider) => (
                      <tr key={rider.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="font-semibold text-gray-600">
                                {rider.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{rider.name}</p>
                                {rider.isVerified && (
                                  <CheckCircle className="h-4 w-4 text-blue-500" />
                                )}
                              </div>
                              <p className="text-xs text-gray-500">{rider.zone || 'No zone'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm">{rider.phone}</p>
                          <p className="text-xs text-gray-500">{rider.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm">{rider.vehicle || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{rider.vehicleNumber || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <span className="font-medium">{rider.rating?.toFixed(1) || 'N/A'}</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {rider.totalDeliveries} deliveries
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={statusColors[rider.status] || 'default'}>
                            {rider.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {rider.status === 'pending' ? (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedRider(rider);
                                  setShowApprovalModal(true);
                                }}
                              >
                                Review
                              </Button>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedRider(rider);
                                    setShowRiderModal(true);
                                  }}
                                  className="p-2 hover:bg-gray-100 rounded"
                                >
                                  <Eye className="h-4 w-4 text-gray-600" />
                                </button>
                                <button
                                  onClick={() => handleSuspend(rider)}
                                  className="p-2 hover:bg-gray-100 rounded"
                                >
                                  <Ban className={`h-4 w-4 ${rider.status === 'suspended' ? 'text-green-600' : 'text-red-600'}`} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <p className="text-sm text-gray-500">
                Showing {riders.length} of {pagination.total} riders
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">Page {currentPage} of {pagination.totalPages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= pagination.totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Rider Details Modal */}
      <Modal
        isOpen={showRiderModal}
        onClose={() => {
          setShowRiderModal(false);
          setSelectedRider(null);
        }}
        title="Rider Details"
      >
        {selectedRider && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-600">
                  {selectedRider.name.charAt(0)}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{selectedRider.name}</h3>
                  {selectedRider.isVerified && (
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                  )}
                </div>
                <Badge variant={statusColors[selectedRider.status]}>
                  {selectedRider.status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-xl font-bold">{selectedRider.rating?.toFixed(1) || 'N/A'}</span>
                </div>
                <p className="text-xs text-gray-500">Rating</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xl font-bold">{selectedRider.totalDeliveries}</p>
                <p className="text-xs text-gray-500">Total Deliveries</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xl font-bold">{formatCurrency(selectedRider.earnings)}</p>
                <p className="text-xs text-gray-500">Total Earnings</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xl font-bold">{formatCurrency(selectedRider.todayEarnings)}</p>
                <p className="text-xs text-gray-500">Today&apos;s Earnings</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{selectedRider.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{selectedRider.zone || 'No zone assigned'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Bike className="h-4 w-4" />
                <span>{selectedRider.vehicle || 'N/A'} {selectedRider.vehicleNumber ? `• ${selectedRider.vehicleNumber}` : ''}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Joined {new Date(selectedRider.joinedAt).toLocaleDateString()}</span>
              </div>
            </div>

            <Button fullWidth onClick={() => setShowRiderModal(false)}>
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
          setSelectedRider(null);
        }}
        title="Review Rider Application"
      >
        {selectedRider && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Bike className="h-12 w-12 text-gray-400" />
              <div>
                <h3 className="font-semibold">{selectedRider.name}</h3>
                <p className="text-sm text-gray-500">{selectedRider.zone || 'No zone'}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between">
                <span className="text-gray-500">Phone</span>
                <span>{selectedRider.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span>{selectedRider.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Vehicle</span>
                <span>{selectedRider.vehicle || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Vehicle Number</span>
                <span>{selectedRider.vehicleNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Applied On</span>
                <span>{new Date(selectedRider.joinedAt).toLocaleDateString()}</span>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Review the rider application and documents before approval.
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

      {/* Add Rider Modal */}
      <Modal
        isOpen={showAddRiderModal}
        onClose={() => {
          setShowAddRiderModal(false);
          setNewRider({
            name: '',
            phone: '',
            email: '',
            vehicleType: 'BIKE',
            vehicleNumber: '',
            assignedZone: '',
          });
        }}
        title="Add New Rider"
      >
        <div className="space-y-4">
          <Input
            label="Full Name *"
            placeholder="Enter rider's full name"
            value={newRider.name}
            onChange={(e) => setNewRider({ ...newRider, name: e.target.value })}
            leftIcon={<Bike className="h-5 w-5" />}
          />
          <Input
            label="Phone Number *"
            type="tel"
            placeholder="Enter phone number"
            value={newRider.phone}
            onChange={(e) => setNewRider({ ...newRider, phone: e.target.value })}
            leftIcon={<Phone className="h-5 w-5" />}
          />
          <Input
            label="Email"
            type="email"
            placeholder="Enter email address"
            value={newRider.email}
            onChange={(e) => setNewRider({ ...newRider, email: e.target.value })}
            leftIcon={<Mail className="h-5 w-5" />}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Type
            </label>
            <select
              value={newRider.vehicleType}
              onChange={(e) => setNewRider({ ...newRider, vehicleType: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="BIKE">Bike</option>
              <option value="SCOOTER">Scooter</option>
              <option value="BICYCLE">Bicycle</option>
              <option value="EV">Electric Vehicle</option>
            </select>
          </div>
          <Input
            label="Vehicle Number"
            placeholder="e.g., KA 01 AB 1234"
            value={newRider.vehicleNumber}
            onChange={(e) => setNewRider({ ...newRider, vehicleNumber: e.target.value })}
          />
          <Input
            label="Assigned Zone"
            placeholder="e.g., Indiranagar, Koramangala"
            value={newRider.assignedZone}
            onChange={(e) => setNewRider({ ...newRider, assignedZone: e.target.value })}
            leftIcon={<MapPin className="h-5 w-5" />}
          />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Riders added directly by admin are pre-verified and can start immediately. A default password will be set (phone number).
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                setShowAddRiderModal(false);
                setNewRider({
                  name: '',
                  phone: '',
                  email: '',
                  vehicleType: 'BIKE',
                  vehicleNumber: '',
                  assignedZone: '',
                });
              }}
            >
              Cancel
            </Button>
            <Button fullWidth onClick={handleAddRider} loading={actionLoading}>
              <Plus className="h-4 w-4" />
              Add Rider
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
