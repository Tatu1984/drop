'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, Eye, RefreshCw, Send, Clock, DollarSign, TrendingUp,
  Package, MapPin, CheckCircle, XCircle, Bike, User, Navigation,
  Phone, MessageSquare, BarChart3, AlertCircle
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import AdminLayout from '@/components/layout/AdminLayout';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface GenieTask {
  id: string;
  taskNumber: string;
  type: 'pickup_drop' | 'errand' | 'document' | 'parcel' | 'custom';
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  customerName: string;
  customerPhone: string;
  pickupAddress: string;
  dropAddress: string;
  description: string;
  estimatedFare: number;
  actualFare: number;
  riderId: string | null;
  riderName: string | null;
  createdAt: string;
  assignedAt: string | null;
  completedAt: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface GenieStats {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedToday: number;
  avgCompletionTime: number;
  totalRevenue: number;
  activeRiders: number;
  avgFare: number;
}

export default function GeniePage() {
  const [tasks, setTasks] = useState<GenieTask[]>([]);
  const [stats, setStats] = useState<GenieStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState<GenieTask | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const taskTypes = [
    { value: 'pickup_drop', label: 'Pickup & Drop' },
    { value: 'errand', label: 'Run Errand' },
    { value: 'document', label: 'Document Delivery' },
    { value: 'parcel', label: 'Parcel Delivery' },
    { value: 'custom', label: 'Custom Task' },
  ];

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin-token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      });
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (typeFilter !== 'all') params.set('type', typeFilter);

      const res = await fetch(`/api/admin/departments/genie?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        setTasks(result.data.tasks || []);
        setStats(result.data.stats || null);
        setTotalPages(result.data.pagination?.totalPages || 1);
      } else {
        toast.error(result.error || 'Failed to load tasks');
      }
    } catch (err) {
      toast.error('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, statusFilter, typeFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, typeFilter]);

  const handleAction = async (action: string, taskId: string, data?: Record<string, unknown>) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/departments/genie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ taskId, action, ...data }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(result.message || 'Action completed');
        fetchTasks();
      } else {
        toast.error(result.error || 'Action failed');
      }
    } catch (err) {
      toast.error('Failed to perform action');
    } finally {
      setActionLoading(false);
      setShowAssignModal(false);
      setSelectedTask(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'assigned': return 'info';
      case 'picked_up': return 'info';
      case 'in_transit': return 'info';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pickup_drop': return <Package className="h-4 w-4" />;
      case 'errand': return <Navigation className="h-4 w-4" />;
      case 'document': return <Send className="h-4 w-4" />;
      case 'parcel': return <Package className="h-4 w-4" />;
      default: return <Send className="h-4 w-4" />;
    }
  };

  return (
    <AdminLayout title="Genie/Porter Services">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-gray-500">
            Manage pickup, drop, and errand services
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchTasks} loading={loading}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button>
            <Plus className="h-4 w-4" />
            Create Task
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
        <Card className="col-span-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Send className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.totalTasks || 0}</p>
              <p className="text-xs text-gray-500">Total Tasks</p>
            </div>
          </div>
        </Card>
        <Card className="col-span-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{stats?.pendingTasks || 0}</p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
          </div>
        </Card>
        <Card className="col-span-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Navigation className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{stats?.inProgressTasks || 0}</p>
              <p className="text-xs text-gray-500">In Progress</p>
            </div>
          </div>
        </Card>
        <Card className="col-span-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats?.completedToday || 0}</p>
              <p className="text-xs text-gray-500">Today</p>
            </div>
          </div>
        </Card>
        <Card className="col-span-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <Clock className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.avgCompletionTime || 0}m</p>
              <p className="text-xs text-gray-500">Avg Time</p>
            </div>
          </div>
        </Card>
        <Card className="col-span-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency((stats?.totalRevenue || 0) / 1000)}K</p>
              <p className="text-xs text-gray-500">Revenue</p>
            </div>
          </div>
        </Card>
        <Card className="col-span-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-100 rounded-lg">
              <Bike className="h-5 w-5 text-cyan-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.activeRiders || 0}</p>
              <p className="text-xs text-gray-500">Active Riders</p>
            </div>
          </div>
        </Card>
        <Card className="col-span-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(stats?.avgFare || 0)}</p>
              <p className="text-xs text-gray-500">Avg Fare</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search by task ID, customer..."
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
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Types</option>
            {taskTypes.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Tasks List */}
      {loading && tasks.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : tasks.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Send className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No tasks found</p>
            <Button className="mt-4">
              <Plus className="h-4 w-4" />
              Create Your First Task
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  {getTypeIcon(task.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">#{task.taskNumber}</h3>
                        <Badge variant={getStatusColor(task.status)}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {taskTypes.find(t => t.value === task.type)?.label || task.type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(task.estimatedFare)}</p>
                      <p className="text-xs text-gray-500">Est. Fare</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div className="flex items-start gap-2 text-sm">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Pickup</p>
                        <p className="text-gray-700">{task.pickupAddress}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Drop</p>
                        <p className="text-gray-700">{task.dropAddress}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{task.customerName}</span>
                      </div>
                      {task.riderName && (
                        <div className="flex items-center gap-1">
                          <Bike className="h-4 w-4" />
                          <span>{task.riderName}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(task.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTask(task);
                          setShowDetailsModal(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                      {task.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedTask(task);
                            setShowAssignModal(true);
                          }}
                        >
                          <Bike className="h-4 w-4" />
                          Assign
                        </Button>
                      )}
                      {['pending', 'assigned'].includes(task.status) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                          onClick={() => handleAction('cancel', task.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
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

      {/* Task Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedTask(null);
        }}
        title="Task Details"
        size="lg"
      >
        {selectedTask && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">#{selectedTask.taskNumber}</h3>
                <p className="text-gray-500">
                  {taskTypes.find(t => t.value === selectedTask.type)?.label}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge variant={getStatusColor(selectedTask.status)}>
                  {selectedTask.status.replace('_', ' ')}
                </Badge>
                <Badge variant={getPriorityColor(selectedTask.priority)}>
                  {selectedTask.priority}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Estimated Fare</p>
                <p className="text-2xl font-bold">{formatCurrency(selectedTask.estimatedFare)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Actual Fare</p>
                <p className="text-2xl font-bold">{formatCurrency(selectedTask.actualFare || 0)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pickup Location</p>
                  <p className="font-medium">{selectedTask.pickupAddress}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Drop Location</p>
                  <p className="font-medium">{selectedTask.dropAddress}</p>
                </div>
              </div>
            </div>

            {selectedTask.description && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Task Description</p>
                <p className="text-gray-700">{selectedTask.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Customer</p>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{selectedTask.customerName}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="h-4 w-4" />
                  <span>{selectedTask.customerPhone}</span>
                </div>
              </div>
              <div>
                <p className="text-gray-500">Assigned Rider</p>
                {selectedTask.riderName ? (
                  <div className="flex items-center gap-2">
                    <Bike className="h-4 w-4" />
                    <span>{selectedTask.riderName}</span>
                  </div>
                ) : (
                  <Badge variant="warning">Not Assigned</Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Created</p>
                <p>{new Date(selectedTask.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Assigned</p>
                <p>{selectedTask.assignedAt ? new Date(selectedTask.assignedAt).toLocaleString() : '-'}</p>
              </div>
              <div>
                <p className="text-gray-500">Completed</p>
                <p>{selectedTask.completedAt ? new Date(selectedTask.completedAt).toLocaleString() : '-'}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
              {selectedTask.status === 'pending' && (
                <Button fullWidth onClick={() => {
                  setShowDetailsModal(false);
                  setShowAssignModal(true);
                }}>
                  <Bike className="h-4 w-4" />
                  Assign Rider
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Assign Rider Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedTask(null);
        }}
        title="Assign Rider"
      >
        {selectedTask && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Task</p>
              <p className="font-semibold">#{selectedTask.taskNumber}</p>
              <p className="text-sm text-gray-600 mt-1">{selectedTask.pickupAddress} → {selectedTask.dropAddress}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Available Rider
              </label>
              <select className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="">Select a rider...</option>
                <option value="rider1">Rajesh Kumar - 2.5km away</option>
                <option value="rider2">Suresh Singh - 3.1km away</option>
                <option value="rider3">Amit Sharma - 4.0km away</option>
              </select>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                  The rider will be notified immediately and should reach the pickup location within the estimated time.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowAssignModal(false)}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                onClick={() => handleAction('assign', selectedTask.id, { riderId: 'rider1' })}
                loading={actionLoading}
              >
                Assign Rider
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
