'use client';

import { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  Printer,
  Clock,
  Check,
  X,
  AlertTriangle,
  ChevronDown,
  DollarSign,
  Users,
  MapPin,
  Phone,
  UtensilsCrossed,
  Package,
  Bike,
  RefreshCw,
  MoreVertical,
} from 'lucide-react';
import Button from '@/components/ui/Button';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  modifiers?: string[];
  notes?: string;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED';
}

interface Order {
  id: string;
  orderNumber: string;
  type: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'SERVED' | 'COMPLETED' | 'CANCELLED';
  tableNumber?: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentStatus: 'PENDING' | 'PAID' | 'PARTIAL';
  paymentMethod?: string;
  createdAt: Date;
  notes?: string;
  deliveryAddress?: string;
  assignedRider?: string;
}

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'DIN-001',
    type: 'DINE_IN',
    status: 'PREPARING',
    tableNumber: 'T-05',
    customerName: 'Walk-in',
    customerPhone: '-',
    items: [
      { id: '1a', name: 'Paneer Tikka', quantity: 2, price: 320, status: 'PREPARING' },
      { id: '1b', name: 'Butter Chicken', quantity: 1, price: 420, modifiers: ['Extra Gravy'], status: 'PENDING' },
      { id: '1c', name: 'Garlic Naan', quantity: 4, price: 60, status: 'READY' },
    ],
    subtotal: 1300,
    tax: 65,
    discount: 0,
    total: 1365,
    paymentStatus: 'PENDING',
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: '2',
    orderNumber: 'TKY-015',
    type: 'TAKEAWAY',
    status: 'READY',
    customerName: 'Rahul Sharma',
    customerPhone: '+91 98765 43210',
    items: [
      { id: '2a', name: 'Chicken Biryani', quantity: 2, price: 450, status: 'READY' },
      { id: '2b', name: 'Raita', quantity: 2, price: 60, status: 'READY' },
    ],
    subtotal: 1020,
    tax: 51,
    discount: 100,
    total: 971,
    paymentStatus: 'PAID',
    paymentMethod: 'UPI',
    createdAt: new Date(Date.now() - 25 * 60 * 1000),
  },
  {
    id: '3',
    orderNumber: 'DEL-042',
    type: 'DELIVERY',
    status: 'PREPARING',
    customerName: 'Priya Mehta',
    customerPhone: '+91 98765 43211',
    items: [
      { id: '3a', name: 'Veg Biryani', quantity: 1, price: 380, status: 'PREPARING' },
      { id: '3b', name: 'Paneer Butter Masala', quantity: 1, price: 340, status: 'PENDING' },
      { id: '3c', name: 'Butter Naan', quantity: 3, price: 50, status: 'READY' },
    ],
    subtotal: 870,
    tax: 44,
    discount: 0,
    total: 914,
    paymentStatus: 'PAID',
    paymentMethod: 'Card',
    createdAt: new Date(Date.now() - 10 * 60 * 1000),
    deliveryAddress: '123, Green Park, Sector 45, Gurgaon',
    assignedRider: 'Amit Kumar',
  },
  {
    id: '4',
    orderNumber: 'DIN-002',
    type: 'DINE_IN',
    status: 'SERVED',
    tableNumber: 'T-12',
    customerName: 'Reserved - Mr. Kapoor',
    customerPhone: '+91 98765 43212',
    items: [
      { id: '4a', name: 'Tandoori Platter', quantity: 1, price: 850, status: 'SERVED' },
      { id: '4b', name: 'Dal Makhani', quantity: 1, price: 280, status: 'SERVED' },
      { id: '4c', name: 'Assorted Naan', quantity: 1, price: 180, status: 'SERVED' },
      { id: '4d', name: 'Gulab Jamun', quantity: 2, price: 120, status: 'SERVED' },
    ],
    subtotal: 1550,
    tax: 78,
    discount: 155,
    total: 1473,
    paymentStatus: 'PENDING',
    createdAt: new Date(Date.now() - 45 * 60 * 1000),
    notes: 'VIP Guest - Extra attention',
  },
  {
    id: '5',
    orderNumber: 'DIN-003',
    type: 'DINE_IN',
    status: 'PENDING',
    tableNumber: 'T-08',
    customerName: 'Walk-in',
    customerPhone: '-',
    items: [
      { id: '5a', name: 'Chicken Tikka', quantity: 1, price: 380, status: 'PENDING' },
      { id: '5b', name: 'Mutton Rogan Josh', quantity: 1, price: 520, status: 'PENDING' },
    ],
    subtotal: 900,
    tax: 45,
    discount: 0,
    total: 945,
    paymentStatus: 'PENDING',
    createdAt: new Date(Date.now() - 2 * 60 * 1000),
  },
];

