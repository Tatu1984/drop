'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Clock, Phone, Navigation, Package, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import Badge from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  orderNumber?: string;
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

export default function RiderOrdersPage() {
  const [activeTab, setActiveTab] = useState('active');
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch orders from API
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('rider-token');
      if (!token) {
        toast.error('Please login to continue');
        return;
      }

      const response = await fetch('/api/rider/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success && data.data?.orders) {
        setOrdersList(data.data.orders);
      } else {
        toast.error(data.error || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const tabs = [
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
  ];

  const activeOrders = ordersList.filter(o => ['pending', 'accepted', 'picked_up'].includes(o.status));
  const completedOrders = ordersList.filter(o => ['delivered', 'cancelled'].includes(o.status));

  const handleOrderAction = async (orderId: string, action: 'accept' | 'pickup' | 'deliver') => {
    setActionLoading(orderId);
    try {
      const token = localStorage.getItem('rider-token');
      if (!token) {
        toast.error('Please login to continue');
        return;
      }

      const response = await fetch('/api/rider/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId,
          action,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          action === 'accept' ? 'Order accepted!' :
          action === 'pickup' ? 'Order picked up!' :
          'Order delivered!'
        );
        fetchOrders(); // Refresh orders
      } else {
        toast.error(data.error || 'Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAccept = (orderId: string) => handleOrderAction(orderId, 'accept');
  const handlePickedUp = (orderId: string) => handleOrderAction(orderId, 'pickup');
  const handleDelivered = (orderId: string) => handleOrderAction(orderId, 'deliver');

  const handleReject = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      const token = localStorage.getItem('rider-token');
      if (!token) {
        toast.error('Please login to continue');
        return;
      }

      const response = await fetch('/api/rider/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId,
          action: 'reject',
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Order rejected');
        fetchOrders(); // Refresh orders
      } else {
        toast.error(data.error || 'Failed to reject order');
      }
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast.error('Failed to reject order');
    } finally {
      setActionLoading(null);
    }
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
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : displayOrders.length > 0 ? (
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
                        disabled={actionLoading === order.id}
                      >
                        {actionLoading === order.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        Reject
                      </Button>
                      <Button
                        fullWidth
                        onClick={() => handleAccept(order.id)}
                        disabled={actionLoading === order.id}
                      >
                        {actionLoading === order.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        Accept
                      </Button>
                    </>
                  )}
                  {order.status === 'accepted' && (
                    <Button
                      fullWidth
                      onClick={() => handlePickedUp(order.id)}
                      disabled={actionLoading === order.id}
                    >
                      {actionLoading === order.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Package className="h-4 w-4" />
                      )}
                      Picked Up
                    </Button>
                  )}
                  {order.status === 'picked_up' && (
                    <Button
                      fullWidth
                      onClick={() => handleDelivered(order.id)}
                      disabled={actionLoading === order.id}
                    >
                      {actionLoading === order.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
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
