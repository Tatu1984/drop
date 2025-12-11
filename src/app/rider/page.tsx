'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Power,
  Navigation,
  Clock,
  Package,
  Phone,
  MessageCircle,
  CheckCircle,
  MapPin,
  Star,
  TrendingUp,
  AlertCircle,
  User,
  LogOut,
  Menu,
  Wallet,
  History,
  Settings,
  HelpCircle,
  X,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/store/useStore';
import toast from 'react-hot-toast';

const MapComponent = dynamic(() => import('@/components/map/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-full bg-gray-100 animate-pulse flex items-center justify-center">
      <span className="text-gray-500">Loading map...</span>
    </div>
  ),
});

const mockOrder = {
  id: 'order-1',
  orderNumber: 'ORD-ABC123',
  restaurant: {
    name: 'Biryani Blues',
    address: '123, MG Road, Bangalore',
    lat: 12.9716,
    lng: 77.5946,
    phone: '9876543210',
  },
  customer: {
    name: 'John Doe',
    address: '456, Indiranagar, Bangalore',
    lat: 12.98,
    lng: 77.60,
    phone: '9876543211',
  },
  items: ['2x Hyderabadi Chicken Biryani', '1x Mirchi ka Salan'],
  total: 647,
  paymentMethod: 'Online Paid',
  distance: 3.5,
  earnings: 45,
};

