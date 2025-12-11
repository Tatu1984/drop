'use client';

import { useState, useEffect } from 'react';
import { Wine, Search, RefreshCw, CheckCircle, XCircle, Clock, FileText, Eye } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

interface LiquorLicense {
  id: string;
  vendorName: string;
  licenseNumber: string;
  licenseType: string;
  issuedBy: string;
  issuedDate: string;
  expiryDate: string;
  status: 'valid' | 'expired' | 'pending' | 'rejected';
  documentUrl?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export default function LiquorLicensesPage() {
  const [licenses, setLicenses] = useState<LiquorLicense[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLicense, setSelectedLicense] = useState<LiquorLicense | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchLicenses();
  }, [statusFilter]);

  const fetchLicenses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin-token');
      const res = await fetch(`/api/admin/compliance/liquor?status=${statusFilter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setLicenses(data.data.licenses);
      }
    } catch (error) {
      console.error('Failed to fetch licenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLicenseAction = async (license: LiquorLicense, action: 'approve' | 'reject') => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/compliance/liquor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          licenseId: license.id,
          action,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(action === 'approve' ? 'License approved successfully' : 'License rejected');
        setLicenses(prev => prev.map(l =>
          l.id === license.id
            ? { ...l, status: action === 'approve' ? 'valid' : 'rejected', verifiedAt: new Date().toISOString() }
            : l
        ));
        setShowViewModal(false);
      } else {
        toast.error(data.error || 'Action failed');
      }
    } catch (error) {
      toast.error('Failed to process license');
    } finally {
      setActionLoading(false);
    }
  };

  const viewLicense = (license: LiquorLicense) => {
    setSelectedLicense(license);
    setShowViewModal(true);
  };

  const filteredLicenses = licenses.filter(license =>
    license.vendorName.toLowerCase().includes(search.toLowerCase()) ||
    license.licenseNumber.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid': return <Badge variant="success" size="sm">Valid</Badge>;
      case 'expired': return <Badge variant="error" size="sm">Expired</Badge>;
      case 'pending': return <Badge variant="warning" size="sm">Pending</Badge>;
      case 'rejected': return <Badge variant="error" size="sm">Rejected</Badge>;
      default: return <Badge size="sm">{status}</Badge>;
    }
  };

  const stats = {
    total: licenses.length,
    valid: licenses.filter(l => l.status === 'valid').length,
    pending: licenses.filter(l => l.status === 'pending').length,
    expiringSoon: licenses.filter(l => {
      const expiry = new Date(l.expiryDate);
      const now = new Date();
      const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      return l.status === 'valid' && expiry <= thirtyDays;
    }).length,
  };

  return (
    <AdminLayout title="Liquor Licenses">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Wine className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Licenses</p>
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
              <p className="text-sm text-gray-500">Valid</p>
              <p className="text-xl font-bold">{stats.valid}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Review</p>
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
              <p className="text-sm text-gray-500">Expiring Soon</p>
              <p className="text-xl font-bold">{stats.expiringSoon}</p>
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
                placeholder="Search by vendor or license number..."
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
              <option value="valid">Valid</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <Button variant="outline" onClick={fetchLicenses}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Licenses Table */}
      <Card padding="none">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : filteredLicenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Wine className="h-12 w-12 mb-2" />
            <p>No licenses found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">License #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issued By</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredLicenses.map((license) => (
                  <tr key={license.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{license.vendorName}</td>
                    <td className="px-4 py-3 text-sm font-mono">{license.licenseNumber}</td>
                    <td className="px-4 py-3 text-sm">{license.licenseType}</td>
                    <td className="px-4 py-3 text-sm">{license.issuedBy}</td>
                    <td className="px-4 py-3 text-sm">{new Date(license.expiryDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{getStatusBadge(license.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => viewLicense(license)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {license.status === 'pending' && (
                          <>
                            <Button variant="primary" size="sm" onClick={() => handleLicenseAction(license, 'approve')}>
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleLicenseAction(license, 'reject')}>
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

      {/* View License Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="License Details"
      >
        {selectedLicense && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Wine className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{selectedLicense.vendorName}</h3>
                <p className="text-gray-500 font-mono">{selectedLicense.licenseNumber}</p>
              </div>
              {getStatusBadge(selectedLicense.status)}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">License Type</p>
                <p className="font-medium">{selectedLicense.licenseType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Issued By</p>
                <p className="font-medium">{selectedLicense.issuedBy}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Issued Date</p>
                <p className="font-medium">{new Date(selectedLicense.issuedDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Expiry Date</p>
                <p className="font-medium">{new Date(selectedLicense.expiryDate).toLocaleDateString()}</p>
              </div>
              {selectedLicense.verifiedAt && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Verified At</p>
                  <p className="font-medium">{new Date(selectedLicense.verifiedAt).toLocaleString()}</p>
                </div>
              )}
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm">License document on file</span>
              </div>
            </div>

            {selectedLicense.status === 'pending' && (
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  fullWidth
                  loading={actionLoading}
                  onClick={() => handleLicenseAction(selectedLicense, 'reject')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  fullWidth
                  loading={actionLoading}
                  onClick={() => handleLicenseAction(selectedLicense, 'approve')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
