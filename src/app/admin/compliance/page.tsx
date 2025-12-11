'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, ShieldCheck, AlertTriangle, FileText, CheckCircle, XCircle, Clock, Eye, Download, Wine, User, Truck, RefreshCw } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Tabs from '@/components/ui/Tabs';
import AdminLayout from '@/components/layout/AdminLayout';
import toast from 'react-hot-toast';

interface KYCRequest {
  id: string;
  entityId: string;
  entityName: string;
  type: 'vendor' | 'rider';
  documentType: string;
  documentNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  expiresAt?: string;
  reason?: string;
}

interface ComplianceAlert {
  id: string;
  type: 'wine_age' | 'fraud' | 'document_expired' | 'suspicious_activity';
  severity: 'high' | 'medium' | 'low';
  entityType: 'user' | 'rider' | 'vendor';
  entityId: string;
  entityName: string;
  description: string;
  createdAt: string;
  resolved: boolean;
}

interface ExpiringDocument {
  id: string;
  entityType: string;
  entityName: string;
  documentType: string;
  expiresAt: string;
}

interface AuditLog {
  timestamp: string;
  action: string;
  entity: string;
  performedBy: string;
}

interface ComplianceData {
  kycRequests: KYCRequest[];
  alerts: ComplianceAlert[];
  expiringDocuments: ExpiringDocument[];
  auditLog: AuditLog[];
  stats: {
    pendingKYC: number;
    approvedKYC: number;
    activeAlerts: number;
    highSeverity: number;
  };
}