export default function RiderDashboard() {
  const router = useRouter();
  const { riderUser, logoutRider } = useAuthStore();
  const [isOnline, setIsOnline] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<typeof mockOrder | null>(null);
  const [orderStatus, setOrderStatus] = useState<'pickup' | 'delivering' | 'completed'>('pickup');
  const [riderLocation, setRiderLocation] = useState<[number, number]>([12.9716, 77.5946]);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [todayDeliveries, setTodayDeliveries] = useState(0);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSOSModal, setShowSOSModal] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!riderUser?.isAuthenticated) {
      router.push('/rider/login');
    }
  }, [riderUser, router]);

  const handleLogout = () => {
    logoutRider();
    router.push('/rider/login');
  };

  const handleSOS = () => {
    setShowSOSModal(true);
  };

  const triggerSOS = (type: string) => {
    toast.success(`SOS Alert: ${type} - Help is on the way!`);
    setShowSOSModal(false);
  };

  // Simulate location updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (isOnline) {
        setRiderLocation((prev) => [
          prev[0] + (Math.random() - 0.5) * 0.001,
          prev[1] + (Math.random() - 0.5) * 0.001,
        ]);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isOnline]);

  // Simulate incoming order
  useEffect(() => {
    if (isOnline && !currentOrder) {
      const timer = setTimeout(() => {
        setCurrentOrder(mockOrder);
        toast.success('New order received!');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, currentOrder]);

  const handleToggleOnline = () => {
    setIsOnline(!isOnline);
    toast.success(isOnline ? 'You are now offline' : 'You are now online');
  };

  const handleAcceptOrder = () => {
    toast.success('Order accepted! Navigate to pickup location');
  };

  const handlePickedUp = () => {
    setOrderStatus('delivering');
    toast.success('Order picked up! Navigate to customer');
  };

  const handleDelivered = () => {
    setOrderStatus('completed');
    setTodayEarnings((prev) => prev + (currentOrder?.earnings || 0));
    setTodayDeliveries((prev) => prev + 1);
    toast.success('Order delivered! Great job!');

    // Reset after 2 seconds
    setTimeout(() => {
      setCurrentOrder(null);
      setOrderStatus('pickup');
    }, 2000);
  };

  const destination = orderStatus === 'pickup'
    ? [currentOrder?.restaurant.lat || 0, currentOrder?.restaurant.lng || 0] as [number, number]
    : [currentOrder?.customer.lat || 0, currentOrder?.customer.lng || 0] as [number, number];

  // Show loading while checking auth
  if (!riderUser?.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar Overlay */}
      {showSidebar && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowSidebar(false)} />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-white z-50 transform transition-transform ${showSidebar ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {riderUser.name?.charAt(0) || 'R'}
            </div>
            <div>
              <p className="font-semibold">{riderUser.name}</p>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>4.8</span>
              </div>
            </div>
          </div>
          <button onClick={() => setShowSidebar(false)}>
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          <Link href="/rider/earnings" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50">
            <Wallet className="h-5 w-5 text-gray-600" />
            <span>Earnings</span>
          </Link>
          <Link href="/rider/orders" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50">
            <History className="h-5 w-5 text-gray-600" />
            <span>Order History</span>
          </Link>
          <Link href="/rider/profile" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50">
            <User className="h-5 w-5 text-gray-600" />
            <span>Profile</span>
          </Link>
          <Link href="/rider/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50">
            <Settings className="h-5 w-5 text-gray-600" />
            <span>Settings</span>
          </Link>
          <Link href="/help" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50">
            <HelpCircle className="h-5 w-5 text-gray-600" />
            <span>Help & Support</span>
          </Link>
          <div className="border-t my-4"></div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50">
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Header */}
      <div className="bg-gray-900 text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowSidebar(true)} className="p-2 hover:bg-gray-800 rounded-lg">
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-sm text-gray-400">Good morning</p>
              <h1 className="text-lg font-bold">{riderUser.name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">4.8</span>
            </div>
            <button
              onClick={handleToggleOnline}
              className={`p-2 rounded-full transition-colors ${
                isOnline ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <Power className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Online Status Banner */}
      <div
        className={`px-4 py-2 text-center text-sm font-medium ${
          isOnline ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'
        }`}
      >
        {isOnline ? 'You are online - Waiting for orders' : 'You are offline'}
      </div>

      {/* Map */}
      <div className="h-64">
        <MapComponent
          center={riderLocation}
          zoom={14}
          markers={[
            { position: riderLocation, type: 'rider', popup: 'Your Location' },
            ...(currentOrder
              ? [
                  {
                    position: [currentOrder.restaurant.lat, currentOrder.restaurant.lng] as [number, number],
                    type: 'store' as const,
                    popup: currentOrder.restaurant.name,
                  },
                  {
                    position: [currentOrder.customer.lat, currentOrder.customer.lng] as [number, number],
                    type: 'destination' as const,
                    popup: currentOrder.customer.name,
                  },
                ]
              : []),
          ]}
          route={
            currentOrder
              ? [
                  riderLocation,
                  orderStatus === 'pickup'
                    ? [currentOrder.restaurant.lat, currentOrder.restaurant.lng]
                    : [currentOrder.customer.lat, currentOrder.customer.lng],
                ]
              : undefined
          }
          height="100%"
        />
      </div>

      {/* Today's Stats */}
      <Card className="mx-4 -mt-6 relative z-10">
        <div className="grid grid-cols-3 divide-x">
          <div className="text-center py-2">
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(todayEarnings)}
            </p>
            <p className="text-xs text-gray-500">Today&apos;s Earnings</p>
          </div>
          <div className="text-center py-2">
            <p className="text-xl font-bold text-gray-900">{todayDeliveries}</p>
            <p className="text-xs text-gray-500">Deliveries</p>
          </div>
          <div className="text-center py-2">
            <p className="text-xl font-bold text-green-500">+₹50</p>
            <p className="text-xs text-gray-500">Bonus</p>
          </div>
        </div>
      </Card>

      {/* Current Order */}
      {currentOrder && orderStatus !== 'completed' && (
        <Card className="mx-4 mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Current Order</h3>
            <Badge
              variant={orderStatus === 'pickup' ? 'warning' : 'info'}
            >
              {orderStatus === 'pickup' ? 'Pickup' : 'Delivering'}
            </Badge>
          </div>

          {/* Destination */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">
                  {orderStatus === 'pickup'
                    ? currentOrder.restaurant.name
                    : currentOrder.customer.name}
                </p>
                <p className="text-sm text-gray-500">
                  {orderStatus === 'pickup'
                    ? currentOrder.restaurant.address
                    : currentOrder.customer.address}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Order Items</p>
            {currentOrder.items.map((item, idx) => (
              <p key={idx} className="text-sm text-gray-600">{item}</p>
            ))}
          </div>

          {/* Payment & Earnings */}
          <div className="flex justify-between items-center py-3 border-t">
            <div>
              <p className="text-sm text-gray-500">{currentOrder.paymentMethod}</p>
              <p className="font-semibold">{formatCurrency(currentOrder.total)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Your Earnings</p>
              <p className="font-semibold text-green-600">
                +{formatCurrency(currentOrder.earnings)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                const phone = orderStatus === 'pickup'
                  ? currentOrder.restaurant.phone
                  : currentOrder.customer.phone;
                window.open(`tel:${phone}`);
              }}
            >
              <Phone className="h-4 w-4" />
              Call
            </Button>
            <Button
              variant="outline"
              className="flex-1"
            >
              <Navigation className="h-4 w-4" />
              Navigate
            </Button>
          </div>

          <Button
            fullWidth
            className="mt-3"
            onClick={orderStatus === 'pickup' ? handlePickedUp : handleDelivered}
          >
            <CheckCircle className="h-5 w-5" />
            {orderStatus === 'pickup' ? 'Picked Up' : 'Mark Delivered'}
          </Button>
        </Card>
      )}

      {/* No Orders Message */}
      {!currentOrder && isOnline && (
        <Card className="mx-4 mt-4 text-center py-8">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Waiting for new orders...</p>
          <p className="text-sm text-gray-400 mt-1">
            Stay in busy areas to get more orders
          </p>
        </Card>
      )}

      {/* Offline Message */}
      {!isOnline && (
        <Card className="mx-4 mt-4 text-center py-8">
          <Power className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">You are currently offline</p>
          <Button className="mt-4" onClick={handleToggleOnline}>
            Go Online
          </Button>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="px-4 mt-4 grid grid-cols-3 gap-3 pb-4">
        <Link href="/rider/earnings">
          <Card className="text-center py-3 cursor-pointer hover:bg-gray-50">
            <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Earnings</p>
          </Card>
        </Link>
        <Link href="/rider/orders">
          <Card className="text-center py-3 cursor-pointer hover:bg-gray-50">
            <Clock className="h-6 w-6 text-blue-500 mx-auto mb-1" />
            <p className="text-xs text-gray-600">History</p>
          </Card>
        </Link>
        <Card className="text-center py-3 cursor-pointer hover:bg-red-50 border-red-200" onClick={handleSOS}>
          <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-1" />
          <p className="text-xs text-red-600 font-medium">SOS</p>
        </Card>
      </div>

      {/* SOS Modal */}
      <Modal
        isOpen={showSOSModal}
        onClose={() => setShowSOSModal(false)}
        title="Emergency SOS"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600 text-center">Select the type of emergency</p>

          <button
            onClick={() => triggerSOS('Accident')}
            className="w-full p-4 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
          >
            Accident / Medical Emergency
          </button>

          <button
            onClick={() => triggerSOS('Harassment')}
            className="w-full p-4 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            Harassment / Threat
          </button>

          <button
            onClick={() => triggerSOS('Vehicle Breakdown')}
            className="w-full p-4 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
          >
            Vehicle Breakdown
          </button>

          <button
            onClick={() => triggerSOS('Other')}
            className="w-full p-4 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
          >
            Other Emergency
          </button>

          <div className="border-t pt-4 mt-4">
            <p className="text-sm text-gray-500 text-center mb-3">Emergency Contacts</p>
            <div className="flex gap-3">
              <a href="tel:100" className="flex-1 p-3 border rounded-lg text-center hover:bg-gray-50">
                <Phone className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                <p className="text-xs font-medium">Police</p>
                <p className="text-xs text-gray-500">100</p>
              </a>
              <a href="tel:102" className="flex-1 p-3 border rounded-lg text-center hover:bg-gray-50">
                <Phone className="h-5 w-5 mx-auto mb-1 text-red-500" />
                <p className="text-xs font-medium">Ambulance</p>
                <p className="text-xs text-gray-500">102</p>
              </a>
              <a href="tel:1800123456" className="flex-1 p-3 border rounded-lg text-center hover:bg-gray-50">
                <Phone className="h-5 w-5 mx-auto mb-1 text-green-500" />
                <p className="text-xs font-medium">Drop Help</p>
                <p className="text-xs text-gray-500">24/7</p>
              </a>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
