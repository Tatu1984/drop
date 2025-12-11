'use client';

import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, RefreshCw, CheckCircle, XCircle, Eye, Ban, User, Store, Truck } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface FraudAlert {
  id: string;
  type: 'suspicious_order' | 'multiple_accounts' | 'coupon_abuse' | 'payment_fraud' | 'fake_review';
  severity: 'high' | 'medium' | 'low';
  entityType: 'user' | 'vendor' | 'rider';
  entityId: string;
  entityName: string;
  description: string;
  riskScore: number;
  amount?: number;
  status: 'pending' | 'reviewed' | 'actioned' | 'dismissed';
  detectedAt: string;
  details: Record<string, unknown>;
}

export default function FraudDetectionPage() {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, [statusFilter, severityFilter]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin-token');
      const res = await fetch(`/api/admin/ai/fraud?status=${statusFilter}&severity=${severityFilter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setAlerts(data.data.alerts);
      }
    } catch (error) {
      console.error('Failed to fetch fraud alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high': return <Badge variant="error" size="sm">High Risk</Badge>;
      case 'medium': return <Badge variant="warning" size="sm">Medium</Badge>;
      case 'low': return <Badge variant="info" size="sm">Low</Badge>;
      default: return <Badge size="sm">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="warning" size="sm">Pending</Badge>;
      case 'reviewed': return <Badge variant="info" size="sm">Reviewed</Badge>;
      case 'actioned': return <Badge variant="success" size="sm">Actioned</Badge>;
      case 'dismissed': return <Badge variant="default" size="sm">Dismissed</Badge>;
      default: return <Badge size="sm">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const labels: Record<string, string> = {
      suspicious_order: 'Suspicious Order',
      multiple_accounts: 'Multi-Account',
      coupon_abuse: 'Coupon Abuse',
      payment_fraud: 'Payment Fraud',
      fake_review: 'Fake Review',
    };
    return labels[type] || type;
  };

  const viewAlert = (alert: FraudAlert) => {
    setSelectedAlert(alert);
    setShowViewModal(true);
  };

  const handleFraudAction = async (alert: FraudAlert, action: 'dismiss' | 'action' | 'ban') => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/ai/fraud', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          alertId: alert.id,
          action,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const messages: Record<string, string> = {
          dismiss: 'Alert dismissed',
          action: 'Alert flagged for action',
          ban: 'Entity banned successfully',
        };
        toast.success(messages[action]);
        setAlerts(prev => prev.map(a =>
          a.id === alert.id
            ? { ...a, status: action === 'dismiss' ? 'dismissed' : 'actioned' }
            : a
        ));
        setShowViewModal(false);
      } else {
        toast.error(data.error || 'Action failed');
      }
    } catch (error) {
      toast.error('Failed to process action');
    } finally {
      setActionLoading(false);
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'user': return <User className="h-5 w-5" />;
      case 'vendor': return <Store className="h-5 w-5" />;
      case 'rider': return <Truck className="h-5 w-5" />;
      default: return <User className="h-5 w-5" />;
    }
  };

  const stats = {
    total: alerts.length,
    high: alerts.filter(a => a.severity === 'high').length,
    pending: alerts.filter(a => a.status === 'pending').length,
    totalAtRisk: alerts.reduce((sum, a) => sum + (a.amount || 0), 0),
  };

  return (
    <AdminLayout title="Fraud Detection">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Alerts</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">High Risk</p>
              <p className="text-xl font-bold">{stats.high}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Review</p>
              <p className="text-xl font-bold">{stats.pending}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Amount at Risk</p>
              <p className="text-xl font-bold">{formatCurrency(stats.totalAtRisk)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="actioned">Actioned</option>
              <option value="dismissed">Dismissed</option>
            </select>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Severity</option>
              <option value="high">High Risk</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <Button variant="outline" onClick={fetchAlerts}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </Card>

      {/* Alerts List */}
      <Card padding="none">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Shield className="h-12 w-12 mb-2" />
            <p>No fraud alerts</p>
          </div>
        ) : (
          <div className="divide-y">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getSeverityBadge(alert.severity)}
                      <span className="text-sm font-medium text-gray-700">
                        {getTypeBadge(alert.type)}
                      </span>
                      {getStatusBadge(alert.status)}
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">{alert.entityName}</h4>
                    <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Risk Score: <span className="font-medium text-gray-700">{alert.riskScore}%</span></span>
                      {alert.amount && (
                        <span>Amount: <span className="font-medium text-gray-700">{formatCurrency(alert.amount)}</span></span>
                      )}
                      <span>Detected: {new Date(alert.detectedAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => viewAlert(alert)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {alert.status === 'pending' && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handleFraudAction(alert, 'action')}>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleFraudAction(alert, 'ban')}>
                          <Ban className="h-4 w-4 text-red-500" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleFraudAction(alert, 'dismiss')}>
                          <XCircle className="h-4 w-4 text-gray-500" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* View Alert Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Fraud Alert Details"
      >
        {selectedAlert && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                selectedAlert.severity === 'high' ? 'bg-red-100' :
                selectedAlert.severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
              }`}>
                {getEntityIcon(selectedAlert.entityType)}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{selectedAlert.entityName}</h3>
                <p className="text-sm text-gray-500 capitalize">{selectedAlert.entityType}</p>
              </div>
              <div className="flex flex-col gap-1 items-end">
                {getSeverityBadge(selectedAlert.severity)}
                {getStatusBadge(selectedAlert.status)}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-1">Alert Type</p>
              <p className="font-medium">{getTypeBadge(selectedAlert.type)}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
              <p className="text-gray-900">{selectedAlert.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Risk Score</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        selectedAlert.riskScore >= 80 ? 'bg-red-500' :
                        selectedAlert.riskScore >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${selectedAlert.riskScore}%` }}
                    />
                  </div>
                  <span className="font-medium">{selectedAlert.riskScore}%</span>
                </div>
              </div>
              {selectedAlert.amount && (
                <div>
                  <p className="text-sm text-gray-500">Amount at Risk</p>
                  <p className="font-medium text-red-600">{formatCurrency(selectedAlert.amount)}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Detected At</p>
                <p className="font-medium">{new Date(selectedAlert.detectedAt).toLocaleString()}</p>
              </div>
            </div>

            {selectedAlert.details && Object.keys(selectedAlert.details).length > 0 && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Additional Details</p>
                <div className="text-sm space-y-1">
                  {Object.entries(selectedAlert.details).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedAlert.status === 'pending' && (
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  fullWidth
                  loading={actionLoading}
                  onClick={() => handleFraudAction(selectedAlert, 'dismiss')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Dismiss
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  loading={actionLoading}
                  onClick={() => handleFraudAction(selectedAlert, 'action')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Flag Action
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  loading={actionLoading}
                  onClick={() => handleFraudAction(selectedAlert, 'ban')}
                  className="bg-red-500 hover:bg-red-600"
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Ban Entity
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
