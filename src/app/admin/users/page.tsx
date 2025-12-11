'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Eye, Ban, Trash2, Mail, Phone, MapPin, Calendar, ChevronLeft, ChevronRight, RefreshCw, Plus, User } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import AdminLayout from '@/components/layout/AdminLayout';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'banned';
  orders: number;
  spent: number;
  joinedAt: string;
  lastOrder: string;
  address: string;
}

interface UsersData {
  users: User[];
  stats: {
    total: number;
    active: number;
    inactive: number;
    banned: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function AdminUsersPage() {
  const [data, setData] = useState<UsersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [actionType, setActionType] = useState<'ban' | 'delete' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Add user form state
  const [newUser, setNewUser] = useState({
    name: '',
    phone: '',
    email: '',
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin-token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      } else {
        toast.error(result.error || 'Failed to load users');
      }
    } catch (err) {
      toast.error('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleBanUser = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('admin-token');
      const action = selectedUser.status === 'banned' ? 'activate' : 'ban';
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: selectedUser.id, action }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(selectedUser.status === 'banned' ? 'User unbanned' : 'User banned');
        fetchUsers();
      } else {
        toast.error(result.error || 'Action failed');
      }
    } catch (err) {
      toast.error('Failed to perform action');
    } finally {
      setActionLoading(false);
      setShowActionModal(false);
      setSelectedUser(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch(`/api/admin/users?userId=${selectedUser.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        toast.success('User deleted');
        fetchUsers();
      } else {
        toast.error(result.error || 'Failed to delete user');
      }
    } catch (err) {
      toast.error('Failed to delete user');
    } finally {
      setActionLoading(false);
      setShowActionModal(false);
      setSelectedUser(null);
    }
  };

  const openAction = (user: User, type: 'ban' | 'delete') => {
    setSelectedUser(user);
    setActionType(type);
    setShowActionModal(true);
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.phone) {
      toast.error('Name and phone are required');
      return;
    }
    setActionLoading(true);
    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'create', ...newUser }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('User added successfully');
        setShowAddUserModal(false);
        setNewUser({ name: '', phone: '', email: '' });
        fetchUsers();
      } else {
        toast.error(result.error || 'Failed to add user');
      }
    } catch (err) {
      toast.error('Failed to add user');
    } finally {
      setActionLoading(false);
    }
  };

  const users = data?.users || [];
  const stats = data?.stats || { total: 0, active: 0, inactive: 0, banned: 0 };
  const pagination = data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  return (
    <AdminLayout title="User Management">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{stats.total} total users</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchUsers} loading={loading}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setShowAddUserModal(true)}>
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Inactive</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.inactive}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Banned</p>
          <p className="text-2xl font-bold text-red-600">{stats.banned}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search users..."
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
            <option value="inactive">Inactive</option>
            <option value="banned">Banned</option>
          </select>
          <Button variant="outline">
            <Filter className="h-4 w-4" />
            More Filters
          </Button>
        </div>
      </Card>

      {/* Users Table */}
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
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Orders</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Spent</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">Joined {new Date(user.joinedAt).toLocaleDateString()}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm">{user.email}</p>
                          <p className="text-sm text-gray-500">{user.phone}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium">{user.orders}</p>
                          <p className="text-xs text-gray-500">
                            Last: {user.lastOrder ? new Date(user.lastOrder).toLocaleDateString() : 'Never'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium">{formatCurrency(user.spent)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              user.status === 'active' ? 'success' :
                              user.status === 'inactive' ? 'warning' : 'error'
                            }
                          >
                            {user.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowUserModal(true);
                              }}
                              className="p-2 hover:bg-gray-100 rounded"
                            >
                              <Eye className="h-4 w-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => openAction(user, 'ban')}
                              className="p-2 hover:bg-gray-100 rounded"
                            >
                              <Ban className="h-4 w-4 text-orange-600" />
                            </button>
                            <button
                              onClick={() => openAction(user, 'delete')}
                              className="p-2 hover:bg-gray-100 rounded"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </button>
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
                Showing {users.length} of {pagination.total} users
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

      {/* User Details Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setSelectedUser(null);
        }}
        title="User Details"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="text-center pb-4 border-b">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-600">
                  {selectedUser.name.charAt(0)}
                </span>
              </div>
              <h3 className="font-semibold text-lg">{selectedUser.name}</h3>
              <Badge
                variant={
                  selectedUser.status === 'active' ? 'success' :
                  selectedUser.status === 'inactive' ? 'warning' : 'error'
                }
              >
                {selectedUser.status}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <span>{selectedUser.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <span>+91 {selectedUser.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <span>{selectedUser.address || 'No address'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span>Joined {new Date(selectedUser.joinedAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{selectedUser.orders}</p>
                <p className="text-sm text-gray-500">Total Orders</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(selectedUser.spent)}</p>
                <p className="text-sm text-gray-500">Total Spent</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" fullWidth onClick={() => setShowUserModal(false)}>
                Close
              </Button>
              <Button fullWidth>View Orders</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Action Confirmation Modal */}
      <Modal
        isOpen={showActionModal}
        onClose={() => {
          setShowActionModal(false);
          setSelectedUser(null);
          setActionType(null);
        }}
        title={actionType === 'ban' ? 'Ban User' : 'Delete User'}
      >
        {selectedUser && (
          <div>
            <p className="text-gray-600 mb-6">
              {actionType === 'ban'
                ? `Are you sure you want to ${selectedUser.status === 'banned' ? 'unban' : 'ban'} ${selectedUser.name}?`
                : `Are you sure you want to delete ${selectedUser.name}? This action cannot be undone.`
              }
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowActionModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                fullWidth
                onClick={actionType === 'ban' ? handleBanUser : handleDeleteUser}
                loading={actionLoading}
              >
                {actionType === 'ban'
                  ? (selectedUser.status === 'banned' ? 'Unban' : 'Ban')
                  : 'Delete'
                }
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add User Modal */}
      <Modal
        isOpen={showAddUserModal}
        onClose={() => {
          setShowAddUserModal(false);
          setNewUser({ name: '', phone: '', email: '' });
        }}
        title="Add New User"
      >
        <div className="space-y-4">
          <Input
            label="Full Name *"
            placeholder="Enter user's full name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            leftIcon={<User className="h-5 w-5" />}
          />
          <Input
            label="Phone Number *"
            type="tel"
            placeholder="Enter phone number"
            value={newUser.phone}
            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
            leftIcon={<Phone className="h-5 w-5" />}
          />
          <Input
            label="Email"
            type="email"
            placeholder="Enter email address"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            leftIcon={<Mail className="h-5 w-5" />}
          />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Users added directly by admin can log in immediately using OTP verification on their phone number.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                setShowAddUserModal(false);
                setNewUser({ name: '', phone: '', email: '' });
              }}
            >
              Cancel
            </Button>
            <Button fullWidth onClick={handleAddUser} loading={actionLoading}>
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
