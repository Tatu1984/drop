'use client';

import { useState } from 'react';
import {
  Package,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
  Phone,
  MapPin,
  Printer,
  Eye,
  RefreshCw,
} from 'lucide-react';
import VendorLayout from '@/components/layout/VendorLayout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'NEW' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'PICKED_UP' | 'DELIVERED' | 'CANCELLED';
  type: 'DELIVERY' | 'PICKUP';
  customer: {
    name: string;
    phone: string;
    address?: string;
  };
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'PAID' | 'PENDING' | 'COD';
  createdAt: Date;
  scheduledFor?: Date;
  rider?: {
    name: string;
    phone: string;
  };
  notes?: string;
}

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'DRP-001234',
    status: 'NEW',
    type: 'DELIVERY',
    customer: { name: 'Rahul Sharma', phone: '+91 98765 43210', address: '123, Green Park, Sector 45, Gurgaon' },
    items: [
      { name: 'Butter Chicken', quantity: 2, price: 350 },
      { name: 'Garlic Naan', quantity: 4, price: 60 },
      { name: 'Jeera Rice', quantity: 1, price: 180 },
    ],
    subtotal: 1120,
    deliveryFee: 40,
    discount: 100,
    total: 1060,
    paymentMethod: 'Online',
    paymentStatus: 'PAID',
    createdAt: new Date(Date.now() - 2 * 60 * 1000),
  },
  {
    id: '2',
    orderNumber: 'DRP-001235',
    status: 'PREPARING',
    type: 'DELIVERY',
    customer: { name: 'Priya Mehta', phone: '+91 98765 43211', address: '456, DLF Phase 2, Gurgaon' },
    items: [
      { name: 'Paneer Tikka', quantity: 1, price: 320 },
      { name: 'Dal Makhani', quantity: 1, price: 280 },
      { name: 'Butter Naan', quantity: 2, price: 50 },
    ],
    subtotal: 700,
    deliveryFee: 40,
    discount: 0,
    total: 740,
    paymentMethod: 'COD',
    paymentStatus: 'COD',
    createdAt: new Date(Date.now() - 12 * 60 * 1000),
    rider: { name: 'Amit Kumar', phone: '+91 98765 43220' },
  },
  {
    id: '3',
    orderNumber: 'DRP-001236',
    status: 'READY',
    type: 'PICKUP',
    customer: { name: 'Vikram Singh', phone: '+91 98765 43212' },
    items: [
      { name: 'Chicken Biryani', quantity: 2, price: 450 },
      { name: 'Raita', quantity: 2, price: 60 },
    ],
    subtotal: 1020,
    deliveryFee: 0,
    discount: 50,
    total: 970,
    paymentMethod: 'Online',
    paymentStatus: 'PAID',
    createdAt: new Date(Date.now() - 25 * 60 * 1000),
  },
  {
    id: '4',
    orderNumber: 'DRP-001237',
    status: 'ACCEPTED',
    type: 'DELIVERY',
    customer: { name: 'Neha Gupta', phone: '+91 98765 43213', address: '789, Sushant Lok, Phase 1, Gurgaon' },
    items: [
      { name: 'Veg Biryani', quantity: 1, price: 380 },
      { name: 'Paneer Butter Masala', quantity: 1, price: 340 },
    ],
    subtotal: 720,
    deliveryFee: 40,
    discount: 0,
    total: 760,
    paymentMethod: 'UPI',
    paymentStatus: 'PAID',
    createdAt: new Date(Date.now() - 8 * 60 * 1000),
    notes: 'Extra spicy please',
  },
  {
    id: '5',
    orderNumber: 'DRP-001238',
    status: 'DELIVERED',
    type: 'DELIVERY',
    customer: { name: 'Amit Patel', phone: '+91 98765 43214', address: '321, MG Road, Gurgaon' },
    items: [
      { name: 'Tandoori Platter', quantity: 1, price: 850 },
    ],
    subtotal: 850,
    deliveryFee: 40,
    discount: 85,
    total: 805,
    paymentMethod: 'Card',
    paymentStatus: 'PAID',
    createdAt: new Date(Date.now() - 90 * 60 * 1000),
    rider: { name: 'Ravi Singh', phone: '+91 98765 43221' },
  },
];

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: Order['status']) => {
    const styles: Record<string, string> = {
      NEW: 'bg-red-100 text-red-700 border-red-200',
      ACCEPTED: 'bg-blue-100 text-blue-700 border-blue-200',
      PREPARING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      READY: 'bg-green-100 text-green-700 border-green-200',
      PICKED_UP: 'bg-purple-100 text-purple-700 border-purple-200',
      DELIVERED: 'bg-gray-100 text-gray-700 border-gray-200',
      CANCELLED: 'bg-red-100 text-red-700 border-red-200',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
        {status.replace('_', ' ')}
      </span>
    );
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

  const newOrders = orders.filter(o => o.status === 'NEW').length;
  const preparingOrders = orders.filter(o => o.status === 'PREPARING').length;
  const readyOrders = orders.filter(o => o.status === 'READY').length;

  return (
    <VendorLayout title="Orders">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-red-50 border-red-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-700">{newOrders}</p>
                <p className="text-sm text-red-600">New Orders</p>
              </div>
            </div>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-yellow-700">{preparingOrders}</p>
                <p className="text-sm text-yellow-600">Preparing</p>
              </div>
            </div>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-700">{readyOrders}</p>
                <p className="text-sm text-green-600">Ready</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-gray-500" />
              <div>
                <p className="text-2xl font-bold text-gray-700">{orders.length}</p>
                <p className="text-sm text-gray-600">Total Today</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Orders List */}
          <div className="flex-1">
            <Card padding="none">
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
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="ALL">All Status</option>
                    <option value="NEW">New</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="PREPARING">Preparing</option>
                    <option value="READY">Ready</option>
                    <option value="PICKED_UP">Picked Up</option>
                    <option value="DELIVERED">Delivered</option>
                  </select>
                  <Button variant="outline" className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Orders */}
              <div className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${selectedOrder?.id === order.id ? 'bg-green-50' : ''}`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900">{order.orderNumber}</span>
                          {getStatusBadge(order.status)}
                          <span className={`px-2 py-0.5 text-xs rounded ${
                            order.type === 'DELIVERY' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {order.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{order.customer.name}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="font-medium text-gray-900">₹{order.total}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' :
                            order.paymentStatus === 'COD' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {order.paymentStatus}
                          </span>
                          <span className="text-xs text-gray-400">{getOrderAge(order.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {order.status === 'NEW' && (
                          <>
                            <Button size="sm" onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'ACCEPTED'); }}>
                              Accept
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600" onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'CANCELLED'); }}>
                              Reject
                            </Button>
                          </>
                        )}
                        {order.status === 'ACCEPTED' && (
                          <Button size="sm" onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'PREPARING'); }}>
                            Start Prep
                          </Button>
                        )}
                        {order.status === 'PREPARING' && (
                          <Button size="sm" onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'READY'); }}>
                            Mark Ready
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Order Details Panel */}
          {selectedOrder && (
            <div className="w-full lg:w-96">
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">{selectedOrder.orderNumber}</h3>
                  <button onClick={() => setSelectedOrder(null)} className="p-1 hover:bg-gray-100 rounded">
                    <XCircle className="h-5 w-5 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Status */}
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedOrder.status)}
                    <span className="text-sm text-gray-500">{getOrderAge(selectedOrder.createdAt)}</span>
                  </div>

                  {/* Customer */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="font-medium text-gray-900">{selectedOrder.customer.name}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <Phone className="h-3 w-3" />
                      {selectedOrder.customer.phone}
                    </p>
                    {selectedOrder.customer.address && (
                      <p className="text-sm text-gray-600 flex items-start gap-1 mt-1">
                        <MapPin className="h-3 w-3 mt-0.5" />
                        {selectedOrder.customer.address}
                      </p>
                    )}
                  </div>

                  {/* Items */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span>{item.quantity}x {item.name}</span>
                          <span className="font-medium">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedOrder.notes && (
                    <div className="bg-yellow-50 rounded-lg p-3 text-sm text-yellow-800">
                      <strong>Note:</strong> {selectedOrder.notes}
                    </div>
                  )}

                  {/* Total */}
                  <div className="border-t pt-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span>₹{selectedOrder.subtotal}</span>
                    </div>
                    {selectedOrder.deliveryFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Delivery Fee</span>
                        <span>₹{selectedOrder.deliveryFee}</span>
                      </div>
                    )}
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>-₹{selectedOrder.discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold pt-2 border-t">
                      <span>Total</span>
                      <span>₹{selectedOrder.total}</span>
                    </div>
                  </div>

                  {/* Rider */}
                  {selectedOrder.rider && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm text-blue-700 font-medium">Rider Assigned</p>
                      <p className="text-sm text-blue-800">{selectedOrder.rider.name}</p>
                      <p className="text-xs text-blue-600">{selectedOrder.rider.phone}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="flex-1 flex items-center justify-center gap-2">
                      <Printer className="h-4 w-4" />
                      Print
                    </Button>
                    <Button variant="outline" className="flex-1 flex items-center justify-center gap-2">
                      <Phone className="h-4 w-4" />
                      Call
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </VendorLayout>
  );
}
