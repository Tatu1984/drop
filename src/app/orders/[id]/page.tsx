'use client';

import { use } from 'react';
import { ArrowLeft, MapPin, Clock, Phone, MessageCircle, Star, ChevronRight, Package, Check, RefreshCw, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { sampleOrders } from '@/data/mockData';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';

const orderStatuses = [
  { key: 'PLACED', label: 'Order Placed', icon: Check },
  { key: 'CONFIRMED', label: 'Confirmed', icon: Check },
  { key: 'PREPARING', label: 'Preparing', icon: Package },
  { key: 'PICKED_UP', label: 'Picked Up', icon: Package },
  { key: 'DELIVERED', label: 'Delivered', icon: Check },
];

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const order = sampleOrders.find(o => o.id === resolvedParams.id) || sampleOrders[0];

  const currentStatusIndex = orderStatuses.findIndex(s => s.key === order.status);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      case 'PREPARING':
      case 'PICKED_UP':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-4 border-b sticky top-0 z-10">
        <Link href="/orders">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div className="flex-1">
          <h1 className="font-semibold">Order #{order.id}</h1>
          <p className="text-xs text-gray-500">
            {new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <Badge variant={getStatusVariant(order.status)}>
          {order.status.replace('_', ' ')}
        </Badge>
      </div>

      <div className="p-4 space-y-4">
        {/* Status Timeline */}
        {order.status !== 'CANCELLED' && (
          <Card>
            <h3 className="font-semibold mb-4">Order Status</h3>
            <div className="relative">
              {orderStatuses.map((status, index) => (
                <div key={status.key} className="flex items-start gap-3 pb-4 last:pb-0">
                  <div className="relative">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index <= currentStatusIndex
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      <status.icon className="h-4 w-4" />
                    </div>
                    {index < orderStatuses.length - 1 && (
                      <div
                        className={`absolute top-8 left-1/2 w-0.5 h-8 -translate-x-1/2 ${
                          index < currentStatusIndex ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <p
                      className={`font-medium ${
                        index <= currentStatusIndex ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {status.label}
                    </p>
                    {index === currentStatusIndex && (
                      <p className="text-xs text-gray-500">Current status</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {order.status !== 'DELIVERED' && (
              <Link href={`/orders/${order.id}/track`}>
                <Button fullWidth variant="outline" className="mt-4">
                  <MapPin className="h-4 w-4" />
                  Track Order Live
                </Button>
              </Link>
            )}
          </Card>
        )}

        {/* Restaurant Info */}
        {order.vendor && (
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden relative">
                <Image
                  src="/placeholder-store.jpg"
                  alt={order.vendor.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{order.vendor.name}</h3>
                <p className="text-sm text-gray-500">{order.vendor.address}</p>
              </div>
              <Link href={`/store/${order.vendor.id}`}>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>
            </div>
          </Card>
        )}

        {/* Delivery Address */}
        {order.address && (
          <Card>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900">Delivery Address</h3>
                <p className="text-sm text-gray-500 mt-1">{order.address.fullAddress}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Order Items */}
        <Card>
          <h3 className="font-semibold mb-4">Order Items</h3>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between">
                <div className="flex items-start gap-2">
                  <span className="text-sm text-gray-500">{item.quantity}x</span>
                  <span className="text-gray-900">{item.product?.name || 'Unknown Item'}</span>
                </div>
                <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Bill Details */}
        <Card>
          <h3 className="font-semibold mb-4">Bill Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Item Total</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Fee</span>
              <span>{formatCurrency(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Platform Fee</span>
              <span>{formatCurrency(order.platformFee)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-base pt-2 border-t">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </Card>

        {/* Payment */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Payment</h3>
              <p className="text-sm text-gray-500">{order.paymentMethod}</p>
            </div>
            <Badge variant="success">Paid</Badge>
          </div>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href={order.vendor ? `/store/${order.vendor.id}` : '/'}>
            <Button variant="outline" fullWidth>
              <RefreshCw className="h-4 w-4" />
              Reorder
            </Button>
          </Link>
          <Link href="/support">
            <Button variant="outline" fullWidth>
              <HelpCircle className="h-4 w-4" />
              Get Help
            </Button>
          </Link>
        </div>

        {/* Rate Order */}
        {order.status === 'DELIVERED' && (
          <Card className="bg-orange-50">
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-2">Rate your order</h3>
              <div className="flex justify-center gap-2 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} className="p-1">
                    <Star className="h-8 w-8 text-gray-300 hover:text-yellow-400 hover:fill-yellow-400 transition-colors" />
                  </button>
                ))}
              </div>
              <Button size="sm">Submit Review</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
