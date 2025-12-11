'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, ChevronRight, MapPin, Phone, Package } from 'lucide-react';
import { sampleOrder } from '@/data/mockData';
import { formatCurrency, formatRelativeTime, getStatusText, getStatusColor } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Tabs from '@/components/ui/Tabs';
import Button from '@/components/ui/Button';

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('active');

  // For demo, use sample order - memoize to avoid Date.now() in render
  const activeOrders = [sampleOrder];
  const pastOrders = useMemo(() => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const deliveredTime = new Date(threeDaysAgo.getTime() + 40 * 60000);

    return [{
      ...sampleOrder,
      id: 'order-2',
      orderNumber: 'ORD-XYZ789',
      status: 'DELIVERED' as const,
      createdAt: threeDaysAgo,
      deliveredAt: deliveredTime,
    }];
  }, []);

  const orders = activeTab === 'active' ? activeOrders : pastOrders;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b sticky top-0 z-20">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Your Orders</h1>
        <Tabs
          tabs={[
            { id: 'active', label: 'Active', badge: activeOrders.length },
            { id: 'past', label: 'Past Orders' },
          ]}
          defaultTab={activeTab}
          onChange={setActiveTab}
          fullWidth
        />
      </div>

      {/* Orders List */}
      <div className="p-4 space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">
              No {activeTab} orders
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              {activeTab === 'active'
                ? "You don't have any active orders"
                : "You haven't placed any orders yet"}
            </p>
            <Link href="/">
              <Button>Order Now</Button>
            </Link>
          </div>
        ) : (
          orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <Card hoverable className="overflow-hidden">
                {/* Status Banner */}
                {activeTab === 'active' && (
                  <div className={`${getStatusColor(order.status)} text-white px-4 py-2 -mx-4 -mt-4 mb-4`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {getStatusText(order.status)}
                      </span>
                      <span className="text-sm opacity-90">
                        ETA: 15 mins
                      </span>
                    </div>
                  </div>
                )}

                {/* Order Info */}
                <div className="flex gap-3">
                  {/* Restaurant Logo */}
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={order.vendor?.logo || '/placeholder-store.jpg'}
                      alt={order.vendor?.name || 'Restaurant'}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {order.vendor?.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {order.items.length} items • {formatCurrency(order.total)}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    </div>

                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{formatRelativeTime(order.createdAt)}</span>
                      <span>•</span>
                      <span>#{order.orderNumber.slice(-6)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions for active orders */}
                {activeTab === 'active' && (
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Phone className="h-4 w-4" />
                      Call
                    </Button>
                    <Link href={`/orders/${order.id}/track`} className="flex-1">
                      <Button size="sm" fullWidth>
                        <MapPin className="h-4 w-4" />
                        Track Order
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Reorder for past orders */}
                {activeTab === 'past' && (
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                    <Button size="sm" className="flex-1">
                      Reorder
                    </Button>
                  </div>
                )}
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