export default function AdminCompliancePage() {
  const [data, setData] = useState<ComplianceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('kyc');
  const [selectedKYC, setSelectedKYC] = useState<KYCRequest | null>(null);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [alertStatusFilter, setAlertStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(false);

  const tabs = [
    { id: 'kyc', label: 'KYC Verification' },
    { id: 'alerts', label: 'Compliance Alerts' },
    { id: 'documents', label: 'Document Verification' },
    { id: 'audit', label: 'Audit Log' },
  ];

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin-token');
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (typeFilter !== 'all') params.set('type', typeFilter);

      const res = await fetch(`/api/admin/compliance?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      } else {
        toast.error(result.error || 'Failed to load compliance data');
      }
    } catch (err) {
      toast.error('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter]);

  useEffect(() => {
    fetchCompliance();
  }, [fetchCompliance]);

  const handleApproveKYC = async (kyc: KYCRequest) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/compliance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ kycId: kyc.id, action: 'approve' }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(`KYC approved for ${kyc.entityName}`);
        setShowKYCModal(false);
        setSelectedKYC(null);
        fetchCompliance();
      } else {
        toast.error(result.error || 'Failed to approve KYC');
      }
    } catch (err) {
      toast.error('Failed to approve KYC');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectKYC = async (kyc: KYCRequest, reason: string) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/compliance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ kycId: kyc.id, action: 'reject', reason }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(`KYC rejected for ${kyc.entityName}`);
        setShowKYCModal(false);
        setSelectedKYC(null);
        fetchCompliance();
      } else {
        toast.error(result.error || 'Failed to reject KYC');
      }
    } catch (err) {
      toast.error('Failed to reject KYC');
    } finally {
      setActionLoading(false);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/compliance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ alertId, action: 'resolve' }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Alert resolved');
        fetchCompliance();
      } else {
        toast.error(result.error || 'Failed to resolve alert');
      }
    } catch (err) {
      toast.error('Failed to resolve alert');
    }
  };

  const sendReminder = async (entityName: string) => {
    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/compliance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'send-reminder', entityName }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Reminder sent successfully');
      } else {
        toast.error(result.error || 'Failed to send reminder');
      }
    } catch (err) {
      toast.error('Failed to send reminder');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'error'> = {
      pending: 'warning',
      approved: 'success',
      rejected: 'error',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, 'success' | 'warning' | 'error'> = {
      low: 'success',
      medium: 'warning',
      high: 'error',
    };
    return <Badge variant={variants[severity]}>{severity}</Badge>;
  };

  const getAlertIcon = (type: string) => {
    const icons: Record<string, React.ElementType> = {
      wine_age: Wine,
      fraud: AlertTriangle,
      document_expired: FileText,
      suspicious_activity: ShieldCheck,
    };
    const Icon = icons[type] || AlertTriangle;
    return <Icon className="h-5 w-5" />;
  };

  const getEntityIcon = (type: string) => {
    const icons: Record<string, React.ElementType> = {
      user: User,
      rider: Truck,
      vendor: ShieldCheck,
    };
    const Icon = icons[type] || User;
    return <Icon className="h-4 w-4" />;
  };

  const kycRequests = data?.kycRequests || [];
  const alerts = data?.alerts || [];
  const expiringDocuments = data?.expiringDocuments || [];
  const auditLogs = data?.auditLog || [];
  const stats = data?.stats || {
    pendingKYC: 0,
    approvedKYC: 0,
    activeAlerts: 0,
    highSeverity: 0,
  };

  const filteredKYC = kycRequests.filter(k => {
    const matchesSearch = k.entityName.toLowerCase().includes(search.toLowerCase()) ||
                          k.documentNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || k.status === statusFilter;
    const matchesType = typeFilter === 'all' || k.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const filteredAlerts = alerts.filter(a => {
    const matchesSeverity = severityFilter === 'all' || a.severity === severityFilter;
    const matchesStatus = alertStatusFilter === 'all' ||
                          (alertStatusFilter === 'active' && !a.resolved) ||
                          (alertStatusFilter === 'resolved' && a.resolved);
    return matchesSeverity && matchesStatus;
  });

  return (
    <AdminLayout title="Compliance & Verification">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending KYC</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingKYC}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Approved KYC</p>
                <p className="text-2xl font-bold text-green-600">{stats.approvedKYC}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Alerts</p>
                <p className="text-2xl font-bold text-red-600">{stats.activeAlerts}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">High Severity</p>
                <p className="text-2xl font-bold text-red-600">{stats.highSeverity}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border">
          <div className="border-b px-4 flex items-center justify-between">
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
            <Button variant="outline" onClick={fetchCompliance} loading={loading}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-6">
            {loading && !data ? (
              <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : (
              <>
                {activeTab === 'kyc' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-4 justify-between items-center">
                      <div className="flex-1 min-w-[200px] max-w-md">
                        <Input
                          placeholder="Search by name or document..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          leftIcon={<Search className="h-5 w-5 text-gray-400" />}
                        />
                      </div>
                      <div className="flex gap-2">
                        <select
                          className="px-4 py-2 border rounded-lg"
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                        >
                          <option value="all">All Status</option>
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                        <select
                          className="px-4 py-2 border rounded-lg"
                          value={typeFilter}
                          onChange={(e) => setTypeFilter(e.target.value)}
                        >
                          <option value="all">All Types</option>
                          <option value="vendor">Vendor</option>
                          <option value="rider">Rider</option>
                        </select>
                      </div>
                    </div>

                    {filteredKYC.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">No KYC requests found</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">User</th>
                              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Document</th>
                              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Submitted</th>
                              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {filteredKYC.map((kyc) => (
                              <tr key={kyc.id} className="hover:bg-gray-50">
                                <td className="px-4 py-4">
                                  <p className="font-medium">{kyc.entityName}</p>
                                  <p className="text-xs text-gray-500">{kyc.entityId}</p>
                                </td>
                                <td className="px-4 py-4">
                                  <span className="capitalize">{kyc.type}</span>
                                </td>
                                <td className="px-4 py-4">
                                  <p className="text-sm">{kyc.documentType}</p>
                                  <p className="text-xs text-gray-500">{kyc.documentNumber}</p>
                                </td>
                                <td className="px-4 py-4">{getStatusBadge(kyc.status)}</td>
                                <td className="px-4 py-4 text-sm text-gray-600">{new Date(kyc.submittedAt).toLocaleDateString()}</td>
                                <td className="px-4 py-4">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => {
                                        setSelectedKYC(kyc);
                                        setShowKYCModal(true);
                                      }}
                                      className="p-2 hover:bg-gray-100 rounded"
                                    >
                                      <Eye className="h-4 w-4 text-gray-600" />
                                    </button>
                                    {kyc.status === 'pending' && (
                                      <>
                                        <button
                                          onClick={() => handleApproveKYC(kyc)}
                                          className="p-2 hover:bg-green-100 rounded"
                                          disabled={actionLoading}
                                        >
                                          <CheckCircle className="h-4 w-4 text-green-600" />
                                        </button>
                                        <button
                                          onClick={() => handleRejectKYC(kyc, 'Manual rejection')}
                                          className="p-2 hover:bg-red-100 rounded"
                                          disabled={actionLoading}
                                        >
                                          <XCircle className="h-4 w-4 text-red-600" />
                                        </button>
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
                  </div>
                )}

                {activeTab === 'alerts' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-4 justify-between items-center">
                      <div className="flex gap-2">
                        <Badge variant={stats.activeAlerts > 0 ? 'error' : 'success'}>
                          {stats.activeAlerts} Active Alerts
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <select
                          className="px-4 py-2 border rounded-lg"
                          value={severityFilter}
                          onChange={(e) => setSeverityFilter(e.target.value)}
                        >
                          <option value="all">All Severity</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                        <select
                          className="px-4 py-2 border rounded-lg"
                          value={alertStatusFilter}
                          onChange={(e) => setAlertStatusFilter(e.target.value)}
                        >
                          <option value="all">All Status</option>
                          <option value="active">Active</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                    </div>

                    {filteredAlerts.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">No alerts found</div>
                    ) : (
                      <div className="space-y-3">
                        {filteredAlerts.map((alert) => (
                          <Card key={alert.id} className={`${!alert.resolved ? 'border-l-4 border-l-red-500' : ''}`}>
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  alert.severity === 'high' ? 'bg-red-100 text-red-600' :
                                  alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                  'bg-green-100 text-green-600'
                                }`}>
                                  {getAlertIcon(alert.type)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium capitalize">{alert.type.replace('_', ' ')}</span>
                                    {getSeverityBadge(alert.severity)}
                                    {alert.resolved && <Badge variant="success">Resolved</Badge>}
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                                  <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <div className="flex items-center gap-1">
                                      {getEntityIcon(alert.entityType)}
                                      <span>{alert.entityName}</span>
                                    </div>
                                    <span>{alert.createdAt}</span>
                                  </div>
                                </div>
                              </div>
                              {!alert.resolved && (
                                <Button size="sm" onClick={() => resolveAlert(alert.id)}>
                                  Resolve
                                </Button>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'documents' && (
                  <div className="space-y-6">
                    <Card>
                      <h3 className="font-semibold mb-4">Document Requirements</h3>
                      <div className="space-y-4">
                        {[
                          { entity: 'Users (Wine)', docs: ['Age Proof (Aadhaar/DL/Passport)', 'Photo'], required: true },
                          { entity: 'Riders', docs: ['Aadhaar Card', 'PAN Card', 'Driving License', 'Vehicle RC', 'Police Verification'], required: true },
                          { entity: 'Vendors', docs: ['Business Registration', 'FSSAI License', 'GST Certificate', 'Liquor License (if applicable)'], required: true },
                        ].map((item, idx) => (
                          <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{item.entity}</h4>
                              <Badge variant={item.required ? 'error' : 'default'}>
                                {item.required ? 'Mandatory' : 'Optional'}
                              </Badge>
                            </div>
                            <ul className="space-y-1">
                              {item.docs.map((doc, i) => (
                                <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  {doc}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card>
                      <h3 className="font-semibold mb-4">Expiring Documents</h3>
                      {expiringDocuments.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No expiring documents</div>
                      ) : (
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Entity</th>
                              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Document</th>
                              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Expires</th>
                              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {expiringDocuments.map((item) => (
                              <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">{item.entityName}</td>
                                <td className="px-4 py-3">{item.documentType}</td>
                                <td className="px-4 py-3">
                                  <Badge variant="warning">{item.expiresAt ? new Date(item.expiresAt).toLocaleDateString() : 'N/A'}</Badge>
                                </td>
                                <td className="px-4 py-3">
                                  <Button size="sm" variant="outline" onClick={() => sendReminder(item.entityName)}>
                                    Send Reminder
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </Card>
                  </div>
                )}

                {activeTab === 'audit' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">Compliance Audit Log</h3>
                      <Button variant="outline">
                        <Download className="h-4 w-4" />
                        Export Log
                      </Button>
                    </div>

                    {auditLogs.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">No audit logs available</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Action</th>
                              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Entity</th>
                              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Performed By</th>
                              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Details</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {auditLogs.map((log, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-600">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="px-4 py-3 font-medium">{log.action}</td>
                                <td className="px-4 py-3">{log.entity}</td>
                                <td className="px-4 py-3">{log.performedBy}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">-</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* KYC Review Modal */}
      <Modal
        isOpen={showKYCModal}
        onClose={() => {
          setShowKYCModal(false);
          setSelectedKYC(null);
        }}
        title="Review KYC Document"
      >
        {selectedKYC && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Entity Name</label>
                <p className="font-medium">{selectedKYC.entityName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Entity ID</label>
                <p className="font-medium">{selectedKYC.entityId}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Entity Type</label>
                <p className="font-medium capitalize">{selectedKYC.type}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Status</label>
                <div>{getStatusBadge(selectedKYC.status)}</div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Document Type</label>
                <p className="font-medium">{selectedKYC.documentType}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Document Number</label>
                <p className="font-medium">{selectedKYC.documentNumber}</p>
              </div>
            </div>

            <div className="p-4 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-500 mb-2">Document Preview</p>
              <div className="h-48 bg-gray-200 rounded flex items-center justify-center">
                <FileText className="h-12 w-12 text-gray-400" />
              </div>
            </div>

            {selectedKYC.status === 'pending' && (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  fullWidth
                  className="text-red-600"
                  onClick={() => handleRejectKYC(selectedKYC, 'Document verification failed')}
                  loading={actionLoading}
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
                <Button
                  fullWidth
                  onClick={() => handleApproveKYC(selectedKYC)}
                  loading={actionLoading}
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </Button>
              </div>
            )}

            {selectedKYC.status === 'rejected' && selectedKYC.reason && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">
                  <strong>Rejection Reason:</strong> {selectedKYC.reason}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
