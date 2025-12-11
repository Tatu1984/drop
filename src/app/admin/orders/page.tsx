'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Eye, MapPin, Phone, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import AdminLayout from '@/components/layout/AdminLayout';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  customerPhone: string;
  vendor: string;
  vendorType: string;
  items: number;
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'PICKED_UP' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  rider: string | null;
  riderPhone: string | null;
  createdAt: string;
  deliveryAddress: string;
  paymentMethod: string;
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED';
}

interface OrdersData {
  orders: Order[];
  stats: {
    total: number;
    active: number;
    delivered: number;
    cancelled: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const statusColors: Record<string, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PREPARING: 'warning',
  PICKED_UP: 'info',
  OUT_FOR_DELIVERY: 'info',
  DELIVERED: 'success',
  CANCELLED: 'error',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  PICKED_UP: 'Picked Up',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export default function AdminOrdersPage() {
  const [data, setData] = useState<OrdersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin-token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      });
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/admin/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      } else {
        toast.error(result.error || 'Failed to load orders');
      }
    } catch (err) {
      toast.error('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, statusFilter]);

  useEffect(() => {
    fetchOrders();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(`Order status updated to ${statusLabels[newStatus]}`);
        fetchOrders();
      } else {
        toast.error(result.error || 'Failed to update order');
      }
    } catch (err) {
      toast.error('Failed to update order');
    }
  };

  const orders = data?.orders || [];
  const stats = data?.stats || { total: 0, active: 0, delivered: 0, cancelled: 0 };
  const pagination = data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  return (
    <AdminLayout title="Order Management">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{stats.total} total orders</p>
        <Button variant="outline" onClick={fetchOrders} loading={loading}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Delivered</p>
          <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Cancelled</p>
          <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search orders..."
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
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PREPARING">Preparing</option>
            <option value="PICKED_UP">Picked Up</option>
            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <Button variant="outline">
            <Filter className="h-4 w-4" />
            More Filters
          </Button>
        </div>
      </Card>

      {/* Orders Table */}
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
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Order</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Vendor</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Rider</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-orange-600">{order.orderNumber}</p>
                            <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium">{order.customer}</p>
                          <p className="text-xs text-gray-500">{order.customerPhone}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium">{order.vendor}</p>
                          <p className="text-xs text-gray-500">{order.items} items</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium">{formatCurrency(order.total)}</p>
                          <Badge
                            variant={order.paymentStatus === 'PAID' ? 'success' : order.paymentStatus === 'REFUNDED' ? 'warning' : 'default'}
                            size="sm"
                          >
                            {order.paymentStatus.toLowerCase()}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={statusColors[order.status]}>
                            {statusLabels[order.status] || order.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          {order.rider ? (
                            <div>
                              <p className="text-sm">{order.rider}</p>
                              <p className="text-xs text-gray-500">{order.riderPhone}</p>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Not assigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowOrderModal(true);
                              }}
                              className="p-2 hover:bg-gray-100 rounded"
                            >
                              <Eye className="h-4 w-4 text-gray-600" />
                            </button>
                            {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                              <select
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                className="text-xs border rounded px-2 py-1"
                              >
                                <option value="PENDING">Pending</option>
                                <option value="CONFIRMED">Confirmed</option>
                                <option value="PREPARING">Preparing</option>
                                <option value="PICKED_UP">Picked Up</option>
                                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                                <option value="DELIVERED">Delivered</option>
                                <option value="CANCELLED">Cancelled</option>
                              </select>
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
                Showing {orders.length} of {pagination.total} orders
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

      {/* Order Details Modal */}
      <Modal
        isOpen={showOrderModal}
        onClose={() => {
          setShowOrderModal(false);
          setSelectedOrder(null);
        }}
        title={`Order ${selectedOrder?.orderNumber}`}
      >
        {selectedOrder && (
          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center justify-between">
              <Badge variant={statusColors[selectedOrder.status]} size="sm">
                {statusLabels[selectedOrder.status] || selectedOrder.status}
              </Badge>
              <span className="text-sm text-gray-500">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
            </div>

            {/* Customer */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Customer</p>
              <p className="font-medium">{selectedOrder.customer}</p>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <Phone className="h-4 w-4" />
                <span>{selectedOrder.customerPhone}</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-600 mt-1">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>{selectedOrder.deliveryAddress || 'No address'}</span>
              </div>
            </div>

            {/* Vendor */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Vendor</p>
              <p className="font-medium">{selectedOrder.vendor}</p>
              <p className="text-sm text-gray-600">{selectedOrder.vendorType?.replace('_', ' ')}</p>
              <p className="text-sm text-gray-600">{selectedOrder.items} items</p>
            </div>

            {/* Rider */}
            {selectedOrder.rider && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Rider</p>
                <p className="font-medium">{selectedOrder.rider}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <Phone className="h-4 w-4" />
                  <span>{selectedOrder.riderPhone}</span>
                </div>
              </div>
            )}

            {/* Payment */}
            <div className="flex justify-between items-center py-3 border-t border-b">
              <div>
                <p className="text-sm text-gray-500">Payment</p>
                <p className="font-medium">{selectedOrder.paymentMethod}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">{formatCurrency(selectedOrder.total)}</p>
                <Badge
                  variant={selectedOrder.paymentStatus === 'PAID' ? 'success' : 'warning'}
                  size="sm"
                >
                  {selectedOrder.paymentStatus.toLowerCase()}
                </Badge>
              </div>
            </div>

            <Button fullWidth onClick={() => setShowOrderModal(false)}>
              Close
            </Button>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