const orderStatuses = ['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED'];
const orderTypes = ['ALL', 'DINE_IN', 'TAKEAWAY', 'DELIVERY'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || order.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: Order['status']) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      CONFIRMED: 'bg-blue-100 text-blue-700',
      PREPARING: 'bg-orange-100 text-orange-700',
      READY: 'bg-green-100 text-green-700',
      SERVED: 'bg-purple-100 text-purple-700',
      COMPLETED: 'bg-gray-100 text-gray-700',
      CANCELLED: 'bg-red-100 text-red-700',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>{status}</span>;
  };

  const getTypeBadge = (type: Order['type']) => {
    const config: Record<string, { bg: string; icon: React.ReactNode }> = {
      DINE_IN: { bg: 'bg-blue-100 text-blue-700', icon: <UtensilsCrossed className="h-3 w-3" /> },
      TAKEAWAY: { bg: 'bg-orange-100 text-orange-700', icon: <Package className="h-3 w-3" /> },
      DELIVERY: { bg: 'bg-green-100 text-green-700', icon: <Bike className="h-3 w-3" /> },
    };
    const { bg, icon } = config[type];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${bg}`}>
        {icon}
        {type.replace('_', ' ')}
      </span>
    );
  };

  const getPaymentBadge = (status: Order['paymentStatus']) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-red-100 text-red-700',
      PAID: 'bg-green-100 text-green-700',
      PARTIAL: 'bg-yellow-100 text-yellow-700',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>{status}</span>;
  };

  const getOrderAge = (createdAt: Date) => {
    const diff = Date.now() - createdAt.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m ago`;
  };

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
  const preparingOrders = orders.filter(o => o.status === 'PREPARING').length;
  const readyOrders = orders.filter(o => o.status === 'READY').length;
  const todayRevenue = orders.filter(o => o.status !== 'CANCELLED').reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600">View and manage all orders</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Print All
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-700">{pendingOrders}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600">Preparing</p>
              <p className="text-2xl font-bold text-orange-700">{preparingOrders}</p>
            </div>
            <UtensilsCrossed className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Ready</p>
              <p className="text-2xl font-bold text-green-700">{readyOrders}</p>
            </div>
            <Check className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Today&apos;s Revenue</p>
              <p className="text-2xl font-bold text-blue-700">₹{todayRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Orders List */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200">
          {/* Filters */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                {orderStatuses.map((status) => (
                  <option key={status} value={status}>{status === 'ALL' ? 'All Status' : status}</option>
                ))}
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                {orderTypes.map((type) => (
                  <option key={type} value={type}>{type === 'ALL' ? 'All Types' : type.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className={`hover:bg-gray-50 cursor-pointer ${selectedOrder?.id === order.id ? 'bg-orange-50' : ''}`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{order.orderNumber}</p>
                        {order.tableNumber && (
                          <p className="text-sm text-gray-500">{order.tableNumber}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">{getTypeBadge(order.type)}</td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-900">{order.customerName}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{order.items.length} items</td>
                    <td className="px-4 py-4 font-medium text-gray-900">₹{order.total}</td>
                    <td className="px-4 py-4">{getStatusBadge(order.status)}</td>
                    <td className="px-4 py-4">{getPaymentBadge(order.paymentStatus)}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">{getOrderAge(order.createdAt)}</td>
                    <td className="px-4 py-4">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <MoreVertical className="h-4 w-4 text-gray-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details Panel */}
        {selectedOrder && (
          <div className="w-96 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">{selectedOrder.orderNumber}</h3>
                  <p className="text-sm text-gray-500">{selectedOrder.createdAt.toLocaleString()}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {getTypeBadge(selectedOrder.type)}
                {getStatusBadge(selectedOrder.status)}
                {getPaymentBadge(selectedOrder.paymentStatus)}
              </div>
            </div>

            <div className="p-4 space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto">
              {/* Customer Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Customer</h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="font-medium text-gray-900">{selectedOrder.customerName}</p>
                  {selectedOrder.customerPhone !== '-' && (
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <Phone className="h-3 w-3" />
                      {selectedOrder.customerPhone}
                    </p>
                  )}
                  {selectedOrder.tableNumber && (
                    <p className="text-sm text-gray-600 mt-1">Table: {selectedOrder.tableNumber}</p>
                  )}
                  {selectedOrder.deliveryAddress && (
                    <p className="text-sm text-gray-600 flex items-start gap-1 mt-1">
                      <MapPin className="h-3 w-3 mt-0.5" />
                      {selectedOrder.deliveryAddress}
                    </p>
                  )}
                  {selectedOrder.assignedRider && (
                    <p className="text-sm text-orange-600 mt-1">Rider: {selectedOrder.assignedRider}</p>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between py-2 border-b border-gray-100">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{item.quantity}×</span>
                          <span className="text-gray-900">{item.name}</span>
                        </div>
                        {item.modifiers && (
                          <p className="text-sm text-orange-600 ml-6">{item.modifiers.join(', ')}</p>
                        )}
                        {item.notes && (
                          <p className="text-sm text-red-600 ml-6">{item.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">₹{item.price * item.quantity}</p>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          item.status === 'READY' ? 'bg-green-100 text-green-700' :
                          item.status === 'PREPARING' ? 'bg-orange-100 text-orange-700' :
                          item.status === 'SERVED' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Notes */}
              {selectedOrder.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Notes</h4>
                  <div className="bg-yellow-50 rounded-lg p-3 text-sm text-yellow-800">
                    <AlertTriangle className="h-4 w-4 inline mr-1" />
                    {selectedOrder.notes}
                  </div>
                </div>
              )}

              {/* Bill Summary */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Bill Summary</h4>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">₹{selectedOrder.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (5%)</span>
                    <span className="text-gray-900">₹{selectedOrder.tax}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Discount</span>
                      <span className="text-green-600">-₹{selectedOrder.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold pt-2 border-t border-gray-200">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">₹{selectedOrder.total}</span>
                  </div>
                  {selectedOrder.paymentMethod && (
                    <p className="text-xs text-gray-500">Paid via {selectedOrder.paymentMethod}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-gray-200 space-y-2">
              {selectedOrder.status === 'PENDING' && (
                <Button
                  onClick={() => updateOrderStatus(selectedOrder.id, 'CONFIRMED')}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  Confirm Order
                </Button>
              )}
              {selectedOrder.status === 'CONFIRMED' && (
                <Button
                  onClick={() => updateOrderStatus(selectedOrder.id, 'PREPARING')}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                >
                  Start Preparing
                </Button>
              )}
              {selectedOrder.status === 'PREPARING' && (
                <Button
                  onClick={() => updateOrderStatus(selectedOrder.id, 'READY')}
                  className="w-full bg-green-500 hover:bg-green-600"
                >
                  Mark Ready
                </Button>
              )}
              {selectedOrder.status === 'READY' && selectedOrder.type === 'DINE_IN' && (
                <Button
                  onClick={() => updateOrderStatus(selectedOrder.id, 'SERVED')}
                  className="w-full bg-purple-500 hover:bg-purple-600"
                >
                  Mark Served
                </Button>
              )}
              {(selectedOrder.status === 'SERVED' || (selectedOrder.status === 'READY' && selectedOrder.type !== 'DINE_IN')) && (
                <Button
                  onClick={() => updateOrderStatus(selectedOrder.id, 'COMPLETED')}
                  className="w-full bg-gray-700 hover:bg-gray-800"
                >
                  Complete Order
                </Button>
              )}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 flex items-center justify-center gap-2">
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
                <Button variant="outline" className="flex-1 flex items-center justify-center gap-2">
                  <Eye className="h-4 w-4" />
                  View Bill
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
