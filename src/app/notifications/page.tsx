'use client';

import { useState } from 'react';
import { ArrowLeft, Bell, Package, Tag, Gift, Megaphone, Trash2, Check, CheckCheck } from 'lucide-react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  type: 'order' | 'offer' | 'promo' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionUrl?: string;
}

const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'order',
    title: 'Order Delivered!',
    message: 'Your order #1234 has been delivered. Enjoy your meal!',
    time: '2 min ago',
    read: false,
    actionUrl: '/orders/1234',
  },
  {
    id: '2',
    type: 'offer',
    title: '50% OFF on your next order!',
    message: 'Use code SAVE50 to get 50% off up to ₹100 on your next order.',
    time: '1 hour ago',
    read: false,
  },
  {
    id: '3',
    type: 'order',
    title: 'Order Out for Delivery',
    message: 'Your order #1233 is out for delivery. Rider will reach in 10 mins.',
    time: '3 hours ago',
    read: true,
    actionUrl: '/orders/1233/track',
  },
  {
    id: '4',
    type: 'promo',
    title: 'New Restaurant Alert!',
    message: 'The famous "Biryani House" is now on Drop. Order now!',
    time: 'Yesterday',
    read: true,
  },
  {
    id: '5',
    type: 'system',
    title: 'Wallet Credited',
    message: '₹100 has been added to your wallet as cashback.',
    time: '2 days ago',
    read: true,
  },
  {
    id: '6',
    type: 'offer',
    title: 'Flash Sale Live!',
    message: 'Flat 60% OFF on select restaurants. Limited time only!',
    time: '3 days ago',
    read: true,
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="h-5 w-5" />;
      case 'offer':
        return <Tag className="h-5 w-5" />;
      case 'promo':
        return <Megaphone className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'order':
        return 'bg-blue-100 text-blue-600';
      case 'offer':
        return 'bg-green-100 text-green-600';
      case 'promo':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-orange-100 text-orange-600';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
    toast.success('Notification deleted');
  };

  const clearAll = () => {
    setNotifications([]);
    toast.success('All notifications cleared');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-4 border-b sticky top-0 z-10">
        <Link href="/profile">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-lg font-semibold flex-1">Notifications</h1>
        {unreadCount > 0 && (
          <Badge variant="error">{unreadCount} new</Badge>
        )}
      </div>

      {/* Actions */}
      {notifications.length > 0 && (
        <div className="bg-white px-4 py-3 border-b flex items-center justify-between">
          <button
            onClick={markAllAsRead}
            className="text-sm text-orange-500 font-medium flex items-center gap-1"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </button>
          <button
            onClick={clearAll}
            className="text-sm text-gray-500 font-medium flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" />
            Clear all
          </button>
        </div>
      )}

      {/* Notifications List */}
      <div className="p-4 space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              padding="none"
              className={notification.read ? 'opacity-75' : ''}
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getIconBg(notification.type)}`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className={`font-medium text-gray-900 ${!notification.read ? 'font-semibold' : ''}`}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">{notification.time}</span>
                      <div className="flex items-center gap-2">
                        {notification.actionUrl && (
                          <Link
                            href={notification.actionUrl}
                            className="text-xs text-orange-500 font-medium"
                          >
                            View Details
                          </Link>
                        )}
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs text-gray-400"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-xs text-gray-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No notifications</p>
            <p className="text-sm text-gray-400">
              You're all caught up! Check back later for updates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
