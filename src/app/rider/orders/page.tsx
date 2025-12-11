'use client';

import { useState } from 'react';
import { ArrowLeft, MapPin, Clock, Phone, Navigation, Package, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import Badge from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  restaurant: string;
  customer: string;
  customerPhone: string;
  pickup: string;
  dropoff: string;
  items: number;
  total: number;
  earning: number;
  distance: string;
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';
  time: string;
}

const orders: Order[] = [
  {
    id: 'ORD1234',
    restaurant: 'Burger King',
    customer: 'Rahul Sharma',
    customerPhone: '9876543210',
    pickup: '123 MG Road, Indiranagar',
    dropoff: '456 HSR Layout, Sector 1',
    items: 3,
    total: 450,
    earning: 55,
    distance: '4.2 km',
    status: 'pending',
    time: '2 min ago',
  },
  {
    id: 'ORD1235',
    restaurant: 'Dominos Pizza',
    customer: 'Priya Patel',
    customerPhone: '9876543211',
    pickup: '789 Koramangala 4th Block',
    dropoff: '321 BTM Layout 2nd Stage',
    items: 2,
    total: 599,
    earning: 45,
    distance: '3.5 km',
    status: 'accepted',
    time: '10 min ago',
  },
  {
    id: 'ORD1236',
    restaurant: 'KFC',
    customer: 'Amit Kumar',
    customerPhone: '9876543212',
    pickup: '555 Whitefield Main Road',
    dropoff: '777 Marathahalli Bridge',
    items: 4,
    total: 750,
    earning: 65,
    distance: '5.8 km',
    status: 'delivered',
    time: '1 hour ago',
  },
];

export default function RiderOrdersPage() {
  const [activeTab, setActiveTab] = useState('active');
  const [ordersList, setOrdersList] = useState(orders);

  const tabs = [
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
  ];

  const activeOrders = ordersList.filter(o => ['pending', 'accepted', 'picked_up'].includes(o.status));
  const completedOrders = ordersList.filter(o => ['delivered', 'cancelled'].includes(o.status));

  const handleAccept = (orderId: string) => {
    setOrdersList(ordersList.map(o =>
      o.id === orderId ? { ...o, status: 'accepted' as const } : o
    ));
    toast.success('Order accepted!');
  };

  const handleReject = (orderId: string) => {
    setOrdersList(ordersList.filter(o => o.id !== orderId));
    toast.success('Order rejected');
  };

  const handlePickedUp = (orderId: string) => {
    setOrdersList(ordersList.map(o =>
      o.id === orderId ? { ...o, status: 'picked_up' as const } : o
    ));
    toast.success('Order picked up!');
  };

  const handleDelivered = (orderId: string) => {
    setOrdersList(ordersList.map(o =>
      o.id === orderId ? { ...o, status: 'delivered' as const } : o
    ));
    toast.success('Order delivered!');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">New</Badge>;
      case 'accepted':
        return <Badge variant="info">Accepted</Badge>;
      case 'picked_up':
        return <Badge variant="info">Picked Up</Badge>;
      case 'delivered':
        return <Badge variant="success">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="error">Cancelled</Badge>;
      default:
        return null;
    }
  };

  const displayOrders = activeTab === 'active' ? activeOrders : completedOrders;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-4 border-b sticky top-0 z-10">
        <Link href="/rider">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-lg font-semibold">My Orders</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b px-4">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Orders List */}
      <div className="p-4 space-y-4">
        {displayOrders.length > 0 ? (
          displayOrders.map((order) => (
            <Card key={order.id} padding="none">
              <div className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold">{order.restaurant}</p>
                    <p className="text-xs text-gray-500">{order.time} • {order.items} items</p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                {/* Locations */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Pickup</p>
                      <p className="text-sm">{order.pickup}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin className="w-3 h-3 text-red-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Dropoff</p>
                      <p className="text-sm">{order.dropoff}</p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span>{order.distance}</span>
                  <span>•</span>
                  <span>Order: {formatCurrency(order.total)}</span>
                  <span>•</span>
                  <span className="text-green-600 font-semibold">Earn: ₹{order.earning}</span>
                </div>

                {/* Customer */}
                {order.status !== 'pending' && order.status !== 'delivered' && (
                  <div className="flex items-center justify-between py-2 border-t">
                    <div>
                      <p className="font-medium">{order.customer}</p>
                      <p className="text-xs text-gray-500">{order.customerPhone}</p>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="p-2 bg-green-100 rounded-full text-green-600"
                      >
                        <Phone className="h-4 w-4" />
                      </a>
                      <button className="p-2 bg-blue-100 rounded-full text-blue-600">
                        <Navigation className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-3 pt-3 border-t">
                  {order.status === 'pending' && (
                    <>
                      <Button
                        variant="outline"
                        fullWidth
                        onClick={() => handleReject(order.id)}
                        className="text-red-500 border-red-200"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                      <Button
                        fullWidth
                        onClick={() => handleAccept(order.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                        Accept
                      </Button>
                    </>
                  )}
                  {order.status === 'accepted' && (
                    <Button fullWidth onClick={() => handlePickedUp(order.id)}>
                      <Package className="h-4 w-4" />
                      Picked Up
                    </Button>
                  )}
                  {order.status === 'picked_up' && (
                    <Button fullWidth onClick={() => handleDelivered(order.id)}>
                      <CheckCircle className="h-4 w-4" />
                      Mark Delivered
                    </Button>
                  )}
                  {(order.status === 'delivered' || order.status === 'cancelled') && (
                    <Button variant="outline" fullWidth>
                      View Details
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No {activeTab} orders</p>
          </div>
        )}
      </div>
    </div>
  );
}
