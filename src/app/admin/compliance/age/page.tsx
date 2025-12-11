'use client';

import { useState, useEffect } from 'react';
import { Shield, Search, RefreshCw, CheckCircle, XCircle, AlertTriangle, User, Eye } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

interface AgeVerification {
  id: string;
  userName: string;
  userPhone: string;
  dateOfBirth: string;
  age: number;
  verificationType: 'id_card' | 'aadhaar' | 'passport' | 'dl';
  documentNumber: string;
  status: 'verified' | 'pending' | 'rejected' | 'expired';
  verifiedAt?: string;
  category: 'alcohol' | 'tobacco' | 'medication';
  orderId?: string;
}

export default function AgeVerificationPage() {
  const [verifications, setVerifications] = useState<AgeVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedVerification, setSelectedVerification] = useState<AgeVerification | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchVerifications();
  }, [statusFilter]);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin-token');
      const res = await fetch(`/api/admin/compliance/age?status=${statusFilter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setVerifications(data.data.verifications);
      }
    } catch (error) {
      console.error('Failed to fetch verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVerifications = verifications.filter(v =>
    v.userName.toLowerCase().includes(search.toLowerCase()) ||
    v.userPhone.includes(search)
  );

  const handleVerification = async (verification: AgeVerification, action: 'verify' | 'reject') => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/compliance/age', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          verificationId: verification.id,
          action,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(action === 'verify' ? 'User verified successfully' : 'Verification rejected');
        // Update local state
        setVerifications(prev => prev.map(v =>
          v.id === verification.id
            ? { ...v, status: action === 'verify' ? 'verified' : 'rejected', verifiedAt: new Date().toISOString() }
            : v
        ));
        setShowViewModal(false);
      } else {
        toast.error(data.error || 'Action failed');
      }
    } catch (error) {
      toast.error('Failed to process verification');
    } finally {
      setActionLoading(false);
    }
  };

  const viewVerification = (verification: AgeVerification) => {
    setSelectedVerification(verification);
    setShowViewModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified': return <Badge variant="success" size="sm">Verified</Badge>;
      case 'pending': return <Badge variant="warning" size="sm">Pending</Badge>;
      case 'rejected': return <Badge variant="error" size="sm">Rejected</Badge>;
      case 'expired': return <Badge variant="default" size="sm">Expired</Badge>;
      default: return <Badge size="sm">{status}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'alcohol': return <Badge variant="info" size="sm">Alcohol</Badge>;
      case 'tobacco': return <Badge variant="warning" size="sm">Tobacco</Badge>;
      case 'medication': return <Badge variant="default" size="sm">Medication</Badge>;
      default: return <Badge size="sm">{category}</Badge>;
    }
  };

  const stats = {
    total: verifications.length,
    verified: verifications.filter(v => v.status === 'verified').length,
    pending: verifications.filter(v => v.status === 'pending').length,
    rejected: verifications.filter(v => v.status === 'rejected').length,
  };

  return (
    <AdminLayout title="Age Verification">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Verifications</p>
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
              <p className="text-sm text-gray-500">Verified</p>
              <p className="text-xl font-bold">{stats.verified}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-xl font-bold">{stats.pending}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Rejected</p>
              <p className="text-xl font-bold">{stats.rejected}</p>
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
                placeholder="Search by name or phone..."
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
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <Button variant="outline" onClick={fetchVerifications}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Verifications Table */}
      <Card padding="none">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : filteredVerifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Shield className="h-12 w-12 mb-2" />
            <p>No verifications found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Document</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredVerifications.map((verification) => (
                  <tr key={verification.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{verification.userName}</p>
                          <p className="text-sm text-gray-500">{verification.userPhone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{verification.age} years</p>
                        <p className="text-xs text-gray-500">{verification.dateOfBirth}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium capitalize">{verification.verificationType.replace('_', ' ')}</p>
                        <p className="text-xs text-gray-500">{verification.documentNumber}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">{getCategoryBadge(verification.category)}</td>
                    <td className="px-4 py-3">{getStatusBadge(verification.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => viewVerification(verification)}>
                          <Eye className="h-3 w-3" />
                        </Button>
                        {verification.status === 'pending' && (
                          <>
                            <Button variant="primary" size="sm" onClick={() => handleVerification(verification, 'verify')}>
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleVerification(verification, 'reject')}>
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* View Verification Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Verification Details"
      >
        {selectedVerification && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-gray-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{selectedVerification.userName}</h3>
                <p className="text-gray-500">{selectedVerification.userPhone}</p>
              </div>
              {getStatusBadge(selectedVerification.status)}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="font-medium">{selectedVerification.dateOfBirth}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Age</p>
                <p className="font-medium">{selectedVerification.age} years</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Document Type</p>
                <p className="font-medium capitalize">{selectedVerification.verificationType.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Document Number</p>
                <p className="font-medium">{selectedVerification.documentNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Category</p>
                {getCategoryBadge(selectedVerification.category)}
              </div>
              <div>
                <p className="text-sm text-gray-500">Verified At</p>
                <p className="font-medium">
                  {selectedVerification.verifiedAt
                    ? new Date(selectedVerification.verifiedAt).toLocaleString()
                    : 'Not yet verified'}
                </p>
              </div>
            </div>

            {selectedVerification.age < 21 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Age below 21 - Cannot order alcohol</span>
                </div>
              </div>
            )}

            {selectedVerification.status === 'pending' && (
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  fullWidth
                  loading={actionLoading}
                  onClick={() => handleVerification(selectedVerification, 'reject')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  fullWidth
                  loading={actionLoading}
                  onClick={() => handleVerification(selectedVerification, 'verify')}
                  disabled={selectedVerification.age < 21}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
